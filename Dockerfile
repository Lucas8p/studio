# Use the official Node.js 20 image in its slim Alpine variant
FROM node:20-alpine AS base

# Install necessary dependency for Next.js on Alpine
# See https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#nodealpine
RUN apk add --no-cache libc6-compat

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
# This step is cached, so it only re-runs if package.json changes.
COPY package.json ./
RUN npm install

# Copy the rest of the application source code
# This is where .dockerignore is critical.
COPY . .

# Build the application for production
RUN npm run build

# --- Production Stage ---
# Use a clean, minimal image for the final stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary standalone output from the build stage.
# This is enabled by `output: 'standalone'` in next.config.ts.
COPY --from=base /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static

# Run as the non-root user
USER nextjs

EXPOSE 3000

ENV PORT 3000

# The command to start the Next.js server in standalone mode
CMD ["node", "server.js"]
