const express = require("express");
const cors = require("cors");
const { TICKERS } = require("./shared/tickers");
const { randomPrice, generateHistoricalData } = require("./shared/priceUtils");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use Redis or Database)
const historicalPrices = {};
const currentPrices = {};

// Initialize data
TICKERS.tickers.forEach(ticker => {
  currentPrices[ticker.symbol] = randomPrice();
  historicalPrices[ticker.symbol] = generateHistoricalData(ticker.symbol);
});

// List available tickers
app.get("/api/tickers", (req, res) => {
  console.log("GET /api/tickers");
  res.json(TICKERS);
});

// Get current price for a ticker
app.get("/api/price/:ticker", (req, res) => {
  const { ticker } = req.params;
  
  if (!currentPrices[ticker]) {
    return res.status(404).json({ error: "Ticker not found" });
  }
  
  res.json({
    ticker,
    price: currentPrices[ticker],
    timestamp: Date.now()
  });
});

// Get historical data for a ticker
app.get("/api/history/:ticker", (req, res) => {
  const { ticker } = req.params;
  const { limit = 50 } = req.query;

  if (!historicalPrices[ticker]) {
    return res.status(404).json({ error: "Ticker not found" });
  }

  const data = historicalPrices[ticker].slice(-parseInt(limit));
  res.json(data);
});

// Get market overview (all current prices)
app.get("/api/market-overview", (req, res) => {
  const overview = TICKERS.tickers.map(ticker => ({
    ...ticker,
    currentPrice: currentPrices[ticker.symbol],
    timestamp: Date.now()
  }));
  
  res.json(overview);
});

// Update price (used by realtime service)
app.post("/api/internal/update-price", (req, res) => {
  const { ticker, price, timestamp } = req.body;
  
  if (!ticker || !price) {
    return res.status(400).json({ error: "ticker and price are required" });
  }
  
  currentPrices[ticker] = price;
  
  // Add to historical data
  if (historicalPrices[ticker]) {
    historicalPrices[ticker].push({ timestamp, price });
    // Keep only last 1000 entries
    if (historicalPrices[ticker].length > 1000) {
      historicalPrices[ticker] = historicalPrices[ticker].slice(-1000);
    }
  }
  
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Market Data Service running on http://localhost:${PORT}`);
});
