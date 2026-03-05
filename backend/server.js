const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");
const cors = require("cors");
const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const TICKERS = {
  "tickers": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "assetClass": "equity",
      "exchange": "NASDAQ",
      "currency": "USD"
    },
    {
      "symbol": "TSLA",
      "name": "Tesla Inc.",
      "assetClass": "equity",
      "exchange": "NASDAQ",
      "currency": "USD"
    },
    {
      "symbol": "BTC-USD",
      "name": "Bitcoin",
      "assetClass": "crypto",
      "exchange": "CRYPTO",
      "currency": "USD",
    }
  ]
}
const currentPrices = {};
const historicalPrices = {};
const subscribers = {};

// Initialize data
TICKERS.tickers.forEach(ticker => {
  currentPrices[ticker.symbol] = randomPrice();
  historicalPrices[ticker.symbol] = generateHistoricalData(ticker.symbol);
  subscribers[ticker.symbol] = new Set();
});

function randomPrice(base = 100) {
  return +(base + Math.random() * 20 - 10).toFixed(2);
}

function generateHistoricalData(ticker) {
  const data = [];
  let price = randomPrice(100);

  for (let i = 0; i < 50; i++) {
    price += Math.random() * 4 - 2;
    data.push({
      timestamp: Date.now() - i * 60000,
      price: +price.toFixed(2)
    });
  }

  return data.reverse();
}

setInterval(() => {
  TICKERS.tickers.forEach(ticker => {
    const newPrice = randomPrice(currentPrices[ticker.symbol]);
    currentPrices[ticker.symbol] = newPrice;

    const update = {
      ticker:ticker.symbol,
      price: newPrice,
      timestamp: Date.now()
    };

    // Save to history
    historicalPrices[ticker.symbol].push(update);

    // Broadcast to subscribers
    subscribers[ticker.symbol].forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(update));
      }
    });
  });
}, 2000);

// List available tickers
app.get("/tickers", (req, res) => {
    console.log("get tickers")
  res.json(TICKERS);
});

// Fetch historical data
app.get("/history/:ticker", (req, res) => {
  const { ticker } = req.params;

  if (!historicalPrices[ticker]) {
    return res.status(404).json({ error: "Ticker not found" });
  }

  res.json(historicalPrices[ticker]);
});

// websockets
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { action, ticker } = data;

      if (action === "SUBSCRIBE" && subscribers[ticker]) {
        subscribers[ticker].add(ws);
        ws.send(JSON.stringify({
          type: "SUBSCRIBED",
          ticker
        }));
      }

      if (action === "UNSUBSCRIBE" && subscribers[ticker]) {
        subscribers[ticker].delete(ws);
      }

    } catch (err) {
      console.error("WebSocket message error:", err);
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    TICKERS.tickers.forEach(ticker => {
      subscribers[ticker.symbol].delete(ws);
    });
  });
});


server.listen(3010, () => {
  console.log("Market Data Service running on http://localhost:3010");
});