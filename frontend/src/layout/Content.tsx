import { useState, useEffect } from 'react'
import PriceChart from '../components/PriceChart';
import WebSocketManager from '../utils/WebSocketManager';
import { ChevronUp, ChevronDown, ChevronsLeftRight, ChartLine } from 'lucide-react';
import TickerItem from '../components/TickerItem';
import type { Ticker } from '../components/TickerItem';

function Content() {
  const [selectedEq, setSelectedEq] = useState<string | null>(null)
  const [list, setList] = useState<Ticker[]>([]);
  
  useEffect(() => {
    fetch('http://localhost:3000/api/market/tickers').then(res=>res.json()).then(values=>{
      setList(values.tickers)
    })
  },[]);
  
  const chooseEQ = (val:string)=>{
    setSelectedEq(val);
  }

  return (
  
    <main className='w-100 flex'>
      <aside className="w-64 border-r border-gray-800 p-4 overflow-y-auto">
        <h2 className="text-sm text-gray-400 mb-3">WATCHLIST</h2>

        <div className="space-y-2 flex flex-col gap-2">
    {list?.map((eq) => (
            <TickerItem selected={selectedEq===eq.symbol} eq={eq} onClick={chooseEQ} key={eq.symbol} />
         ))}
     </div>
     </aside>
     <section className='w-[500px] h-[400px] flex justify-center items-center'>
      {selectedEq && <PriceChart eq={selectedEq} />}
      {!selectedEq && "select an option in the watchlist"}
     </section>
     </main>
  
  )
}



export default Content;
