FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port (Fly sets PORT env variable at runtime)
EXPOSE 5000

CMD ["node", "server.js"]
