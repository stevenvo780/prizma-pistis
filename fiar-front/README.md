# Pistis Frontend

Frontend web de Pistis para operacion comercial y de cartera.

## Stack

- Next.js 13 + React 18 + TypeScript
- Redux Toolkit
- Firebase Auth
- Axios

## Requisitos

- Node.js >= 18
- npm >= 9
- Pistis API disponible

## Configuracion

Crear variables de entorno locales:

```bash
cp .env.example .env.local
```

Variables usadas por el runtime:
- `NEXT_PUBLIC_API` (ejemplo local: `http://localhost:8080/api/v1`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Ejecucion

```bash
npm install
npm run dev
```

Aplicacion local:
- `http://localhost:3000`

## Build

```bash
npm run build
npm run start
```

## Docker

Desde `Pistis/` se orquesta junto con API y Postgres:

```bash
docker compose up --build
```

Puerto publicado en el stack: `3001:3000`.

## Scripts utiles

```bash
npm run lint
```

## Referencias

- API: `../pistis-api/README.md`
- Stack completo: `../docker-compose.yml`
