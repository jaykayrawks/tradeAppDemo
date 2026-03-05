import { useState,useEffect } from 'react'
import './App.css'

type Ticker = {
    symbol: string;
    name: string;
    assetClass: string;
    exchange: string;
    currency: string;
  };

function App() {
  const [selectedEq, setSelectedEq] = useState<string | null>(null)
  const [list, setList] = useState<Ticker[]>([]);
  
  useEffect(() => {
      fetch('http://localhost:3001/tickers').then(res=>res.json()).then(values=>{
        console.log(values.tickers);
        setList(values.tickers)
      })

      return ()=>{}
  }, []);
  
  const chooseEQ = (e: React.MouseEvent<HTMLButtonElement>)=>{
    const stockSymbol = (e.target as HTMLButtonElement).value;
    setSelectedEq(stockSymbol);
    
  }

  return (
    <>
      {list?.map((eq) => (
      <button disabled={selectedEq===eq.symbol} value={eq.symbol} onClick={chooseEQ} key={eq.symbol}>{eq.name}</button>
     ))}
    </>
  )
}

export default App
