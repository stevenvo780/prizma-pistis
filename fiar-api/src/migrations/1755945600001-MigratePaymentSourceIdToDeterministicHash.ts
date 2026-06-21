import { MigrationInterface, QueryRunner } from 'typeorm';
import * as crypto from 'crypto';

/**
 * Migración de datos: PaymentSource.sourceId (cifrado → hash determinista)
 *
 * CONTEXTO:
 * - Registros históricos guardaron sourceId con encrypt() (IV aleatorio).
 * - El IV aleatorio causa que el mismo paymentId tenga ciphertexts distintos en cada llamada.
 * - Sin idempotencia, reentregas de webhooks (MP reintenta ante 5xx/timeout) duplicaban la
 *   confirmación, alterando el balance del cliente.
 *
 * SOLUCIÓN:
 * - Nuevos pagos usan hashDeterministic() = SHA256(paymentId + ENCRYPTION_KEY).
 * - El hash es determinista: mismo paymentId → mismo hash siempre.
 *
 * MIGRACIÓN:
 * - No migra datos históricos inline en el DB (costoso, requiere decrypt/re-hash).
 * - En su lugar, marca registros históricos con una bandera "migrado" = false.
 * - Los webhooks nuevos llegan con sourceId ya hasheado.
 * - El código de confirmación ahora busca por hash (determinista).
 *
 * IMPACTO:
 * - Registros históricos cifrados quedarán huérfanos (no se reutilizarán).
 * - Pero NO causarán conflictos de duplicate key (no hay UNIQUE al inicio).
 * - Nuevos pagos son idempotentes y seguros (una sola carga por paymentId).
 *
 * BACKFILL DE DATOS (one-off, fuera de esta migración):
 *   El re-hash de los sourceId históricos NO se hace inline aquí porque requiere
 *   ENCRYPTION_KEY y la función decrypt() (no disponibles en el contexto de una
 *   migración de schema). Lo realiza un script dedicado, idempotente y con
 *   dry-run por defecto:
 *       src/scripts/backfill-payment-source-hash.ts
 *       npm run backfill:payment-source-hash            # simulación
 *       npm run backfill:payment-source-hash -- --apply # aplica
 *   Ese script descifra, recomputa el hash determinista, persiste sourceId y
 *   pone legacyEncrypted=false; los duplicados (dos filas → mismo paymentId) se
 *   loguean y se omiten para no violar el UNIQUE index.
 */

export class MigratePaymentSourceIdToDeterministicHash1755945600001
  implements MigrationInterface
{
  name = 'MigratePaymentSourceIdToDeterministicHash1755945600001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna "legacyEncrypted" para marcar registros históricos.
    // Esta columna es defensiva: permite tracking de cuándo fue migrado el schema.
    const table = await queryRunner.getTable('payment_source');
    if (table) {
      const legacyEncryptedColumn = table.findColumnByName('legacyEncrypted');
      if (!legacyEncryptedColumn) {
        await queryRunner.query(
          `ALTER TABLE "payment_source" ADD COLUMN "legacyEncrypted" boolean DEFAULT true`,
        );
      }
    }

    // NOTA: No migramos los datos inline (decrypt históricos + re-hash).
    // Razón: requeriría acceso a ENCRYPTION_KEY y decrypt() en contexto de
    // migración de schema. El backfill de datos lo hace, tras desplegar el
    // código de hash determinista, el script one-off:
    //   src/scripts/backfill-payment-source-hash.ts
    //   (npm run backfill:payment-source-hash [-- --apply])
    // que: 1) lee filas con sourceId aún cifrado ("iv:cipher"),
    //      2) descifra el paymentId (ENCRYPTION_KEY),
    //      3) computa el hash determinista,
    //      4) escribe sourceId = hash y legacyEncrypted = false,
    //      5) loguea + omite duplicados (dos filas → mismo paymentId).
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: eliminar columna defensiva
    const table = await queryRunner.getTable('payment_source');
    if (table) {
      const legacyEncryptedColumn = table.findColumnByName('legacyEncrypted');
      if (legacyEncryptedColumn) {
        await queryRunner.query(
          `ALTER TABLE "payment_source" DROP COLUMN "legacyEncrypted"`,
        );
      }
    }
  }
}
