# 🧪 Guía de Pruebas de Pagos — FIAR

¡Hola! Esta guía te explica paso a paso cómo probar los pagos en FIAR. **No te preocupes**, el sistema está en modo de pruebas, así que **NO se va a cobrar dinero real**. Todo es simulado.

---

## 📦 Lo que necesitas antes de empezar

### 1. Tu cuenta de FIAR
Usa tu cuenta normal de FIAR para iniciar sesión.

### 2. Cuenta de Mercado Pago de prueba
Cuando te pida pagar, usa esta cuenta **de prueba** de Mercado Pago:

| | |
|---|---|
| **Email** | `test_user_3549839656740443625@testuser.com` |
| **Contraseña** | `ckgWOkXLny` |

### 3. Tarjeta de prueba
Cuando te pida una tarjeta, usa estos datos **ficticios**:

| | |
|---|---|
| **Número de tarjeta** | `5031 7557 3453 0604` |
| **Nombre en la tarjeta** | `TEST USER` |
| **Fecha de vencimiento** | `11/30` |
| **Código de seguridad (CVV)** | `123` |
| **Tipo de documento** | `CC` |
| **Número de documento** | `12345678` |

> 💡 **Tip:** Copia estos datos en un bloc de notas para tenerlos a mano.

---

## 🧪 PRUEBA 1: Suscribirse a un plan

### Paso 1 — Abrir FIAR
1. Abre **Google Chrome** (recomendado)
2. Ve a: **https://fiar.humanizar.cloud**
3. Inicia sesión con tu cuenta de FIAR

### Paso 2 — Ir a la página de Planes
1. En el menú de la izquierda, haz clic en **"Planes"** 📋
2. Deberías ver dos opciones de plan:
   - **Plan Mensual** — $30.000 al mes
   - **Plan Anual** — $288.000 al año (con descuento)

> ✅ **Verificar:** ¿Se ven los dos planes con sus precios correctos?

### Paso 3 — Elegir un plan
1. Haz clic en el botón **"Elegir Mensual"**
2. Aparecerá una ventana con el resumen del plan
3. Verifica que diga: "Plan BASIC Mensual — $30.000/mes"
4. Haz clic en **"Suscribirme con Mercado Pago"**

> ⏳ Espera unos segundos, se va a abrir la página de Mercado Pago.

### Paso 4 — Iniciar sesión en Mercado Pago (pruebas)
Se abrirá la página de Mercado Pago. **Arriba vas a ver un banner que dice "Test"** — eso es normal, significa que estás en modo pruebas.

1. Si te pide iniciar sesión:
   - Email: `test_user_3549839656740443625@testuser.com`
   - Contraseña: `ckgWOkXLny`
2. Si te pide **verificación**, selecciona la opción **"Contraseña"**
3. Si ya estás con sesión abierta, simplemente continúa

> ⚠️ **Si te sale error de sesión:** Abre una **ventana de incógnito** en Chrome (Ctrl+Shift+N) y repite desde el Paso 1.

### Paso 5 — Pagar con la tarjeta de prueba
1. Si ves una tarjeta guardada **"Mastercard **** 0604"**, haz clic en ella
2. Si NO ves tarjeta guardada, haz clic en **"Nueva tarjeta"** y llena:
   - Número: `5031 7557 3453 0604`
   - Nombre: `TEST USER`
   - Vencimiento: `11/30`
   - CVV: `123`
   - Documento: CC `12345678`
3. Haz clic en **"Continuar"** o **"Pagar"**

### Paso 6 — Confirmar el pago
1. Revisa que el monto sea correcto ($30.000)
2. Haz clic en **"Confirmar"**
3. Espera a que procese... ⏳

### Paso 7 — Verificar que todo salió bien
1. Deberías ver el mensaje: **"¡Listo! Ya te suscribiste"** ✅
2. Haz clic en **"Volver al sitio del vendedor"**
3. FIAR te mostrará una pantalla que dice **"Activando tu plan..."** con un spinner
4. El sistema verificará automáticamente tu pago con MercadoPago (puede tomar 10-20 segundos)
5. Cuando termine, verás: **"¡Pago exitoso!"** con un check verde ✅

> ✅ **Verificar:** ¿Viste "Activando tu plan..." y luego "¡Pago exitoso!"?

### Paso 8 — Verificar que el plan cambió
1. Haz clic en **"Ir al Dashboard"**
2. Tu plan debería decir **"Basic"** en vez de "Free"

> ✅ **Verificar:** ¿El dashboard muestra plan "Basic"?
>
> ⚠️ **Nota:** Si todavía dice "Free", cierra sesión y vuelve a iniciar sesión. Si sigue sin cambiar, avísale al desarrollador con la **hora exacta** del pago.

---

## 🧪 PRUEBA 2: Cancelar la suscripción

### Paso 1
1. Ve a la página de **"Planes"** (menú izquierdo)
2. Deberías ver que ya tienes el plan activo

