import { useEffect, useState } from "react";
import WebSocketManager from '../utils/WebSocketManager';

export function usePriceStream(symbol:string) {
  const [data, setData] = useState<{ time: string; price: number }[]>([]);

  useEffect(() => {
    const abortHandler =  new AbortController();
    const handler = (data: { time: string; price: number; })=>{
      console.log("handler",data)
          setData((prev) => [
          ...prev.slice(-50),
          data
        ]);
      }
    const socket =  WebSocketManager.getInstance("ws://localhost:3000/ws");
    fetch(`http://localhost:3000/api/market/history/${symbol}`,{signal:abortHandler.signal}).then(res=>res.json()).then(values=>{
      setData(values);
      
      socket.subscribe(handler);
      socket.send({
        action: "SUBSCRIBE",
        ticker: symbol
      });

    });
    
    return ()=>{
        abortHandler.abort();
        socket.unsubscribe(handler);
    }
}, [symbol]);

  return {data};
}
