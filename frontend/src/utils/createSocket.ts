

declare global {
  // eslint-disable-next-line no-var
  var socket: WebSocket | undefined;
}

function waitForSocket(ws) {
  return new Promise((resolve) => {
    if (ws.readyState === WebSocket.OPEN) {
      resolve(ws);
    } else {
      ws.addEventListener("open", resolve, { once: true });
    }
  });
}


export async function subscribe(ticker) {
  if(globalThis.socket){
    return globalThis.socket;
  }
  else{
    const ws= new WebSocket('ws://localhost:3010');
    await waitForSocket(ws);
    globalThis.socket  = ws;
  }
  globalThis.socket.send(JSON.stringify({
    type: "SUBSCRIBE",
    ticker
  }));
  return globalThis.socket;
}
