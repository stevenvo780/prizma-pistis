# FIAR

Sistema de gestion de creditos del ecosistema Humanizar.

## Componentes

- `fiar-front`: frontend Next.js.
- `fiar-api`: API NestJS + TypeORM.
- `docker-compose.yml`: orquestacion local de frontend, backend y PostgreSQL.

## Infraestructura local

Servicios definidos:
- `postgres`: `5436:5432`
- `fiar-api`: `8080:8080`
- `fiar-front`: `3001:3000`

Dependencias externas opcionales:
- Firebase (auth y servicios administrativos).
- Mercado Pago (suscripciones/pagos).

## Arranque rapido

```bash
cd Fiar
docker compose up --build
```

## Ejecucion por componente

```bash
cd fiar-api && npm install && npm run start:dev
cd ../fiar-front && npm install && npm run dev
```

## Referencias

- API: `fiar-api/README.md`
- Frontend: `fiar-front/README.md`
- Logica de negocio: `LOGICA_DE_NEGOCIO.md`
- Paso a produccion: `PASO_A_PRODUCCION.md`
