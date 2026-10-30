/**
 * Market data service: historical candles, live tick simulation, and Binance klines integration
 */

import { Candle } from '../types/tradingBot';

export interface MarketAsset {
  symbol: string;
  mt5Symbol: string;
  name: string;
  category: 'Commodities' | 'Crypto' | 'Forex' | 'Stocks';
  basePrice: number;
  decimals: number;
  tickSize: number;
  binanceSymbol?: string;
}

export const SUPPORTED_ASSETS: MarketAsset[] = [
  {
    symbol: 'XAU/USD',
    mt5Symbol: 'XAUUSD',
    name: 'Gold Spot (មាស)',
    category: 'Commodities',
    basePrice: 2742.8,
    decimals: 2,
    tickSize: 0.05
  },
  {
    symbol: 'BTC/USDT',
    mt5Symbol: 'BTCUSD',
    name: 'Bitcoin',
    category: 'Crypto',
    basePrice: 68450.0,
    decimals: 2,
    tickSize: 0.1,
    binanceSymbol: 'BTCUSDT'
  },
  {
    symbol: 'ETH/USDT',
    mt5Symbol: 'ETHUSD',
    name: 'Ethereum',
    category: 'Crypto',
    basePrice: 3520.0,
    decimals: 2,
    tickSize: 0.05,
    binanceSymbol: 'ETHUSDT'
  },
  {
    symbol: 'SOL/USDT',
    mt5Symbol: 'SOLUSD',
    name: 'Solana',
    category: 'Crypto',
    basePrice: 178.5,
    decimals: 2,
    tickSize: 0.01,
    binanceSymbol: 'SOLUSDT'
  },
  {
    symbol: 'EUR/USD',
    mt5Symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    category: 'Forex',
    basePrice: 1.0855,
    decimals: 4,
    tickSize: 0.0001
  },
  {
    symbol: 'NVDA',
    mt5Symbol: 'NVDA.US',
    name: 'NVIDIA Corp',
    category: 'Stocks',
    basePrice: 142.3,
    decimals: 2,
    tickSize: 0.01
  },
  {
    symbol: 'AAPL',
    mt5Symbol: 'AAPL.US',
    name: 'Apple Inc',
    category: 'Stocks',
    basePrice: 231.5,
    decimals: 2,
    tickSize: 0.01
  }
];

export const TIMEFRAMES = [
  { id: '1m', label: '1m', ms: 60 * 1000 },
  { id: '5m', label: '5m', ms: 5 * 60 * 1000 },
  { id: '15m', label: '15m', ms: 15 * 60 * 1000 },
  { id: '1h', label: '1h', ms: 60 * 60 * 1000 },
  { id: '4h', label: '4h', ms: 4 * 60 * 60 * 1000 },
  { id: '1D', label: '1D', ms: 24 * 60 * 60 * 1000 }
];

export function generateSyntheticCandles(
  asset: MarketAsset,
  count = 200,
  timeframeMs = 15 * 60 * 1000
): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  let currentPrice = asset.basePrice;
  const volatility = currentPrice * 0.0025;
  const startTime = now - count * timeframeMs;
  let trend = (Math.random() - 0.48) * 0.0008;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * timeframeMs;
    if (i % 25 === 0) {
      trend = (Math.random() - 0.49) * 0.001;
    }

    const open = currentPrice;
    const change = currentPrice * trend + (Math.random() - 0.5) * volatility * 2.2;
    const close = Math.max(open * 0.8, open + change);

    const maxBody = Math.max(open, close);
    const minBody = Math.min(open, close);
    const upperWick = Math.random() * volatility * 1.5;
    const lowerWick = Math.random() * volatility * 1.5;

    const high = maxBody + upperWick;
    const low = Math.max(open * 0.7, minBody - lowerWick);
    const volume = Math.floor(
      100 + Math.random() * 800 + Math.abs(change / currentPrice) * 15000
    );

    candles.push({
      time,
      open: Number(open.toFixed(asset.decimals)),
      high: Number(high.toFixed(asset.decimals)),
      low: Number(low.toFixed(asset.decimals)),
      close: Number(close.toFixed(asset.decimals)),
      volume
    });

    currentPrice = close;
  }

  return candles;
}

export async function fetchMarketCandles(
  asset: MarketAsset,
  timeframe = '15m',
  limit = 200
): Promise<Candle[]> {
  const tfConfig = TIMEFRAMES.find(t => t.id === timeframe) || TIMEFRAMES[2];

  if (asset.binanceSymbol) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);
      const url = `https://api.binance.com/api/v3/klines?symbol=${asset.binanceSymbol}&interval=${timeframe}&limit=${limit}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const raw = await response.json();
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map((k: (string | number)[]) => ({
            time: Number(k[0]),
            open: parseFloat(String(k[1])),
            high: parseFloat(String(k[2])),
            low: parseFloat(String(k[3])),
            close: parseFloat(String(k[4])),
            volume: parseFloat(String(k[5]))
          }));
        }
      }
    } catch {
      // Graceful fallback to realistic synthetic data
    }
  }

  return generateSyntheticCandles(asset, limit, tfConfig.ms);
}
