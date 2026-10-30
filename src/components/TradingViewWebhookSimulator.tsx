import React, { useState } from 'react';
import { Language, TradingSignal, WebhookLog, TradingViewIndicator } from '../types';
import { SAMPLE_PINE_SCRIPT, INITIAL_TV_INDICATORS } from '../data/mockData';
import { TradingViewChart } from './TradingViewChart';
import { TradingViewIndicatorModal } from './TradingViewIndicatorModal';
import { 
  Bell, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  Copy, 
  Check, 
  AlertTriangle,
  Code2,
  Clock,
  Sliders,
  Layers,
  X,
  CheckCircle2,
  TrendingUp,
  Lock,
  Plus,
  Crown
} from 'lucide-react';

interface TradingViewWebhookSimulatorProps {
  lang: Language;
  onDispatchSignal: (signal: TradingSignal) => void;
  webhookSecret: string;
  duplicateWindowSeconds: number;
  recentSignals: TradingSignal[];
  logs: WebhookLog[];
  onAddLog: (log: WebhookLog) => void;
  isAdmin?: boolean;
  indicators?: TradingViewIndicator[];
  onAddIndicator?: (indicator: Omit<TradingViewIndicator, 'id' | 'createdAt'>) => void;
  onUpdateIndicator?: (id: string, updates: Partial<TradingViewIndicator>) => void;
  onDeleteIndicator?: (id: string) => void;
  adminActorLabel?: string;
  nonAdminStaffLabel?: string;
  onQuickSwitchToAdmin?: () => void;
}

