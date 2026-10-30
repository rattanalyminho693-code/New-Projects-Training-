import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Language,
  MT5Config,
  MT5ExecutionLog,
  MT5Position,
  Role,
  UserAccount
} from '../types';
import {
  Candle,
  IndicatorSettings,
  TradeAlert,
  BotWorkspaceTab
} from '../types/tradingBot';
import {
  SUPPORTED_ASSETS,
  TIMEFRAMES,
  MarketAsset,
  fetchMarketCandles
} from '../services/marketData';
import {
  DEFAULT_INDICATOR_SETTINGS,
  computeLuxAlgoIndicator,
  runIndicatorBacktest
} from '../services/pineIndicator';
import { botEngine, BotState } from '../services/tradingBotEngine';
import { soundAlert } from '../services/soundAlert';
import { TradingChart } from './bot/TradingChart';
import { AutoTradingBotPanel } from './bot/AutoTradingBotPanel';
import { BacktestPanel } from './bot/BacktestPanel';
import { PineScriptViewer } from './bot/PineScriptViewer';
import { AlertsPanel } from './bot/AlertsPanel';
import { IndicatorSettingsModal } from './bot/IndicatorSettingsModal';
import {
  Bot,
  X,
  CheckCircle2,
  Sliders,
  Activity,
  Zap,
  Play,
  Pause,
  Code2,
  TrendingUp,
  TrendingDown,
  Power,
  Lock,
  ShieldAlert,
  Crown,
  MessageSquare,
  BarChart3,
  LineChart,
  Bell,
  Server
} from 'lucide-react';

export interface MT5AutoTradingEngineViewProps {
  lang: Language;
  config: MT5Config;
  onUpdateConfig: (updated: Partial<MT5Config>) => void;
  positions: MT5Position[];
  onClosePosition: (ticket: number) => void;
  onSetBreakeven: (ticket: number) => void;
  logs: MT5ExecutionLog[];
  onSimulateTestOrder: () => void;
  onCloseModal?: () => void;
  embedded?: boolean;
}

