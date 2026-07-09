# Stage 1: Build Next.js app
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@9.12.0
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @csv-crm/shared build
RUN pnpm --filter @csv-crm/web build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@9.12.0

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/
COPY --from=builder /app/packages/shared/package.json /app/packages/shared/package.json
COPY --from=builder /app/packages/shared/dist /app/packages/shared/dist
COPY --from=builder /app/apps/web/package.json /app/apps/web/package.json
COPY --from=builder /app/apps/web/.next /app/apps/web/.next
COPY --from=builder /app/apps/web/public /app/apps/web/public

RUN pnpm install --prod --no-frozen-lockfile

EXPOSE 3000
CMD ["pnpm", "--filter", "@csv-crm/web", "start"]
