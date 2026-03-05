 
 function WatchItem({ ticker, price }) {
  return (
    <div className="flex justify-between p-2 bg-gray-900 rounded cursor-pointer hover:bg-gray-800">
      <span>{ticker}</span>
      <span>{price}</span>
    </div>
  );
}

 export default function TradingLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">

      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-gray-800">
        <div className="font-bold text-lg">TradeX</div>

        <div className="flex gap-6 text-sm">
          <span>Balance: $25,430</span>
          <span>User</span>
        </div>
      </header>

      {/* TICKER BAR */}
      <div className="h-10 border-b border-gray-800 flex items-center px-4 gap-6 overflow-x-auto text-sm">
        <span className="text-green-400">AAPL 186.22 ▲</span>
        <span className="text-red-400">TSLA 242.31 ▼</span>
        <span className="text-green-400">BTC-USD 65,200 ▲</span>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">

        {/* WATCHLIST SIDEBAR */}
        <aside className="w-64 border-r border-gray-800 p-4 overflow-y-auto">
          <h2 className="text-sm text-gray-400 mb-3">WATCHLIST</h2>

          <div className="space-y-2">
            <WatchItem ticker="AAPL" price="186.22" />
            <WatchItem ticker="TSLA" price="242.31" />
            <WatchItem ticker="BTC-USD" price="65200" />
          </div>
        </aside>

        {/* CHART AREA */}
        <main className="flex-1 flex flex-col">

          <div className="flex-1 border-b border-gray-800 p-4">
            <h2 className="text-sm text-gray-400 mb-2">PRICE CHART</h2>

            <div className="h-full bg-gray-900 rounded-lg flex items-center justify-center">
              Chart Component
            </div>
          </div>
        </main>


      </div>

    </div>
  );
}