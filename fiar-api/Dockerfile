# Build stage
FROM node:18-alpine AS builder

# Instalar dependencias necesarias para la compilación
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copiar archivos necesarios para la instalación
COPY package*.json ./
COPY tsconfig*.json nest-cli.json ./
# Copiar el vendor local ANTES de npm ci para que el file: dep resuelva correctamente
COPY vendor-prizma-contracts ./vendor-prizma-contracts

# Instalar dependencias con cache optimizado
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación con nest build (webpack omitido: incompatibilidad node18/webpack-cli@7)
RUN npm run build

# Prune para producción (antes de copiar el vendor manualmente)
RUN npm prune --production

# Reemplazar el symlink de prizma-contracts con una copia física para que
# la copia multi-stage no pierda el módulo local (npm link = symlink absoluto).
# Se hace DESPUÉS del prune para que npm no borre la copia manual.
RUN rm -rf /app/node_modules/prizma-contracts && \
    cp -r /app/vendor-prizma-contracts /app/node_modules/prizma-contracts

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar los artefactos de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Configuración de producción
ENV NODE_ENV=production
ENV PORT=8080
ENV NODE_OPTIONS="--max-old-space-size=512 --no-warnings"

# Health check para garantizar el uptime en Cloud Run
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

# Exponer el puerto
EXPOSE ${PORT}

# Comando de inicio
CMD ["node", "dist/main.js"]
