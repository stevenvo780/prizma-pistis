# FIAR — Lógica de Negocio

> **Sistema de Créditos sin Interés para Comercios**  
> Permite a comercios "fiar" dinero a clientes de confianza con control total sobre límites de crédito, transacciones y suscripciones premium.

---

## 1. Arquitectura General

| Capa | Tecnología | URL |
|------|-----------|-----|
| **Frontend** | Next.js 13 + React 18 + Redux Toolkit + React Bootstrap | `localhost:3001` / `fiar-front.vercel.app` |
| **Backend API** | NestJS 10 + TypeORM + PostgreSQL + Firebase Admin | `localhost:8080/api/v1` / Cloud Run |
| **Autenticación** | Firebase Auth (email/password + Google) | `fiar-3a207.firebaseapp.com` |
| **Pagos** | Mercado Pago PreApproval (suscripciones recurrentes) | `api.mercadopago.com` |
| **Base de datos** | PostgreSQL (Neon en prod, Docker local) | Puerto 5432 |

---

## 2. Modelo de Datos

### 2.1 User (Tabla `user`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (PK) | UID de Firebase Auth |
| `email` | string | Correo del usuario |
| `name` | string | Nombre/razón social |
| `role` | enum | `super_admin`, `business_owner`, `customer` |
| `apiKey` | string? | Clave para acceso server-to-server |

**Roles:**
- **`super_admin`**: Acceso total al sistema. Se asigna automáticamente cuando un usuario se autentica por primera vez sin registro previo (vía FirebaseAuthGuard).
- **`business_owner`**: Dueño de comercio. Se asigna al registrarse vía formulario web. Puede crear clientes, transacciones, gestionar su perfil y suscripciones.
- **`customer`**: Cliente del comercio (uso futuro vía API).

### 2.2 Client (Tabla `client`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int (PK, auto) | ID interno |
| `document` | string | Cédula/NIT (único por usuario) |
| `name` | string | Nombre |
| `lastname` | string | Apellido |
| `credit_limit` | decimal | Límite de crédito máximo |
| `current_balance` | decimal | Saldo actual disponible |
| `trusted` | boolean | Marcado como confiable |
| `blocked` | boolean? | Marcado como bloqueado |
| `city`, `state`, `direction` | string? | Ubicación |
| `phone`, `email` | string? | Contacto |
| `user` | relación | Pertenece a un User (owner) |

**Reglas de negocio:**
- Un cliente pertenece a un `user` (business_owner).
- `document` es único por usuario (no puede repetir cédula en el mismo negocio).
- `credit_limit` se auto-incrementa cuando un ingreso supera el límite actual.
- `current_balance` cambia con cada transacción aprobada.

### 2.3 Transaction (Tabla `transaction`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único |
| `amount` | decimal | Monto de la transacción |
| `status` | enum | `pending`, `approved`, `rejected` |
| `operation` | enum | `income` (abono), `expense` (préstamo) |
| `detail` | JSON | Información adicional |
| `client` | relación | Cliente asociado |
| `owner` | relación | Usuario dueño del negocio |

### 2.4 Profile (Tabla `profile`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int (PK) | ID interno |
| `phone` | string? | Teléfono del comercio |
| `commerce_name` | string? | Nombre del comercio |
| `user` | relación 1:1 | Vinculado a un User |

### 2.5 Subscription (Tabla `subscription`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int (PK) | ID interno |
| `planType` | enum | `FREE`, `BASIC`, `PRO`, `ENTERPRISE` |
| `startDate` | date | Inicio de suscripción |
| `endDate` | date | Fin de suscripción |
| `lastPaymentSource` | string? | Referencia del último medio de pago |
| `mpSubscriptionId` | string? | ID de la suscripción (PreApproval) en Mercado Pago |
| `mpSubscriptionStatus` | string? | Estado de la suscripción en MP (`pending`, `authorized`, `paused`, `cancelled`) |
| `user` | relación 1:1 | Vinculado a un User |

### 2.6 PaymentSource (Tabla `payment_source`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int (PK) | ID interno |
| `sourceId` | string | ID del payment source (encriptado con AES-256-CBC) |
| `active` | boolean | Si está activa |
| `frequency` | enum | `MONTHLY`, `ANNUALLY` |
| `nextCharge` | date | Próximo cobro programado |
| `planType` | enum | Tipo de plan |
| `user` | relación | Vinculado a un User |

