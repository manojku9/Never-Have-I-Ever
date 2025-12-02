FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy entire repository into the image so the frontend folder is available for postinstall
COPY . .

# Install dependencies (this will run postinstall which builds the frontend)
RUN npm ci --only=production

# Expose port (Fly sets PORT env variable at runtime)
EXPOSE 5000

CMD ["node", "server.js"]
