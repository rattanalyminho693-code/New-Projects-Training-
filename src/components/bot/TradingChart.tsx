import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Candle,
  IndicatorBarData,
  IndicatorSettings,
  BotPosition
} from '../../types/tradingBot';
import { MT5Position } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface TradingChartProps {
  candles: Candle[];
  indicatorData: IndicatorBarData[];
  settings: IndicatorSettings;
  activePositions: BotPosition[];
  mt5Positions?: MT5Position[];
  selectedTradeIndex?: number | null;
  onSelectTrade?: (index: number) => void;
  decimals?: number;
  symbol: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  indicatorData,
  settings,
  activePositions,
  mt5Positions = [],
  selectedTradeIndex,
  decimals = 2,
  symbol
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [visibleBars, setVisibleBars] = useState<number>(75);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartOffsetRef = useRef<number>(0);

  useEffect(() => {
    if (
      selectedTradeIndex !== undefined &&
      selectedTradeIndex !== null &&
      candles.length > 0
    ) {
      const targetOffset = Math.max(
        0,
        candles.length - 1 - selectedTradeIndex - Math.floor(visibleBars / 2)
      );
      setScrollOffset(targetOffset);
    }
  }, [selectedTradeIndex, candles.length, visibleBars]);

  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const rightMargin = 82;
    const bottomMargin = 28;
    const chartWidth = width - rightMargin;
    const chartHeight = height - bottomMargin;
    const volumeHeight = Math.min(72, chartHeight * 0.16);
    const priceChartHeight = chartHeight - volumeHeight - 10;

    ctx.fillStyle = '#0c1017';
    ctx.fillRect(0, 0, width, height);

    const totalCandles = candles.length;
    const barsCount = Math.min(visibleBars, totalCandles);
    const endIndex = Math.max(0, totalCandles - scrollOffset);
    const startIndex = Math.max(0, endIndex - barsCount);
    const actualVisibleCount = endIndex - startIndex;

    if (actualVisibleCount <= 0 || chartWidth <= 20 || priceChartHeight <= 20) {
      ctx.restore();
      return;
    }

    const candleWidth = chartWidth / actualVisibleCount;
    const bodyWidth = Math.max(2, candleWidth * 0.72);

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    for (let i = startIndex; i < endIndex; i++) {
      const c = candles[i];
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;

      const ind = indicatorData[i];
      if (ind) {
        if (ind.max > maxPrice) maxPrice = ind.max;
        if (ind.min < minPrice) minPrice = ind.min;
      }
    }

    // Include open position SL/TP for matching symbol so bracket lines stay visible
    const normalizedSym = symbol.replace('/', '');
    activePositions
      .filter(p => p.symbol === symbol || p.symbol.replace('/', '') === normalizedSym)
      .forEach(p => {
        minPrice = Math.min(minPrice, p.slPrice, p.tpPrice, p.entryPrice);
        maxPrice = Math.max(maxPrice, p.slPrice, p.tpPrice, p.entryPrice);
      });

    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.06;
    maxPrice += priceRange * 0.06;
    const adjustedRange = maxPrice - minPrice;

    const getY = (price: number) =>
      priceChartHeight - ((price - minPrice) / adjustedRange) * priceChartHeight;

    const getX = (index: number) => {
      const relIdx = index - startIndex;
      return relIdx * candleWidth + candleWidth / 2;
    };

    // Grid Lines
    ctx.strokeStyle = '#18202f';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    const gridStepsY = 6;
    for (let i = 0; i <= gridStepsY; i++) {
      const y = (priceChartHeight / gridStepsY) * i;
      const price = maxPrice - (i / gridStepsY) * adjustedRange;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(decimals), chartWidth + 6, y + 3);
    }

    // Time Axis Labels
    const timeStep = Math.max(1, Math.floor(actualVisibleCount / 6));
    for (let i = startIndex; i < endIndex; i += timeStep) {
      const x = getX(i);
      const t = new Date(candles[i].time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartHeight);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t, x, height - 9);
    }
    ctx.setLineDash([]);

    // 1. Trailing Channel Polygon Fill + Max / Min / Avg Lines
    if (indicatorData.length > 0) {
      ctx.beginPath();
      let first = true;
      for (let i = startIndex; i < endIndex; i++) {
        const ind = indicatorData[i];
        if (!ind) continue;
        const x = getX(i);
        const yMax = getY(ind.max);
        if (first) {
          ctx.moveTo(x, yMax);
          first = false;
        } else {
          ctx.lineTo(x, yMax);
        }
      }
      for (let i = endIndex - 1; i >= startIndex; i--) {
        const ind = indicatorData[i];
        if (!ind) continue;
        const x = getX(i);
        const yMin = getY(ind.min);
        ctx.lineTo(x, yMin);
      }
      ctx.closePath();
      const lastVisibleTrend = indicatorData[endIndex - 1]?.trend || 'bull';
      ctx.fillStyle =
        lastVisibleTrend === 'bull'
          ? 'rgba(20, 184, 166, 0.11)'
          : 'rgba(239, 68, 68, 0.11)';
      ctx.fill();

      // Trailing Max
      ctx.beginPath();
      ctx.strokeStyle = settings.maxCss || '#14b8a6';
      ctx.lineWidth = 1.7;
      for (let i = startIndex; i < endIndex; i++) {
        const ind = indicatorData[i];
        if (!ind) continue;
        const x = getX(i);
        const y = getY(ind.max);
        if (i === startIndex) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Trailing Min
      ctx.beginPath();
      ctx.strokeStyle = settings.minCss || '#ef4444';
      ctx.lineWidth = 1.7;
      for (let i = startIndex; i < endIndex; i++) {
        const ind = indicatorData[i];
        if (!ind) continue;
        const x = getX(i);
        const y = getY(ind.min);
        if (i === startIndex) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Trailing Avg
      ctx.beginPath();
      ctx.strokeStyle = settings.avgCss || '#ff5d00';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 3]);
      for (let i = startIndex; i < endIndex; i++) {
        const ind = indicatorData[i];
        if (!ind) continue;
        const x = getX(i);
        const y = getY(ind.avg);
        if (i === startIndex) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Volume Bars
    const volBaseY = chartHeight;
    for (let i = startIndex; i < endIndex; i++) {
      const c = candles[i];
      const x = getX(i);
      const isUp = c.close >= c.open;
      const volHeight = maxVolume > 0 ? (c.volume / maxVolume) * volumeHeight : 0;
      ctx.fillStyle = isUp ? 'rgba(20, 184, 166, 0.24)' : 'rgba(239, 68, 68, 0.24)';
      ctx.fillRect(x - bodyWidth / 2, volBaseY - volHeight, bodyWidth, volHeight);
    }

    // 3. Candlesticks & LuxAlgo BUY/SELL Badges
    for (let i = startIndex; i < endIndex; i++) {
      const c = candles[i];
      const x = getX(i);
      const isUp = c.close >= c.open;
      const color = isUp ? '#14b8a6' : '#ef4444';

      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
      ctx.fillStyle = color;
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);

      if (selectedTradeIndex === i) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(
          x - bodyWidth / 2 - 3,
          yHigh - 6,
          bodyWidth + 6,
          Math.max(14, yLow - yHigh + 12)
        );
      }

      const ind = indicatorData[i];
      if (ind) {
        if (ind.isBuy) {
          const arrowY = Math.min(priceChartHeight - 18, yLow + 14);
          ctx.fillStyle = '#14b8a6';
          ctx.beginPath();
          ctx.moveTo(x, arrowY - 6);
          ctx.lineTo(x - 5, arrowY + 2);
          ctx.lineTo(x + 5, arrowY + 2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#0f766e';
          ctx.strokeStyle = '#2dd4bf';
          ctx.lineWidth = 1;
          ctx.fillRect(x - 16, arrowY + 3, 32, 14);
          ctx.strokeRect(x - 16, arrowY + 3, 32, 14);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('BUY', x, arrowY + 13);
        }

        if (ind.isSell) {
          const arrowY = Math.max(18, yHigh - 14);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(x, arrowY + 6);
          ctx.lineTo(x - 5, arrowY - 2);
          ctx.lineTo(x + 5, arrowY - 2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#9f1239';
          ctx.strokeStyle = '#fb7185';
          ctx.lineWidth = 1;
          ctx.fillRect(x - 17, arrowY - 17, 34, 14);
          ctx.strokeRect(x - 17, arrowY - 17, 34, 14);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SELL', x, arrowY - 7);
        }
      }
    }

    // 4. Draw Bot Active Bracket Orders (Entry, SL, TP)
    activePositions
      .filter(p => p.symbol === symbol || p.symbol.replace('/', '') === normalizedSym)
      .forEach(pos => {
        const yEntry = getY(pos.entryPrice);
        const ySl = getY(pos.slPrice);
        const yTp = getY(pos.tpPrice);

        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.4;

        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(0, yEntry);
        ctx.lineTo(chartWidth, yEntry);
        ctx.stroke();

        ctx.strokeStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(0, ySl);
        ctx.lineTo(chartWidth, ySl);
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(0, yTp);
        ctx.lineTo(chartWidth, yTp);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';

        ctx.fillStyle = '#0891b2';
        ctx.fillRect(chartWidth + 2, yEntry - 8, rightMargin - 4, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`ENT:${pos.entryPrice.toFixed(decimals)}`, chartWidth + 5, yEntry + 3);

        ctx.fillStyle = '#059669';
        ctx.fillRect(chartWidth + 2, yTp - 8, rightMargin - 4, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`TP:${pos.tpPrice.toFixed(decimals)}`, chartWidth + 5, yTp + 3);

        ctx.fillStyle = '#e11d48';
        ctx.fillRect(chartWidth + 2, ySl - 8, rightMargin - 4, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`SL:${pos.slPrice.toFixed(decimals)}`, chartWidth + 5, ySl + 3);
      });

    // Also render matching MT5 ticket entry lines if present
    mt5Positions
      .filter(m => m.symbol === normalizedSym)
      .forEach(mp => {
        const yOpen = getY(mp.openPrice);
        if (yOpen >= 0 && yOpen <= priceChartHeight) {
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, yOpen);
          ctx.lineTo(chartWidth, yOpen);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

    // 5. Latest Live Price Line & Tag
    const latestCandle = candles[candles.length - 1];
    if (latestCandle) {
      const yLatest = getY(latestCandle.close);
      const isBullish = latestCandle.close >= latestCandle.open;
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = isBullish ? '#14b8a6' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, yLatest);
      ctx.lineTo(chartWidth, yLatest);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isBullish ? '#0d9488' : '#dc2626';
      ctx.fillRect(chartWidth + 2, yLatest - 9, rightMargin - 4, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(latestCandle.close.toFixed(decimals), chartWidth + 6, yLatest + 3);
    }

    // 6. Crosshair
    if (mousePos && mousePos.x < chartWidth && mousePos.y < priceChartHeight) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, chartHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const hoverPrice = maxPrice - (mousePos.y / priceChartHeight) * adjustedRange;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(chartWidth + 2, mousePos.y - 9, rightMargin - 4, 18);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(hoverPrice.toFixed(decimals), chartWidth + 6, mousePos.y + 3);
    }

    // Axis Dividers
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, height);
    ctx.moveTo(0, chartHeight);
    ctx.lineTo(width, chartHeight);
    ctx.stroke();

    ctx.restore();
  }, [
    candles,
    indicatorData,
    settings,
    activePositions,
    mt5Positions,
    visibleBars,
    scrollOffset,
    mousePos,
    selectedTradeIndex,
    decimals,
    symbol
  ]);

  // ResizeObserver for crisp DPR canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(300, Math.floor(rect.width * dpr));
      canvas.height = Math.max(320, Math.floor(rect.height * dpr));
      renderChart();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [renderChart]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = scrollOffset;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const chartWidth = Math.max(50, rect.width - 82);
    const barsCount = Math.min(visibleBars, candles.length);
    const candleWidth = chartWidth / barsCount;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartXRef.current;
      const deltaBars = Math.round(deltaX / Math.max(2, candleWidth));
      const nextOffset = Math.max(
        0,
        Math.min(candles.length - barsCount, dragStartOffsetRef.current + deltaBars)
      );
      setScrollOffset(nextOffset);
    } else if (x >= 0 && x <= chartWidth) {
      const endIndex = Math.max(0, candles.length - scrollOffset);
      const startIndex = Math.max(0, endIndex - barsCount);
      const relIdx = Math.floor(x / candleWidth);
      const idx = Math.min(candles.length - 1, Math.max(0, startIndex + relIdx));
      setHoverIndex(idx);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const step = e.deltaY > 0 ? 8 : -8;
    setVisibleBars(prev => Math.max(20, Math.min(candles.length, prev + step)));
  };

  const activeIdx =
    hoverIndex !== null && candles[hoverIndex] ? hoverIndex : candles.length - 1;
  const activeCandle = candles[activeIdx];
  const activeIndicator = indicatorData[activeIdx];

  return (
    <div className="flex flex-col flex-1 bg-[#0c1017] border border-slate-800 rounded-xl overflow-hidden min-h-[480px]">
      {/* OHLCV + LuxAlgo Channel Readout Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#090d14] border-b border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold font-mono text-white">{symbol}</span>
          {activeCandle && (
            <div className="flex flex-wrap items-center gap-2.5 font-mono tabular-nums text-[11px] text-slate-400">
              <span>
                O: <span className="text-slate-200">{activeCandle.open.toFixed(decimals)}</span>
              </span>
              <span>
                H: <span className="text-emerald-400">{activeCandle.high.toFixed(decimals)}</span>
              </span>
              <span>
                L: <span className="text-rose-400">{activeCandle.low.toFixed(decimals)}</span>
              </span>
              <span>
                C: <span className="text-slate-100">{activeCandle.close.toFixed(decimals)}</span>
              </span>
              <span>
                Vol: <span className="text-slate-300">{activeCandle.volume.toLocaleString()}</span>
              </span>
            </div>
          )}
        </div>

        {activeIndicator && (
          <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums text-[11px]">
            <span className="text-teal-400">
              Max: {activeIndicator.max.toFixed(decimals)}
            </span>
            <span className="text-rose-400">
              Min: {activeIndicator.min.toFixed(decimals)}
            </span>
            <span className="text-amber-400">
              Avg: {activeIndicator.avg.toFixed(decimals)}
            </span>
            <span
              className={`font-semibold ${
                activeIndicator.trend === 'bull' ? 'text-teal-300' : 'text-rose-300'
              }`}
            >
              · {activeIndicator.trend === 'bull' ? 'Uptrend (Bull)' : 'Downtrend (Bear)'}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-[420px] overflow-hidden cursor-crosshair select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setMousePos(null);
            setHoverIndex(null);
          }}
          onWheel={handleWheel}
          className="absolute inset-0 block w-full h-full"
        />

        {/* Floating Zoom / Reset Controls */}
        <div className="absolute bottom-9 right-24 flex items-center gap-1 bg-[#131a26]/95 border border-slate-700/80 rounded-lg px-1.5 py-1 text-slate-300 shadow-lg">
          <button
            type="button"
            onClick={() => setVisibleBars(prev => Math.max(20, prev - 10))}
            title="Zoom In"
            className="p-1.5 hover:text-white hover:bg-slate-700/60 rounded transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setVisibleBars(prev => Math.min(candles.length, prev + 10))}
            title="Zoom Out"
            className="p-1.5 hover:text-white hover:bg-slate-700/60 rounded transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setScrollOffset(0);
              setVisibleBars(75);
            }}
            title="Reset to Latest"
            className="p-1.5 hover:text-white hover:bg-slate-700/60 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
