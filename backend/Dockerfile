FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy backend source code
COPY backend/ ./backend/

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "backend/server.js"]

