# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas arquivos de dependências primeiro (cache layer)
COPY package*.json ./

# Instalar todas as dependências (incluindo dev)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copiar apenas package*.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar build do stage anterior
COPY --from=builder /app/dist ./dist

# Expor porta da aplicação
EXPOSE 3000

# Usuário não-root para segurança
USER node

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"]
