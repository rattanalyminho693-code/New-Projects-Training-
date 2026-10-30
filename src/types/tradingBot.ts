import { Language } from '../types';

export type SignalMode =
  | 'Fast Pivot (ចេញលឿន 1-Bar)'
  | 'Instant Breakout (ចេញភ្លាមៗ 0-Bar)'
  | 'Classic LuxAlgo (ដើម 24-Bar)';

export interface IndicatorSettings {
  signalMode: SignalMode;
  leftBars: number;
  rightBars: number;
  rrRatio: number;
  backpaint: boolean;
  maxCss: string;
  minCss: string;
  avgCss: string;
  bullFill: string;
  bearFill: string;
}

export interface Candle {
  time: number; // Unix timestamp in ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorBarData {
  ph: number | null;
  pl: number | null;
  max: number;
  min: number;
  avg: number;
  trend: 'bull' | 'bear';
  isBuy: boolean;
  isSell: boolean;
  entryPrice?: number;
  slPrice?: number;
  tpPrice?: number;
}

export type TradeStatus = 'WIN' | 'LOSS' | 'OPEN';

export interface Trade {
  id: string;
  type: 'BUY' | 'SELL';
  entryIndex: number;
  entryTime: number;
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  exitIndex?: number;
  exitTime?: number;
  exitPrice?: number;
  status: TradeStatus;
  rMultiple: number;
  pnlPercent: number;
  pnlUsd?: number;
  durationBars: number;
}

export interface BacktestMetrics {
  totalTrades: number;
  winCount: number;
  lossCount: number;
  openCount: number;
  winRate: number;
  profitFactor: number;
  netR: number;
  avgR: number;
  maxDrawdownR: number;
  bestTradeR: number;
  worstTradeR: number;
  equityCurve: { tradeIndex: number; cumulativeR: number }[];
}

export interface TradeAlert {
  id: string;
  time: number;
  symbol: string;
  timeframe: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  signalMode: SignalMode;
  read: boolean;
}

export type BotStatus = 'RUNNING' | 'PAUSED' | 'STOPPED';

export interface BotConfig {
  botEnabled: boolean;
  status: BotStatus;
  mode: 'PAPER' | 'MT5_BRIDGE';
  syncWithMT5: boolean;
  initialBalance: number;
  currentBalance: number;
  riskPerTradePercent: number;
  maxLeverage: number;
  autoCloseOnOpposite: boolean;
  trailingStop: boolean;
  soundAlerts: boolean;
  webhookSecret: string;
  telegramChatId: string;
  telegramBotToken: string;
}

export interface BotPosition {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  slPrice: number;
  tpPrice: number;
  sizeUnits: number;
  allocatedMargin: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  entryTime: number;
  status: 'OPEN' | 'CLOSED';
  closedReason?: 'TAKE_PROFIT' | 'STOP_LOSS' | 'OPPOSITE_SIGNAL' | 'MANUAL_CLOSE';
  exitPrice?: number;
  exitTime?: number;
  realizedPnl?: number;
}

export interface BotLogItem {
  id: string;
  time: number;
  type:
    | 'ORDER_OPEN'
    | 'ORDER_CLOSE'
    | 'WEBHOOK_RECEIVED'
    | 'MT5_SYNC'
    | 'TP_HIT'
    | 'SL_HIT'
    | 'INFO'
    | 'ERROR';
  message: string;
  messageKh: string;
  details?: Record<string, unknown>;
}

export type BotWorkspaceTab = 'bot' | 'chart' | 'mt5_bridge' | 'backtest' | 'script' | 'alerts';

export type { Language };
