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
RUN npm install --legacy-peer-deps

# NestJS's isMiddlewareApplied accesses app.router which Express 4 made a
# throwing getter. Patch the adapter to use app._router (the real router).
RUN node -e " \
  const fs = require('fs'); \
  const p = 'node_modules/@nestjs/platform-express/adapters/express-adapter.js'; \
  let c = fs.readFileSync(p, 'utf8'); \
  const count = (c.match(/app\.router/g) || []).length; \
  c = c.split('app.router').join('app._router'); \
  fs.writeFileSync(p, c); \
  console.log('express-adapter.js: replaced ' + count + ' app.router -> app._router'); \
"

# 3. Build
WORKDIR /app
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN ./node_modules/.bin/tsc -p tsconfig.build.json

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]
