import { useState, useEffect } from 'react'
import './App.css'
import PriceChart from './components/PriceChart';
import WebSocketManager from './utils/WebSocketManager';
import { ChevronUp, ChevronDown, ChevronsLeftRight } from 'lucide-react';
type Ticker = {
    symbol: string;
    name: string;
    assetClass: string;
    exchange: string;
    currency: string;
  };

type TickerItemProps = {
  eq: Ticker;
  selected: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

type DIRECTION = 'positive' | 'negative' | 'same';

const DIRECTION = {
  POSITIVE: 'positive' as DIRECTION,
  NEGATIVE: 'negative' as DIRECTION,
  SAME: 'same' as DIRECTION,
};


const TickerItem = ({ eq, selected, onClick }: TickerItemProps) => {
  const [price,setPrice] = useState(0);
  const [direction, setDirection] = useState(DIRECTION.SAME);

  useEffect(()=>{
     const socket = WebSocketManager.getInstance("ws://localhost:3010");
    
     const handler = (data) => {
        if(data.ticker === eq.symbol){
          setPrice(prev => {
            let newDirection = DIRECTION.NEGATIVE;
            if(prev === data.price){
              newDirection = DIRECTION.SAME;
            } else if(prev < data.price){
              newDirection = DIRECTION.POSITIVE;
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

  return (
    // <button disabled={selected} value={eq.symbol} onClick={onClick} key={eq.symbol}>
      <div className="flex justify-between p-2 bg-gray-900 rounded cursor-pointer hover:bg-gray-800">
      <button disabled={selected} value={eq.symbol} onClick={onClick} key={eq.symbol}>
        <span>{eq.name}</span>
        <span>{price}</span>
        <span>{direction == DIRECTION.POSITIVE && <ChevronUp color='green' />}
        {direction == DIRECTION.NEGATIVE && <ChevronDown color='red' />}
        {direction == DIRECTION.SAME && <ChevronsLeftRight color='yellow' />}
        </span>
       </button>
       </div>
    // </button>
  );
};

function App() {
  const [selectedEq, setSelectedEq] = useState<string | null>(null)
  const [list, setList] = useState<Ticker[]>([]);
  
  useEffect(() => {
    fetch('http://localhost:3010/tickers').then(res=>res.json()).then(values=>{
      setList(values.tickers)
    })
  },[]);
  
  const chooseEQ = (e: React.MouseEvent<HTMLButtonElement>)=>{
    const stockSymbol = (e.target as HTMLButtonElement).value;
    setSelectedEq(stockSymbol);
  }

  return (
  
    <main className='w-100 flex'>
      <aside className="w-64 border-r border-gray-800 p-4 overflow-y-auto">
        <h2 className="text-sm text-gray-400 mb-3">WATCHLIST</h2>

        <div className="space-y-2">
      {list?.map((eq) => (
        <TickerItem selected={selectedEq===eq.symbol} eq={eq} onClick={chooseEQ} key={eq.symbol} />
     ))}
     </div>
     </aside>
     <section className='w-[500px] flex-1'>
      {selectedEq && <PriceChart eq={selectedEq} />}
      {!selectedEq && "select an option in the watchlist"}
     </section>
     </main>
  
  )
}



export default App
