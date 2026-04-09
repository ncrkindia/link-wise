# syntax=docker/dockerfile:1

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# --- Builder Stage ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Configuration for Build-time (Next.js Public Variables)
ARG NEXT_PUBLIC_APP_URL=""
ARG NEXT_PUBLIC_APP_NAME="LinkWise"
ARG NEXT_PUBLIC_SUPPORT_EMAIL="linkwise@slpro.in"

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_SUPPORT_EMAIL=$NEXT_PUBLIC_SUPPORT_EMAIL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# --- Runner Stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Configuration for Runtime (OIDC, DB, SMTP)
ENV DATABASE_URL=""
ENV AUTH_SECRET=""
ENV AUTH_TRUST_HOST=true
ENV AUTH_URL=""

# Keycloak OIDC Settings
ENV AUTH_KEYCLOAK_ID="linkwise-client"
ENV AUTH_KEYCLOAK_SECRET=""
ENV AUTH_KEYCLOAK_ISSUER=""

# Branding (Runtime fallback for server-side)
ENV NEXT_PUBLIC_APP_NAME="LinkWise"
ENV NEXT_PUBLIC_SUPPORT_EMAIL="linkwise@slpro.in"

# SMTP Configuration
ENV SMTP_HOST=""
ENV SMTP_PORT="587"
ENV SMTP_USER=""
ENV SMTP_PASS=""
ENV SMTP_FROM_NAME="Link-Wise"
ENV SMTP_FROM_EMAIL=""

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3010
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
