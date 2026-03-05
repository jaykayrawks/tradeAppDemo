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
      "currency": "USD",
    },
    {
      "symbol": "TSLA",
      "name": "Tesla Inc.",
      "assetClass": "equity",
      "exchange": "NASDAQ",
      "currency": "USD",
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


// List of tickers
app.get("/tickers", (req, res) => {
    console.log("get tickers")
    res.json(TICKERS);
});


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
});


server.listen(3001, () => {
  console.log("trader backend running on http://localhost:3001");
});