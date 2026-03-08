# Realtime Service
FROM node:18-alpine

WORKDIR /app

# Copy package.json first for better caching
COPY services/realtime-service/package*.json ./
RUN npm install

# Copy shared dependencies
COPY services/shared ./shared

# Copy service files
COPY services/realtime-service .

EXPOSE 3002

CMD ["npm", "start"]
