##############################
# 1. Base dependencies image #
##############################
FROM node:20-alpine AS base
WORKDIR /app

# Install OS deps required by Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm install --production=false

COPY . .

##############################
# 2. Build the Next.js app   #
##############################
FROM base AS builder
WORKDIR /app

RUN npm run build
RUN npx prisma generate


##############################
# 3. Production runtime image #
##############################
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a secure user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Create SQLite directory
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copy compiled files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Runtime DB path for SQLite on Render
ENV DATABASE_URL="file:/app/data/dev.db"

# Permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

##############################################
# Render Start Command (runs at container run)
#   1. Run Prisma migrations
#   2. Start Next.js production server
##############################################
CMD sh -c "npx prisma migrate deploy && npm start"
