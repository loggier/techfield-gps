FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

FROM base AS deps
COPY package*.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/
RUN npm install

FROM deps AS types-build
COPY packages/types ./packages/types
RUN cd packages/types && npm run build

FROM types-build AS build
COPY apps/api ./apps/api
RUN cd apps/api && npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
# Resolve workspace symlink: replace it with actual compiled package
RUN rm -rf ./node_modules/@techfield/types
COPY --from=types-build /app/packages/types/package.json ./node_modules/@techfield/types/package.json
COPY --from=types-build /app/packages/types/dist ./node_modules/@techfield/types/dist

EXPOSE 3000
CMD ["node", "dist/main"]
