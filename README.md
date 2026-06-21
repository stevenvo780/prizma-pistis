# Pistis (ex Pistis)

Sistema de gestion de creditos de la suite Prizma.

> **Antes**: `pistis` · **Clave tecnica nueva**: `pistis` (suite Prizma). Los directorios `pistis-front`/`pistis-api` y demas rutas conservan su nombre como shim.

## Componentes

- `pistis-front`: frontend Next.js.
- `pistis-api`: API NestJS + TypeORM.
- `docker-compose.yml`: orquestacion local de frontend, backend y PostgreSQL.

## Infraestructura local

Servicios definidos:
- `postgres`: `5436:5432`
- `pistis-api`: `8080:8080`
- `pistis-front`: `3001:3000`

Dependencias externas opcionales:
- Firebase (auth y servicios administrativos).
- Mercado Pago (suscripciones/pagos).

## Arranque rapido

```bash
cd pistis
docker compose up --build
```

## Ejecucion por componente

```bash
cd pistis-api && npm install && npm run start:dev
cd ../pistis-front && npm install && npm run dev
```

## Referencias

- API: `pistis-api/README.md`
- Frontend: `pistis-front/README.md`
- Logica de negocio: `LOGICA_DE_NEGOCIO.md`
- Paso a produccion: `PASO_A_PRODUCCION.md`
