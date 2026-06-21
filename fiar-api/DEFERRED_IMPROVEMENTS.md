# Deferred Improvements — Pistis Backend

Reporte de estado de los 4 items abiertos de pistis-backend (SPRINT-REPORT.md, líneas 17-22).

## Items Cerrados (Implementados)

### 1. ✅ Atomicidad transaction.create + updateCredits

**Status**: IMPLEMENTADO

**Archivos modificados**:
- `src/transaction/transaction.service.ts`: Refactorizado `create()` para envolver transacción + updateCredits en `QueryRunner`.
- `src/client/client.service.ts`: Agregado método `updateCreditsWithQueryRunner()` que acepta un QueryRunner externo.

**Implementación**:
- El método `create()` ahora instancia un `DataSource.createQueryRunner()`.
- Dentro de la transacción: guardar Transaction + llamar `updateCreditsWithQueryRunner()`.
- Si cualquiera falla, rollback automático (FAIL-CLOSED).
- Hub notification ocurre fuera de la transacción (fault-tolerant).

**Garantías**:
- Si `transaction.save()` falla → no se tocan créditos.
- Si `updateCredits()` falla → transaction se revierte, cliente no sufre cambio.
- Idempotencia: si se reintenta la misma operación (p.ej. webhook duplicado), el segundo intento ve el estado actualizado.

---

### 2. ✅ Índice UNIQUE sobre PaymentSource.sourceId

**Status**: IMPLEMENTADO

**Archivos modificados**:
- `src/common/entities/payment-source.entity.ts`: Agregada anotación `@Index({ unique: true })` en columna `sourceId`.
- `src/migrations/1755945600000-AddUniqueIndexToPaymentSourceId.ts`: Migración TypeORM que crea el índice.

**Implementación**:
- Entity decorator genera index UNIQUE automáticamente.
- Migración crea índice en DB con `CREATE UNIQUE INDEX IF NOT EXISTS`.
- Idempotente: no falla si el índice ya existe.

**Garantías**:
- DB rechaza INSERT si `sourceId` es duplicado (enforce a nivel DB).
- `confirmPaymentSubscription()` en `mercadopago.service.ts` ya busca por sourceId hasheado.
- Primera carga de webhook → INSERT exitoso.
- Reentrega de webhook (mismo paymentId) → retorna idempotencia key, no duplica.

---

### 3. ⚠️ Migración de PaymentSource.sourceId existentes (cifrado → hash determinista)

**Status**: DEFERRED (Seguro, no bloquea)

**Archivos modificados**:
- `src/migrations/1755945600001-MigratePaymentSourceIdToDeterministicHash.ts`: Migración defensiva (no migra datos inline).

**Razón del deferral**:
- Registros históricos usaron `encrypt()` (IV aleatorio).
- Descifrarlos requiere acceso a `ENCRYPTION_KEY` y función `decrypt()` en contexto de migración (complejidad).
- **Impacto cero en flujo futuro**: nuevos webhooks llegan con sourceId hasheado.
- Registros históricos quedan huérfanos (no se reutilizarán), pero no causan conflictos.

**One-off tooling** (opcional, Phase 2):
```bash
# Si en futuro se necesita limpiar registros históricos:
# 1. Script Python/Node que lee registros con legacyEncrypted=true
# 2. Descifra sourceId (requiere ENCRYPTION_KEY)
# 3. Computa hash determinista del paymentId original
# 4. Actualiza sourceId = hash, setea legacyEncrypted = false
# 5. Elimina registros huérfanos tras período de gracia (ej: 90 días)
```

**Mitigación aplicada**:
- Agregada columna `legacyEncrypted` (default=true) para tracking.
- Código de aplicación ya es agnóstico: busca por hash (determinista).
- Webhooks reentregados ahora son idempotentes (clave: usar `hashDeterministic()`, no `encrypt()`).

---

### 4. ✅ Validación estricta de planType/frequency en parseExternalReference

**Status**: IMPLEMENTADO (ya en codebase)

**Archivos**:
- `src/mercadopago/mercadopago.service.ts` (líneas 714-789): `parseExternalReference()` valida enums con `Object.values()`.

**Implementación** (ya presente):
- Verifica que `planType` esté en `PlanType` enum.
- Verifica que `frequency` esté en `PaymentFrequency` enum.
- Retorna `null` y loguea warning si alguno es inválido (FAIL-CLOSED).
- Previene inyección de valores que causarían crashes aguas abajo.

---

## Resumen

| Item | Estado | Linea Abierta | Criticidad |
|------|--------|---------------|------------|
| Atomicidad TX | ✅ Cerrado | No | CRÍTICA |
| Índice UNIQUE | ✅ Cerrado | No | MEDIA |
| Migración datos históricos | ⚠️ Deferred | One-off tool | BAJA |
| Validación enums | ✅ Cerrado | No | MEDIA |

---

## Deploy

Para aplicar cambios:

```bash
# 1. Deploy del código (sin migraciones automáticas primero)
gcloud run deploy olympo-pistis-backend --project udea-filosofia ...

# 2. Ejecutar migraciones (cuando esté listo)
export DB_MIGRATIONS_RUN=true
# (O manualmente: npx typeorm migration:run -d src/utils/typeorm.config.ts)
```

Las migraciones son idempotentes (IF NOT EXISTS, IF NOT NULL, etc.).

---

## Testing

Verificación post-deploy:

```bash
# Atomicidad: crear transacción con estado 'approved'
curl -X POST http://localhost:3090/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"operation":"income", "amount":100, "status":"approved", "clientId":1}'

# Verificar que cliente.current_balance cambió (ambas operaciones ocurrieron juntas).

# Índice UNIQUE: intentar insertar sourceId duplicado
# → BD rechaza con unique violation error (bueno).

# Migración: auditar registros con legacyEncrypted=true
SELECT COUNT(*) FROM payment_source WHERE "legacyEncrypted" = true;
```

---

## Documentación Adicional

- `src/transaction/transaction.service.ts`: Línea 90-155 (método `create()` con QueryRunner).
- `src/client/client.service.ts`: Línea 287-328 (método `updateCreditsWithQueryRunner()`).
- `src/common/entities/payment-source.entity.ts`: Línea 14-17 (entity con @Index).
- `src/migrations/`: Dos migraciones TypeORM (índice + defensiva).
