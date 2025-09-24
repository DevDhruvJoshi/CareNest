FROM node:20-alpine AS build
WORKDIR /app

# Copy monorepo and install deps
COPY . .
RUN npm ci

# Build web app
RUN npm run -w apps/web build

# Prune dev deps and keep node_modules for runtime
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what is needed to run Next.js
COPY --from=build /app/apps/web/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/next.config.js ./next.config.js
COPY --from=build /app/apps/web/.next/standalone ./

EXPOSE 3000
CMD ["node", "server.js"]


