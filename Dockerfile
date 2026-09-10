# https://docs.docker.com/engine/reference/builder/
FROM node:20-alpine AS base

# --- dependencies ---
# Install the FULL dependency tree, devDependencies included. `next build`
# resolves tailwindcss and @tailwindcss/postcss at build time and both are
# devDependencies, so `--omit=dev` here made the build fail on
# "Cannot find module '@tailwindcss/postcss'". Nothing from this stage reaches
# the runtime image: the runner copies only the standalone output, which
# already contains the pruned production node_modules Next traced.
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
