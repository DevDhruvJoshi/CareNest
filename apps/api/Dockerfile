FROM node:20-alpine AS build
WORKDIR /app

# Copy full monorepo and install deps
COPY . .
RUN npm ci

# Build shared DB package and generate Prisma client first
RUN npm run -w packages/db build && npm run -w packages/db prisma:generate

# Ensure the built dist exists inside installed package (file: dep)
# Replace potential workspace symlink with real package files for runtime
RUN rm -rf node_modules/@carenest/db && \
    mkdir -p node_modules/@carenest/db && \
    cp packages/db/package.json node_modules/@carenest/db/package.json && \
    cp -r packages/db/dist node_modules/@carenest/db/dist

# Build API
RUN npm run -w apps/api build

# Prune dev deps for production runtime and keep node_modules
RUN npm ci --omit=dev

# Runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/index.js"]


