# Trade App - BFF (Backend for Frontend) Architecture

## Overview

This project uses a **Backend for Frontend (BFF)** pattern where the BFF service acts as an intermediary layer between the frontend application and the backend microservices.

## Architecture

```
Frontend (React/Vite)
        ↓
    BFF Service (Port 3000)
   ↙           ↘
Market Data    Realtime Service
Service        (Port 3002)
(Port 3001)
```

## BFF Service Features

### 🎯 **Frontend-Optimized APIs**
- **Dashboard API** (`/api/dashboard`) - Aggregates data from multiple services
- **Chart API** (`/api/chart/:ticker`) - Returns chart-ready data format
- **Service Status** (`/api/services/status`) - Health monitoring

### 🔄 **Service Proxying**
- **Market Data** (`/api/market/*`) - Proxies to Market Data Service
- **WebSocket** (`/ws`) - Proxies to Realtime Service

### 🌐 **CORS Configuration**
- Configured for frontend URL (default: `http://localhost:5173`)
- Supports credentials for authenticated requests

## Running the Services

### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down
```

### Local Development
```bash
# Start each service in separate terminals

# Terminal 1: Market Data Service
cd services/market-data-service && npm install && npm start

# Terminal 2: Realtime Service  
cd services/realtime-service && npm install && npm start

# Terminal 3: BFF Service
cd services/bff && npm install && npm start
```

## API Endpoints

### BFF Specific Endpoints
- `GET /` - BFF documentation
- `GET /api/dashboard` - Aggregated dashboard data
- `GET /api/chart/:ticker` - Chart-ready price data

### Proxied Market Data Endpoints
- `GET /api/market/tickers` - List all tickers
- `GET /api/market/price/:ticker` - Get current price
- `GET /api/market/history/:ticker` - Get historical data
- `GET /api/market/market-overview` - Market overview

### WebSocket
- `WS /ws` - Real-time price updates

## Frontend Integration

Update your frontend to use the BFF endpoints:

```javascript
// Dashboard data (aggregated)
const dashboardData = await fetch('http://localhost:3000/api/dashboard');

// Chart data (optimized for charts)
const chartData = await fetch('http://localhost:3000/api/chart/AAPL');

// WebSocket connection
const ws = new WebSocket('ws://localhost:3000/ws');