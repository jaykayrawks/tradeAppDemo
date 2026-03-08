import { useState, useEffect } from 'react'
import WebSocketManager from '../utils/WebSocketManager';
import { ChevronUp, ChevronDown, ChevronsLeftRight, ChartLine } from 'lucide-react';
export type Ticker = {
    symbol: string;
    name: string;
    assetClass: string;
    exchange: string;
    currency: string;
  };

type TickerItemProps = {
  eq: Ticker;
  selected: boolean;
  onClick: (val: string) => void;
};

type DIRECTION = 'up' | 'down' | 'same';

const DIRECTION = {
  UP: 'up' as DIRECTION,
  DOWN: 'down' as DIRECTION,
  SAME: 'same' as DIRECTION,
};


const TickerItem = ({ eq, selected, onClick }: TickerItemProps) => {
  const [price,setPrice] = useState(0);
  const [direction, setDirection] = useState(DIRECTION.SAME);

  useEffect(()=>{
     const socket = WebSocketManager.getInstance("ws://localhost:3000/ws");
    
     const handler = (data: { ticker: string; price: number; }) => {
        if(data.ticker === eq.symbol){
          setPrice(prev => {
            let newDirection = DIRECTION.DOWN;
            if(prev === data.price){
              newDirection = DIRECTION.SAME;
            } else if(prev < data.price){
              newDirection = DIRECTION.UP;
            }
            setDirection(newDirection);
            return data.price;
          });
        }
      };
      socket.subscribe(handler);
      socket.send({
        action: "SUBSCRIBE",
        ticker: eq.symbol
      });

      return ()=>{
        socket.unsubscribe(handler);
      }
    },[eq]);

    const clickHandler = (_e: React.MouseEvent<HTMLButtonElement>)=>{
        onClick(eq.symbol);
    }
  return (
      <div className="flex justify-between p-2 bg-gray-900 rounded cursor-pointer hover:bg-gray-800">
        <button className='p-1' disabled={selected} onClick={clickHandler} value={eq.symbol}>
        <span><ChartLine /></span>
        <span>{eq.name}</span>
        <span>{price}</span>
        <span>{direction == DIRECTION.UP && <ChevronUp color='green' />}
        {direction == DIRECTION.DOWN && <ChevronDown color='red' />}
        {direction == DIRECTION.SAME && <ChevronsLeftRight color='yellow' />}
        </span>
       </button>
       </div>
  );
};

export default TickerItem;