---

## 3. Flujos de Negocio

### 3.1 Registro de Usuario
```
[Frontend] Formulario → Firebase.createUserWithEmailAndPassword()
                       → Obtener ID Token
                       → POST /auth/register (con Bearer token)
                       → Backend verifica token → crea User con rol BUSINESS_OWNER
                       → Redirige a /transacciones
```

### 3.2 Login
```
[Frontend] Email/Password → Firebase.signInWithEmailAndPassword()
           Google → Firebase.signInWithPopup(GoogleProvider)
                  → Obtener ID Token → guardar en Redux
                  → Redirige a /transacciones
```
- Token se renueva automáticamente cada 55 minutos.
- Axios interceptor adjunta el token a cada petición.
- Si recibe 401/403, intenta renovar el token automáticamente.

### 3.3 Gestión de Clientes (CRUD)
- **Crear**: `POST /clients` — Verifica que no exista otro cliente con el mismo documento para ese usuario.
- **Listar**: `GET /clients?page=X&limit=Y&search=Z` — Paginado, con búsqueda por nombre.
- **Actualizar**: `PUT /clients/:id` — Verifica que el cliente pertenece al usuario autenticado.
- **Eliminar**: `DELETE /clients/:id` — Verificación de propiedad.
- **Excel Import**: El frontend permite importar clientes desde archivos `.xlsx`.
- **Excel Export**: Descarga la lista de clientes en formato Excel.
- **Balance**: `GET /clients/:id/balance` — Retorna el saldo actual.

### 3.4 Transacciones (Flujo Principal)

#### Crear Transacción
```
POST /transactions/web
{
  clientId: number,         // ID del cliente
  amount: number,           // Monto
  operation: "income"|"expense",
  status: "approved"|"pending",
  detail: {}                // Opcional
}
```

**Reglas:**
1. Si `operation = "expense"` (préstamo): Verifica que el cliente tenga saldo suficiente (`current_balance >= amount`).
2. Si `status = "approved"`:
   - **Income (abono)**: Suma `amount` al `current_balance` del cliente. Si el nuevo balance supera `credit_limit`, actualiza `credit_limit`.
   - **Expense (préstamo)**: Resta `amount` del `current_balance` del cliente.
3. Si `status = "pending"`: No modifica el balance del cliente.

#### Resolución de Cliente
La transacción puede crearse con:
- `clientId` (referencia directa)
- `clientData` (teléfono, documento o email) → Busca el cliente; si no existe, lo crea automáticamente con `credit_limit = 100,000`.

#### Cambio de Estado
```
PUT /transactions/:id
{ status: "approved" | "rejected" }
```

**Transiciones válidas:**
- `pending → approved`: Aplica el impacto financiero (ingreso/egreso).
- `pending → rejected`: No aplica cambios.
- `approved → rejected`: **Revierte** el impacto financiero.
- `approved → pending`: **Revierte** el impacto y deja la transacción en espera.

#### Eliminar Transacción
- Si la transacción tenía `status = "approved"`, se **revierten** los créditos automáticamente.

### 3.5 Suscripciones y Pagos Recurrentes (Mercado Pago – PreApproval)

#### Flujo de Suscripción Recurrente
```
1. Frontend: Usuario elige plan (Mensual o Anual) desde /plans
2. Frontend muestra modal con resumen de plan, métodos de pago aceptados
   (tarjeta, PSE, Nequi, Efecty) y botón "Suscribirme con Mercado Pago"
3. Frontend → Backend: POST /mercadopago/subscribe
   { planType: "BASIC", frequency: "MONTHLY"|"ANNUALLY" }
4. Backend crea una Suscripción Recurrente (PreApproval) en Mercado Pago con:
   - reason: "Suscripción FIAR - Plan BASIC Mensual/Anual"
   - external_reference: "userId|planType|frequency"
   - payer_email: email del usuario
   - auto_recurring: { frequency, frequency_type, transaction_amount, currency_id: "COP" }
   - back_url: URL de retorno post-pago
5. Backend guarda mpSubscriptionId y mpSubscriptionStatus en DB
6. Backend retorna init_point (URL del checkout hosted de MP)
7. Frontend redirige al usuario al checkout de suscripción de Mercado Pago
8. Usuario completa pago en Mercado Pago (tarjeta de crédito/débito)
9. Mercado Pago redirige al usuario a /payment/success
10. Mercado Pago → Backend: POST /mercadopago/webhook (notifica eventos)
11. Backend: Procesa webhooks de tipo subscription_preapproval
    - Si status=authorized → actualiza Subscription del usuario al plan pagado
```

