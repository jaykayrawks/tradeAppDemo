const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Configure CORS for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port
  credentials: true
}));

app.use(express.json());

// Service URLs
const MARKET_DATA_SERVICE_URL = process.env.MARKET_DATA_SERVICE_URL || "http://localhost:3001";
const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || "http://localhost:3002";

// ----------------------
// BFF Health Check
// ----------------------

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "bff-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      marketData: MARKET_DATA_SERVICE_URL,
      realtime: REALTIME_SERVICE_URL
    }
  });
});

// ----------------------
// Frontend-Specific API Aggregation
// ----------------------

// Dashboard data aggregation
app.get("/api/dashboard", async (req, res) => {
  try {
    const axios = require("axios");
    
    // Fetch data from multiple services
    const [tickersResponse, marketOverviewResponse] = await Promise.all([
      axios.get(`${MARKET_DATA_SERVICE_URL}/api/tickers`),
      axios.get(`${MARKET_DATA_SERVICE_URL}/api/market-overview`)
    ]);

    // Aggregate data for frontend
    const dashboardData = {
      tickers: tickersResponse.data.tickers,
      marketOverview: marketOverviewResponse.data,
      timestamp: Date.now(),
      summary: {
        totalTickers: tickersResponse.data.tickers.length,
        activeMarkets: tickersResponse.data.tickers.map(t => t.exchange).filter((v, i, a) => a.indexOf(v) === i)
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard aggregation error:", error.message);
    res.status(503).json({ 
      error: "Failed to aggregate dashboard data",
      message: error.message 
    });
  }
});

// Chart data optimized for frontend
app.get("/api/chart/:ticker", async (req, res) => {
  try {
    const axios = require("axios");
    const { ticker } = req.params;
    const { timeframe = "1h", limit = 50 } = req.query;
    
    const historyResponse = await axios.get(
      `${MARKET_DATA_SERVICE_URL}/api/history/${ticker}?limit=${limit}`
    );

    // Format data for chart library (assuming Chart.js or similar)
    const chartData = {
      labels: historyResponse.data.map(point => 
        new Date(point.timestamp).toLocaleTimeString()
      ),
      datasets: [{
        label: ticker,
        data: historyResponse.data.map(point => point.price),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }],
      meta: {
        ticker,
        timeframe,
        dataPoints: historyResponse.data.length,
        lastUpdate: Date.now()
      }
    };

    res.json(chartData);
  } catch (error) {
    console.error("Chart data error:", error.message);
    res.status(503).json({ 
      error: "Failed to fetch chart data",
      message: error.message 
    });
  }
});

// ----------------------
// Proxy to Market Data Service
// ----------------------

app.use("/api/market", createProxyMiddleware({
  target: MARKET_DATA_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api/market": "/api"
  },
  onError: (err, req, res) => {
    console.error("Market Data Service proxy error:", err.message);
    res.status(503).json({ 
      error: "Market Data Service unavailable",
      message: err.message 
    });
  }
}));

// ----------------------
// WebSocket Proxy for Realtime Data
// ----------------------

app.use("/ws", createProxyMiddleware({
  target: REALTIME_SERVICE_URL,
  ws: true,
  changeOrigin: true,
  pathRewrite: {
    "^/ws": ""
  },
  onError: (err, req, res) => {
    console.error("Realtime Service proxy error:", err.message);
    if (res && !res.headersSent) {
      res.status(503).json({ 
        error: "Realtime Service unavailable",
        message: err.message 
      });
    }
  }
}));

// ----------------------
// Service Status & Monitoring
// ----------------------

app.get("/api/services/status", async (req, res) => {
  const axios = require("axios");
  
  const services = {
    bff: { 
      status: "healthy", 
      url: `http://localhost:${PORT}`,
      uptime: process.uptime()
    },
    marketData: { url: MARKET_DATA_SERVICE_URL },
    realtime: { url: REALTIME_SERVICE_URL }
  };

  // Check Market Data Service
  try {
    const response = await axios.get(`${MARKET_DATA_SERVICE_URL}/health`, { timeout: 5000 });
    services.marketData.status = response.data.status;
    services.marketData.lastCheck = new Date().toISOString();
  } catch (error) {
    services.marketData.status = "unhealthy";
    services.marketData.error = error.message;
    services.marketData.lastCheck = new Date().toISOString();
  }

  // Check Realtime Service
  try {
    const response = await axios.get(`${REALTIME_SERVICE_URL}/health`, { timeout: 5000 });
    services.realtime.status = response.data.status;
    services.realtime.connections = response.data.connections;
    services.realtime.lastCheck = new Date().toISOString();
  } catch (error) {
    services.realtime.status = "unhealthy";
    services.realtime.error = error.message;
    services.realtime.lastCheck = new Date().toISOString();
  }

  res.json(services);
});

// ----------------------
// Frontend Documentation
// ----------------------

app.get("/", (req, res) => {
  res.json({
    message: "Trade App BFF (Backend for Frontend)",
    version: "1.0.0",
    description: "Aggregates and optimizes backend services for frontend consumption",
    endpoints: {
      health: "GET /health - BFF health check",
      dashboard: "GET /api/dashboard - Aggregated dashboard data",
      chart: "GET /api/chart/:ticker - Chart-ready data",
      serviceStatus: "GET /api/services/status - All services status",
      marketData: {
        description: "Proxied market data endpoints",
        baseUrl: "/api/market",
        examples: [
          "/api/market/tickers",
          "/api/market/price/:ticker",
          "/api/market/history/:ticker",
          "/api/market/market-overview"
        ]
      },
      realtime: {
        description: "WebSocket connection for real-time data",
        websocket: "WS /ws - WebSocket connection",
        health: "/ws/health"
      }
    },
    frontend: {
      cors: "Configured for frontend access",
      supportedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"]
    }
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 BFF Service running on http://localhost:${PORT}`);
  console.log(`📱 Configured for frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`🔗 Proxying to:`);
  console.log(`   Market Data Service: ${MARKET_DATA_SERVICE_URL}`);
  console.log(`   Realtime Service: ${REALTIME_SERVICE_URL}`);
  console.log(`🎯 Available endpoints:`);
  console.log(`   GET  / - BFF Documentation`);
  console.log(`   GET  /health - BFF health`);
  console.log(`   GET  /api/dashboard - Aggregated dashboard data`);
  console.log(`   GET  /api/chart/:ticker - Chart data`);
  console.log(`   GET  /api/services/status - All services status`);
  console.log(`   GET  /api/market/* - Market data endpoints`);
  console.log(`   WS   /ws - WebSocket for real-time data`);
});

// Handle WebSocket upgrade for proxy
server.on("upgrade", (request, socket, head) => {
  console.log("WebSocket upgrade request received by BFF");
});