### Paso 2
1. Busca el botón **"Cancelar suscripción"**
2. Haz clic en él
3. Confirma la cancelación

### Paso 3
1. Cierra sesión y vuelve a iniciar sesión
2. Ve al Dashboard
3. El plan debería volver a decir **"Free"**

> ✅ **Verificar:** ¿El plan volvió a "Free" después de cancelar?

---

## 🧪 PRUEBA 3: Intentar suscribirse al plan Anual

Repite la **PRUEBA 1** pero esta vez:
- En el Paso 3, elige **"Elegir Anual"** en vez de Mensual
- Verifica que el monto sea **$288.000**
- El resto de los pasos es igual

> ✅ **Verificar:** ¿Funciona igual que el mensual pero con el precio anual?

---

## 🧪 PRUEBA 4: Verificar límite de clientes

### Con plan FREE (sin suscripción):
1. Ve a **"Clientes"** en el menú
2. Intenta crear clientes hasta llegar a **5**
3. Al intentar crear el cliente número **6**, debería mostrarte un error o impedirte crearlo

> ✅ **Verificar:** ¿Te bloquea al intentar crear más de 5 clientes en plan Free?

### Con plan BASIC (suscrito):
1. Suscríbete al plan (PRUEBA 1)
2. Ahora intenta crear más clientes
3. Deberías poder crear hasta **50 clientes**

> ✅ **Verificar:** ¿Con plan Basic puedes crear más de 5 clientes?

---

## 📝 Hoja de resultados

Copia esta tabla y llénala con tus resultados:

| # | Prueba | ¿Funcionó? | Comentarios |
|---|--------|------------|-------------|
| 1 | Ver planes con precios correctos | ⬜ Sí / ⬜ No | |
| 2 | Elegir plan Mensual y ver resumen | ⬜ Sí / ⬜ No | |
| 3 | Abrir Mercado Pago de pruebas | ⬜ Sí / ⬜ No | |
| 4 | Pagar con tarjeta de prueba | ⬜ Sí / ⬜ No | |
| 5 | Ver "¡Listo! Ya te suscribiste" | ⬜ Sí / ⬜ No | |
| 6 | Ver "¡Pago exitoso!" en FIAR | ⬜ Sí / ⬜ No | |
| 7 | Plan cambió a "Basic" en Dashboard | ⬜ Sí / ⬜ No | |
| 8 | Cancelar suscripción funciona | ⬜ Sí / ⬜ No | |
| 9 | Plan volvió a "Free" tras cancelar | ⬜ Sí / ⬜ No | |
| 10 | Plan Anual funciona ($288.000) | ⬜ Sí / ⬜ No | |
| 11 | Límite 5 clientes en Free | ⬜ Sí / ⬜ No | |
| 12 | Más de 5 clientes en Basic | ⬜ Sí / ⬜ No | |

---

## ⚠️ Solución de problemas comunes

### "Me sale un error al intentar pagar"
→ Puede que ya tengas una suscripción activa. Ve a **Planes** y cancélala primero.

### "La página de Mercado Pago no carga"
→ Abre una **ventana de incógnito** (Ctrl+Shift+N en Chrome) y vuelve a intentar.

### "No me acepta la tarjeta"
→ Asegúrate de copiar el número exacto: `5031 7557 3453 0604`. Sin espacios de más ni números faltantes.

### "Pagué pero mi plan sigue en Free"
→ Espera en la pantalla de "Activando tu plan..." hasta que termine (máximo 20 segundos). Si después de eso sigue en Free, **cierra sesión y vuelve a entrar**. Si persiste, avísale al desarrollador con la hora del pago.

### "Me pide verificar email en Mercado Pago"
→ Selecciona la opción **"Contraseña"** en vez de email para verificar.

---

## 🐛 ¿Encontraste un error?

Si algo no funciona como se describe aquí, por favor anota:

1. 📸 **Captura de pantalla** del error
2. 📝 **En qué paso** estabas (ej: "Paso 4 de la Prueba 1")
3. 🕐 **Hora** en que pasó
4. 🌐 **Navegador** que usas (Chrome, Firefox, etc.)

Envíale esta información al desarrollador.

---

## 🔑 Datos de referencia rápida

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CUENTA MERCADO PAGO DE PRUEBA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Email:      test_user_3549839656740443625@testuser.com
  Contraseña: ckgWOkXLny

  TARJETA DE PRUEBA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Número:     5031 7557 3453 0604
  Nombre:     TEST USER
  Vencimiento: 11/30
  CVV:        123
  Documento:  CC 12345678

  URL DE FIAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  https://fiar.humanizar.cloud
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

> 💡 **Recuerda:** Todo esto es modo prueba. No se cobra dinero real. Puedes repetir las pruebas las veces que quieras.

*Guía creada el 25/Feb/2026*
