# Stage 1: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production

# Stage 2: Build the Next.js app
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# This will generate the .next/standalone directory because of the `output: 'standalone'` in next.config.ts
RUN npm run build

# Stage 3: Production image - minimal and optimized
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# The PORT environment variable is used by Next.js to start the server.
# It defaults to 3000, so you may not need to set it.
# ENV PORT=3000

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