export const TradingViewWebhookSimulator: React.FC<TradingViewWebhookSimulatorProps> = ({
  lang,
  onDispatchSignal,
  webhookSecret,
  duplicateWindowSeconds,
  recentSignals,
  logs,
  onAddLog,
  isAdmin = false,
  indicators,
  onAddIndicator,
  onUpdateIndicator,
  onDeleteIndicator,
  adminActorLabel = 'ADM-001 (Administrator)',
  nonAdminStaffLabel,
  onQuickSwitchToAdmin
}) => {
  const isKm = lang === 'km';
  const resolvedIndicators = indicators ?? INITIAL_TV_INDICATORS;

  // Active Symbol and Timeframe
  const [ticker, setTicker] = useState('XAUUSD');
  const [assetName, setAssetName] = useState('Gold Spot / US Dollar');
  const [timeframe, setTimeframe] = useState('15m');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [price, setPrice] = useState(2385.50);
  const [sl, setSl] = useState(2376.00);
  const [tp1, setTp1] = useState(2393.00);
  const [tp2, setTp2] = useState(2402.00);
  const [tp3, setTp3] = useState(2418.00);
  const [strategy, setStrategy] = useState('AlphaSignal EMA Cloud Breakout v5');
  const [triggerFrequency, setTriggerFrequency] = useState<'once_per_bar_close' | 'once_per_bar' | 'only_once'>('once_per_bar_close');

  // Secret token & test modes
  const [secretInput, setSecretInput] = useState(webhookSecret);
  const [testMode, setTestMode] = useState<'normal' | 'invalid_secret' | 'duplicate'>('normal');

  // Modal / Tab States
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertDialogTab, setAlertDialogTab] = useState<'settings' | 'notifications'>('settings');
  const [bottomTab, setBottomTab] = useState<'pipeline' | 'pine_editor' | 'strategy_tester' | 'logs'>('pipeline');
  
  // Pipeline execution state
  const [executing, setExecuting] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [lastExecutionResult, setLastExecutionResult] = useState<{
    status: 'success' | 'rejected' | 'duplicate';
    message: string;
    details: string;
  } | null>(null);

  const [copiedPine, setCopiedPine] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);

  // Interactive Pine Editor Indicator Builder States (Administrator)
  const [pineTitle, setPineTitle] = useState('AlphaSignal Institutional EMA Cloud v6');
  const [pineShortName, setPineShortName] = useState('EMA Cloud');
  const [pineStudyId, setPineStudyId] = useState('STD;EMA');
  const [pinePeriod, setPinePeriod] = useState<number>(34);
  const [pineColor, setPineColor] = useState('#089981');
  const [pineIsOverlay, setPineIsOverlay] = useState(true);
  const [pineVipVisible, setPineVipVisible] = useState(true);
  const [pineSourceCode, setPineSourceCode] = useState(SAMPLE_PINE_SCRIPT);
  const [pineCompiledNotice, setPineCompiledNotice] = useState<string | null>(null);

  const handleCompileAndAddPineIndicator = () => {
    if (!isAdmin || !onAddIndicator) return;
    const finalTitle = pineTitle.trim() || 'Admin Pine Indicator';
    const finalShort = pineShortName.trim() || 'PINE v5';
    onAddIndicator({
      name: finalTitle,
      nameKm: finalTitle,
      shortName: finalShort,
      category: 'custom_pine',
      tvStudyId: pineStudyId || undefined,
      isOverlay: pineIsOverlay,
      period: pinePeriod || 20,
      source: 'close',
      color: pineColor,
      active: true,
      vipVisible: pineVipVisible,
      pineScript: pineSourceCode,
      description: 'Compiled and attached via Administrator Pine Script v5 Editor.',
      descriptionKm: 'បង្កើត និងដាក់បញ្ចូលពី Pine Editor ដោយ Administrator។',
      createdBy: adminActorLabel
    });
    setStrategy(finalTitle);
    setPineCompiledNotice(
      isKm
        ? `បាន Compile និងបន្ថែម Indicator "${finalShort}" ទៅលើក្រាហ្វ TradingView រួចរាល់!`
        : `Compiled & added "${finalShort}" onto the live TradingView chart!`
    );
    setTimeout(() => setPineCompiledNotice(null), 3500);
  };

  // Preset Symbols
  const symbolsList = [
    { id: 'XAUUSD', name: 'Gold Spot', price: 2385.50, change: '+1.42%', up: true },
    { id: 'BTCUSD', name: 'Bitcoin', price: 67850.00, change: '+2.18%', up: true },
    { id: 'EURUSD', name: 'Euro / USD', price: 1.0865, change: '-0.14%', up: false },
    { id: 'GBPUSD', name: 'British Pound', price: 1.2725, change: '+0.21%', up: true },
    { id: 'US30', name: 'Dow Jones 30', price: 39240.00, change: '+0.65%', up: true }
  ];

  const handleSelectSymbol = (sym: string) => {
    setTicker(sym);
    if (sym === 'XAUUSD') {
      setAssetName('Gold Spot / US Dollar');
      setPrice(2385.50);
      setSl(2376.00);
      setTp1(2393.00);
      setTp2(2402.00);
      setTp3(2418.00);
      setAction('BUY');
    } else if (sym === 'BTCUSD') {
      setAssetName('Bitcoin / US Dollar');
      setPrice(67850.00);
      setSl(66900.00);
      setTp1(68900.00);
      setTp2(70200.00);
      setTp3(72000.00);
      setAction('BUY');
    } else if (sym === 'EURUSD') {
      setAssetName('Euro / US Dollar');
      setPrice(1.0865);
      setSl(1.0895);
      setTp1(1.0835);
      setTp2(1.0805);
      setTp3(1.0760);
      setAction('SELL');
    } else if (sym === 'GBPUSD') {
      setAssetName('British Pound / US Dollar');
      setPrice(1.2725);
      setSl(1.2690);
      setTp1(1.2760);
      setTp2(1.2800);
      setTp3(1.2850);
      setAction('BUY');
    } else if (sym === 'US30') {
      setAssetName('Dow Jones 30');
      setPrice(39240.00);
      setSl(39050.00);
      setTp1(39450.00);
      setTp2(39700.00);
      setTp3(40000.00);
      setAction('BUY');
    }
  };

  // Pipeline execution matching Mermaid Diagram
  const handleFireWebhook = async () => {
    setExecuting(true);
    setLastExecutionResult(null);
    setBottomTab('pipeline');

    const secretToUse = testMode === 'invalid_secret' ? 'WRONG_SECRET_TOKEN_XYZ' : secretInput;
    const signature = `${ticker}_${action}_${price}_${timeframe}`;

    // Step 1: TradingView Pine Script
    setActiveStepIndex(0);
    await new Promise((r) => setTimeout(r, 300));

    // Step 2: BUY / SELL Alert Trigger
    setActiveStepIndex(1);
    await new Promise((r) => setTimeout(r, 300));

    // Step 3: Webhook HTTPS
    setActiveStepIndex(2);
    await new Promise((r) => setTimeout(r, 350));

    // Step 4: Validate Secret
    setActiveStepIndex(3);
    await new Promise((r) => setTimeout(r, 400));

    if (secretToUse !== webhookSecret) {
      // Secret Invalid -> Reject Request (401)
      const log: WebhookLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ticker,
        action,
        secretProvided: secretToUse,
        status: 'INVALID_SECRET',
        responseCode: 401,
        message: 'Reject Request: 401 Unauthorized (Invalid Secret Token)',
        rawPayload: { ticker, action, price, sl, tp1, tp2, tp3, timeframe },
        stepsTrace: [
          { step: 'TradingView Pine Script', stepKm: 'Pine Script Alert', passed: true, details: 'Strategy condition triggered' },
          { step: 'BUY/SELL Alert', stepKm: 'Alert Trigger', passed: true, details: `${action} alert fired` },
          { step: 'Webhook HTTPS', stepKm: 'HTTPS Request', passed: true, details: 'POST payload received' },
          { step: 'Validate Secret', stepKm: 'ផ្ទៀងផ្ទាត់ Secret', passed: false, details: 'Secret mismatch! Expected ' + webhookSecret }
        ]
      };
      onAddLog(log);
      setLastExecutionResult({
        status: 'rejected',
        message: isKm ? 'ច្រានចោល (401 Unauthorized) - Secret មិនត្រឹមត្រូវ' : 'Rejected (401 Unauthorized) - Invalid Secret',
        details: isKm 
          ? 'ប្រព័ន្ធការពារសុវត្ថិភាពបដិសេធ Payload ដែលគ្មាន Secret Key ត្រឹមត្រូវ។' 
          : 'Security authorization failed. Webhook ignored.'
      });
      setExecuting(false);
      setIsAlertModalOpen(false);
      return;
    }

    // Step 5: Validate Signal Data
    setActiveStepIndex(4);
    await new Promise((r) => setTimeout(r, 350));

    // Step 6: Duplicate Signal?
    setActiveStepIndex(5);
    await new Promise((r) => setTimeout(r, 350));

    const isDuplicate = testMode === 'duplicate' || recentSignals.some(
      (s) => s.signature === signature && (Date.now() - new Date(s.timestamp).getTime()) < (duplicateWindowSeconds * 1000)
    );

    if (isDuplicate) {
      // Duplicate -> Ignore Duplicate
      const log: WebhookLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ticker,
        action,
        secretProvided: secretToUse,
        status: 'DUPLICATE_IGNORED',
        responseCode: 200,
        message: `Duplicate Signal Ignored: Signature [${signature}] active within ${duplicateWindowSeconds}s`,
        rawPayload: { ticker, action, price, sl, tp1, tp2, tp3, timeframe },
        stepsTrace: [
          { step: 'TradingView Pine Script', stepKm: 'Pine Script', passed: true, details: 'Condition triggered' },
          { step: 'BUY/SELL Alert', stepKm: 'Alert Trigger', passed: true, details: 'Fired' },
          { step: 'Webhook HTTPS', stepKm: 'HTTPS Request', passed: true, details: 'Received' },
          { step: 'Validate Secret', stepKm: 'Validate Secret', passed: true, details: 'Secret Verified' },
          { step: 'Validate Signal Data', stepKm: 'Validate Data', passed: true, details: 'Data format OK' },
          { step: 'Duplicate Signal?', stepKm: 'Duplicate Check', passed: true, details: 'Duplicate detected -> Ignored' }
        ]
      };
      onAddLog(log);
      setLastExecutionResult({
        status: 'duplicate',
        message: isKm ? 'មិនកត់ត្រាស្ទួន (200 OK - Duplicate Ignored)' : 'Duplicate Ignored (200 OK - Duplicate Filtered)',
        details: isKm 
          ? `Signal [${ticker} ${action}] ត្រូវបានទប់ស្កាត់មិនឱ្យបញ្ជូនស្ទួនជូន VIP ក្នុងរយៈពេល ${duplicateWindowSeconds} វិនាទី។` 
          : `Signal already emitted recently. Suppressed duplicate to prevent spamming VIP members.`
      });
      setExecuting(false);
      setIsAlertModalOpen(false);
      return;
    }

    // Step 7: Save to Database
    setActiveStepIndex(6);
    await new Promise((r) => setTimeout(r, 350));

    const newSignal: TradingSignal = {
      id: `sig_${Date.now().toString().slice(-5)}`,
      ticker,
      assetName,
      action,
      entryPrice: Number(price),
      tp1: Number(tp1),
      tp2: Number(tp2),
      tp3: Number(tp3),
      sl: Number(sl),
      status: 'ACTIVE',
      timeframe,
      strategy,
      source: 'TradingView Webhook',
      timestamp: new Date().toISOString(),
      riskReward: '1 : 2.6',
      notes: `TradingView Pine Script Alert fired on ${ticker} (${strategy}).`,
      isVipOnly: true,
      signature
    };

    onDispatchSignal(newSignal);

    // Step 8: Update VIP Dashboard & Check Member Access
    setActiveStepIndex(7);
    await new Promise((r) => setTimeout(r, 400));

    const log: WebhookLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ticker,
      action,
      secretProvided: secretToUse,
      status: 'SUCCESS',
      responseCode: 200,
      message: `200 OK: Broadcasted [${ticker} ${action} @ ${price}] to VIP Dashboard!`,
      rawPayload: { ticker, action, price, sl, tp1, tp2, tp3, timeframe, strategy },
      stepsTrace: [
        { step: 'TradingView Pine Script', stepKm: 'Pine Script', passed: true, details: 'Condition triggered' },
        { step: 'BUY/SELL Alert', stepKm: 'Alert Trigger', passed: true, details: 'Fired' },
        { step: 'Webhook HTTPS', stepKm: 'HTTPS Request', passed: true, details: 'Received' },
        { step: 'Validate Secret', stepKm: 'Validate Secret', passed: true, details: 'Secret Verified' },
        { step: 'Validate Signal Data', stepKm: 'Validate Data', passed: true, details: 'Data format OK' },
        { step: 'Duplicate Signal?', stepKm: 'Duplicate Check', passed: true, details: 'No duplicate found' },
        { step: 'Save to Database', stepKm: 'Save to DB', passed: true, details: 'Persisted to database' },
        { step: 'Update VIP Dashboard', stepKm: 'Update VIP', passed: true, details: 'Live VIP Broadcasted with Audio Chime' }
      ]
    };
    onAddLog(log);

    setLastExecutionResult({
      status: 'success',
      message: isKm ? 'ជោគជ័យ! Signal ត្រូវបានផ្សាយផ្ទាល់ជូន VIP Member' : 'Success! Webhook Received & Broadcasted to VIP Dashboard',
      details: isKm
        ? `Signal [${ticker} ${action} @ ${price}] បានផ្ទៀងផ្ទាត់ និងផ្សាយជូន VIP Member ជាមួយសំឡេង Alert!`
        : `Verified secret, passed duplicate check, saved to DB, and updated VIP member terminal with audio alert.`
    });

    setExecuting(false);
    setIsAlertModalOpen(false);
  };

  const flowchartNodes = [
    { label: 'TradingView Pine Script', sub: 'Alert Condition' },
    { label: 'BUY / SELL Alert', sub: 'Event Triggered' },
    { label: 'Webhook HTTPS', sub: 'POST Payload' },
    { label: 'Validate Secret', sub: 'Check API Key' },
    { label: 'Validate Signal Data', sub: 'Verify Parameters' },
    { label: 'Duplicate Signal?', sub: `Window: ${duplicateWindowSeconds}s` },
    { label: 'Save to Database', sub: 'Record Stored' },
    { label: 'Update VIP Dashboard', sub: 'VIP: Show / Free: Hide' }
  ];

  return (
    <div className="space-y-4 bg-[#131722] text-[#d1d4dc] rounded-2xl p-4 sm:p-5 border border-[#2a2e39] shadow-2xl">
      {/* Administrator vs Non-Admin Role Authority Banner */}
      {!isAdmin && nonAdminStaffLabel && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isKm
                ? `អ្នកកំពុងចូលជា ${nonAdminStaffLabel} — សិទ្ធិបន្ថែម ឬកែប្រែ Indicator លើ TradingView គឺអនុញ្ញាតសម្រាប់តែមុខតំណែង Administrator ប៉ុណ្ណោះ។`
                : `Signed in as ${nonAdminStaffLabel} — Adding or modifying TradingView Indicators is restricted to Administrators.`}
            </span>
          </div>
          {onQuickSwitchToAdmin && (
            <button
              type="button"
              onClick={onQuickSwitchToAdmin}
              className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              {isKm ? 'ប្តូរទៅ Administrator (ADM-001)' : 'Switch to Administrator'}
            </button>
          )}
        </div>
      )}

      {/* 1. TradingView Authentic Top Header Bar */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: TradingView Brand, Symbol Ticker, Timeframes */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-[#2a2e39]">
            <svg className="w-6 h-6 text-[#2962ff]" viewBox="0 0 36 28" fill="currentColor">
              <path d="M14 22H7V11h7v11zm11 0h-7V6h7v16zm11 0h-7V0h7v22z" />
            </svg>
            <span className="text-sm font-bold text-white tracking-wide font-sans">
              TradingView
            </span>
            <span className="text-[10px] bg-[#2962ff]/20 text-[#2962ff] px-1.5 py-0.5 rounded font-mono font-bold">
              PRO+
            </span>
          </div>

          {/* Symbol Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {symbolsList.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSymbol(s.id)}
                className={`px-2.5 py-1 text-xs font-mono tabular-nums font-bold rounded transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  ticker === s.id
                    ? 'bg-[#2962ff] text-white shadow-sm'
                    : 'bg-[#131722] text-[#787b86] hover:text-[#d1d4dc] border border-[#2a2e39]'
                }`}
              >
                <span>{s.id}</span>
                <span className={`text-[10px] ${s.up ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {s.change}
                </span>
              </button>
            ))}
          </div>

          {/* Timeframe Switcher */}
          <div className="hidden lg:flex items-center gap-1 pl-3 border-l border-[#2a2e39] text-xs font-mono">
            {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#2a2e39] text-[#2962ff] font-bold'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions: Administrator Add Indicator (fx), Create Alert & Fire Webhook */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && onAddIndicator && onUpdateIndicator && onDeleteIndicator ? (
            <button
              type="button"
              onClick={() => setIsIndicatorModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#089981] hover:bg-[#06806b] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title="Administrator: Add & Configure TradingView Indicators"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="font-mono">fx</span>
              <span>{isKm ? 'បន្ថែម Indicator' : 'Add Indicator'}</span>
              <span className="px-1.5 py-0.2 rounded bg-black/25 font-mono tabular-nums text-[10px]">
                {resolvedIndicators.filter(i => i.active).length}
              </span>
            </button>
          ) : (
            <div
              className="px-3 py-1.5 bg-[#131722] border border-[#2a2e39] text-[#787b86] text-xs rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
              title={isKm ? 'សម្រាប់តែ Administrator ប៉ុណ្ណោះ' : 'Administrators only'}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isKm ? 'fx Indicators (Admin)' : 'fx Indicators (Admin)'}</span>
            </div>
          )}

          {/* Authentic TradingView "Alert" Button */}
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#2a2e39] hover:bg-[#363a45] text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer border border-[#363a45] whitespace-nowrap shrink-0"
            title="Open TradingView Alert Settings Dialog"
          >
            <Bell className="w-3.5 h-3.5 text-[#2962ff]" />
            <span>{isKm ? 'បង្កើត Alert (TradingView)' : 'Create Alert'}</span>
          </button>

          {/* Direct Fire Webhook Button */}
          <button
            onClick={handleFireWebhook}
            disabled={executing}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md whitespace-nowrap shrink-0 ${
              executing
                ? 'bg-[#2a2e39] text-[#787b86] cursor-not-allowed'
                : 'bg-[#2962ff] hover:bg-[#1e53e5] text-white shadow-[#2962ff]/20'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {executing
                ? (isKm ? 'កំពុងបាញ់ Webhook...' : 'Firing Webhook...')
                : (isKm ? 'បញ្ជូន Signal Webhook' : 'Fire Webhook')}
            </span>
          </button>
        </div>
      </div>

      {/* 2. TradingView Interactive Live Candlestick Chart */}
      <div className="relative">
        <TradingViewChart
          symbol={ticker}
          timeframe={timeframe}
          isAdmin={isAdmin}
          lang={lang}
          viewerScope="management"
          indicators={resolvedIndicators}
          onAddIndicator={onAddIndicator}
          onUpdateIndicator={onUpdateIndicator}
          onDeleteIndicator={onDeleteIndicator}
          adminActorLabel={adminActorLabel}
        />

        {/* Overlay Banner showing simulated Pine Script Alert on chart (offset below Indicator Bar) */}
        <div className="hidden md:block absolute top-16 right-4 z-10 bg-[#1e222d]/95 backdrop-blur-md border border-[#2a2e39] rounded-xl p-3 shadow-xl max-w-xs text-xs space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-[#2a2e39] pb-1.5">
            <span className="font-mono font-bold text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${action === 'BUY' ? 'bg-[#089981]' : 'bg-[#f23645]'}`}></span>
              <span>{ticker} {action} Signal</span>
            </span>
            <span className="text-[10px] text-[#787b86] font-mono">{timeframe}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono tabular-nums text-[11px]">
            <div>
              <span className="text-[#787b86]">Entry:</span>
              <div className="text-white font-bold">{price}</div>
            </div>
            <div>
              <span className="text-[#f23645]">Stop Loss:</span>
              <div className="text-[#f23645] font-bold">{sl}</div>
            </div>
            <div>
              <span className="text-[#089981]">Target TP1:</span>
              <div className="text-[#089981] font-bold">{tp1}</div>
            </div>
            <div>
              <span className="text-[#089981]">Target TP2:</span>
              <div className="text-[#089981] font-bold">{tp2}</div>
            </div>
          </div>

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="w-full py-1 bg-[#2962ff]/20 hover:bg-[#2962ff]/30 text-[#2962ff] text-[11px] font-semibold rounded border border-[#2962ff]/40 transition-colors cursor-pointer"
          >
            {isKm ? 'កែសម្រួល Alert នេះ' : 'Edit Alert Condition'}
          </button>
        </div>
      </div>

      {/* 3. Result Banner if execution completed */}
      {lastExecutionResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            lastExecutionResult.status === 'success'
              ? 'bg-[#089981]/15 border-[#089981]/50 text-[#22ab94]'
              : lastExecutionResult.status === 'rejected'
              ? 'bg-[#f23645]/15 border-[#f23645]/50 text-[#f7525f]'
              : 'bg-[#f5a623]/15 border-[#f5a623]/50 text-[#f5a623]'
          }`}
        >
          {lastExecutionResult.status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#089981] shrink-0 mt-0.5" />
          ) : lastExecutionResult.status === 'rejected' ? (
            <ShieldAlert className="w-5 h-5 text-[#f23645] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#f5a623] shrink-0 mt-0.5" />
          )}
          <div>
            <div className="text-sm font-bold text-white">{lastExecutionResult.message}</div>
            <div className="text-xs text-[#d1d4dc] mt-0.5">{lastExecutionResult.details}</div>
          </div>
        </div>
      )}

      {/* 4. TradingView Bottom Console Dock */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden">
        {/* Bottom Tab Bar */}
        <div className="flex items-center justify-between border-b border-[#2a2e39] px-4 bg-[#181b24]">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setBottomTab('pipeline')}
              className={`py-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                bottomTab === 'pipeline'
                  ? 'border-[#2962ff] text-white'
                  : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#2962ff]" />
              <span>{isKm ? 'លំហូរដំណើរការ Mermaid Pipeline' : 'Mermaid Execution Pipeline'}</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setBottomTab('pine_editor')}
                className={`py-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  bottomTab === 'pine_editor'
                    ? 'border-[#2962ff] text-white'
                    : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-[#f5a623]" />
                <span>Pine Editor (Indicators)</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded font-mono">Admin</span>
              </button>
            ) : (
              <div 
                className="py-2.5 px-3 text-[#787b86] flex items-center gap-1.5 text-xs opacity-60 cursor-not-allowed border-b-2 border-transparent"
                title={isKm ? 'មុខងារ Indicators ត្រូវបានបិទ - បង្ហាញសម្រាប់តែ Admin' : 'Indicators restricted to Admin only'}
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Indicators (Admin Only)</span>
              </div>
            )}

            <button
              onClick={() => setBottomTab('strategy_tester')}
              className={`py-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                bottomTab === 'strategy_tester'
                  ? 'border-[#2962ff] text-white'
                  : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#089981]" />
              <span>Strategy Tester</span>
            </button>

            <button
              onClick={() => setBottomTab('logs')}
              className={`py-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                bottomTab === 'logs'
                  ? 'border-[#2962ff] text-white'
                  : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#2962ff]" />
              <span>Webhook Logs ({logs.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#787b86] font-mono">
              Status: <span className="text-[#089981]">ONLINE</span>
            </span>
          </div>
        </div>

        {/* Tab Content 1: Live Execution Pipeline */}
        {bottomTab === 'pipeline' && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {flowchartNodes.map((node, idx) => {
                const isCompleted = activeStepIndex !== null && activeStepIndex > idx;
                const isCurrent = activeStepIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? 'bg-[#2962ff]/20 border-[#2962ff] ring-2 ring-[#2962ff]/50 scale-[1.02]'
                        : isCompleted
                        ? 'bg-[#089981]/20 border-[#089981]/50 text-[#22ab94]'
                        : 'bg-[#131722] border-[#2a2e39] text-[#787b86]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                      <span className="text-[#787b86]">#{idx + 1}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#089981]" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-[#2962ff] animate-ping"></span>
                      ) : null}
                    </div>
                    <div className="font-semibold text-xs text-white leading-tight">
                      {node.label}
                    </div>
                    <div className="text-[10px] text-[#787b86] mt-1 truncate">
                      {node.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content 2: Administrator Interactive Pine Script v5 Indicator Editor */}
        {bottomTab === 'pine_editor' && isAdmin && (
          <div className="p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-white font-bold flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#089981]" />
                  <span>
                    {isKm
                      ? 'Pine Script v5 Indicator Editor (Administrator អាចសរសេរ និងបន្ថែមចូលក្រាហ្វផ្ទាល់)'
                      : 'Pine Script v5 Indicator Builder (Compile & Add to Live Chart)'}
                  </span>
                </div>
                <p className="text-[11px] text-[#787b86] mt-0.5">
                  {isKm
                    ? 'កំណត់ឈ្មោះ, ប្រភេទ Indicator, ពណ៌ និងកូដ Pine Script រួចចុច "បន្ថែមចូលក្រាហ្វ TradingView"'
                    : 'Configure indicator parameters and Pine Script code, then click Add to Chart'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onAddIndicator && (
                  <button
                    type="button"
                    onClick={() => setIsIndicatorModalOpen(true)}
                    className="px-3 py-1.5 bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc] rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#2962ff]" />
                    <span>{isKm ? 'បើកបញ្ជី Indicators ទាំងអស់' : 'Browse Built-in Catalog'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pineSourceCode);
                    setCopiedPine(true);
                    setTimeout(() => setCopiedPine(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-[#2a2e39] hover:bg-[#363a45] text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedPine ? <Check className="w-3.5 h-3.5 text-[#089981]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPine ? (isKm ? 'បានចម្លង!' : 'Copied!') : (isKm ? 'ចម្លងកូដ' : 'Copy Script')}</span>
                </button>

                {onAddIndicator && (
                  <button
                    type="button"
                    onClick={handleCompileAndAddPineIndicator}
                    className="px-4 py-1.5 bg-[#089981] hover:bg-[#06806b] text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isKm ? '+ បន្ថែមចូលក្រាហ្វ TradingView' : '+ Add to Chart'}</span>
                  </button>
                )}
              </div>
            </div>

            {pineCompiledNotice && (
              <div className="px-3.5 py-2 rounded-lg bg-[#089981]/15 border border-[#089981]/40 text-[#22ab94] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pineCompiledNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[10px] text-[#787b86] mb-1">
                  {isKm ? 'ឈ្មោះ Indicator' : 'Indicator Name'}
                </label>
                <input
                  type="text"
                  value={pineTitle}
                  onChange={e => setPineTitle(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#787b86] mb-1">
                  {isKm ? 'ឈ្មោះកាត់ (Short Label)' : 'Short Label'}
                </label>
                <input
                  type="text"
                  value={pineShortName}
                  onChange={e => setPineShortName(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#787b86] mb-1">
                  {isKm ? 'ប្រភេទក្រាហ្វ TradingView' : 'Base TV Study'}
                </label>
                <select
                  value={pineStudyId}
                  onChange={e => {
                    const v = e.target.value;
                    setPineStudyId(v);
                    setPineIsOverlay(!v.includes('RSI') && !v.includes('MACD') && !v.includes('ATR'));
                  }}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="STD;EMA">EMA Overlay</option>
                  <option value="STD;SMA">SMA Overlay</option>
                  <option value="STD;Bollinger_Bands">Bollinger Bands</option>
                  <option value="STD;Supertrend">SuperTrend</option>
                  <option value="STD;VWAP">VWAP</option>
                  <option value="STD;Pivot%1Points%1Standard">Pivot / SMC Levels</option>
                  <option value="STD;RSI">RSI Sub-Pane</option>
                  <option value="STD;MACD">MACD Sub-Pane</option>
                  <option value="">Custom HUD Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#787b86] mb-1">
                  Period & Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={pinePeriod}
                    onChange={e => setPinePeriod(parseInt(e.target.value, 10) || 20)}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-2.5 py-1.5 text-white font-mono tabular-nums"
                  />
                  <input
                    type="color"
                    value={pineColor}
                    onChange={e => setPineColor(e.target.value)}
                    className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer shrink-0"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <label className="w-full px-2.5 py-1.5 rounded-lg bg-[#131722] border border-[#2a2e39] flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pineVipVisible}
                    onChange={e => setPineVipVisible(e.target.checked)}
                    className="accent-[#2962ff]"
                  />
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] text-white truncate">
                    {isKm ? 'បង្ហាញលើ VIP Chart' : 'Show to VIP'}
                  </span>
                </label>
              </div>
            </div>

            <textarea
              rows={7}
              value={pineSourceCode}
              onChange={e => setPineSourceCode(e.target.value)}
              className="w-full p-3.5 bg-[#131722] rounded-lg border border-[#2a2e39] text-xs text-[#22ab94] font-mono leading-relaxed focus:outline-none focus:border-[#2962ff]"
            />
          </div>
        )}

        {/* Tab Content 3: Strategy Tester */}
        {bottomTab === 'strategy_tester' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[#787b86]">Net Profit</div>
                <div className="text-lg font-bold text-[#089981] font-mono mt-0.5">+$18,450.00 (+42.8%)</div>
              </div>
              <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[#787b86]">Total Closed Trades</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">248 Trades</div>
              </div>
              <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[#787b86]">Percent Profitable</div>
                <div className="text-lg font-bold text-[#f5a623] font-mono mt-0.5">84.6% Win Rate</div>
              </div>
              <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[#787b86]">Profit Factor</div>
                <div className="text-lg font-bold text-[#2962ff] font-mono mt-0.5">2.45</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Webhook Logs */}
        {bottomTab === 'logs' && (
          <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#787b86]">
                {isKm ? 'មិនទាន់មានព្រឹត្តិការណ៍ Webhook នៅឡើយទេ' : 'No webhook events recorded yet.'}
              </div>
            ) : (
              logs.map((l) => (
                <div
                  key={l.id}
                  className="p-2.5 rounded bg-[#131722] border border-[#2a2e39] text-xs flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className={l.action === 'BUY' ? 'text-[#089981] font-bold' : 'text-[#f23645] font-bold'}>
                      {l.action}
                    </span>
                    <span className="text-white font-bold">{l.ticker}</span>
                    <span className="text-[#787b86] truncate max-w-sm">{l.message}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        l.status === 'SUCCESS'
                          ? 'bg-[#089981]/20 text-[#089981]'
                          : l.status === 'DUPLICATE_IGNORED'
                          ? 'bg-[#f5a623]/20 text-[#f5a623]'
                          : 'bg-[#f23645]/20 text-[#f23645]'
                      }`}
                    >
                      {l.responseCode} {l.status}
                    </span>
                    <span className="text-[10px] text-[#787b86]">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 5. Authentic TradingView "Create Alert" Dialog Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#1e222d] border border-[#2a2e39] rounded-2xl shadow-2xl p-6 text-[#d1d4dc] my-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#2962ff]" />
                <h2 className="text-base font-bold text-white">
                  {isKm ? `បង្កើត Alert លើ ${ticker}` : `Create Alert on ${ticker}`}
                </h2>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="text-[#787b86] hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TradingView Dialog Tabs */}
            <div className="flex items-center gap-4 border-b border-[#2a2e39] mt-3">
              <button
                onClick={() => setAlertDialogTab('settings')}
                className={`pb-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                  alertDialogTab === 'settings'
                    ? 'border-[#2962ff] text-white'
                    : 'border-transparent text-[#787b86] hover:text-white'
                }`}
              >
                {isKm ? 'ការកំណត់ (Settings)' : 'Settings'}
              </button>

              <button
                onClick={() => setAlertDialogTab('notifications')}
                className={`pb-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                  alertDialogTab === 'notifications'
                    ? 'border-[#2962ff] text-white'
                    : 'border-transparent text-[#787b86] hover:text-white'
                }`}
              >
                {isKm ? 'ការជូនដំណឹង (Notifications & Webhook)' : 'Notifications & Webhook'}
              </button>
            </div>

            {/* Tab 1: Settings */}
            {alertDialogTab === 'settings' && (
              <div className="py-4 space-y-4 text-xs">
                {!isAdmin && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {isKm 
                        ? 'មុខងារ Indicators និង Settings ត្រូវបានបិទ - បង្ហាញសម្រាប់តែ Admin ប៉ុណ្ណោះ' 
                        : 'Indicators and Settings are locked. Only Admin can modify indicators.'}
                    </span>
                  </div>
                )}

                {/* Condition row */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#787b86] font-medium">Condition & Indicator</label>
                    {!isAdmin && (
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Admin Indicator</span>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={ticker}
                      onChange={(e) => handleSelectSymbol(e.target.value)}
                      className="bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#2962ff]"
                    >
                      {symbolsList.map((s) => (
                        <option key={s.id} value={s.id}>{s.id} ({s.name})</option>
                      ))}
                    </select>

                    <select
                      value={strategy}
                      disabled={!isAdmin}
                      onChange={(e) => setStrategy(e.target.value)}
                      className={`bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white focus:outline-none focus:border-[#2962ff] ${
                        !isAdmin ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <optgroup label={isKm ? 'Indicators បានបន្ថែមដោយ Administrator' : 'Administrator Active Indicators'}>
                        {resolvedIndicators.map(ind => (
                          <option key={ind.id} value={ind.name}>
                            {ind.shortName} — {ind.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={isKm ? 'យុទ្ធសាស្ត្រស្តង់ដារ' : 'Built-in Strategies'}>
                        <option value="AlphaSignal EMA Cloud Breakout v5">AlphaSignal EMA Cloud v5</option>
                        <option value="OrderBlock Liquidity Sweep">OrderBlock Liquidity Sweep</option>
                        <option value="RSI Multi-Timeframe Divergence">RSI Divergence Strategy</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Trigger Frequency (TradingView radio buttons) */}
                <div>
                  <label className="block text-[#787b86] mb-1.5 font-medium">Trigger</label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="radio"
                        name="freq"
                        checked={triggerFrequency === 'once_per_bar_close'}
                        onChange={() => setTriggerFrequency('once_per_bar_close')}
                        className="accent-[#2962ff]"
                      />
                      <span>Once Per Bar Close (Recommended)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="radio"
                        name="freq"
                        checked={triggerFrequency === 'once_per_bar'}
                        onChange={() => setTriggerFrequency('once_per_bar')}
                        className="accent-[#2962ff]"
                      />
                      <span>Once Per Bar</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="radio"
                        name="freq"
                        checked={triggerFrequency === 'only_once'}
                        onChange={() => setTriggerFrequency('only_once')}
                        className="accent-[#2962ff]"
                      />
                      <span>Only Once</span>
                    </label>
                  </div>
                </div>

                {/* Signal Parameters: BUY / SELL, Price, SL, TPs */}
                <div className="p-3 rounded-xl bg-[#131722] border border-[#2a2e39] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Trade Order Details</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAction('BUY')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          action === 'BUY'
                            ? 'bg-[#089981] text-white ring-1 ring-white/20'
                            : 'bg-[#1e222d] text-[#787b86]'
                        }`}
                      >
                        ▲ BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setAction('SELL')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          action === 'SELL'
                            ? 'bg-[#f23645] text-white ring-1 ring-white/20'
                            : 'bg-[#1e222d] text-[#787b86]'
                        }`}
                      >
                        ▼ SELL
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-[#787b86]">Entry Price</span>
                      <input
                        type="number"
                        step="any"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#f23645]">Stop Loss</span>
                      <input
                        type="number"
                        step="any"
                        value={sl}
                        onChange={(e) => setSl(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-[#f23645] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#089981]">Target TP1</span>
                      <input
                        type="number"
                        step="any"
                        value={tp1}
                        onChange={(e) => setTp1(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-[#089981] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#089981]">Target TP2</span>
                      <input
                        type="number"
                        step="any"
                        value={tp2}
                        onChange={(e) => setTp2(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-[#089981] text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Message Box with JSON Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#787b86] font-medium">Message (Webhook Payload)</label>
                    <span className="text-[10px] font-mono text-[#2962ff]">JSON format</span>
                  </div>
                  <pre className="p-3 bg-[#131722] border border-[#2a2e39] rounded-lg font-mono text-[11px] text-[#22ab94] overflow-x-auto leading-relaxed">
{JSON.stringify(
  {
    secret: testMode === 'invalid_secret' ? 'WRONG_SECRET_TOKEN_XYZ' : secretInput,
    ticker,
    action,
    price,
    sl,
    tp1,
    tp2,
    tp3,
    timeframe,
    strategy,
    timestamp: new Date().toISOString()
  },
  null,
  2
)}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 2: Notifications & Webhook */}
            {alertDialogTab === 'notifications' && (
              <div className="py-4 space-y-4 text-xs">
                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="mt-0.5 accent-[#2962ff]"
                    />
                    <div className="w-full">
                      <span className="font-semibold text-white">Webhook URL</span>
                      <input
                        type="text"
                        readOnly
                        value="https://api.alphasignal.vip/webhook/tradingview"
                        className="w-full mt-1 bg-[#131722] border border-[#2a2e39] rounded px-3 py-1.5 font-mono text-xs text-[#2962ff]"
                      />
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="accent-[#2962ff]"
                    />
                    <span className="text-white">Play sound: Chime</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="accent-[#2962ff]"
                    />
                    <span className="text-white">Send Email-to-SMS to VIP Channel</span>
                  </label>
                </div>

                {/* Scenario Testing Controls */}
                {isAdmin ? (
                  <div className="pt-3 border-t border-[#2a2e39] space-y-2">
                    <span className="font-semibold text-white block flex items-center justify-between">
                      <span>{isKm ? 'សាកល្បងលក្ខខណ្ឌដ្យាក្រាម (Admin Scenarios):' : 'Test Diagram Execution Branch:'}</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono font-bold">Admin</span>
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTestMode('normal')}
                        className={`p-2 rounded border text-left cursor-pointer ${
                          testMode === 'normal'
                            ? 'bg-[#089981]/20 border-[#089981] text-white font-bold'
                            : 'bg-[#131722] border-[#2a2e39] text-[#787b86]'
                        }`}
                      >
                        <div className="font-bold">1. Valid Secret</div>
                        <div className="text-[10px]">Passes to VIP</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTestMode('invalid_secret')}
                        className={`p-2 rounded border text-left cursor-pointer ${
                          testMode === 'invalid_secret'
                            ? 'bg-[#f23645]/20 border-[#f23645] text-white font-bold'
                            : 'bg-[#131722] border-[#2a2e39] text-[#787b86]'
                        }`}
                      >
                        <div className="font-bold">2. Invalid Secret</div>
                        <div className="text-[10px]">Reject 401</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTestMode('duplicate')}
                        className={`p-2 rounded border text-left cursor-pointer ${
                          testMode === 'duplicate'
                            ? 'bg-[#f5a623]/20 border-[#f5a623] text-white font-bold'
                            : 'bg-[#131722] border-[#2a2e39] text-[#787b86]'
                        }`}
                      >
                        <div className="font-bold">3. Duplicate</div>
                        <div className="text-[10px]">Ignore 200</div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-[#2a2e39] p-3 rounded-lg bg-[#131722] border border-[#2a2e39] flex items-center gap-2 text-xs text-[#787b86]">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {isKm 
                        ? 'ការកំណត់ Webhook Secret & Simulation គឺសម្រាប់តែ Admin' 
                        : 'Webhook Secret & Simulation Controls are restricted to Admin.'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#2a2e39] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
                className="px-4 py-2 bg-[#2a2e39] hover:bg-[#363a45] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleFireWebhook}
                disabled={executing}
                className="px-5 py-2 bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#2962ff]/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isKm ? 'បង្កើត & បញ្ជូន Alert នេះ' : 'Create & Fire Webhook Alert'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Administrator TradingView Indicator Catalog & Pine Script Modal */}
      {isAdmin && onAddIndicator && onUpdateIndicator && onDeleteIndicator && (
        <TradingViewIndicatorModal
          isOpen={isIndicatorModalOpen}
          onClose={() => setIsIndicatorModalOpen(false)}
          lang={lang}
          indicators={resolvedIndicators}
          onAddIndicator={onAddIndicator}
          onUpdateIndicator={onUpdateIndicator}
          onDeleteIndicator={onDeleteIndicator}
          adminActorLabel={adminActorLabel}
        />
      )}
    </div>
  );
};
