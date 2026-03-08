import { useState, useEffect } from "react";

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Left — Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none">
            Trade App <span className="text-blue-600">Demo</span>
          </h1>
          <p className="text-xs text-gray-400 leading-none mt-0.5 tracking-wide uppercase">
            Market Simulator
          </p>
        </div>
      </div>


      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800 tabular-nums tracking-tight leading-none">
            {formatTime(time)}
          </p>
          <p className="text-xs text-gray-400 leading-none mt-0.5">
            {formatDate(time)}
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
          <span className="text-xs font-bold text-blue-600">JK</span>
        </div>
      </div>
    </header>
  );
}
