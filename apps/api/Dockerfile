FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

# Install all dependencies (monorepo root context)
FROM base AS deps
COPY package*.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/
RUN npm install

# Build shared types
FROM deps AS types-build
COPY packages/types ./packages/types
RUN cd packages/types && npm run build

# Build API
FROM types-build AS build
COPY apps/api ./apps/api
RUN cd apps/api && npm run build

# Production image
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
# ← copy compiled types so @techfield/types resolves at runtime
COPY --from=types-build /app/packages/types/dist ./packages/types/dist
COPY --from=types-build /app/packages/types/package.json ./packages/types/package.json

EXPOSE 3000
CMD ["node", "dist/main"]
