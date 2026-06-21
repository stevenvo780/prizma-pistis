/**
 * Backfill one-off: PaymentSource.sourceId cifrado (IV aleatorio) → hash determinista.
 *
 * ─── CONTEXTO ──────────────────────────────────────────────────────────────
 * Históricamente, `confirmPaymentSubscription` guardaba
 *     sourceId = encrypt(paymentId, ENCRYPTION_KEY)
 * que usa AES-256-CBC con IV ALEATORIO → cada llamada produce un ciphertext
 * distinto para el mismo paymentId. Resultado: las reentregas de webhook de
 * Mercado Pago (MP reintenta ante 5xx/timeout) NUNCA encontraban el registro
 * previo y duplicaban la confirmación del pago.
 *
 * El código nuevo guarda
 *     sourceId = hashDeterministic(paymentId, ENCRYPTION_KEY)  // HMAC-SHA256
 * que es determinista (mismo paymentId → mismo hash) y por tanto sirve como
 * clave de idempotencia indexable. Existe un UNIQUE index sobre sourceId
 * (migración AddUniqueIndexToPaymentSourceId1755945600000).
 *
 * Este script recorre los PaymentSource históricos (cifrados), descifra el
 * paymentId, recomputa el hash determinista y lo persiste en `sourceId`,
 * marcando `legacyEncrypted = false`.
 *
 * ─── DISCRIMINADOR DE FORMATO ──────────────────────────────────────────────
 * - Legacy (encrypt):   "<ivHex(32)>:<cipherHex>"  → contiene ':' (1+ veces)
 * - Nuevo  (HMAC-SHA256): 64 chars hex, SIN ':'
 * Por eso un registro es legacy ⇔ su sourceId contiene ':'. Esto hace el
 * script IDEMPOTENTE: una segunda corrida ignora los ya hasheados.
 *
 * ─── DUPLICADOS ────────────────────────────────────────────────────────────
 * Dos filas legacy pueden descifrar al MISMO paymentId (justamente el bug que
 * se corrige). Ambas mapearían al mismo hash → violación del UNIQUE index.
 * Estrategia: NO destructiva. Si el hash destino ya existe (en otra fila ya
 * migrada o en otra legacy ya procesada en esta corrida), se LOGUEA y se SKIP,
 * dejando la fila duplicada intacta para el tool de limpieza posterior.
 *
 * ─── SEGURIDAD (fail-closed) ───────────────────────────────────────────────
 * - Requiere ENCRYPTION_KEY; aborta si falta (no puede descifrar nada).
 * - DRY-RUN por defecto: NO escribe salvo que se pase --apply.
 * - Cada fila se procesa en su propia transacción con lock FOR UPDATE.
 * - Filas indescifrables (clave equivocada / dato corrupto) se SKIP + log,
 *   nunca se borran ni se sobreescriben.
 *
 * ─── CÓMO CORRERLO (one-off, NO automatizar) ───────────────────────────────
 *   # Pre-requisito: la migración de schema ya aplicada (índice UNIQUE +
 *   # columna legacyEncrypted). Variables DB_* y ENCRYPTION_KEY en el entorno.
 *
 *   # 1) Simulación (sin escribir) — revisar el resumen:
 *   npm run backfill:payment-source-hash
 *
 *   # 2) Aplicar de verdad:
 *   npm run backfill:payment-source-hash -- --apply
 *
 *   # Opcional: tamaño de página (default 500)
 *   npm run backfill:payment-source-hash -- --apply --batch=200
 *
 * Es ONE-OFF: corre una vez tras desplegar el código de hash determinista.
 * Re-ejecutarlo es seguro (idempotente) pero innecesario.
 */
import 'reflect-metadata';
import { QueryRunner } from 'typeorm';

import { AppDataSource } from '../utils/data-source';
import { decrypt, hashDeterministic } from '../utils/encrypt';

interface LegacyRow {
  id: number;
  sourceId: string;
}

interface Stats {
  scanned: number;
  migrated: number;
  skippedAlreadyHashed: number;
  skippedDuplicate: number;
  skippedUndecryptable: number;
  errors: number;
}

const TABLE = 'payment_source';

function parseArgs(argv: string[]): { apply: boolean; batch: number } {
  const apply = argv.includes('--apply');
  const batchArg = argv.find((a) => a.startsWith('--batch='));
  const batch = batchArg ? parseInt(batchArg.split('=')[1], 10) : 500;
  return {
    apply,
    batch: Number.isFinite(batch) && batch > 0 ? batch : 500,
  };
}

/**
 * Un sourceId es legacy (cifrado) si contiene ':' (separador iv:ciphertext).
 * Los hashes deterministas (HMAC-SHA256 hex) nunca contienen ':'.
 */
function isLegacyEncrypted(sourceId: string): boolean {
  return typeof sourceId === 'string' && sourceId.includes(':');
}

async function legacyRowExistsByHash(
  qr: QueryRunner,
  hash: string,
  excludeId: number,
): Promise<boolean> {
  const rows = await qr.query(
    `SELECT 1 FROM "${TABLE}" WHERE "sourceId" = $1 AND "id" <> $2 LIMIT 1`,
    [hash, excludeId],
  );
  return rows.length > 0;
}

/**
 * Procesa una fila legacy en su propia transacción.
 * Devuelve la categoría del resultado para el conteo.
 */
