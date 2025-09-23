FROM node:20-alpine AS base
WORKDIR /app

# Install root deps
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
RUN npm install --omit=dev --workspaces=false --prefix ./apps/api || true

# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run -w apps/api build

# Runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/dist ./dist
RUN npm install --omit=dev
EXPOSE 4000
CMD ["node", "dist/index.js"]


