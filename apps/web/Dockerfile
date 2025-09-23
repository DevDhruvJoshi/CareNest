FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
RUN npm install --workspaces=false --prefix ./apps/web || true

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run -w apps/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web .
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]


