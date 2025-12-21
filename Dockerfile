# Use stable Node version
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy only package files first (for cache)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the app
COPY . .

# Expose the port your server uses
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
