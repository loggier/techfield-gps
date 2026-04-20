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

# Fix: Express 4 made app.router a throwing getter; NestJS adapter still calls it.
# Patch A — adapter: swap app.router for app._router (the real internal router)
RUN node -e " \
  var fs = require('fs'); \
  var p = 'node_modules/@nestjs/platform-express/adapters/express-adapter.js'; \
  var c = fs.readFileSync(p, 'utf8'); \
  var n = (c.match(/app\.router/g)||[]).length; \
  fs.writeFileSync(p, c.split('app.router').join('app._router')); \
  console.log('adapter: replaced ' + n + ' occurrences'); \
"
# Patch B — nested express application.js: replace the __defineGetter__ that throws
RUN node -e " \
  var fs = require('fs'); \
  var p = 'node_modules/@nestjs/platform-express/node_modules/express/lib/application.js'; \
  if (!fs.existsSync(p)) { console.log('no nested express — skip'); process.exit(0); } \
  var c = fs.readFileSync(p, 'utf8'); \
  var c2 = c.replace(/app\.__defineGetter__\('router'[\s\S]*?\}\);/, \
    'Object.defineProperty(app,\"router\",{get:function(){return this._router;},configurable:true});'); \
  if (c2 === c) { console.log('WARNING: pattern not matched in application.js'); } \
  else { fs.writeFileSync(p, c2); console.log('nested express application.js patched'); } \
"

# 3. Build
WORKDIR /app
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN ./node_modules/.bin/tsc -p tsconfig.build.json

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]
