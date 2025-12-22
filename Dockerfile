FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install app dependencies
COPY package*.json ./

RUN npm ci --omit=dev || npm install --production

# Bundle app source
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
