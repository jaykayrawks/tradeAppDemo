import { useEffect, useState, useRef } from "react";
import {subscribe} from "../utils/createSocket";

export function usePriceStream(eq:string) {
  const [data, setData] = useState<{ time: string; price: any }[]>([]);
  const lastRef = useRef(eq);

  useEffect(() => {
    // const ws = createSocket();

    fetch(`http://localhost:3010/history/${eq}`).then(res=>res.json()).then(values=>{
      setData(values);
      // ws.send(JSON.stringify({
      //   action: "SUBSCRIBE",
      //   ticker: eq,
      // }));
    });
    lastRef.current = eq;
      
    // ws.onmessage = (event) => {
    //   console.log(event)
    //   const message = JSON.parse(event.data);

    //   setData((prev) => [
    //     ...prev.slice(-50),
    //     message
    //   ]);
    // }
    return ()=>{
        // ws.send(JSON.stringify({
        // action: "UNSUBSCRIBE",
        // ticker: lastRef.current
        // }));
    }
}, [eq]);

  return {data};
}