#### Cobro Automático
- **MP se encarga de los cobros recurrentes** — El usuario solo paga una vez en el checkout
- **Mensual**: MP cobra automáticamente cada mes
- **Anual**: MP cobra automáticamente cada 12 meses
- El comerciante no necesita intervenir; MP gestiona reintentos y notificaciones

#### Precios
- **Mensual**: $30,000 COP/mes (cobro automático mensual)
- **Anual**: $288,000 COP/año (cobro automático anual — 20% descuento, equivale a $24,000/mes)

#### Gestión de Suscripciones
- **Consultar estado**: `GET /mercadopago/subscription-info` — Retorna datos de la suscripción local + status en MP
- **Cancelar**: `POST /mercadopago/cancel-subscription` — Cambia status a `cancelled` en MP y en DB, plan vuelve a FREE
- **Pausar**: `POST /mercadopago/pause-subscription` — Cambia status a `paused` en MP (usuario puede reactivar desde MP)

#### Páginas de resultado de pago
- `/payment/success` — Pago exitoso (✅), enlace al inicio
- `/payment/failure` — Pago fallido (❌), botón reintentar
- `/payment/pending` — Pago en proceso (⏰), información de espera

#### Endpoints de Mercado Pago
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/mercadopago/subscribe` | POST | Crea suscripción recurrente (PreApproval) y retorna URL de checkout |
| `/mercadopago/subscription-info` | GET | Consulta estado de suscripción del usuario |
| `/mercadopago/payment-status/:id` | GET | Consulta estado de un pago específico |
| `/mercadopago/cancel-subscription` | POST/GET | Cancela suscripción activa en MP |
| `/mercadopago/pause-subscription` | POST | Pausa suscripción (se puede reactivar) |
| `/mercadopago/webhook` | POST | Recibe notificaciones de eventos de MP |

#### Webhook Events
| Evento | Acción del Backend |
|--------|-------------------|
| `subscription_preapproval` | Consulta la PreApproval en MP → Si status=authorized → confirma suscripción |
| `payment` | Consulta el pago en MP → Si approved con external_reference → confirma pago |

#### Cancelación
- `POST /mercadopago/cancel-subscription` (autenticado)
- Actualiza PreApproval en MP a status `cancelled`
- Cambia la suscripción local a FREE
- Limpia `mpSubscriptionId` y `mpSubscriptionStatus`

### 3.6 API Key Auth (Server-to-Server)
- Endpoint `POST /transactions` (sin `/web`) usa `ApiKeyAuthGuard`
- Requiere header `X-API-KEY` con la apiKey del usuario
- Diseñado para integraciones POS/e-commerce

---

## 4. Seguridad

| Mecanismo | Detalle |
|-----------|---------|
| **Autenticación** | Firebase Auth (tokens JWT verificados con Firebase Admin SDK) |
| **Autorización** | Guards: `FirebaseAuthGuard`, `RolesGuard`, `ApiKeyAuthGuard` |
| **Auto-creación** | Si un usuario se autentica y no existe en DB → se crea como `SUPER_ADMIN` |
| **Encriptación** | PaymentSource.sourceId encriptado con AES-256-CBC (`ENCRYPTION_KEY`) |
| **CORS** | Habilitado globalmente |
| **SSL DB** | En producción (`NODE_ENV=PROD`) se conecta con `ssl: { rejectUnauthorized: false }` |
| **Token Renewal** | Frontend renueva token cada 55 min; interceptor reintenta en 401/403 |

---

## 5. Frontend — Páginas y Funcionalidades

| Ruta | Descripción |
|------|-------------|
| `/home` | Landing page pública con info del sistema |
| `/login` | Login (email/password + Google), registro, recuperar contraseña |
| `/transacciones` | CRUD de transacciones con filtros avanzados (monto, fecha, estado, búsqueda), exportar Excel, paginación |
| `/client` | CRUD de clientes, búsqueda, importar/exportar Excel, estado de cuenta, deudas pendientes |
| `/plans` | Página de planes con modal de suscripción (MP PreApproval recurrente), toggle mensual/anual |
| `/payment/success` | Resultado de pago exitoso |
| `/payment/failure` | Resultado de pago fallido |
| `/payment/pending` | Resultado de pago pendiente |
| `/edit_user` | Editar perfil (nombre, comercio, teléfono), generar API Key, cambiar contraseña |

---

## 6. Bugs Encontrados y Corregidos

| # | Bug | Archivo | Fix |
|---|-----|---------|-----|
| 1 | **Registro fallaba**: El frontend enviaba datos al backend sin crear primero el usuario en Firebase | `fiar-front/src/store/user/index.tsx` | Se modificó `registerUser` para crear usuario en Firebase primero, obtener token, luego llamar al backend |
| 2 | **`GET /user` devolvía 403**: `fetchUser()` llamaba a `GET /user` (listado admin) en vez de `GET /user/me/data` | `fiar-front/src/api/users.ts` | Cambiar endpoint a `/user/me/data` |
| 3 | **FirebaseAuthGuard dejaba `req.user = null`**: Cuando se creaba un usuario nuevo, asignaba el usuario y luego sobreescribía con `null` | `fiar-api/src/auth/firebase-auth.guard.ts` | Agregar `else` para que solo asigne cuando el usuario ya existe |
| 4 | **Rol incorrecto al registrar**: Usuarios se creaban como `CUSTOMER` en vez de `BUSINESS_OWNER`, lo que impedía crear transacciones | `fiar-api/src/auth/auth.controller.ts` | Cambiar default de `CUSTOMER` a `BUSINESS_OWNER` |
| 5 | **API Key de Firebase incorrecta**: La key extraída del bundle tenía `_` en vez de `z` | `fiar-front/.env.local` | Obtener la key correcta via `gcloud services api-keys get-key-string` |
| 6 | **addTransaction no relanzaba errores**: El store atrapaba el error pero no lo relanzaba, por lo que el modal mostraba "éxito" incluso cuando el backend retornaba 400 (créditos insuficientes) | `fiar-front/src/store/transactions/index.tsx` | Agregar `throw err` en el catch de `addTransaction` |
| 7 | **Mensajes de error genéricos en clientes**: Todos los errores del CRUD de clientes mostraban "Ocurrió un error, consulta a soporte" en vez del mensaje real del backend | `fiar-front/src/store/client/index.tsx` | Extraer `error.response.data.message` en los catch de `createClient`, `updateClient`, `deleteClient` |
| 8 | **Editar perfil enviaba campo `plugins` inválido**: `handleSubmit` enviaba `{ ...formData, plugins }` al backend, pero `User` no tiene campo `plugins`, causando un 500 Internal Server Error | `fiar-front/src/pages/edit_user/index.tsx` | Enviar solo campos válidos: `{ email, name, apiKey }` |
| 9 | **Transacciones no aparecían en lista sin recargar**: El reducer de transacciones no tenía cases para `ADD_TRANSACTION`, `UPDATE_TRANSACTION` ni `DELETE_TRANSACTION`, por lo que nuevas transacciones no se reflejaban en la UI sin refrescar la página | `fiar-front/src/store/transactions/reducer.ts` | Agregar los 3 cases faltantes al reducer |

---

## 6b. Correcciones de Responsive y Usabilidad

| # | Problema | Archivo(s) | Fix |
|---|---------|-----------|-----|
| R1 | **Toolbar de clientes se rompía en móvil**: Los botones de acción (Nuevo, Excel, Estado, Deudas) usaban `Navbar.Collapse` que colapsaba en mobile | `fiar-front/src/pages/client/index.tsx` + `Client.module.css` | Reemplazar con flex-wrap div responsive |
| R2 | **Paginación en inglés**: rc-pagination mostraba "items" y "page" en inglés | Páginas client y transacciones | Agregar `paginationLocale` con textos en español |
| R3 | **FAB solapaba última tarjeta**: El botón flotante "+" en transacciones tapaba la última transacción | `Transactions.module.css` | Agregar `paddingBottom: 100px` al contenedor |
| R4 | **Footer descentrado**: Copyright no estaba centrado | `Footer.tsx` | Agregar `text-center` |
| R5 | **Header inconsistente**: "Transacciones" aparecía en minúscula | `Header.tsx` | Capitalizar "Transacciones" |
| R6 | **Cards sin espacio en mobile**: Las tarjetas de transacciones y clientes no tenían gap entre ellas | CSS modules | Agregar gap y media queries responsive |
| R7 | **Filtros de transacciones se desbordaban**: En pantallas pequeñas los filtros no tenían wrapping | `Transactions.module.css` | Agregar flex-wrap y ajustes responsive |

---

## 7. Variables de Entorno

### Backend (`fiar-api/.env`)
```env
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME  # PostgreSQL
DB_SYNCHRONIZE=true                                    # Auto-sync schema (solo dev)
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL
MP_ACCESS_TOKEN              # Token de acceso de Mercado Pago (TEST o PROD)
ENCRYPTION_KEY                # 32 chars, para AES-256-CBC
RENEWAL_ACCESS_KEY            # Para proteger endpoint de renovación
APP_DOMAIN                    # Dominio del frontend (para back_urls de MP)
PORT                          # Default: 8080
NODE_ENV                      # PROD habilita SSL
```

### Frontend (`fiar-front/.env.local`)
```env
NEXT_PUBLIC_API               # URL del backend (http://localhost:8080/api/v1)
NEXT_PUBLIC_FIREBASE_*        # Config de Firebase (6 variables)
NEXT_PUBLIC_MP_PUBLIC_KEY     # Llave pública de Mercado Pago
```

---

## 8. Despliegue

| Servicio | Plataforma | URL |
|----------|-----------|-----|
| Frontend | **Vercel** | `https://fiar-front.vercel.app` |
| Backend | **Google Cloud Run** | `https://fiar-api-212302024675.us-central1.run.app` |
| Base de datos | **Neon** (PostgreSQL serverless) | `ep-plain-sky-a52y0tgz-pooler.us-east-2.aws.neon.tech` |
| Auth | **Firebase** | Proyecto `fiar-3a207` |

