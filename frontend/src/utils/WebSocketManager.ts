class WebSocketManager {
  static instances = new Map();

  constructor(url) {
    this.url = url;
    this.ws = null;
    this.queue = [];
    this.listeners = new Set();

    this.connect();
  }

  static getInstance(url) {
    if (!WebSocketManager.instances.has(url)) {
      const instance = new WebSocketManager(url);
      WebSocketManager.instances.set(url, instance);
    }

    return WebSocketManager.instances.get(url);
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("WebSocket connected:", this.url);
      this.flushQueue();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      this.listeners.forEach((listener) => listener(data));
    };

    this.ws.onclose = () => {
      console.log("WebSocket closed. Reconnecting...");
      setTimeout(() => this.connect(), 2000);
    };

    this.ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }

  send(data) {
    const message = JSON.stringify(data);

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.queue.push(message);
    }
  }

  flushQueue() {
    while (this.queue.length) {
      this.ws.send(this.queue.shift());
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
  }

  unsubscribe(listener) {
    this.listeners.delete(listener);
  }
}

export default WebSocketManager;