export const MT5AutoTradingEngineView: React.FC<MT5AutoTradingEngineViewProps> = ({
  lang,
  config,
  onUpdateConfig,
  positions,
  onClosePosition,
  onSetBreakeven,
  logs,
  onSimulateTestOrder,
  onCloseModal,
  embedded = false
}) => {
  const isKm = lang === 'km';

  // Active Workspace Sub-Tab
  const [activeTab, setActiveTab] = useState<BotWorkspaceTab>('bot');

  // Market Asset & Timeframe State
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(SUPPORTED_ASSETS[0]);
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(true);

  // Live Tick Simulation Controls
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1000);

  // LuxAlgo Indicator Settings & Modal
  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>(
    DEFAULT_INDICATOR_SETTINGS
  );
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState<boolean>(false);
  const [selectedTradeIndex, setSelectedTradeIndex] = useState<number | null>(null);

  // Live Alerts Stream
  const [alerts, setAlerts] = useState<TradeAlert[]>([]);

  // Subscribe to TradingBotEngine state
  const [botState, setBotState] = useState<BotState>(() => botEngine.getSnapshot());

  useEffect(() => {
    const unsub = botEngine.subscribe(() => {
      setBotState(botEngine.getSnapshot());
    });
    return unsub;
  }, []);

  // MT5 Settings Form State + Inline Toast (no window.alert!)
  const [serverInput, setServerInput] = useState(config.brokerServer);
  const [accountInput, setAccountInput] = useState(config.accountNumber);
  const [lotType, setLotType] = useState<'fixed' | 'risk_percent'>(config.lotType);
  const [fixedLot, setFixedLot] = useState(config.fixedLotSize);
  const [riskPercent, setRiskPercent] = useState(config.riskPercent);
  const [autoBe, setAutoBe] = useState(config.partialTakeProfit);
  const [maxSlippage, setMaxSlippage] = useState(config.maxSlippage);
  const [mt5SavedToast, setMt5SavedToast] = useState(false);

  // Load initial candles whenever Asset or Timeframe changes
  useEffect(() => {
    let cancelled = false;
    setIsLoadingCandles(true);
    fetchMarketCandles(selectedAsset, timeframe, 200).then(data => {
      if (!cancelled) {
        setCandles(data);
        setIsLoadingCandles(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedAsset, timeframe]);

  // Real-time Tick Simulation & Candle Progression
  useEffect(() => {
    if (!isSimulating || candles.length === 0) return;

    const tfMs =
      TIMEFRAMES.find(t => t.id === timeframe)?.ms || 15 * 60 * 1000;

    const interval = setInterval(() => {
      setCandles(prev => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const last = { ...next[next.length - 1] };

        const vol = selectedAsset.basePrice * 0.00055;
        const delta = (Math.random() - 0.495) * vol * 2;
        const newClose = Number(
          Math.max(selectedAsset.tickSize, last.close + delta).toFixed(
            selectedAsset.decimals
          )
        );

        const now = Date.now();
        // Occasionally roll a new bar every ~18 ticks or if timeframe elapsed
        const shouldOpenNewBar = now - last.time >= tfMs || Math.random() < 0.06;

        if (shouldOpenNewBar) {
          const newBar: Candle = {
            time: last.time + tfMs,
            open: last.close,
            high: Math.max(last.close, newClose),
            low: Math.min(last.close, newClose),
            close: newClose,
            volume: Math.floor(80 + Math.random() * 240)
          };
          const updated = [...next.slice(1), newBar];
          botEngine.processTick(selectedAsset.symbol, newClose);
          return updated;
        } else {
          last.close = newClose;
          if (newClose > last.high) last.high = newClose;
          if (newClose < last.low) last.low = newClose;
          last.volume += Math.floor(5 + Math.random() * 35);
          next[next.length - 1] = last;
          botEngine.processTick(selectedAsset.symbol, newClose);
          return next;
        }
      });
    }, simSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, selectedAsset, timeframe, candles.length]);

  // Compute LuxAlgo Indicator & Quantitative Backtest
  const indicatorData = useMemo(
    () => computeLuxAlgoIndicator(candles, indicatorSettings),
    [candles, indicatorSettings]
  );

  const backtestResult = useMemo(
    () => runIndicatorBacktest(candles, indicatorData, indicatorSettings.rrRatio),
    [candles, indicatorData, indicatorSettings.rrRatio]
  );

  // Detect newly confirmed Buy / Sell signal on latest bar -> auto-execute in Bot
  const lastSignalBarTimeRef = useRef<number>(-1);
  useEffect(() => {
    if (indicatorData.length === 0 || candles.length === 0) return;
    const lastIdx = indicatorData.length - 1;
    const latestBar = indicatorData[lastIdx];
    const latestCandle = candles[lastIdx];
    if (!latestBar || !latestCandle) return;

    if (
      (latestBar.isBuy || latestBar.isSell) &&
      lastSignalBarTimeRef.current !== latestCandle.time
    ) {
      lastSignalBarTimeRef.current = latestCandle.time;
      const type = latestBar.isBuy ? 'BUY' : 'SELL';
      const entryPrice = latestBar.entryPrice || latestCandle.close;
      const slPrice =
        latestBar.slPrice ||
        (type === 'BUY' ? entryPrice * 0.992 : entryPrice * 1.008);
      const tpPrice =
        latestBar.tpPrice ||
        (type === 'BUY'
          ? entryPrice + (entryPrice - slPrice) * indicatorSettings.rrRatio
          : entryPrice - (slPrice - entryPrice) * indicatorSettings.rrRatio);

      botEngine.executeSignal(
        selectedAsset.symbol,
        type,
        Number(entryPrice.toFixed(selectedAsset.decimals)),
        Number(slPrice.toFixed(selectedAsset.decimals)),
        Number(tpPrice.toFixed(selectedAsset.decimals)),
        'INDICATOR'
      );

      const newAlert: TradeAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        time: Date.now(),
        symbol: selectedAsset.symbol,
        timeframe,
        type,
        entryPrice,
        slPrice,
        tpPrice,
        signalMode: indicatorSettings.signalMode,
        read: false
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
    }
  }, [
    indicatorData,
    candles,
    selectedAsset.symbol,
    selectedAsset.decimals,
    timeframe,
    indicatorSettings.signalMode,
    indicatorSettings.rrRatio
  ]);

  const latestCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const priceChange =
    latestCandle && firstCandle ? latestCandle.close - firstCandle.open : 0;
  const priceChangePercent =
    latestCandle && firstCandle && firstCandle.open > 0
      ? (priceChange / firstCandle.open) * 100
      : 0;

  const totalFloatingMT5Profit = positions.reduce((acc, p) => acc + p.profit, 0);

  const handleSelectBacktestTrade = useCallback((entryIdx: number) => {
    setSelectedTradeIndex(entryIdx);
    setActiveTab('chart');
  }, []);

  const handleSaveMT5Settings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      brokerServer: serverInput,
      accountNumber: accountInput,
      lotType,
      fixedLotSize: Number(fixedLot),
      riskPercent: Number(riskPercent),
      partialTakeProfit: autoBe,
      maxSlippage: Number(maxSlippage)
    });
    setMt5SavedToast(true);
    setTimeout(() => setMt5SavedToast(false), 3000);
  };

  return (
    <div className="bg-[#0b1019] border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-200 flex flex-col">
      {/* 1. Primary Engine Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-[#0d1422] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isKm
                  ? 'MT5 Auto-Trading Engine & Bot Auto Trading'
                  : 'MT5 Auto-Trading Engine & Bot Auto Trading'}
              </h2>
              <span className="text-xs font-mono text-teal-400 font-semibold">
                · LuxAlgo Instant + MT5 Bridge
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isKm
                ? 'ប្រព័ន្ធជួញដូរស្វ័យប្រវត្តិរួមបញ្ចូលគ្នា៖ Bot Auto Trading (SL/TP Bracket) + MetaTrader 5 Expert Advisor'
                : 'Integrated automated execution terminal: Real-time Bot Bracket Engine + MetaTrader 5 Broker Bridge'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Master Auto Bot Toggle */}
          <button
            type="button"
            onClick={() => {
              const next =
                botState.config.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
              botEngine.updateConfig({
                status: next,
                botEnabled: next === 'RUNNING'
              });
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              botState.config.status === 'RUNNING'
                ? 'bg-teal-600 hover:bg-teal-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>
              {botState.config.status === 'RUNNING'
                ? isKm
                  ? 'Bot Auto: កំពុងដំណើរការ'
                  : 'Bot Auto: RUNNING'
                : isKm
                ? 'Bot Auto: ផ្អាក'
                : 'Bot Auto: PAUSED'}
            </span>
          </button>

          {/* Master MT5 Bridge Toggle */}
          <button
            type="button"
            onClick={() =>
              onUpdateConfig({ autoTradeEnabled: !config.autoTradeEnabled })
            }
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              config.autoTradeEnabled
                ? 'bg-[#2962ff] hover:bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>
              {config.autoTradeEnabled
                ? isKm
                  ? 'MT5 Bridge: បើក (ON)'
                  : 'MT5 Bridge: ON'
                : isKm
                ? 'MT5 Bridge: បិទ (OFF)'
                : 'MT5 Bridge: OFF'}
            </span>
          </button>

          {!embedded && onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={isKm ? 'បិទផ្ទាំង' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Contextual Market Ticker, Timeframes & Simulation Speed Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#090d15] border-b border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedAsset.symbol}
            onChange={e => {
              const found = SUPPORTED_ASSETS.find(a => a.symbol === e.target.value);
              if (found) setSelectedAsset(found);
            }}
            className="px-3 py-1.5 bg-[#121927] border border-slate-700 rounded-lg font-mono font-bold text-white text-xs cursor-pointer focus:outline-none focus:border-teal-500"
          >
            {SUPPORTED_ASSETS.map(asset => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.symbol} ({asset.name})
              </option>
            ))}
          </select>

          <div className="flex items-center p-0.5 bg-[#121927] border border-slate-800 rounded-lg font-mono text-[11px]">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeframe(tf.id)}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  timeframe === tf.id
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {latestCandle && (
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="text-sm font-bold text-white">
                ${latestCandle.close.toFixed(selectedAsset.decimals)}
              </span>
              <span
                className={`flex items-center text-[11px] font-semibold ${
                  priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {priceChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {priceChange >= 0 ? '+' : ''}
                {priceChangePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>{isKm ? 'របៀបសញ្ញា:' : 'Mode:'}</span>
            <span className="text-teal-400 font-semibold">
              {indicatorSettings.signalMode.split(' ')[0]}
            </span>
            <span>· RR {indicatorSettings.rrRatio}x</span>
          </div>

          <button
            type="button"
            onClick={() => setIsIndicatorModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121927] hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>{isKm ? 'ការកំណត់ Indicator' : 'Indicator Settings'}</span>
          </button>

          <div className="flex items-center gap-1 bg-[#121927] border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setIsSimulating(prev => !prev)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isSimulating
                  ? 'text-teal-400 hover:bg-slate-800'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title={isSimulating ? 'Pause Live Ticks' : 'Resume Live Ticks'}
            >
              {isSimulating ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                setSimSpeed(prev =>
                  prev === 1000 ? 300 : prev === 300 ? 120 : 1000
                )
              }
              className="px-2 py-1 text-[11px] font-mono tabular-nums font-bold text-slate-300 hover:text-white cursor-pointer"
              title="Toggle Tick Speed"
            >
              {simSpeed === 1000 ? '1x' : simSpeed === 300 ? '3x' : '10x'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0d121c] border-b border-slate-800 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('bot')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'bot'
              ? 'bg-teal-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>
            {isKm
              ? `Bot Auto Trading (${botState.positions.length})`
              : `Bot Auto Trading (${botState.positions.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chart')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'chart'
              ? 'bg-teal-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>
            {isKm ? 'ក្រាហ្វជួញដូរផ្ទាល់ (Live Chart)' : 'Live Bot Chart'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mt5_bridge')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'mt5_bridge'
              ? 'bg-[#2962ff] text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>
            {isKm
              ? `MT5 Broker Bridge (${positions.length})`
              : `MT5 Broker Bridge (${positions.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backtest')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'backtest'
              ? 'bg-teal-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>
            {isKm ? 'របាយការណ៍ Backtest' : 'Strategy Backtest'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('script')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'script'
              ? 'bg-teal-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>
            {isKm ? 'កូដ Pine Script & MQL5 EA' : 'Pine Script & MQL5 EA'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'alerts'
              ? 'bg-teal-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>
            {isKm
              ? `សញ្ញាជូនដំណឹង (${alerts.length})`
              : `Signal Alerts (${alerts.length})`}
          </span>
        </button>
      </div>

      {/* 4. Active Workspace Content */}
      <div className="p-5 flex-1">
        {isLoadingCandles && activeTab !== 'mt5_bridge' && activeTab !== 'script' ? (
          <div className="flex flex-col items-center justify-center min-h-[380px] gap-3 text-slate-400">
            <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">
              {isKm ? 'កំពុងទាញយកទិន្នន័យតម្លៃទីផ្សារ...' : 'Loading market candlestick data...'}
            </span>
          </div>
        ) : (
          <>
            {/* SUB-TAB 1: BOT AUTO TRADING CONTROL CENTER */}
            {activeTab === 'bot' && (
              <AutoTradingBotPanel
                config={botState.config}
                positions={botState.positions}
                closedPositions={botState.closedPositions}
                logs={botState.logs}
                totalTrades={botState.totalTrades}
                winCount={botState.winCount}
                lossCount={botState.lossCount}
                realizedPnl={botState.realizedPnl}
                currentPrice={
                  latestCandle ? latestCandle.close : selectedAsset.basePrice
                }
                symbol={selectedAsset.symbol}
                decimals={selectedAsset.decimals}
                lang={lang}
                onOpenLiveChart={() => setActiveTab('chart')}
              />
            )}

            {/* SUB-TAB 2: LIVE BOT CANDLESTICK CHART */}
            {activeTab === 'chart' && (
              <div className="flex flex-col min-h-[540px]">
                <TradingChart
                  candles={candles}
                  indicatorData={indicatorData}
                  settings={indicatorSettings}
                  activePositions={botState.positions}
                  mt5Positions={positions}
                  selectedTradeIndex={selectedTradeIndex}
                  onSelectTrade={setSelectedTradeIndex}
                  decimals={selectedAsset.decimals}
                  symbol={selectedAsset.symbol}
                />
              </div>
            )}

            {/* SUB-TAB 3: METATRADER 5 BROKER BRIDGE & TICKETS */}
            {activeTab === 'mt5_bridge' && (
              <div className="space-y-5">
                {/* MT5 Account KPI Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-[#0d121c] border border-slate-800">
                    <div className="text-[11px] text-slate-400">MT5 Broker Server</div>
                    <div className="text-sm font-bold text-white font-mono mt-1 truncate">
                      {config.brokerServer}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                      Account #{config.accountNumber}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0d121c] border border-slate-800">
                    <div className="text-[11px] text-slate-400">MT5 Account Balance</div>
                    <div className="text-base font-bold text-white font-mono tabular-nums mt-1">
                      ${config.accountBalance.toLocaleString()}.00 USD
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono">
                      Connected · FOK Fill
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0d121c] border border-slate-800">
                    <div className="text-[11px] text-slate-400">MT5 Live Equity</div>
                    <div className="text-base font-bold text-sky-400 font-mono tabular-nums mt-1">
                      $
                      {(config.accountBalance + totalFloatingMT5Profit).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}{' '}
                      USD
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      Risk Mode:{' '}
                      {config.lotType === 'fixed'
                        ? `${config.fixedLotSize} Lots`
                        : `${config.riskPercent}% Risk`}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0d121c] border border-slate-800">
                    <div className="text-[11px] text-slate-400">MT5 Floating P&L</div>
                    <div
                      className={`text-base font-bold font-mono tabular-nums mt-1 ${
                        totalFloatingMT5Profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {totalFloatingMT5Profit >= 0
                        ? `+$${totalFloatingMT5Profit.toFixed(2)}`
                        : `-$${Math.abs(totalFloatingMT5Profit).toFixed(2)}`}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {positions.length} active MT5 tickets
                    </div>
                  </div>
                </div>

                {/* Active MT5 Positions + Test Order */}
                <div className="p-4 rounded-xl bg-[#0d121c] border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-sky-400" />
                      <h3 className="text-sm font-semibold text-white">
                        {isKm
                          ? `បញ្ជា MT5 កំពុងបើកដំណើរការ (${positions.length})`
                          : `Active MetaTrader 5 Tickets (${positions.length})`}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={onSimulateTestOrder}
                      className="px-3.5 py-1.5 bg-[#2962ff] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>
                        {isKm ? 'សាកល្បងបាញ់ Order ចូល MT5' : 'Test Send Order to MT5'}
                      </span>
                    </button>
                  </div>

                  {positions.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#090d14] border border-slate-800 text-center space-y-1.5">
                      <p className="text-xs font-semibold text-slate-300">
                        {isKm
                          ? 'មិនមាន Ticket កំពុងបើកក្នុង MT5 ទេ'
                          : 'No Open MT5 Positions'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isKm
                          ? 'នៅពេលមាន Signal ថ្មីពី TradingView ឬ Bot Auto Trading ប្រព័ន្ធនឹងបើក Order លើ MT5 ភ្លាមៗ។'
                          : 'Incoming signals from TradingView or AutoBot will open MT5 orders automatically.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {positions.map(pos => {
                        const isBuy = pos.type === 'BUY';
                        return (
                          <div
                            key={pos.ticket}
                            className="p-3.5 rounded-xl bg-[#090d14] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums text-xs">
                                <span className="text-slate-400">#{pos.ticket}</span>
                                <span className="font-bold text-white text-sm">
                                  {pos.symbol}
                                </span>
                                <span
                                  className={`font-bold ${
                                    isBuy ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {pos.type} {pos.volume} Lots
                                </span>
                              </div>
                              <div className="text-xs font-mono tabular-nums text-slate-400 flex flex-wrap items-center gap-2.5">
                                <span>
                                  Open: <strong className="text-slate-200">{pos.openPrice}</strong>
                                </span>
                                <span>·</span>
                                <span>
                                  Current:{' '}
                                  <strong className="text-white">{pos.currentPrice}</strong>
                                </span>
                                <span>·</span>
                                <span>
                                  SL: <strong className="text-rose-400">{pos.sl}</strong>
                                </span>
                                <span>·</span>
                                <span>
                                  TP: <strong className="text-emerald-400">{pos.tp}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-3">
                              <div className="text-right font-mono tabular-nums">
                                <div
                                  className={`text-sm font-bold ${
                                    pos.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {pos.profit >= 0
                                    ? `+$${pos.profit.toFixed(2)}`
                                    : `-$${Math.abs(pos.profit).toFixed(2)}`}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {pos.pips >= 0 ? `+${pos.pips}` : pos.pips} pips
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onSetBreakeven(pos.ticket)}
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Breakeven
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onClosePosition(pos.ticket)}
                                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/70 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {isKm ? 'បិទ Order' : 'Close'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2-Column: MT5 Broker Configuration Form & MT5 Execution Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <form
                    onSubmit={handleSaveMT5Settings}
                    className="p-4 rounded-xl bg-[#0d121c] border border-slate-800 space-y-4 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-sm font-semibold text-white">
                        {isKm
                          ? 'ការកំណត់គណនី MetaTrader 5 (MT5 Config)'
                          : 'MetaTrader 5 Account & Lot Sizing'}
                      </span>
                      {mt5SavedToast && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isKm ? 'បានរក្សាទុកជោគជ័យ!' : 'Saved!'}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-400 mb-1">
                          MT5 Broker Server
                        </label>
                        <input
                          type="text"
                          value={serverInput}
                          onChange={e => setServerInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">
                          MT5 Login Account ID
                        </label>
                        <input
                          type="text"
                          value={accountInput}
                          onChange={e => setAccountInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono tabular-nums focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">
                          Lot Sizing Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setLotType('fixed')}
                            className={`py-2 rounded-lg font-semibold border cursor-pointer ${
                              lotType === 'fixed'
                                ? 'bg-[#2962ff] text-white border-[#2962ff]'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            Fixed Lot
                          </button>
                          <button
                            type="button"
                            onClick={() => setLotType('risk_percent')}
                            className={`py-2 rounded-lg font-semibold border cursor-pointer ${
                              lotType === 'risk_percent'
                                ? 'bg-[#2962ff] text-white border-[#2962ff]'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            Risk %
                          </button>
                        </div>
                      </div>

                      {lotType === 'fixed' ? (
                        <div>
                          <label className="block text-slate-400 mb-1">
                            Fixed Volume (Lot)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={fixedLot}
                            onChange={e =>
                              setFixedLot(parseFloat(e.target.value) || 0.01)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono tabular-nums focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-slate-400 mb-1">
                            Risk Percentage (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={riskPercent}
                            onChange={e =>
                              setRiskPercent(parseFloat(e.target.value) || 1)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono tabular-nums focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-slate-400 mb-1">
                          Max Slippage (Points)
                        </label>
                        <input
                          type="number"
                          value={maxSlippage}
                          onChange={e =>
                            setMaxSlippage(parseInt(e.target.value, 10) || 3)
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono tabular-nums focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoBe}
                            onChange={e => setAutoBe(e.target.checked)}
                            className="accent-sky-500 w-4 h-4"
                          />
                          <span className="text-slate-200 font-medium">
                            {isKm
                              ? 'រំកិល SL ទៅ Breakeven ពេលដល់ TP1'
                              : 'Auto Breakeven on TP1'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#2962ff] hover:bg-blue-600 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        {isKm ? 'រក្សាទុកការកំណត់ MT5' : 'Save MT5 Configuration'}
                      </button>
                    </div>
                  </form>

                  {/* MT5 Execution Logs */}
                  <div className="p-4 rounded-xl bg-[#0d121c] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-sm font-semibold text-white">
                        {isKm
                          ? `ប្រវត្តិបញ្ជូន Order MT5 (${logs.length})`
                          : `MT5 Terminal Execution Logs (${logs.length})`}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {logs.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500">
                          {isKm
                            ? 'មិនទាន់មានប្រវត្តិបញ្ជូន Order MT5 នៅឡើយទេ'
                            : 'No MT5 execution logs yet.'}
                        </div>
                      ) : (
                        logs.map(l => (
                          <div
                            key={l.id}
                            className="p-2.5 rounded-lg bg-[#090d14] border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-slate-500">#{l.ticket}</span>
                              <span
                                className={`font-bold ${
                                  l.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {l.type} {l.volume} {l.symbol}
                              </span>
                              <span className="text-white">@ {l.price}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-emerald-400 font-semibold">
                                {l.status} ({l.latencyMs}ms)
                              </span>
                              <span className="text-slate-500">
                                {new Date(l.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: QUANTITATIVE BACKTEST REPORT */}
            {activeTab === 'backtest' && (
              <BacktestPanel
                metrics={backtestResult.metrics}
                trades={backtestResult.trades}
                onSelectTrade={handleSelectBacktestTrade}
                decimals={selectedAsset.decimals}
                symbol={selectedAsset.symbol}
                lang={lang}
              />
            )}

            {/* SUB-TAB 5: PINE SCRIPT V5 & MQL5 EA */}
            {activeTab === 'script' && <PineScriptViewer lang={lang} />}

            {/* SUB-TAB 6: REAL-TIME SIGNAL ALERTS */}
            {activeTab === 'alerts' && (
              <AlertsPanel
                alerts={alerts}
                soundEnabled={botState.config.soundAlerts}
                onToggleSound={() => {
                  const next = !botState.config.soundAlerts;
                  soundAlert.enabled = next;
                  botEngine.updateConfig({ soundAlerts: next });
                }}
                decimals={selectedAsset.decimals}
                lang={lang}
              />
            )}
          </>
        )}
      </div>

      {/* LuxAlgo Indicator Settings Modal */}
      <IndicatorSettingsModal
        isOpen={isIndicatorModalOpen}
        onClose={() => setIsIndicatorModalOpen(false)}
        settings={indicatorSettings}
        onSave={next => setIndicatorSettings(next)}
        onReset={() => setIndicatorSettings(DEFAULT_INDICATOR_SETTINGS)}
        lang={lang}
      />
    </div>
  );
};

interface MT5AutoTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  config: MT5Config;
  onUpdateConfig: (updated: Partial<MT5Config>) => void;
  positions: MT5Position[];
  onClosePosition: (ticket: number) => void;
  onSetBreakeven: (ticket: number) => void;
  logs: MT5ExecutionLog[];
  onSimulateTestOrder: () => void;
  userRole?: Role;
  isMT5Authorized?: boolean;
  currentUser?: UserAccount;
  onUpgradeToVip?: () => void;
  onSwitchToAdmin?: () => void;
}

export const MT5AutoTradingModal: React.FC<MT5AutoTradingModalProps> = ({
  isOpen,
  onClose,
  lang,
  config,
  onUpdateConfig,
  positions,
  onClosePosition,
  onSetBreakeven,
  logs,
  onSimulateTestOrder,
  userRole = 'vip',
  isMT5Authorized = false,
  currentUser,
  onUpgradeToVip,
  onSwitchToAdmin
}) => {
  const [contactRequested, setContactRequested] = useState(false);

  if (!isOpen) return null;
  const isKm = lang === 'km';
  const isAuthorized =
    userRole === 'admin' || (userRole === 'vip' && !!isMT5Authorized);

  // Unauthorized Visitor / Member / Unapproved VIP Gate
  if (!isAuthorized) {
    const isNonVip = userRole !== 'vip';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-xl bg-[#131722] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200 my-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {isNonVip ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <p className="text-xs font-mono font-bold text-amber-400">
                  {isKm ? 'មុខងារពិសេសសម្រាប់ VIP' : 'VIP EXCLUSIVE ENGINE'}
                </p>
                <h3 className="text-xl font-bold text-white mt-2">
                  {isKm
                    ? 'MT5 & Bot Auto-Trading អាចប្រើបានសម្រាប់តែ Member VIP ប៉ុណ្ណោះ'
                    : 'MT5 & Bot Auto-Trading is Restricted to VIP Members'}
                </h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                  {isKm
                    ? 'មុខងារតភ្ជាប់ MetaTrader 5 និងម៉ាស៊ីន Bot Auto Trading តាម LuxAlgo PineScript អាចប្រើបានសម្រាប់សមាជិក VIP ដែលត្រូវបាន Admin អនុញ្ញាតប៉ុណ្ណោះ។'
                    : 'Real-time automated Bot & MetaTrader 5 execution from TradingView Webhooks is gated for authorized VIP members.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onUpgradeToVip && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onUpgradeToVip();
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    <span>
                      {isKm ? 'តម្លើងជា VIP Member ឥឡូវនេះ' : 'Upgrade to VIP Member'}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {isKm ? 'បិទផ្ទាំង' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div>
                <p className="text-xs font-mono font-bold text-sky-400">
                  {isKm ? 'ត្រូវការការអនុញ្ញាតពី ADMIN' : 'ADMIN AUTHORIZATION REQUIRED'}
                </p>
                <h3 className="text-xl font-bold text-white mt-2">
                  {isKm
                    ? 'គណនី VIP របស់អ្នករង់ចាំការបើកសិទ្ធិ MT5 & Bot Auto-Trading'
                    : 'VIP Account Pending Administrator Authorization'}
                </h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                  {isKm
                    ? `សមាជិក VIP (${currentUser?.name || 'VIP Trader'}) អាចស្នើសុំ Admin បើកសិទ្ធិ MT5 & Bot Auto-Trade ដើម្បីការពារសុវត្ថិភាពដើមទុន។`
                    : 'Request Admin activation or switch to Admin Demo to grant MT5 & Bot clearance.'}
                </p>
              </div>

              {contactRequested ? (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isKm
                      ? 'សំណើត្រូវបានផ្ញើជូន Admin រួចរាល់!'
                      : 'Request submitted to Administrator!'}
                  </span>
                </div>
              ) : (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setContactRequested(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#2962ff] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {isKm
                        ? 'ស្នើសុំ Admin បើកសិទ្ធិ MT5 & Bot'
                        : 'Request Admin Activation'}
                    </span>
                  </button>

                  {onSwitchToAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSwitchToAdmin();
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isKm ? 'ផ្ទាំង Admin (ផ្តល់សិទ្ធិ)' : 'Admin Toggle Demo'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-7xl my-4">
        <MT5AutoTradingEngineView
          lang={lang}
          config={config}
          onUpdateConfig={onUpdateConfig}
          positions={positions}
          onClosePosition={onClosePosition}
          onSetBreakeven={onSetBreakeven}
          logs={logs}
          onSimulateTestOrder={onSimulateTestOrder}
          onCloseModal={onClose}
          embedded={false}
        />
      </div>
    </div>
  );
};
