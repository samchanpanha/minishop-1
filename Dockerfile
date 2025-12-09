##############################
# 1. Base dependencies image #
##############################
FROM node:20-alpine AS base
WORKDIR /app

# Install OS deps required by Prisma (openssl for PostgreSQL)
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm install --production=false

COPY . .

##############################
# 2. Build the Next.js app   #
##############################
FROM base AS builder
WORKDIR /app

# Generate Prisma client first
RUN npx prisma generate

# Build Next.js
RUN npm run build

##############################
# 3. Production runtime image #
##############################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install openssl for Prisma PostgreSQL
RUN apk add --no-cache openssl

# Create a secure user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy compiled files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# DATABASE_URL will be provided by Render environment variables
# Run Prisma migrations and start Next.js
CMD sh -c "npx prisma migrate deploy && npm start"
