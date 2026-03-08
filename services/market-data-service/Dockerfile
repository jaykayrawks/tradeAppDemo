# Market Data Service
FROM node:18-alpine

WORKDIR /app

# Copy package.json first for better caching
COPY services/market-data-service/package*.json ./
RUN npm install

# Copy shared dependencies
COPY services/shared ./shared

# Copy service files
COPY services/market-data-service .

EXPOSE 3001

CMD ["npm", "start"]
