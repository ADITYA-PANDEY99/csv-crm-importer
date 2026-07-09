# Stage 1: Build packages
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@9.12.0
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @csv-crm/shared build
RUN pnpm --filter @csv-crm/api build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@9.12.0

# Copy only production configuration and builds
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/package.json /app/
COPY --from=builder /app/packages/shared/package.json /app/packages/shared/package.json
COPY --from=builder /app/packages/shared/dist /app/packages/shared/dist
COPY --from=builder /app/apps/api/package.json /app/apps/api/package.json
COPY --from=builder /app/apps/api/dist /app/apps/api/dist

RUN pnpm install --prod --no-frozen-lockfile

EXPOSE 3001
CMD ["pnpm", "--filter", "@csv-crm/api", "start"]
