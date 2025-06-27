### STAGE 1: BUILD ###
# Use a specific Node.js version for consistency
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) and build the app
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: PRODUCTION ###
# Use the same Node.js version
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install ONLY production dependencies by copying package files and running install
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port 3000
EXPOSE 3000

# Command to start the application in production mode
CMD ["npm", "start"]
