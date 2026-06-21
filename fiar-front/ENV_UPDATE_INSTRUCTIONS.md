# Instrucciones de Configuración de Variables de Entorno

## .env.example — Actualización Requerida

El archivo `.env.example` debe actualizarse con las siguientes variables de entorno para producción:

### Cambio línea 1-2:

**ANTES:**
```
NEXT_PUBLIC_API=http://localhost:8080/api/v1
```

**DESPUÉS:**
```
NEXT_PUBLIC_API=https://prizma-pistis-kjopuery2a-uc.a.run.app
NEXT_PUBLIC_SITE_URL=https://pistis.prizmacorp.cloud
```

## Explicación

- **`NEXT_PUBLIC_API`**: URL del backend de Pistis (Cloud Run)
  - Dev local: `http://localhost:8090` (si levantas backend local)
  - Prod: `https://prizma-pistis-kjopuery2a-uc.a.run.app`
  - Usado en: `src/utils/axios.ts` (baseURL para todas las llamadas API)

- **`NEXT_PUBLIC_SITE_URL`**: URL del sitio frontend (para SEO/Open Graph)
  - Default: `https://pistis.prizmacorp.cloud`
  - Usado en: `src/pages/_document.js` (metadatos HTML, og:url, canonical)

## Cambios Realizados

- ✅ `src/pages/_document.js` línea 3: Ahora usa `process.env.NEXT_PUBLIC_SITE_URL` con fallback
- ✅ `src/utils/axios.ts` línea 5: Ya usa `process.env.NEXT_PUBLIC_API` (no requería cambios)
- ⏳ `.env.example` línea 1-2: **Requiere actualización manual** (bloqueado por permisos de seguridad)

## Para Vercel (Producción)

En la sección de **Settings → Environment Variables** del proyecto Vercel, configura:

```
NEXT_PUBLIC_API=https://prizma-pistis-kjopuery2a-uc.a.run.app
NEXT_PUBLIC_SITE_URL=https://pistis.prizmacorp.cloud
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
[resto de vars Firebase...]
```

## Build Local / Typecheck

```bash
# Usa el archivo .env.local con valores dev:
NEXT_PUBLIC_API=http://localhost:8090

# Typecheck sin hacer build completo (si es necesario)
npx tsc --noEmit

# Build completo (requiere backend corriendo)
npm run build
```
