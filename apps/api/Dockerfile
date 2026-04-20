FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++

# Copy monorepo structure
COPY package*.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# Install all workspace dependencies
RUN npm install

# Build types
COPY packages/types ./packages/types
RUN cd packages/types && npm run build

# Remove workspace symlink and replace with real compiled package
RUN rm -rf ./node_modules/@techfield/types && \
    mkdir -p ./node_modules/@techfield/types && \
    cp packages/types/package.json ./node_modules/@techfield/types/ && \
    cp -r packages/types/dist ./node_modules/@techfield/types/dist

# Build API
COPY apps/api ./apps/api
RUN cd apps/api && npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "apps/api/dist/main"]