async function processRow(
  row: LegacyRow,
  secret: string,
  apply: boolean,
): Promise<keyof Omit<Stats, 'scanned'>> {
  let plaintext: string;
  try {
    plaintext = decrypt(row.sourceId, secret);
  } catch (err) {
    console.warn(
      `[skip] id=${row.id}: no se pudo descifrar sourceId ` +
        `(clave equivocada o dato corrupto): ${(err as Error).message}`,
    );
    return 'skippedUndecryptable';
  }

  const newHash = hashDeterministic(plaintext, secret);

  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    // Lock pesimista de la fila para evitar carreras con el backend en vivo.
    const locked = await qr.query(
      `SELECT "id", "sourceId" FROM "${TABLE}" WHERE "id" = $1 FOR UPDATE`,
      [row.id],
    );
    if (locked.length === 0) {
      await qr.rollbackTransaction();
      return 'errors';
    }

    const current: string = locked[0].sourceId;
    // Re-chequeo bajo lock: si ya fue migrada (no tiene ':'), nada que hacer.
    if (!isLegacyEncrypted(current)) {
      await qr.rollbackTransaction();
      return 'skippedAlreadyHashed';
    }

    // Si ya existe OTRA fila con el hash destino → duplicado real. Log + skip,
    // sin tocar la fila (queda para el tool de limpieza posterior).
    const collides = await legacyRowExistsByHash(qr, newHash, row.id);
    if (collides) {
      console.warn(
        `[dup ] id=${row.id}: el paymentId descifrado mapea a un hash ya ` +
          `presente (${newHash.slice(0, 12)}…). Se omite para no violar el ` +
          `UNIQUE index; revisar/limpiar manualmente.`,
      );
      await qr.rollbackTransaction();
      return 'skippedDuplicate';
    }

    if (!apply) {
      console.log(
        `[dry ] id=${row.id}: ${current.slice(0, 16)}… → ` +
          `${newHash.slice(0, 16)}… (no escrito; falta --apply)`,
      );
      await qr.rollbackTransaction();
      return 'migrated';
    }

    await qr.query(
      `UPDATE "${TABLE}" SET "sourceId" = $1, "legacyEncrypted" = false WHERE "id" = $2`,
      [newHash, row.id],
    );
    await qr.commitTransaction();
    console.log(`[ok  ] id=${row.id} migrado a hash determinista`);
    return 'migrated';
  } catch (err: any) {
    await qr.rollbackTransaction().catch(() => undefined);
    // 23505 = unique_violation: carrera con otra escritura al mismo hash.
    if (err?.code === '23505') {
      console.warn(
        `[dup ] id=${row.id}: colisión UNIQUE al escribir (carrera). Se omite.`,
      );
      return 'skippedDuplicate';
    }
    console.error(`[err ] id=${row.id}: ${err?.message ?? err}`);
    return 'errors';
  } finally {
    await qr.release();
  }
}

async function main(): Promise<void> {
  const { apply, batch } = parseArgs(process.argv.slice(2));

  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    console.error(
      'ENCRYPTION_KEY no está definida. Es obligatoria para descifrar los ' +
        'sourceId legacy. Abortando (fail-closed).',
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Backfill PaymentSource.sourceId → hash determinista | ` +
      `modo=${apply ? 'APPLY' : 'DRY-RUN'} batch=${batch}`,
  );

  await AppDataSource.initialize();

  const stats: Stats = {
    scanned: 0,
    migrated: 0,
    skippedAlreadyHashed: 0,
    skippedDuplicate: 0,
    skippedUndecryptable: 0,
    errors: 0,
  };

  try {
    // Verificar que el schema esperado existe antes de tocar datos.
    const hasLegacyCol = await AppDataSource.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = $1 AND column_name = 'legacyEncrypted' LIMIT 1`,
      [TABLE],
    );
    if (hasLegacyCol.length === 0) {
      console.error(
        `La columna "legacyEncrypted" no existe en "${TABLE}". Aplicá primero ` +
          `la migración de schema (MigratePaymentSourceIdToDeterministicHash). ` +
          `Abortando.`,
      );
      process.exitCode = 1;
      return;
    }

    // Paginación por id (keyset) para no cargar toda la tabla en memoria.
    let lastId = 0;
    for (;;) {
      const rows: LegacyRow[] = await AppDataSource.query(
        `SELECT "id", "sourceId" FROM "${TABLE}"
         WHERE "id" > $1 AND "sourceId" LIKE '%:%'
         ORDER BY "id" ASC
         LIMIT $2`,
        [lastId, batch],
      );
      if (rows.length === 0) break;

      for (const row of rows) {
        stats.scanned += 1;
        lastId = row.id;
        // Doble-chequeo de formato (el LIKE ya filtra, pero somos defensivos).
        if (!isLegacyEncrypted(row.sourceId)) {
          stats.skippedAlreadyHashed += 1;
          continue;
        }
        const outcome = await processRow(row, secret, apply);
        stats[outcome] += 1;
      }
    }

    console.log('──────────────────────────────────────────────');
    console.log(`Escaneados (legacy):     ${stats.scanned}`);
    console.log(
      `${apply ? 'Migrados' : 'Migrables (dry-run)'}: ${stats.migrated}`,
    );
    console.log(`Ya hasheados (skip):     ${stats.skippedAlreadyHashed}`);
    console.log(`Duplicados (skip):       ${stats.skippedDuplicate}`);
    console.log(`Indescifrables (skip):   ${stats.skippedUndecryptable}`);
    console.log(`Errores:                 ${stats.errors}`);
    console.log('──────────────────────────────────────────────');
    if (!apply) {
      console.log('DRY-RUN: no se escribió nada. Re-ejecutá con --apply.');
    }
    if (stats.errors > 0) {
      process.exitCode = 1;
    }
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Fallo no controlado en el backfill:', err);
  process.exitCode = 1;
});
