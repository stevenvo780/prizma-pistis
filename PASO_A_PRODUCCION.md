# 🚀 PASO A PRODUCCIÓN — MercadoPago en FIAR

> **Estado actual del sistema: SANDBOX (Pruebas)**
> Última actualización: 25/Feb/2026

---

## ⚡ Comando único para pasar a PRODUCCIÓN

Cuando el QA termine las pruebas y todo esté OK, ejecuta este comando en tu terminal:

```bash
gcloud run services update fiar-api \
  --region=us-central1 --project=fiar-3a207 \
  --update-env-vars="MP_ACCESS_TOKEN=APP_USR-2493532165828355-021623-9a7ab897978e0d2014545b4aac218a88-3206528554,MP_SANDBOX_MODE=false" \
  --remove-env-vars="MP_TEST_PAYER_EMAIL"
```

✅ **Eso es todo.** No hay que hacer deploy, no hay que cambiar código, no hay que tocar el frontend.
Los cambios aplican en ~30 segundos.

---

## 🔁 Volver a SANDBOX (si necesitas más pruebas después)

```bash
gcloud run services update fiar-api \
  --region=us-central1 --project=fiar-3a207 \
  --update-env-vars="MP_ACCESS_TOKEN=TEST-2493532165828355-021623-1ce1e258f8e13070152f496ee9475c6e-3206528554,MP_SANDBOX_MODE=true,MP_TEST_PAYER_EMAIL=test_user_3549839656740443625@testuser.com"
```

---

## 📋 Checklist pre-producción

Antes de ejecutar el paso a producción, asegúrate de:

- [ ] QA completó todas las pruebas (ver `GUIA_QA_PAGOS.md`)
- [ ] Flujo completo funciona: elegir plan → pagar → plan se activa
- [ ] Cancelación funciona: cancelar → plan vuelve a FREE
- [ ] No hay suscripciones de prueba activas (cancelar las que queden)
- [ ] Webhooks se probaron (aunque sea manualmente con curl)

---

## 🔧 Diferencias Sandbox vs Producción

| Aspecto | Sandbox | Producción |
|---------|---------|------------|
| Token | `TEST-2493532165828355-...` | `APP_USR-2493532165828355-...` |
| Cobros reales | ❌ No | ✅ Sí |
| Tarjetas | Solo de prueba | Reales |
| Webhooks automáticos | ❌ No (hay que simular) | ✅ Sí |
| `MP_SANDBOX_MODE` | `true` | `false` |
| `MP_TEST_PAYER_EMAIL` | Configurado | No existe |

---

## 📌 Referencia técnica

### Datos de la App de MercadoPago
- **App ID:** 2493532165828355
- **Nombre:** TestApp-d1454f54
- **Owner:** stevenvallejo780@gmail.com (user_id: 165225183)

### Usuarios de prueba

| Rol | ID | Email | Password |
|-----|----|-------|----------|
| Seller (Collector) | 3206528554 | test_user_6164668642400774604@testuser.com | (auto) |
| Buyer (Pagador) | 3229132522 | test_user_3549839656740443625@testuser.com | ckgWOkXLny |

### Tarjeta de prueba (Colombia)

| Campo | Valor |
|-------|-------|
| Número | 5031 7557 3453 0604 |
| CVV | 123 |
| Vencimiento | Cualquier fecha futura (ej: 11/30) |
| Documento | CC 12345678 |

### Infraestructura
- **Backend:** Cloud Run — `fiar-api-212302024675.us-central1.run.app`
- **Frontend:** Vercel — `fiar.humanizar.cloud`
- **GCP Project:** `fiar-3a207`
- **Región:** `us-central1`

---

## 🔥 Simular webhook en sandbox (OPCIONAL)

> **Nota:** Ya NO es necesario simular webhooks para que el plan se active. La página de success ahora sincroniza automáticamente con MercadoPago (`POST /sync-subscription`). Estos comandos solo son útiles para testing técnico avanzado.

### ¿Cómo obtener el SUBSCRIPTION_ID?

**Opción A** — Desde la URL de retorno (el QA la ve en el navegador después de pagar):
```
https://fiar.humanizar.cloud/plans?preapproval_id=XXXXXXXXX
```
El `preapproval_id` es el SUBSCRIPTION_ID.

**Opción B** — Desde logs de Cloud Run:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=fiar-api AND textPayload:subscription" \
  --project=fiar-3a207 --limit=10 --format="value(textPayload)"
```

### Simular activación (plan se activa a BASIC)
```bash
curl -X POST "https://fiar-api-212302024675.us-central1.run.app/api/v1/mercadopago/webhook" \
  -H "Content-Type: application/json" \
  -d '{"id":99999,"live_mode":false,"type":"subscription_preapproval","date_created":"2026-01-01T00:00:00.000-04:00","user_id":3206528554,"api_version":"v1","action":"updated","data":{"id":"PONER_AQUI_EL_SUBSCRIPTION_ID"}}'
```

### Simular cancelación (plan vuelve a FREE)
```bash
curl -X POST "https://fiar-api-212302024675.us-central1.run.app/api/v1/mercadopago/webhook" \
  -H "Content-Type: application/json" \
  -d '{"id":99998,"live_mode":false,"type":"subscription_preapproval","date_created":"2026-01-01T00:00:00.000-04:00","user_id":3206528554,"api_version":"v1","action":"updated","data":{"id":"PONER_AQUI_EL_SUBSCRIPTION_ID"}}'
```

---

## ⚠️ Notas importantes para producción

1. **En producción los webhooks SÍ funcionan automáticamente** — no hace falta simularlos
2. **En producción se cobra dinero real** — asegúrate de que todo funcione antes
3. El código del backend maneja ambos modos sin cambios — solo cambian las variables de entorno
4. El frontend detecta automáticamente si está en sandbox y redirige al `sandbox_init_point`
5. **Después de activar producción**, haz una prueba con un pago real (plan mensual $30.000) para confirmar que todo funciona end-to-end
6. Si algo sale mal, puedes volver a sandbox inmediatamente con el comando de la sección "Volver a SANDBOX"

---

*Documento técnico — Solo para desarrolladores*