---

## 9. Diagrama de Relaciones

```
User (1) ──── (N) Client
  │                  │
  │                  └── (N) Transaction
  │
  ├── (1) Profile
  ├── (1) Subscription
  └── (N) PaymentSource
```

---

## 10. Tests de Integración Realizados (Browser)

Todos los flujos fueron probados en navegador (Playwright) tanto en desktop (1280×800) como en mobile (375×812):

| # | Test | Resultado | Notas |
|---|------|-----------|-------|
| 1 | Home page carga correctamente | ✅ | Landing, CTAs, secciones informativas |
| 2 | Login con email/password | ✅ | Redirige a /transacciones |
| 3 | Registro de nuevo usuario | ✅ | Firebase + backend (corregido bug #1, #3, #4) |
| 4 | Crear cliente | ✅ | Validaciones de campos, documento único |
| 5 | Editar cliente | ✅ | Actualización de datos y límite de crédito |
| 6 | Eliminar cliente | ✅ | Con confirmación |
| 7 | Crear transacción (income) | ✅ | Balance se actualiza correctamente |
| 8 | Crear transacción (expense) | ✅ | Valida saldo suficiente (edge case corregido bug #6) |
| 9 | Edge case: expense > balance | ✅ | Muestra error "Créditos insuficientes" |
| 10 | Filtros de transacciones | ✅ | Búsqueda, estado, operación, fechas |
| 11 | Exportar Excel (clientes) | ✅ | Descarga archivo .xlsx |
| 12 | Exportar Excel (transacciones) | ✅ | Descarga archivo .xlsx |
| 13 | Editar perfil | ✅ | Nombre, API key (corregido bug #8) |
| 14 | Planes y modal de pago | ✅ | Muestra modal con resumen, info de suscripción recurrente |
| 15 | Mercado Pago Suscripción Recurrente | ✅ | Crea PreApproval en MP, redirige al checkout de suscripción. Probado plan Anual ($288.000) y Mensual ($30.000) |
| 16 | Responsive mobile | ✅ | Todas las páginas verificadas en 375×812 |
| 17 | Paginación en español | ✅ | "elementos", "página" en es-ES |
| 18 | Estado de cuenta / Deudas pendientes | ✅ | Filtros funcionan correctamente |

---

*Documento generado y verificado — Proyecto FIAR by Humanizar*
