import React, { useEffect, useRef } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  timeframe: string;
  isAdmin?: boolean;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  timeframe,
  isAdmin = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Map symbols to TradingView standard exchange symbols
  const getTvSymbol = (sym: string) => {
    const s = sym.toUpperCase().trim();
    if (s.includes('XAU') || s.includes('GOLD')) return 'OANDA:XAUUSD';
    if (s.includes('BTC')) return 'BINANCE:BTCUSDT';
    if (s.includes('EUR')) return 'FX:EURUSD';
    if (s.includes('GBP')) return 'FX:GBPUSD';
    if (s.includes('US30') || s.includes('DOW')) return 'BLACKBULL:US30';
    return `FX:${s}`;
  };

  const getTvInterval = (tf: string) => {
    if (tf === '1m') return '1';
    if (tf === '5m') return '5';
    if (tf === '15m') return '15';
    if (tf === '30m') return '30';
    if (tf === '1h') return '60';
    if (tf === '4h') return '240';
    if (tf === '1D') return 'D';
    return '15';
  };

  const tvSymbol = getTvSymbol(symbol);
  const tvInterval = getTvInterval(timeframe);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: tvInterval,
      timezone: 'Asia/Bangkok',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: 'rgba(19, 23, 34, 1)',
      gridColor: 'rgba(42, 46, 57, 0.4)',
      // HIDE Indicators (fx) and Settings ⚙️ toolbar for non-Admin users!
      hide_top_toolbar: !isAdmin,
      hide_legend: false,
      save_image: isAdmin,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com'
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol, tvInterval, isAdmin]);

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-[#2a2e39] bg-[#131722]">
      {/* Indicator & Settings Permission Badge */}
      <div className="absolute top-2 left-2 z-20 pointer-events-none">
        {isAdmin ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-purple-300 text-[10px] font-mono rounded shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Admin Mode: Indicators (fx) & Settings Enabled</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1e222d]/90 backdrop-blur-md border border-[#2a2e39] text-[#787b86] text-[10px] font-mono rounded shadow">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Indicators & Settings: Locked (Admin Only)</span>
          </span>
        )}
      </div>

      <div 
        ref={containerRef} 
        className="tradingview-widget-container w-full h-full"
      />
    </div>
  );
};
