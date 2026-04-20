FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++

# 1. Build & pack @techfield/types as a self-contained tarball
COPY packages/types ./packages/types
RUN cd packages/types && npm install && npm run build && npm pack

# 2. Install API dependencies standalone
COPY apps/api/package.json ./apps/api/package.json
WORKDIR /app/apps/api
RUN sed -i 's|"@techfield/types": "\*"|"@techfield/types": "file:../../packages/types/techfield-types-1.0.0.tgz"|' package.json

# Install, then deduplicate express: remove any nested copy so all nestjs
# packages use the single express@4.21.2 at root node_modules
RUN npm install --legacy-peer-deps && \
    rm -rf node_modules/@nestjs/platform-express/node_modules && \
    npm dedupe --legacy-peer-deps 2>/dev/null || true

# 3. Build
WORKDIR /app
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN ./node_modules/.bin/tsc -p tsconfig.build.json

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]
