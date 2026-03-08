const { WebSocketServer } = require("ws");
const http = require("http");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { TICKERS } = require("./shared/tickers");
const { randomPrice } = require("./shared/priceUtils");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Configuration
const MARKET_DATA_SERVICE_URL = process.env.MARKET_DATA_SERVICE_URL || "http://localhost:3001";
const PRICE_UPDATE_INTERVAL = parseInt(process.env.PRICE_UPDATE_INTERVAL) || 2000;

// WebSocket subscribers: ticker -> Set of ws clients
const subscribers = {};
const currentPrices = {};

// Initialize data
TICKERS.tickers.forEach(ticker => {
  subscribers[ticker.symbol] = new Set();
  currentPrices[ticker.symbol] = randomPrice();
});

function broadcastPriceUpdate(ticker, price, timestamp) {
  const update = {
    type: "PRICE_UPDATE",
    ticker,
    price,
    timestamp
  };

  // Broadcast to subscribers of this ticker
  subscribers[ticker].forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(update));
    }
  });
  
  console.log(`Broadcasted ${ticker}: $${price} to ${subscribers[ticker].size} clients`);
}

async function updateMarketDataService(ticker, price, timestamp) {
  try {
    await axios.post(`${MARKET_DATA_SERVICE_URL}/api/internal/update-price`, {
      ticker,
      price,
      timestamp
    });
  } catch (error) {
    console.error(`Failed to update market data service for ${ticker}:`, error.message);
  }
}

// Simulate live market feed
setInterval(() => {
  TICKERS.tickers.forEach(async ticker => {
    const newPrice = randomPrice(currentPrices[ticker.symbol]);
    const timestamp = Date.now();
    
    currentPrices[ticker.symbol] = newPrice;

    // Broadcast to WebSocket clients
    broadcastPriceUpdate(ticker.symbol, newPrice, timestamp);
    
    // Update the market data service
    await updateMarketDataService(ticker.symbol, newPrice, timestamp);
  });
}, PRICE_UPDATE_INTERVAL);

wss.on("connection", (ws) => {
  console.log("Client connected to realtime service");
  
  // Send initial connection message
  ws.send(JSON.stringify({
    type: "CONNECTED",
    message: "Connected to realtime market data feed",
    availableTickers: TICKERS.tickers.map(t => t.symbol)
  }));

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { action, ticker } = data;

      console.log(`Received: ${action} for ${ticker}`);

      if (action === "SUBSCRIBE") {
        if (subscribers[ticker]) {
          subscribers[ticker].add(ws);
          
          // Send current price immediately
          ws.send(JSON.stringify({
            type: "SUBSCRIBED",
            ticker,
            currentPrice: currentPrices[ticker],
            timestamp: Date.now()
          }));
          
          console.log(`Client subscribed to ${ticker}. Total subscribers: ${subscribers[ticker].size}`);
        } else {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: `Unknown ticker: ${ticker}`
          }));
        }
      }

      if (action === "UNSUBSCRIBE") {
        if (subscribers[ticker]) {
          subscribers[ticker].delete(ws);
          
          ws.send(JSON.stringify({
            type: "UNSUBSCRIBED",
            ticker
          }));
          
          console.log(`Client unsubscribed from ${ticker}. Remaining subscribers: ${subscribers[ticker].size}`);
        }
      }

      if (action === "GET_ALL_PRICES") {
        const allPrices = {};
        TICKERS.tickers.forEach(t => {
          allPrices[t.symbol] = currentPrices[t.symbol];
        });
        
        ws.send(JSON.stringify({
          type: "ALL_PRICES",
          prices: allPrices,
          timestamp: Date.now()
        }));
      }

    } catch (err) {
      console.error("WebSocket message error:", err);
      ws.send(JSON.stringify({ 
        type: "ERROR",
        message: "Invalid message format" 
      }));
    }
  });

  ws.on("close", () => {
    // Clean up subscriptions for this client
    TICKERS.tickers.forEach(ticker => {
      subscribers[ticker.symbol].delete(ws);
    });
    console.log("Client disconnected from realtime service");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// ----------------------
// REST API for Service Health
// ----------------------

app.get("/health", (req, res) => {
  const totalConnections = Object.values(subscribers).reduce((sum, set) => sum + set.size, 0);
  
  res.json({
    status: "healthy",
    service: "realtime-service",
    connections: totalConnections,
    subscribers: Object.keys(subscribers).reduce((acc, ticker) => {
      acc[ticker] = subscribers[ticker].size;
      return acc;
    }, {}),
    timestamp: new Date().toISOString()
  });
});

app.get("/stats", (req, res) => {
  const stats = {
    totalConnections: Object.values(subscribers).reduce((sum, set) => sum + set.size, 0),
    tickerStats: Object.keys(subscribers).map(ticker => ({
      ticker,
      subscribers: subscribers[ticker].size,
      currentPrice: currentPrices[ticker]
    })),
    uptime: process.uptime(),
    timestamp: Date.now()
  };
  
  res.json(stats);
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`Realtime Service running on http://localhost:${PORT}`);
});
