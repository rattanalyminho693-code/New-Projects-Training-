import React, { useState, useEffect } from 'react';
import {
  BotConfig,
  BotPosition,
  BotLogItem,
  Language
} from '../../types/tradingBot';
import { botEngine } from '../../services/tradingBotEngine';
import { SAMPLE_MQL5_EA } from '../../data/mockData';
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Send,
  Code2,
  Terminal,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AutoTradingBotPanelProps {
  config: BotConfig;
  positions: BotPosition[];
  closedPositions: BotPosition[];
  logs: BotLogItem[];
  totalTrades: number;
  winCount: number;
  lossCount: number;
  realizedPnl: number;
  currentPrice: number;
  symbol: string;
  decimals?: number;
  lang: Language;
  onOpenLiveChart?: () => void;
}

export const AutoTradingBotPanel: React.FC<AutoTradingBotPanelProps> = ({
  config,
  positions,
  closedPositions,
  logs,
  totalTrades,
  winCount,
  lossCount,
  realizedPnl,
  currentPrice,
  symbol,
  decimals = 2,
  lang,
  onOpenLiveChart
}) => {
  const isKhmer = lang === 'km';
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'nodejs' | 'mql5'>('python');
  const [posViewTab, setPosViewTab] = useState<'open' | 'closed'>('open');

  // Test Webhook / Live Signal Executor state
  const [testAction, setTestAction] = useState<'BUY' | 'SELL'>('BUY');
  const [testPrice, setTestPrice] = useState<number>(currentPrice);
  const [webhookFeedback, setWebhookFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  useEffect(() => {
    setTestPrice(Number(currentPrice.toFixed(decimals)));
  }, [symbol]);

  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const totalEquity = config.currentBalance + totalUnrealizedPnl;

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleBot = () => {
    const nextStatus = config.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
    botEngine.updateConfig({
      status: nextStatus,
      botEnabled: nextStatus === 'RUNNING'
    });
  };

  const handleManualTestSignal = () => {
    const price = Number((testPrice || currentPrice).toFixed(decimals));
    const sl =
      testAction === 'BUY'
        ? Number((price * 0.994).toFixed(decimals))
        : Number((price * 1.006).toFixed(decimals));
    const tp =
      testAction === 'BUY'
        ? Number((price + (price - sl) * 2).toFixed(decimals))
        : Number((price - (sl - price) * 2).toFixed(decimals));

    const res = botEngine.handleWebhook({
      secret: config.webhookSecret,
      symbol,
      action: testAction,
      price,
      sl,
      tp
    });

    setWebhookFeedback({
      ok: res.success,
      msg: isKhmer ? res.messageKh : res.message
    });
    setTimeout(() => setWebhookFeedback(null), 3500);
  };

  const webhookJsonExample = `{
  "secret": "${config.webhookSecret}",
  "action": "{{strategy.order.action}}",
  "symbol": "${symbol}",
  "price": {{close}},
  "sl": {{low}},
  "tp": {{close}} + ({{close}} - {{low}}) * 2.0
}`;

  const pythonBotScript = `# ========================================================
# AlphaSignal x LuxAlgo Instant Auto Trading Bot (Binance / Bybit)
# ស្គ្រីប Python សម្រាប់ដំណើរការ Bot ជួញដូរស្វ័យប្រវត្តិ
# ========================================================
import ccxt
from fastapi import FastAPI, HTTPException, Request
import uvicorn

app = FastAPI(title="AlphaSignal Auto Trading Bot Bridge")

exchange = ccxt.binance({
    'apiKey': 'YOUR_BINANCE_API_KEY',
    'secret': 'YOUR_BINANCE_SECRET_KEY',
    'enableRateLimit': True,
    'options': {'defaultType': 'future'}
})

WEBHOOK_SECRET = "${config.webhookSecret}"

@app.post("/webhook")
async def tradingview_webhook(request: Request):
    data = await request.json()
    if data.get("secret") != WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized Secret")

    symbol = data.get("symbol", "${symbol}")
    action = data.get("action").upper()
    price = float(data.get("price"))
    sl = float(data.get("sl", price * 0.992 if action == "BUY" else price * 1.008))
    tp = float(data.get("tp", price * 1.016 if action == "BUY" else price * 0.984))

    side = 'buy' if action == 'BUY' else 'sell'
    balance = exchange.fetch_balance()['USDT']['free']
    risk_amount = balance * ${(config.riskPerTradePercent / 100).toFixed(3)}
    units = round(risk_amount / abs(price - sl), 4)

    order = exchange.create_market_order(symbol, side, units)
    opp_side = 'sell' if action == 'BUY' else 'buy'
    exchange.create_order(symbol, 'LIMIT', opp_side, units, tp, {'reduceOnly': True})
    exchange.create_order(symbol, 'STOP_MARKET', opp_side, units, None, {'stopPrice': sl, 'reduceOnly': True})

    return {"status": "success", "order_id": order["id"], "action": action}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`;

  const nodeJsBotScript = `// ========================================================
// AlphaSignal x LuxAlgo Instant Auto Trading Bot (Node.js & Express)
// កូដ Node.js ទទួល Webhook និងដំណើរការបញ្ជាទិញស្វ័យប្រវត្តិ
// ========================================================
const express = require('express');
const ccxt = require('ccxt');

const app = express();
app.use(express.json());

const exchange = new ccxt.binance({
  apiKey: process.env.BINANCE_API_KEY || 'YOUR_API_KEY',
  secret: process.env.BINANCE_SECRET_KEY || 'YOUR_SECRET_KEY',
  enableRateLimit: true,
  options: { defaultType: 'future' }
});

const WEBHOOK_SECRET = "${config.webhookSecret}";

app.post('/webhook', async (req, res) => {
  try {
    const { secret, action, symbol, price, sl, tp } = req.body;
    if (secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid Webhook Secret' });
    }

    const balance = await exchange.fetchBalance();
    const freeUsdt = balance.USDT.free;
    const riskDollar = freeUsdt * ${(config.riskPerTradePercent / 100).toFixed(3)};
    const units = parseFloat((riskDollar / Math.abs(price - sl)).toFixed(4));

    const side = action.toLowerCase();
    const oppSide = side === 'buy' ? 'sell' : 'buy';

    const entryOrder = await exchange.createMarketOrder(symbol, side, units);
    await exchange.createOrder(symbol, 'LIMIT', oppSide, units, tp, { reduceOnly: true });
    await exchange.createOrder(symbol, 'STOP_MARKET', oppSide, units, undefined, { stopPrice: sl, reduceOnly: true });

    res.json({ success: true, orderId: entryOrder.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(8000, () => console.log('Auto Trading Bot listening on port 8000...'));`;

  const currentScriptText =
    activeCodeTab === 'python'
      ? pythonBotScript
      : activeCodeTab === 'nodejs'
      ? nodeJsBotScript
      : SAMPLE_MQL5_EA;

  return (
    <div className="flex flex-col gap-5 text-slate-200">
      {/* Top 4 KPI / Control Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Engine Status & Start/Pause */}
        <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-teal-400" />
              <span className="font-semibold text-xs text-slate-200">
                {isKhmer ? 'ស្ថានភាព Bot Auto Trading' : 'Auto Bot Engine'}
              </span>
            </div>
            <span
              className={`text-[11px] font-mono font-bold ${
                config.status === 'RUNNING' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {config.status === 'RUNNING'
                ? isKhmer
                  ? '● កំពុងដំណើរការ'
                  : '● RUNNING'
                : isKhmer
                ? '● បានផ្អាក'
                : '● PAUSED'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleBot}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                config.status === 'RUNNING'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              {config.status === 'RUNNING' ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>{isKhmer ? 'ផ្អាក Bot (Pause)' : 'Pause Bot'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{isKhmer ? 'ដំណើរការ Bot (Start)' : 'Start Bot'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => botEngine.resetBot()}
              className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              title="Reset Account Capital"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'កំណត់ឡើងវិញ' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Account Equity */}
        <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isKhmer ? 'សមតុល្យគណនី Bot (Equity)' : 'Bot Account Equity'}</span>
            <DollarSign className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1.5">
            ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono tabular-nums text-slate-400 mt-1">
            {isKhmer ? 'ទុនដើម:' : 'Initial:'} ${config.initialBalance.toLocaleString()} ·{' '}
            <span className={totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)} Float
            </span>
          </div>
        </div>

        {/* Card 3: Realized P&L & Win Rate */}
        <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isKhmer ? 'ប្រាក់ចំណេញសរុប (Realized P&L)' : 'Total Realized P&L'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div
            className={`text-xl font-bold font-mono tabular-nums mt-1.5 ${
              realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {realizedPnl >= 0 ? '+' : '-'}${Math.abs(realizedPnl).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
            {isKhmer ? 'អត្រាឈ្នះ:' : 'Win Rate:'}{' '}
            <span className="text-slate-200 font-semibold">
              {totalTrades > 0 ? `${((winCount / totalTrades) * 100).toFixed(1)}%` : '0%'}
            </span>
            {' · '}
            {winCount}W / {lossCount}L
          </div>
        </div>

        {/* Card 4: Open Bracket Positions & MT5 Bridge Sync */}
        <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isKhmer ? 'បញ្ជាកំពុងបើក (Bracket Orders)' : 'Active Bot Orders'}</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <div className="text-xl font-bold font-mono tabular-nums text-white">
              {positions.length}{' '}
              <span className="text-xs font-normal text-slate-400">
                {isKhmer ? 'បញ្ជា' : 'open'}
              </span>
            </div>
            {onOpenLiveChart && (
              <button
                type="button"
                onClick={onOpenLiveChart}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 cursor-pointer whitespace-nowrap"
              >
                {isKhmer ? 'មើលលើក្រាហ្វ →' : 'View Chart →'}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>{isKhmer ? 'ភ្ជាប់ជាមួយ MT5 Bridge:' : 'MT5 Auto-Forward:'}</span>
            <button
              type="button"
              onClick={() => botEngine.updateConfig({ syncWithMT5: !config.syncWithMT5 })}
              className={`font-mono font-bold cursor-pointer ${
                config.syncWithMT5 ? 'text-sky-400' : 'text-slate-500'
              }`}
            >
              {config.syncWithMT5 ? (isKhmer ? 'បើក (SYNC ON)' : 'SYNC ON') : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Active & Closed Bot Bracket Positions Table */}
      <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPosViewTab('open')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  posViewTab === 'open'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isKhmer
                  ? `បញ្ជាកំពុងបើក (${positions.length})`
                  : `Active Positions (${positions.length})`}
              </button>
              <button
                type="button"
                onClick={() => setPosViewTab('closed')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  posViewTab === 'closed'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isKhmer
                  ? `ប្រវត្តិបិទរួច (${closedPositions.length})`
                  : `Closed History (${closedPositions.length})`}
              </button>
            </div>
          </div>

          <span className="text-xs text-slate-400">
            {isKhmer
              ? 'គ្រប់គ្រង SL, TP និង Trailing Break-even (+1R) ដោយស្វ័យប្រវត្តិ'
              : 'Automated SL / TP Bracket & +1R Trailing Break-even'}
          </span>
        </div>

        {posViewTab === 'open' ? (
          positions.length === 0 ? (
            <div className="p-7 text-center text-xs text-slate-400 border border-slate-800 rounded-xl bg-[#090d14] space-y-2">
              <p>
                {isKhmer
                  ? 'មិនទាន់មានបញ្ជាជួញដូរកំពុងបើកទេ។ នៅពេលសញ្ញា BUY ឬ SELL ចេញពី LuxAlgo Indicator ឬ Webhook, Bot នឹងបើកបញ្ជាភ្លាមៗ!'
                  : 'No open bot positions right now. Trigger a test signal below or wait for the next LuxAlgo candle signal.'}
              </p>
              <button
                type="button"
                onClick={handleManualTestSignal}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs cursor-pointer"
              >
                {isKhmer ? `សាកល្បងបើកបញ្ជា ${testAction} ${symbol} ឥឡូវនេះ` : `Open Test ${testAction} ${symbol} Now`}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">{isKhmer ? 'និមិត្តសញ្ញា' : 'Symbol'}</th>
                    <th className="py-2.5 px-3">{isKhmer ? 'ប្រភេទ' : 'Side'}</th>
                    <th className="py-2.5 px-3 text-right">{isKhmer ? 'តម្លៃចូល' : 'Entry'}</th>
                    <th className="py-2.5 px-3 text-right">{isKhmer ? 'តម្លៃបច្ចុប្បន្ន' : 'Current'}</th>
                    <th className="py-2.5 px-3 text-right text-rose-400">{isKhmer ? 'កាត់ខាត (SL)' : 'Stop Loss'}</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400">{isKhmer ? 'ចំណេញ (TP)' : 'Take Profit'}</th>
                    <th className="py-2.5 px-3 text-right">{isKhmer ? 'ទំហំ (Units)' : 'Units'}</th>
                    <th className="py-2.5 px-3 text-right">{isKhmer ? 'ចំណេញ/ខាតបណ្ដោះអាសន្ន' : 'Unrealized P&L'}</th>
                    <th className="py-2.5 px-3 text-right">{isKhmer ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {positions.map(pos => {
                    const isProfit = pos.unrealizedPnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">{pos.symbol}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-bold ${
                              pos.type === 'BUY' ? 'text-teal-400' : 'text-rose-400'
                            }`}
                          >
                            {pos.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          ${pos.entryPrice.toFixed(decimals)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-white font-semibold">
                          ${pos.currentPrice.toFixed(decimals)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400 font-semibold">
                          ${pos.slPrice.toFixed(decimals)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                          ${pos.tpPrice.toFixed(decimals)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{pos.sizeUnits}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`font-bold ${
                              isProfit ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isProfit ? '+' : '-'}${Math.abs(pos.unrealizedPnl).toFixed(2)} (
                            {isProfit ? '+' : ''}
                            {pos.unrealizedPnlPercent}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => botEngine.movePositionToBreakeven(pos.id)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-[11px] font-sans font-semibold transition-colors cursor-pointer whitespace-nowrap"
                              title="Move SL to Entry"
                            >
                              BE
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                botEngine.closePosition(pos, pos.currentPrice, 'MANUAL_CLOSE')
                              }
                              className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/70 rounded text-[11px] font-sans font-semibold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {isKhmer ? 'បិទបញ្ជា' : 'Close'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : closedPositions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 rounded-xl bg-[#090d14]">
            {isKhmer ? 'មិនទាន់មានប្រវត្តិបញ្ជាដែលបានបិទនៅឡើយទេ។' : 'No closed bot trades in this session yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-60">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">{isKhmer ? 'និមិត្តសញ្ញា' : 'Symbol'}</th>
                  <th className="py-2 px-3">{isKhmer ? 'ប្រភេទ' : 'Side'}</th>
                  <th className="py-2 px-3 text-right">{isKhmer ? 'តម្លៃចូល' : 'Entry'}</th>
                  <th className="py-2 px-3 text-right">{isKhmer ? 'តម្លៃបិទ' : 'Exit'}</th>
                  <th className="py-2 px-3">{isKhmer ? 'មូលហេតុ' : 'Reason'}</th>
                  <th className="py-2 px-3 text-right">{isKhmer ? 'លទ្ធផល P&L' : 'Realized P&L'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {closedPositions.map(cp => {
                  const pnl = cp.realizedPnl || 0;
                  return (
                    <tr key={cp.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-bold text-slate-200">{cp.symbol}</td>
                      <td className="py-2 px-3">
                        <span className={cp.type === 'BUY' ? 'text-teal-400 font-bold' : 'text-rose-400 font-bold'}>
                          {cp.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        ${cp.entryPrice.toFixed(decimals)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-200">
                        ${(cp.exitPrice || cp.currentPrice).toFixed(decimals)}
                      </td>
                      <td className="py-2 px-3 text-slate-400">{cp.closedReason}</td>
                      <td
                        className={`py-2 px-3 text-right font-bold ${
                          pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2-Column Grid: Risk & Bot Parameters + TradingView Webhook & Live Signal Executor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Risk & Bot Settings */}
        <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">
              {isKhmer ? 'ការកំណត់ហានិភ័យ និង Bot (Risk & Bot Settings)' : 'Risk & Bot Parameters'}
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Risk Per Trade */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-slate-200">
                  {isKhmer ? 'ហានិភ័យក្នុងមួយបញ្ជា (Risk % Per Trade)' : 'Risk Per Trade (%)'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isKhmer
                    ? 'គណនាទំហំ Lot/Unit ស្វ័យប្រវត្តិតាមចម្ងាយ Stop Loss'
                    : 'Auto-calculates position units based on SL distance'}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={config.riskPerTradePercent}
                  onChange={e =>
                    botEngine.updateConfig({
                      riskPerTradePercent: parseFloat(e.target.value) || 2.0
                    })
                  }
                  className="w-20 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-right font-mono tabular-nums focus:outline-none focus:border-teal-500"
                />
                <span className="text-slate-400 font-mono">%</span>
              </div>
            </div>

            {/* Max Leverage */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-slate-200">
                  {isKhmer ? 'កម្រិត Leverage អតិបរមា' : 'Max Account Leverage'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isKhmer ? 'កំណត់ Margin សម្រាប់ Futures / Forex / Gold' : 'Margin allocation multiplier (1x - 20x)'}
                </div>
              </div>
              <select
                value={config.maxLeverage}
                onChange={e =>
                  botEngine.updateConfig({
                    maxLeverage: parseInt(e.target.value, 10) || 5
                  })
                }
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono tabular-nums focus:outline-none focus:border-teal-500"
              >
                {[1, 2, 3, 5, 10, 15, 20].map(lev => (
                  <option key={lev} value={lev}>
                    {lev}x
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-Close Opposite */}
            <label className="flex items-center justify-between gap-4 pt-1 cursor-pointer">
              <div>
                <div className="font-medium text-slate-200">
                  {isKhmer ? 'បិទបញ្ជាផ្ទុយដោយស្វ័យប្រវត្តិ (Auto-Reverse)' : 'Auto-Close on Opposite Signal'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isKhmer
                    ? 'បិទ BUY ចាស់ភ្លាមៗនៅពេលមានសញ្ញា SELL ថ្មីចូលមក'
                    : 'Closes open BUY when a new SELL signal fires (and vice versa)'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.autoCloseOnOpposite}
                onChange={e =>
                  botEngine.updateConfig({ autoCloseOnOpposite: e.target.checked })
                }
                className="w-4 h-4 accent-teal-500 cursor-pointer shrink-0"
              />
            </label>

            {/* Trailing Stop +1R */}
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <div className="font-medium text-slate-200">
                  {isKhmer ? 'រំកិល SL ទៅ Break-even ពេលចំណេញ +1R' : 'Trailing Stop to Break-even (+1R)'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isKhmer
                    ? 'ការពារដើមទុនដោយរំកិល SL មកចំណុចចូលទិញដោយស្វ័យប្រវត្តិ'
                    : 'Automatically locks entry price once profit reaches 1x Risk'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.trailingStop}
                onChange={e => botEngine.updateConfig({ trailingStop: e.target.checked })}
                className="w-4 h-4 accent-teal-500 cursor-pointer shrink-0"
              />
            </label>

            {/* Forward to MT5 */}
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <div className="font-medium text-sky-300">
                  {isKhmer
                    ? 'បញ្ជូនបន្តទៅ MetaTrader 5 (MT5 Bridge Sync)'
                    : 'Mirror Bot Signals to MetaTrader 5'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isKhmer
                    ? 'រាល់ពេល Bot បើកបញ្ជា នឹងបញ្ជូន Ticket ចូល MT5 ដំណាលគ្នា'
                    : 'Simultaneously dispatches FOK order to connected MT5 terminal'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.syncWithMT5}
                onChange={e => botEngine.updateConfig({ syncWithMT5: e.target.checked })}
                className="w-4 h-4 accent-sky-500 cursor-pointer shrink-0"
              />
            </label>
          </div>
        </div>

        {/* Right: TradingView Webhook & Live Signal Test Executor */}
        <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-white">
                {isKhmer
                  ? 'TradingView Webhook & សាកល្បងបាញ់ Signal ផ្ទាល់'
                  : 'TradingView Webhook & Live Signal Executor'}
              </h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Webhook Secret */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Webhook Secret Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.webhookSecret}
                  onChange={e => botEngine.updateConfig({ webhookSecret: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-teal-300 text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(config.webhookSecret, 'secret')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  {copiedKey === 'secret' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'secret' ? (isKhmer ? 'បានចម្លង' : 'Copied') : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Webhook JSON Payload */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">
                  {isKhmer ? 'ទម្រង់សារ Alert JSON សម្រាប់ TradingView:' : 'TradingView Alert JSON Message:'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(webhookJsonExample, 'json')}
                  className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'json' ? (isKhmer ? 'បានចម្លង' : 'Copied') : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-2.5 bg-[#080c14] border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {webhookJsonExample}
              </pre>
            </div>

            {/* Instant Signal Trigger */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-300">
                {isKhmer
                  ? 'សាកល្បងបាញ់សញ្ញាចូល Bot & MT5 ភ្លាមៗ (1-Click Live Execution):'
                  : 'Simulate Incoming Webhook Signal:'}
              </div>

              {webhookFeedback && (
                <div
                  className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                    webhookFeedback.ok
                      ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                  }`}
                >
                  {webhookFeedback.ok ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{webhookFeedback.msg}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-0.5 bg-slate-900 border border-slate-700 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTestAction('BUY')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold font-mono cursor-pointer transition-colors ${
                      testAction === 'BUY'
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestAction('SELL')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold font-mono cursor-pointer transition-colors ${
                      testAction === 'SELL'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SELL
                  </button>
                </div>

                <input
                  type="number"
                  step="any"
                  value={testPrice}
                  onChange={e => setTestPrice(parseFloat(e.target.value) || currentPrice)}
                  className="w-32 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-mono tabular-nums text-white text-xs focus:outline-none focus:border-teal-500"
                />

                <button
                  type="button"
                  onClick={handleManualTestSignal}
                  className="flex-1 min-w-[160px] px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {isKhmer ? `បាញ់ ${testAction} ${symbol} ចូល Bot` : `Execute ${testAction} ${symbol}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bridge Scripts Viewer: Python FastAPI, Node.js Express, MQL5 Expert Advisor */}
      <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">
              {isKhmer
                ? 'កូដស្គ្រីបតភ្ជាប់ Exchange & MT5 Bridge (Auto-Trading Bot Server)'
                : 'Auto-Trading Server & MT5 EA Bridge Scripts'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveCodeTab('python')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeCodeTab === 'python'
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Python (FastAPI + CCXT)
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab('nodejs')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeCodeTab === 'nodejs'
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Node.js (Express + CCXT)
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab('mql5')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeCodeTab === 'mql5'
                    ? 'bg-[#2962ff] text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MQL5 (MT5 Expert Advisor)
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(currentScriptText, 'script')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedKey === 'script' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isKhmer ? 'បានចម្លងកូដ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isKhmer ? 'ចម្លងកូដស្គ្រីប' : 'Copy Script'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <pre className="p-4 bg-[#080c14] border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 leading-relaxed">
          {currentScriptText}
        </pre>
      </div>

      {/* Live Order & Execution Event Log */}
      <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">
              {isKhmer
                ? 'កំណត់ហេតុដំណើរការបញ្ជាទិញផ្ទាល់ (Live Bot Execution Logs)'
                : 'Live Bot Execution Logs'}
            </h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {logs.length} {isKhmer ? 'ព្រឹត្តិការណ៍' : 'events'}
          </span>
        </div>

        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto font-mono text-xs pr-1">
          {logs.map(log => {
            const timeStr = new Date(log.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            const isTp = log.type === 'TP_HIT';
            const isSl = log.type === 'SL_HIT';
            const isOrder = log.type === 'ORDER_OPEN';
            const isMt5 = log.type === 'MT5_SYNC';
            const isErr = log.type === 'ERROR';

            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                  isTp
                    ? 'bg-emerald-950/35 border-emerald-800/80 text-emerald-200'
                    : isSl
                    ? 'bg-rose-950/35 border-rose-800/80 text-rose-200'
                    : isOrder
                    ? 'bg-teal-950/35 border-teal-800/80 text-teal-200'
                    : isMt5
                    ? 'bg-blue-950/35 border-blue-800/80 text-sky-200'
                    : isErr
                    ? 'bg-red-950/40 border-red-800 text-red-200'
                    : 'bg-[#101622] border-slate-800/80 text-slate-300'
                }`}
              >
                <span className="text-slate-400 text-[11px] tabular-nums shrink-0">{timeStr}</span>
                <span className="font-bold shrink-0 text-[11px]">[{log.type}]</span>
                <span className="flex-1 text-[11px] font-sans">
                  {isKhmer ? log.messageKh || log.message : log.message}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
