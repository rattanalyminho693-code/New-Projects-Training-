import React, { useState } from 'react';
import { Language, TradingSignal, UserAccount, MT5Config, MT5Position, TradingViewIndicator } from '../types';
import { playSignalChime } from '../utils/audio';
import { TradingViewChart } from './TradingViewChart';
import { 
  Crown, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Calculator,
  Clock,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  LineChart,
  Bot,
  Activity,
  Sliders,
  Lock,
  ShieldAlert
} from 'lucide-react';

interface VipMemberViewProps {
  lang: Language;
  currentUser: UserAccount;
  signals: TradingSignal[];
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  onOpenWebhookSimulator: () => void;
  isAdmin?: boolean;
  onOpenMT5?: () => void;
  mt5Config?: MT5Config;
  mt5Positions?: MT5Position[];
  onManualAutoTrade?: (sig: TradingSignal) => void;
  isMT5Authorized?: boolean;
  availableVipUsers?: UserAccount[];
  onSelectVipUser?: (userId: string) => void;
  tvIndicators?: TradingViewIndicator[];
}

export const VipMemberView: React.FC<VipMemberViewProps> = ({
  lang,
  currentUser,
  signals,
  audioEnabled,
  setAudioEnabled,
  onOpenWebhookSimulator,
  isAdmin = false,
  onOpenMT5,
  mt5Config,
  mt5Positions = [],
  onManualAutoTrade,
  isMT5Authorized,
  availableVipUsers = [],
  onSelectVipUser,
  tvIndicators
}) => {
  const isKm = lang === 'km';
  const hasMT5Clearance = isMT5Authorized ?? (isAdmin || !!currentUser.mt5Allowed);

  // Sub-tabs: 'active' | 'chart' | 'history' | 'calculator'
  const [subTab, setSubTab] = useState<'active' | 'chart' | 'history' | 'calculator'>('active');
  const [selectedChartTicker, setSelectedChartTicker] = useState('XAUUSD');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'WON' | 'LOST'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Position Size Calculator States
  const [calcBalance, setCalcBalance] = useState(10000);
  const [calcRiskPercent, setCalcRiskPercent] = useState(1.5);
  const [calcStopLossPips, setCalcStopLossPips] = useState(50);
  const [calcAsset, setCalcAsset] = useState<'gold' | 'fx' | 'crypto'>('gold');

  // Filter signals
  const activeSignals = signals.filter(s => s.status === 'ACTIVE');
  const historySignals = signals.filter(s => s.status !== 'ACTIVE');

  const filteredSignals = signals.filter(s => {
    const matchesSearch = s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.strategy.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return s.status === 'ACTIVE';
    if (statusFilter === 'WON') return ['HIT_TP1', 'HIT_TP2', 'HIT_TP3'].includes(s.status);
    if (statusFilter === 'LOST') return s.status === 'HIT_SL';
    return true;
  });

  // Calculate overall performance stats
  const totalClosed = historySignals.length;
  const wonTrades = historySignals.filter(s => ['HIT_TP1', 'HIT_TP2', 'HIT_TP3'].includes(s.status)).length;
  const winRate = totalClosed > 0 ? ((wonTrades / totalClosed) * 100).toFixed(1) : '85.0';
  const totalPipsGained = signals.reduce((acc, s) => acc + (s.pipsGained || 0), 0);

  // Copy signal to clipboard in MetaTrader MT4/MT5 format
  const copySignalMT5 = (sig: TradingSignal) => {
    const text = `[ALPHASIGNAL VIP]\n${sig.ticker} ${sig.action}\nEntry: ${sig.entryPrice}\nSL: ${sig.sl}\nTP1: ${sig.tp1}\nTP2: ${sig.tp2}\nTP3: ${sig.tp3}\nTimeframe: ${sig.timeframe}\nStrategy: ${sig.strategy}`;
    navigator.clipboard.writeText(text);
    setCopiedId(sig.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate lot size
  const riskAmount = (calcBalance * calcRiskPercent) / 100;
  let calculatedLot = 0.1;
  if (calcAsset === 'gold') {
    // 1 pip on Gold (0.10) with 1 standard lot = $10
    calculatedLot = Number((riskAmount / (calcStopLossPips * 10)).toFixed(2));
  } else if (calcAsset === 'fx') {
    // 1 pip on standard FX pair = $10 per lot
    calculatedLot = Number((riskAmount / (calcStopLossPips * 10)).toFixed(2));
  } else {
    // Crypto
    calculatedLot = Number((riskAmount / (calcStopLossPips * 1.5)).toFixed(3));
  }
  if (calculatedLot <= 0) calculatedLot = 0.01;

  return (
    <div className="space-y-6 py-2">
      {/* VIP Member Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                <Crown className="w-3 h-3 text-emerald-400" />
                <span>VIP ACTIVE</span>
              </span>

              {hasMT5Clearance ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center gap-1 font-mono">
                  <Bot className="w-3 h-3 text-sky-400" />
                  <span>MT5: ADMIN APPROVED ✓</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>MT5: PENDING ADMIN 🔒</span>
                </span>
              )}
            </div>

            {/* Test VIP Account Switcher */}
            {availableVipUsers.length > 1 && onSelectVipUser && (
              <div className="flex items-center gap-2 mt-2 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">{isKm ? 'ជ្រើសរើសតេស្តគណនី VIP:' : 'Simulate VIP Member:'}</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {availableVipUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => onSelectVipUser(u.id)}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentUser.id === u.id
                          ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{u.name}</span>
                      <span className={`text-[9px] px-1 rounded ${u.mt5Allowed ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {u.mt5Allowed ? (isKm ? 'MT5 បានបើក ✓' : 'MT5 Active ✓') : (isKm ? 'MT5 មិនទាន់បើក 🔒' : 'MT5 Pending 🔒')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>{isKm ? 'សុពលភាព VIP: រយៈពេល ៧៥ ថ្ងៃទៀត' : 'VIP Expiration: 75 Days Remaining'}</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">✓ Full Access to Webhook Feeds</span>
              <span>·</span>
              <span>Server Latency: &lt;150ms</span>
            </div>
          </div>
        </div>

        {/* Audio Alert Toggle & Simulator trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              if (next) playSignalChime('SUCCESS');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
              audioEnabled
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Audio Alert Notification on New TradingView Signal"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? (isKm ? 'សំឡេង Alert: បើក' : 'Sound: ON') : (isKm ? 'សំឡេង Alert: បិទ' : 'Sound: OFF')}</span>
          </button>

          <button
            onClick={onOpenWebhookSimulator}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{isKm ? 'តេស្តបាញ់ Signal' : 'Test Webhook'}</span>
          </button>
        </div>
      </div>

      {/* MT5 Auto-Trading Gateway Live Status Banner */}
      <div className={`bg-gradient-to-r rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
        hasMT5Clearance
          ? 'from-slate-900 via-[#131b2e] to-slate-900 border border-sky-500/30 shadow-sky-950/20'
          : 'from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 shadow-amber-950/20'
      }`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
            hasMT5Clearance
              ? 'bg-[#2962ff]/15 border border-[#2962ff]/40 text-sky-400'
              : 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
          }`}>
            {hasMT5Clearance ? <Bot className="w-6 h-6 animate-pulse" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{isKm ? 'MT5 Auto-Trading Engine' : 'MT5 Auto-Trading Engine'}</span>
              </span>

              {hasMT5Clearance ? (
                <>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                    mt5Config?.autoTradeEnabled 
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${mt5Config?.autoTradeEnabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
                    <span>{mt5Config?.autoTradeEnabled ? (isKm ? 'ស្វ័យប្រវត្តិ: បើកដំណើរការ (ON)' : 'Auto-Trade: ON') : (isKm ? 'ស្វ័យប្រវត្តិ: បិទ (OFF)' : 'Auto-Trade: OFF')}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded">
                    ADMIN APPROVED ✓
                  </span>
                  <span className="text-[11px] font-mono text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40">
                    {mt5Config?.brokerServer || 'Exness-MT5Real'} #{mt5Config?.accountNumber || '50892411'}
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>{isKm ? 'ទាមទារការអនុញ្ញាតពី ADMIN' : 'REQUIRES ADMIN AUTHORIZATION'}</span>
                </span>
              )}
            </div>

            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span className="text-slate-400">
                {hasMT5Clearance ? (
                  isKm 
                    ? 'ពេលមាន Signal ពី TradingView ប្រព័ន្ធនឹងបាញ់ Order ចូល MT5 ដោយផ្ទាល់មិនបាច់អង្គុយចាំចុច!' 
                    : 'TradingView alerts instantly open orders on MetaTrader 5 with automated SL/TP & risk management.'
                ) : (
                  isKm
                    ? 'MT5 Auto-Trade អាចប្រើបានសំរាប់តែ Member VIP ដែល Admin បានកំណត់ និងបើកសិទ្ធិប៉ុណ្ណោះ។'
                    : 'MT5 Auto-Trade is exclusively available for VIP Members who have been specifically approved by Admin.'
                )}
              </span>
              {hasMT5Clearance && (
                <>
                  <span>·</span>
                  <span className="text-amber-300 font-mono text-[11px]">
                    {mt5Positions.length} {isKm ? 'Position កំពុងបើក' : 'active positions'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenMT5 && (
            <button
              onClick={onOpenMT5}
              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                hasMT5Clearance
                  ? 'bg-gradient-to-r from-[#2962ff] to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white shadow-blue-500/20'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-amber-500/10'
              }`}
            >
              {hasMT5Clearance ? (
                <>
                  <Activity className="w-4 h-4" />
                  <span>{isKm ? 'ផ្ទាំងគ្រប់គ្រង MT5 Terminal' : 'Open MT5 Terminal'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>{isKm ? 'ពិនិត្យសិទ្ធិ / ស្នើសុំ Admin' : 'Check MT5 Status / Request'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* VIP Performance KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">{isKm ? 'Signal កំពុងដំណើរការ' : 'Active Trades'}</div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
            {activeSignals.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Real-time TradingView feed</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">{isKm ? 'អត្រាឈ្នះសរុប (Win Rate)' : 'Verified Win Rate'}</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums mt-1">
            {winRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{wonTrades} / {totalClosed} closed won</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">{isKm ? 'Pips ទទួលបានសរុប' : 'Total Pips PnL'}</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums mt-1">
            +{totalPipsGained.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Forex, Gold & Crypto</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">{isKm ? 'Average R:R' : 'Avg Risk / Reward'}</div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono tabular-nums mt-1">
            1 : 2.8
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Institutional SMC & EMA</div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('active')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              subTab === 'active'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKm ? `Signal ផ្ទាល់ (${activeSignals.length})` : `Active Signals (${activeSignals.length})`}
          </button>

          <button
            onClick={() => setSubTab('chart')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'chart'
                ? 'bg-[#2962ff] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>{isKm ? 'TradingView Chart ផ្ទាល់' : 'Live TradingView Chart'}</span>
          </button>

          <button
            onClick={() => setSubTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              subTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKm ? `ប្រវត្តិ Signal (${historySignals.length})` : `Signal History (${historySignals.length})`}
          </button>

          <button
            onClick={() => setSubTab('calculator')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'calculator'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{isKm ? 'គណនា Lot Size' : 'Risk Calculator'}</span>
          </button>
        </div>

        {subTab !== 'calculator' && (
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={isKm ? 'ស្វែងរកគូជួញដូរ...' : 'Search pair or strategy...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sub-Tab 1: Active Signals Feed */}
      {subTab === 'active' && (
        <div className="space-y-4">
          {activeSignals.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">
                {isKm ? 'មិនទាន់មាន Signal សកម្មក្នុងពេលនេះទេ' : 'No Active Signals Right Now'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {isKm 
                  ? 'TradingView Pine Script កំពុងតាមដានទីផ្សារ។ អ្នកអាចចុច "តេស្តបាញ់ Signal" ដើម្បីបញ្ជូន Signal សាកល្បងភ្លាមៗ!' 
                  : 'Pine Script is scanning for optimal high-probability entries. Click "Test Webhook" to trigger an alert.'}
              </p>
              <button
                onClick={onOpenWebhookSimulator}
                className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-semibold text-xs rounded-lg hover:bg-amber-400 transition-colors"
              >
                {isKm ? 'បញ្ជូន Signal ពី TradingView' : 'Trigger TradingView Signal'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {activeSignals.map((sig) => {
                const isBuy = sig.action === 'BUY';
                return (
                  <div
                    key={sig.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4 shadow-lg"
                  >
                    {/* Header: Ticker, Action, Timeframe, Timestamp */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                            {sig.ticker}
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                            isBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {sig.action}
                          </span>
                          <span className="text-xs text-slate-400 font-mono px-2 py-0.5 bg-slate-800 rounded">
                            {sig.timeframe}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{sig.assetName}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <span className="inline-block px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded mt-0.5">
                          {sig.source}
                        </span>
                      </div>
                    </div>

                    {/* Price Grid: Entry, SL, TP1, TP2, TP3 */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-slate-400 text-[11px] font-medium">{isKm ? 'តម្លៃចូល (Entry)' : 'Entry Price'}</div>
                        <div className="text-base font-extrabold text-white font-mono tabular-nums mt-0.5">
                          {sig.entryPrice}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                        <div className="text-rose-400 text-[11px] font-medium">Stop Loss (SL)</div>
                        <div className="text-base font-extrabold text-rose-300 font-mono tabular-nums mt-0.5">
                          {sig.sl}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-slate-400 text-[11px] font-medium">Risk / Reward</div>
                        <div className="text-base font-extrabold text-amber-400 font-mono tabular-nums mt-0.5">
                          {sig.riskReward}
                        </div>
                      </div>
                    </div>

                    {/* Take Profits Targets */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Take Profit Targets (TP):</span>
                        <span className="text-emerald-400">Target Scaling</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                        <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                          <div className="text-[10px] text-slate-400">TP 1:</div>
                          <div className="font-bold tabular-nums">{sig.tp1}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                          <div className="text-[10px] text-slate-400">TP 2:</div>
                          <div className="font-bold tabular-nums">{sig.tp2}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                          <div className="text-[10px] text-slate-400">TP 3:</div>
                          <div className="font-bold tabular-nums">{sig.tp3}</div>
                        </div>
                      </div>
                    </div>

                    {/* Strategy & Notes */}
                    {sig.notes && (
                      <div className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 font-medium mr-1.5">{isKm ? 'ការណែនាំ:' : 'Note:'}</span>
                        {sig.notes}
                      </div>
                    )}

                    {/* Bottom Action: Copy MT5 */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {sig.strategy}
                      </span>
                      <div className="flex items-center gap-2">
                        {onManualAutoTrade && (
                          <button
                            onClick={() => {
                              if (hasMT5Clearance) {
                                onManualAutoTrade(sig);
                              } else if (onOpenMT5) {
                                onOpenMT5();
                              }
                            }}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm ${
                              hasMT5Clearance
                                ? 'bg-[#2962ff]/20 hover:bg-[#2962ff]/30 text-sky-300 border border-[#2962ff]/40'
                                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                            title={hasMT5Clearance ? (isKm ? 'បញ្ជូន Signal នេះចូល MT5 ភ្លាមៗ' : 'Execute this signal directly to MetaTrader 5') : (isKm ? 'ត្រូវការ Admin បើកសិទ្ធិ MT5' : 'Requires Admin MT5 Permission')}
                          >
                            {hasMT5Clearance ? <Bot className="w-3.5 h-3.5 text-sky-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{hasMT5Clearance ? (isKm ? '⚡ Auto-Trade MT5' : '⚡ MT5 Trade') : (isKm ? '🔒 MT5 (រង់ចាំ Admin)' : '🔒 MT5 Locked')}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedChartTicker(sig.ticker);
                            setSubTab('chart');
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-[#2962ff]/20 hover:text-[#2962ff] text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open in TradingView Chart"
                        >
                          <LineChart className="w-3.5 h-3.5 text-[#2962ff]" />
                          <span>{isKm ? 'មើល Chart' : 'View Chart'}</span>
                        </button>

                        <button
                          onClick={() => copySignalMT5(sig)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Copy trade parameters for MetaTrader 4/5"
                        >
                          {copiedId === sig.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">{isKm ? 'បានចម្លង!' : 'Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{isKm ? 'ចម្លង MT4/MT5' : 'Copy MT5'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab: TradingView Live Interactive Chart */}
      {subTab === 'chart' && (
        <div className="space-y-4">
          <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                <LineChart className="w-4 h-4 text-[#2962ff]" />
                <span>TradingView Chart:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {['XAUUSD', 'BTCUSD', 'EURUSD', 'GBPUSD', 'US30'].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setSelectedChartTicker(sym)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded cursor-pointer transition-colors ${
                      selectedChartTicker === sym
                        ? 'bg-[#2962ff] text-white'
                        : 'bg-[#131722] text-[#787b86] hover:text-white border border-[#2a2e39]'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#787b86] font-mono">
              Live Real-Time Market Data
            </div>
          </div>

          <TradingViewChart
            symbol={selectedChartTicker}
            timeframe="15m"
            isAdmin={isAdmin}
            lang={lang}
            viewerScope="customer"
            indicators={tvIndicators}
          />
        </div>
      )}

      {/* Sub-Tab 2: Signal History (ប្រវត្តិ Signal) */}
      {subTab === 'history' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-2">{isKm ? 'តម្រង:' : 'Filter:'}</span>
              {(['ALL', 'ACTIVE', 'WON', 'LOST'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' && (isKm ? 'ទាំងអស់' : 'All')}
                  {st === 'ACTIVE' && (isKm ? 'កំពុងដំណើរការ' : 'Active')}
                  {st === 'WON' && (isKm ? 'បានសម្រេច TP' : 'Won Trades')}
                  {st === 'LOST' && (isKm ? 'កាត់ខាត SL' : 'Stop Loss')}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Showing {filteredSignals.length} entries
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{isKm ? 'គូជួញដូរ / ម៉ោង' : 'Pair / Time'}</th>
                    <th className="py-3 px-4">{isKm ? 'សកម្មភាព' : 'Action'}</th>
                    <th className="py-3 px-4">{isKm ? 'តម្លៃចូល' : 'Entry'}</th>
                    <th className="py-3 px-4">Stop Loss</th>
                    <th className="py-3 px-4">Take Profits</th>
                    <th className="py-3 px-4">{isKm ? 'លទ្ធផល' : 'Outcome'}</th>
                    <th className="py-3 px-4 text-right">PnL (Pips)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredSignals.map((sig) => {
                    const isWon = ['HIT_TP1', 'HIT_TP2', 'HIT_TP3'].includes(sig.status);
                    const isLost = sig.status === 'HIT_SL';
                    const isActive = sig.status === 'ACTIVE';

                    return (
                      <tr key={sig.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white font-mono">{sig.ticker}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {new Date(sig.timestamp).toLocaleDateString()} {new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[11px] font-mono ${
                            sig.action === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {sig.action}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono tabular-nums text-slate-200">
                          {sig.entryPrice}
                        </td>

                        <td className="py-3 px-4 font-mono tabular-nums text-rose-400">
                          {sig.sl}
                        </td>

                        <td className="py-3 px-4 font-mono tabular-nums text-emerald-400">
                          {sig.tp1} / {sig.tp2}
                        </td>

                        <td className="py-3 px-4">
                          {isActive && (
                            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded font-semibold text-[10px]">
                              ACTIVE
                            </span>
                          )}
                          {isWon && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-[10px] flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{sig.status.replace('_', ' ')}</span>
                            </span>
                          )}
                          {isLost && (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-bold text-[10px] flex items-center gap-1 w-max">
                              <XCircle className="w-3 h-3" />
                              <span>STOPPED OUT</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                          {sig.pipsGained !== undefined ? (
                            <span className={sig.pipsGained >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {sig.pipsGained > 0 ? `+${sig.pipsGained}` : sig.pipsGained} pips
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Position Size Calculator */}
      {subTab === 'calculator' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>{isKm ? 'ម៉ាស៊ីនគណនាទំហំ Lot Size (Risk Management)' : 'Position Size & Risk Calculator'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isKm 
                ? 'គណនាទំហំ Lot ដែលត្រូវបើកបញ្ជាទិញ ដើម្បីគ្រប់គ្រងហានិភ័យត្រឹម 1-2% នៃសមតុល្យគណនីរបស់អ្នក។'
                : 'Calculate your exact trading volume to maintain strict 1-2% capital risk per trade.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {isKm ? 'ប្រភេទទ្រព្យសកម្ម (Asset Type)' : 'Asset Class'}
              </label>
              <select
                value={calcAsset}
                onChange={(e) => setCalcAsset(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="gold">Gold (XAUUSD)</option>
                <option value="fx">Forex Pairs (EURUSD, GBPUSD)</option>
                <option value="crypto">Crypto (BTCUSD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {isKm ? 'សមតុល្យគណនី Account Balance ($)' : 'Account Balance ($ USD)'}
              </label>
              <input
                type="number"
                value={calcBalance}
                onChange={(e) => setCalcBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {isKm ? 'ហានិភ័យ Risk (%)' : 'Risk Percentage (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={calcRiskPercent}
                onChange={(e) => setCalcRiskPercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-amber-400 font-mono tabular-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {isKm ? 'ចម្ងាយ Stop Loss (Pips)' : 'Stop Loss Distance (Pips)'}
              </label>
              <input
                type="number"
                value={calcStopLossPips}
                onChange={(e) => setCalcStopLossPips(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-rose-400 font-mono tabular-nums focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Calculator Output */}
          <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">{isKm ? 'ទំហំ Lot ដែលត្រូវបើក:' : 'Recommended Lot Size:'}</div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums mt-1">
                {calculatedLot} Lots
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Max Capital Risk: <span className="font-mono text-white font-bold">${riskAmount.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(calculatedLot.toString());
                alert(isKm ? 'បានចម្លងទំហំ Lot: ' + calculatedLot : 'Copied lot size: ' + calculatedLot);
              }}
              className="px-3.5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors"
            >
              {isKm ? 'ចម្លង Lot Size' : 'Copy Lot Size'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
