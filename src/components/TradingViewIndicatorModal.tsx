import React, { useState, useEffect } from 'react';
import {
  Language,
  TradingViewIndicator,
  TradingViewIndicatorCategory
} from '../types';
import {
  TV_BUILTIN_INDICATOR_CATALOG,
  TvIndicatorCatalogTemplate
} from '../data/mockData';
import {
  X,
  Search,
  Plus,
  Check,
  Code2,
  Sliders,
  Eye,
  EyeOff,
  Trash2,
  Crown,
  Sparkles,
  TrendingUp,
  Activity,
  BarChart2,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface TradingViewIndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  indicators: TradingViewIndicator[];
  onAddIndicator: (indicator: Omit<TradingViewIndicator, 'id' | 'createdAt'>) => void;
  onUpdateIndicator: (id: string, updates: Partial<TradingViewIndicator>) => void;
  onDeleteIndicator: (id: string) => void;
  adminActorLabel?: string;
  initialTab?: 'catalog' | 'custom_pine' | 'active_list';
  initialEditingId?: string | null;
}

const COLOR_PRESETS = [
  '#2962ff',
  '#089981',
  '#f5a623',
  '#f23645',
  '#a855f7',
  '#06b6d4',
  '#eab308',
  '#ec4899'
];

const STUDY_ENGINE_OPTIONS: { value: string; label: string }[] = [
  { value: 'STD;EMA', label: 'TradingView EMA (Exponential Moving Average)' },
  { value: 'STD;SMA', label: 'TradingView SMA (Simple Moving Average)' },
  { value: 'STD;WMA', label: 'TradingView WMA (Weighted Moving Average)' },
  { value: 'STD;Bollinger_Bands', label: 'TradingView Bollinger Bands (BB)' },
  { value: 'STD;Supertrend', label: 'TradingView SuperTrend' },
  { value: 'STD;Ichimoku%1Cloud', label: 'TradingView Ichimoku Cloud' },
  { value: 'STD;VWAP', label: 'TradingView VWAP' },
  { value: 'STD;Pivot%1Points%1Standard', label: 'TradingView Pivot Points (S/R)' },
  { value: 'STD;Keltner_Channels', label: 'TradingView Keltner Channels' },
  { value: 'STD;Donchian_Channels', label: 'TradingView Donchian Channels' },
  { value: 'STD;PSAR', label: 'TradingView Parabolic SAR' },
  { value: 'STD;RSI', label: 'TradingView RSI (Oscillator Pane)' },
  { value: 'STD;MACD', label: 'TradingView MACD (Oscillator Pane)' },
  { value: 'STD;Stochastic_RSI', label: 'TradingView Stochastic RSI (Oscillator Pane)' },
  { value: 'STD;ATR', label: 'TradingView ATR (Volatility Pane)' },
  { value: 'STD;ADX', label: 'TradingView ADX (Trend Strength Pane)' },
  { value: 'STD;CCI', label: 'TradingView CCI (Oscillator Pane)' },
  { value: 'STD;OBV', label: 'TradingView On Balance Volume (OBV)' },
  { value: '', label: 'Pure Custom Pine Script Overlay (HUD Signal Only)' }
];

export const TradingViewIndicatorModal: React.FC<TradingViewIndicatorModalProps> = ({
  isOpen,
  onClose,
  lang,
  indicators,
  onAddIndicator,
  onUpdateIndicator,
  onDeleteIndicator,
  adminActorLabel = 'ADM-001 (Administrator)',
  initialTab = 'catalog',
  initialEditingId = null
}) => {
  const isKm = lang === 'km';

  const [modalTab, setModalTab] = useState<'catalog' | 'custom_pine' | 'active_list'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | TradingViewIndicatorCategory>('ALL');

  // Quick parameter overrides in Catalog tab per template code
  const [catalogPeriods, setCatalogPeriods] = useState<Record<string, number>>({});
  const [catalogColors, setCatalogColors] = useState<Record<string, string>>({});
  const [catalogVipShare, setCatalogVipShare] = useState<boolean>(true);
  const [recentAddedBanner, setRecentAddedBanner] = useState<string | null>(null);

  // Custom Indicator / Pine Script Builder Form States
  const [customName, setCustomName] = useState('');
  const [customNameKm, setCustomNameKm] = useState('');
  const [customShortName, setCustomShortName] = useState('');
  const [customCategory, setCustomCategory] = useState<TradingViewIndicatorCategory>('custom_pine');
  const [customStudyId, setCustomStudyId] = useState('STD;EMA');
  const [customIsOverlay, setCustomIsOverlay] = useState(true);
  const [customPeriod, setCustomPeriod] = useState<number>(200);
  const [customSecondaryPeriod, setCustomSecondaryPeriod] = useState<number>(50);
  const [customMultiplier, setCustomMultiplier] = useState<number>(2.0);
  const [customSource, setCustomSource] = useState<
    'close' | 'open' | 'high' | 'low' | 'hl2' | 'hlc3' | 'ohlc4'
  >('close');
  const [customColor, setCustomColor] = useState('#089981');
  const [customVipVisible, setCustomVipVisible] = useState(true);
  const [customDesc, setCustomDesc] = useState('');
  const [customPineScript, setCustomPineScript] = useState(`//@version=5
indicator("Admin Custom EMA 200 Institutional Filter", shorttitle="EMA 200", overlay=true)
len = input.int(200, minval=1, title="Length")
src = input(close, title="Source")
out = ta.ema(src, len)
plot(out, title="Institutional EMA", color=color.new(#089981, 0), linewidth=2)`);

  // Inline Edit & Delete states in Active List tab
  const [editingId, setEditingId] = useState<string | null>(initialEditingId);
  const [editShortName, setEditShortName] = useState('');
  const [editPeriod, setEditPeriod] = useState<number>(20);
  const [editMultiplier, setEditMultiplier] = useState<number>(2);
  const [editColor, setEditColor] = useState('#2962ff');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setModalTab(initialTab);
      if (initialEditingId) {
        const target = indicators.find(i => i.id === initialEditingId);
        if (target) {
          setModalTab('active_list');
          startInlineEdit(target);
        }
      }
    }
  }, [isOpen, initialTab, initialEditingId]);

  if (!isOpen) return null;

  const startInlineEdit = (ind: TradingViewIndicator) => {
    setEditingId(ind.id);
    setEditShortName(ind.shortName);
    setEditPeriod(ind.period ?? 14);
    setEditMultiplier(ind.multiplier ?? 2);
    setEditColor(ind.color);
  };

  const saveInlineEdit = (ind: TradingViewIndicator) => {
    const trimmedShort = editShortName.trim() || ind.shortName;
    onUpdateIndicator(ind.id, {
      shortName: trimmedShort,
      period: editPeriod > 0 ? editPeriod : ind.period,
      multiplier: ind.multiplier !== undefined ? editMultiplier : undefined,
      color: editColor
    });
    setEditingId(null);
    showToast(
      isKm
        ? `បានរក្សាទុកការកែប្រែ "${trimmedShort}" លើក្រាហ្វ TradingView!`
        : `Updated "${trimmedShort}" parameters on TradingView chart!`
    );
  };

  const showToast = (msg: string) => {
    setRecentAddedBanner(msg);
    setTimeout(() => {
      setRecentAddedBanner(null);
    }, 3200);
  };

  const handleQuickAddFromCatalog = (tpl: TvIndicatorCatalogTemplate) => {
    const chosenPeriod = catalogPeriods[tpl.code] ?? tpl.defaultPeriod;
    const chosenColor = catalogColors[tpl.code] ?? tpl.defaultColor;
    const computedShort = chosenPeriod ? `${tpl.shortName} ${chosenPeriod}` : tpl.shortName;
    const computedFull = chosenPeriod ? `${tpl.name} (${chosenPeriod})` : tpl.name;
    const computedFullKm = chosenPeriod ? `${tpl.nameKm} (${chosenPeriod})` : tpl.nameKm;

    onAddIndicator({
      name: computedFull,
      nameKm: computedFullKm,
      shortName: computedShort,
      category: tpl.category,
      tvStudyId: tpl.tvStudyId,
      isOverlay: tpl.isOverlay,
      period: chosenPeriod,
      secondaryPeriod: tpl.defaultSecondaryPeriod,
      multiplier: tpl.defaultMultiplier,
      source: 'close',
      color: chosenColor,
      active: true,
      vipVisible: catalogVipShare,
      pineScript: tpl.pineTemplate,
      description: tpl.description,
      descriptionKm: tpl.descriptionKm,
      createdBy: adminActorLabel
    });

    showToast(
      isKm
        ? `បានបន្ថែម Indicator "${computedShort}" ចូលក្នុង TradingView ដោយជោគជ័យ!`
        : `Added "${computedShort}" to TradingView chart!`
    );
  };

  const handleGeneratePineTemplate = () => {
    const title = customName.trim() || 'Admin Custom Indicator';
    const short = customShortName.trim() || 'ADM-IND';
    const len = customPeriod || 20;
    const overlayStr = customIsOverlay ? 'true' : 'false';
    const fnCall =
      customStudyId === 'STD;RSI'
        ? `ta.rsi(${customSource}, ${len})`
        : customStudyId === 'STD;SMA'
        ? `ta.sma(${customSource}, ${len})`
        : customStudyId === 'STD;ATR'
        ? `ta.atr(${len})`
        : `ta.ema(${customSource}, ${len})`;

    setCustomPineScript(`//@version=5
indicator("${title}", shorttitle="${short}", overlay=${overlayStr})
length = input.int(${len}, minval=1, title="Period Length")
mult   = input.float(${customMultiplier || 2.0}, title="Multiplier")
val    = ${fnCall}

plot(val, title="${short}", color=color.new(${customColor}, 0), linewidth=2)
alertcondition(ta.crossover(close, val), title="${short} Bullish Signal", message="${short} BUY Triggered")
alertcondition(ta.crossunder(close, val), title="${short} Bearish Signal", message="${short} SELL Triggered")`);
  };

  const handleCreateCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customName.trim() || customNameKm.trim();
    if (!finalName) return;

    const finalShort =
      customShortName.trim() ||
      (customPeriod ? `${finalName.slice(0, 8).toUpperCase()} ${customPeriod}` : finalName.slice(0, 10));

    onAddIndicator({
      name: finalName,
      nameKm: customNameKm.trim() || finalName,
      shortName: finalShort,
      category: customCategory,
      tvStudyId: customStudyId || undefined,
      isOverlay: customIsOverlay,
      period: customPeriod || undefined,
      secondaryPeriod: customSecondaryPeriod || undefined,
      multiplier: customMultiplier || undefined,
      source: customSource,
      color: customColor,
      active: true,
      vipVisible: customVipVisible,
      pineScript: customPineScript.trim() || undefined,
      description: customDesc.trim() || 'Custom indicator configured by Administrator.',
      descriptionKm: customDesc.trim() || 'Indicator បង្កើតផ្ទាល់ដោយ Administrator។',
      createdBy: adminActorLabel
    });

    showToast(
      isKm
        ? `បានបង្កើត និងដាក់ "${finalShort}" លើក្រាហ្វ TradingView រួចរាល់!`
        : `Created and attached "${finalShort}" to TradingView!`
    );

    setCustomName('');
    setCustomNameKm('');
    setCustomShortName('');
    setCustomDesc('');
    setModalTab('active_list');
  };

  const filteredCatalog = TV_BUILTIN_INDICATOR_CATALOG.filter(item => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.nameKm.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.shortName.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  const activeCount = indicators.filter(i => i.active).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#1e222d] border border-[#2a2e39] rounded-2xl shadow-2xl text-[#d1d4dc] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[#131722] border-b border-[#2a2e39] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2962ff]/15 border border-[#2962ff]/40 flex items-center justify-center text-[#2962ff] font-mono font-bold text-sm">
              fx
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">
                  {isKm
                    ? 'គ្រប់គ្រង និងបន្ថែម TradingView Indicators'
                    : 'TradingView Indicators, Metrics & Pine Strategies'}
                </h2>
                <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-400" />
                  <span>ADMINISTRATOR ACCESS</span>
                </span>
              </div>
              <p className="text-xs text-[#787b86] mt-0.5">
                {isKm
                  ? `កំពុងគ្រប់គ្រងដោយ ${adminActorLabel} · អាចបន្ថែម Technical Indicators និងបង្កើតកូដ Pine Script v5 ផ្ទាល់ខ្លួន`
                  : `Authorized as ${adminActorLabel} · Add built-in TradingView studies or custom Pine Script v5 indicators`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 bg-[#181b24] border-b border-[#2a2e39] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setModalTab('catalog')}
              className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                modalTab === 'catalog'
                  ? 'border-[#2962ff] text-white'
                  : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#2962ff]" />
              <span>{isKm ? '១. បញ្ជី Indicators ស្តង់ដារ (Built-in)' : '1. Built-in Technicals'}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#2a2e39] text-[10px] font-mono tabular-nums text-[#d1d4dc]">
                {TV_BUILTIN_INDICATOR_CATALOG.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setModalTab('custom_pine')}
              className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                modalTab === 'custom_pine'
                  ? 'border-[#2962ff] text-white'
                  : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-[#089981]" />
              <span>
                {isKm ? '២. បង្កើត Indicator ថ្មី / Pine Script' : '2. Create Custom / Pine Script'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setModalTab('active_list')}
              className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                modalTab === 'active_list'
                  ? 'border-[#2962ff] text-white'
                  : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#f5a623]" />
              <span>{isKm ? '៣. កំពុងប្រើលើក្រាហ្វ (Active)' : '3. Active on Chart'}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#2962ff]/20 text-[#2962ff] text-[10px] font-mono tabular-nums font-bold">
                {activeCount}/{indicators.length}
              </span>
            </button>
          </div>

          {modalTab === 'catalog' && (
            <label className="py-2 flex items-center gap-2 text-xs cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={catalogVipShare}
                onChange={e => setCatalogVipShare(e.target.checked)}
                className="accent-[#2962ff]"
              />
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[#d1d4dc]">
                {isKm ? 'បង្ហាញលើក្រាហ្វ VIP Customer ដែរ' : 'Also show on VIP Customer Chart'}
              </span>
            </label>
          )}
        </div>

        {/* Instant Confirmation Toast Banner */}
        {recentAddedBanner && (
          <div className="mx-5 mt-3 px-4 py-2.5 rounded-xl bg-[#089981]/15 border border-[#089981]/40 text-xs text-[#22ab94] font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#089981] shrink-0" />
              <span>{recentAddedBanner}</span>
            </div>
            <span className="text-[10px] font-mono text-[#d1d4dc]">LIVE SYNC</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* ================= TAB 1: BUILT-IN CATALOG ================= */}
          {modalTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search & Category Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#787b86] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={
                      isKm
                        ? 'ស្វែងរក Indicator (ឧ. EMA, RSI, MACD, Bollinger, VWAP, SuperTrend, SMC)...'
                        : 'Search indicators (EMA, RSI, MACD, Bollinger Bands, VWAP, SuperTrend)...'
                    }
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {(
                    [
                      { id: 'ALL', labelKm: 'ទាំងអស់', labelEn: 'All', icon: Layers },
                      { id: 'trend', labelKm: 'Trend', labelEn: 'Trend', icon: TrendingUp },
                      { id: 'oscillator', labelKm: 'Oscillators', labelEn: 'Oscillators', icon: Activity },
                      { id: 'volatility', labelKm: 'Volatility', labelEn: 'Volatility', icon: BarChart2 },
                      { id: 'volume_smc', labelKm: 'Volume & SMC', labelEn: 'Volume & SMC', icon: Sparkles }
                    ] as const
                  ).map(cat => {
                    const Icon = cat.icon;
                    const active = categoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id as 'ALL' | TradingViewIndicatorCategory)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                          active
                            ? 'bg-[#2962ff] text-white'
                            : 'bg-[#131722] border border-[#2a2e39] text-[#787b86] hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{isKm ? cat.labelKm : cat.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Indicator Catalog List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCatalog.map(tpl => {
                  const currentPeriod = catalogPeriods[tpl.code] ?? tpl.defaultPeriod;
                  const currentColor = catalogColors[tpl.code] ?? tpl.defaultColor;
                  const matchingCount = indicators.filter(
                    i => i.tvStudyId && i.tvStudyId === tpl.tvStudyId && i.active
                  ).length;

                  return (
                    <div
                      key={tpl.code}
                      className="p-3.5 rounded-xl bg-[#131722] border border-[#2a2e39] hover:border-[#363a45] transition-colors flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: currentColor }}
                            />
                            <span className="text-xs font-bold text-white">
                              {isKm ? tpl.nameKm : tpl.name}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-[#1e222d] border border-[#2a2e39] text-[10px] font-mono text-[#787b86] whitespace-nowrap shrink-0">
                            {tpl.isOverlay ? 'Overlay' : 'Sub-Pane'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#787b86] leading-relaxed">
                          {isKm ? tpl.descriptionKm : tpl.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1e222d] flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {tpl.defaultPeriod !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[#787b86] font-mono">Len:</span>
                              <input
                                type="number"
                                min={1}
                                max={500}
                                value={currentPeriod ?? ''}
                                onChange={e =>
                                  setCatalogPeriods(prev => ({
                                    ...prev,
                                    [tpl.code]: Math.max(1, parseInt(e.target.value, 10) || 1)
                                  }))
                                }
                                className="w-14 bg-[#1e222d] border border-[#2a2e39] rounded px-1.5 py-1 text-xs font-mono tabular-nums text-white focus:outline-none focus:border-[#2962ff]"
                              />
                            </div>
                          )}

                          <input
                            type="color"
                            value={currentColor}
                            onChange={e =>
                              setCatalogColors(prev => ({
                                ...prev,
                                [tpl.code]: e.target.value
                              }))
                            }
                            title="Indicator Color"
                            className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                          />

                          {matchingCount > 0 && (
                            <span className="text-[10px] font-mono tabular-nums text-[#089981]">
                              ✓ {matchingCount} active
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickAddFromCatalog(tpl)}
                          className="px-3 py-1.5 rounded-lg bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isKm ? 'បន្ថែមលើក្រាហ្វ' : 'Add to Chart'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 2: CREATE CUSTOM / PINE SCRIPT ================= */}
          {modalTab === 'custom_pine' && (
            <form onSubmit={handleCreateCustomSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#787b86] font-semibold mb-1">
                    {isKm ? 'ឈ្មោះ Indicator (ភាសាអង់គ្លេស) *' : 'Indicator Name (EN) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Institutional EMA 200 Filter"
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2962ff]"
                  />
                </div>

                <div>
                  <label className="block text-[#787b86] font-semibold mb-1">
                    {isKm ? 'ឈ្មោះជាភាសាខ្មែរ' : 'Indicator Name (Khmer)'}
                  </label>
                  <input
                    type="text"
                    value={customNameKm}
                    onChange={e => setCustomNameKm(e.target.value)}
                    placeholder="ឧ. ខ្សែមធ្យមភាគស្ថាប័ន EMA 200"
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2962ff]"
                  />
                </div>

                <div>
                  <label className="block text-[#787b86] font-semibold mb-1">
                    {isKm ? 'ឈ្មោះកាត់លើក្រាហ្វ (Short Label) *' : 'Short Chart Label *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customShortName}
                    onChange={e => setCustomShortName(e.target.value)}
                    placeholder="e.g. EMA 200"
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#2962ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#787b86] font-semibold mb-1">
                    {isKm ? 'ប្រភេទគណនាលើ TradingView' : 'TradingView Plot Engine'}
                  </label>
                  <select
                    value={customStudyId}
                    onChange={e => {
                      const val = e.target.value;
                      setCustomStudyId(val);
                      if (
                        val.includes('RSI') ||
                        val.includes('MACD') ||
                        val.includes('ATR') ||
                        val.includes('ADX') ||
                        val.includes('CCI') ||
                        val.includes('OBV')
                      ) {
                        setCustomIsOverlay(false);
                        setCustomCategory('oscillator');
                      } else {
                        setCustomIsOverlay(true);
                      }
                    }}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2962ff]"
                  >
                    {STUDY_ENGINE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#787b86] font-semibold mb-1">
                    {isKm ? 'ទីតាំងបង្ហាញលើក្រាហ្វ' : 'Chart Placement'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomIsOverlay(true)}
                      className={`py-2 rounded-xl font-bold cursor-pointer border ${
                        customIsOverlay
                          ? 'bg-[#2962ff]/20 border-[#2962ff] text-white'
                          : 'bg-[#131722] border-[#2a2e39] text-[#787b86]'
                      }`}
                    >
                      Overlay (លើទៀន)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomIsOverlay(false)}
                      className={`py-2 rounded-xl font-bold cursor-pointer border ${
                        !customIsOverlay
                          ? 'bg-[#2962ff]/20 border-[#2962ff] text-white'
                          : 'bg-[#131722] border-[#2a2e39] text-[#787b86]'
                      }`}
                    >
                      Sub-Pane (ខាងក្រោម)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#787b86] font-semibold mb-1">
                    {isKm ? 'ពណ៌បន្ទាត់ Indicator' : 'Plot Color'}
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#131722] border border-[#2a2e39] rounded-xl px-2.5 py-1.5">
                    {COLOR_PRESETS.map(hex => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setCustomColor(hex)}
                        className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                          customColor === hex ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    <input
                      type="color"
                      value={customColor}
                      onChange={e => setCustomColor(e.target.value)}
                      className="w-6 h-6 bg-transparent border-0 cursor-pointer ml-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Numeric Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div>
                  <label className="block text-[#787b86] font-sans font-semibold mb-1">
                    Period / Length
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={customPeriod}
                    onChange={e => setCustomPeriod(parseInt(e.target.value, 10) || 14)}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-3 py-2 text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[#787b86] font-sans font-semibold mb-1">
                    Slow / Signal Len
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={customSecondaryPeriod}
                    onChange={e => setCustomSecondaryPeriod(parseInt(e.target.value, 10) || 26)}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-3 py-2 text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[#787b86] font-sans font-semibold mb-1">
                    Multiplier / StdDev
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customMultiplier}
                    onChange={e => setCustomMultiplier(parseFloat(e.target.value) || 2.0)}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-3 py-2 text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[#787b86] font-sans font-semibold mb-1">
                    Price Source
                  </label>
                  <select
                    value={customSource}
                    onChange={e =>
                      setCustomSource(
                        e.target.value as
                          | 'close'
                          | 'open'
                          | 'high'
                          | 'low'
                          | 'hl2'
                          | 'hlc3'
                          | 'ohlc4'
                      )
                    }
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-3 py-2 text-white"
                  >
                    <option value="close">close</option>
                    <option value="hlc3">hlc3</option>
                    <option value="ohlc4">ohlc4</option>
                    <option value="hl2">hl2</option>
                    <option value="open">open</option>
                  </select>
                </div>
              </div>

              {/* Pine Script Code Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[#787b86] font-semibold">
                    {isKm
                      ? 'កូដ Pine Script v5 (អាចកែសម្រួល ឬ Paste កូដផ្ទាល់ខ្លួន)'
                      : 'Pine Script v5 Source Code (Optional / Editable)'}
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePineTemplate}
                    className="px-2.5 py-1 rounded-lg bg-[#2a2e39] hover:bg-[#363a45] text-[#2962ff] font-semibold text-[11px] cursor-pointer"
                  >
                    {isKm ? 'បង្កើតកូដ Pine ស្វ័យប្រវត្តិ' : 'Auto-Generate Pine v5'}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={customPineScript}
                  onChange={e => setCustomPineScript(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl p-3 font-mono text-[11px] text-[#22ab94] leading-relaxed focus:outline-none focus:border-[#2962ff]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2a2e39]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={customVipVisible}
                    onChange={e => setCustomVipVisible(e.target.checked)}
                    className="accent-[#2962ff]"
                  />
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-medium">
                    {isKm
                      ? 'អនុញ្ញាតឱ្យសមាជិក VIP មើលឃើញ Indicator នេះលើក្រាហ្វរបស់ពួកគេ'
                      : 'Display this indicator on VIP Customer TradingView charts'}
                  </span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#089981] hover:bg-[#06806b] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isKm
                      ? '+ បង្កើត & បន្ថែម Indicator ចូល TradingView'
                      : '+ Create & Add Indicator to TradingView'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 3: ACTIVE / INSTALLED INDICATORS LIST ================= */}
          {modalTab === 'active_list' && (
            <div className="space-y-3">
              {indicators.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#131722] border border-[#2a2e39] text-xs text-[#787b86]">
                  {isKm
                    ? 'មិនទាន់មាន Indicator ត្រូវបានបន្ថែមនៅឡើយទេ។ សូមជ្រើសរើសពីបញ្ជី Built-in ឬបង្កើតថ្មី។'
                    : 'No indicators configured yet. Add one from Built-in Technicals or Create Custom.'}
                </div>
              ) : (
                indicators.map(ind => {
                  const isEditing = editingId === ind.id;
                  return (
                    <div
                      key={ind.id}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        ind.active
                          ? 'bg-[#131722] border-[#2a2e39]'
                          : 'bg-[#131722]/50 border-[#2a2e39]/60 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: ind.color }}
                            />
                            <span className="text-xs font-bold text-white font-mono">
                              {ind.shortName}
                            </span>
                            <span className="text-xs text-[#d1d4dc]">
                              — {isKm ? ind.nameKm || ind.name : ind.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                ind.active
                                  ? 'bg-[#089981]/20 text-[#22ab94]'
                                  : 'bg-[#2a2e39] text-[#787b86]'
                              }`}
                            >
                              {ind.active ? (isKm ? 'កំពុងបង្ហាញ' : 'ACTIVE') : isKm ? 'បានលាក់' : 'HIDDEN'}
                            </span>
                            {ind.vipVisible && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                                VIP Shared ✓
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-[#787b86] font-mono tabular-nums flex flex-wrap items-center gap-3">
                            <span>Type: {ind.isOverlay ? 'Overlay' : 'Oscillator'}</span>
                            {ind.period && <span>Length: {ind.period}</span>}
                            {ind.multiplier && <span>Mult: {ind.multiplier}</span>}
                            <span>Added by: {ind.createdBy}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                          {/* Show / Hide on Chart */}
                          <button
                            type="button"
                            onClick={() => onUpdateIndicator(ind.id, { active: !ind.active })}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
                              ind.active
                                ? 'bg-[#1e222d] border-[#363a45] text-white hover:bg-[#2a2e39]'
                                : 'bg-[#2962ff]/20 border-[#2962ff]/40 text-[#2962ff]'
                            }`}
                            title={ind.active ? 'Hide from Chart' : 'Show on Chart'}
                          >
                            {ind.active ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-[#089981]" />
                                <span>{isKm ? 'បង្ហាញ' : 'Shown'}</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>{isKm ? 'បើកវិញ' : 'Enable'}</span>
                              </>
                            )}
                          </button>

                          {/* Toggle VIP Customer Visibility */}
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateIndicator(ind.id, { vipVisible: !ind.vipVisible })
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer border ${
                              ind.vipVisible
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                : 'bg-[#1e222d] border-[#2a2e39] text-[#787b86] hover:text-white'
                            }`}
                            title="Toggle visibility on VIP Customer TradingView chart"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>VIP</span>
                          </button>

                          {/* Edit Parameters */}
                          <button
                            type="button"
                            onClick={() =>
                              isEditing ? setEditingId(null) : startInlineEdit(ind)
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-xs font-semibold text-[#d1d4dc] flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#2962ff]" />
                            <span>{isKm ? 'កែប្រែ' : 'Settings'}</span>
                          </button>

                          {/* Delete Indicator */}
                          {confirmDeleteId === ind.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteIndicator(ind.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#f23645] text-white text-xs font-bold cursor-pointer"
                              >
                                {isKm ? 'លុបចោល' : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 rounded-lg bg-[#2a2e39] text-xs text-[#d1d4dc] cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(ind.id)}
                              className="p-1.5 rounded-lg bg-[#1e222d] hover:bg-[#f23645]/20 border border-[#2a2e39] text-[#f23645] cursor-pointer"
                              title={isKm ? 'លុប Indicator' : 'Remove Indicator'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline Parameter Editor */}
                      {isEditing && (
                        <div className="mt-3 pt-3 border-t border-[#2a2e39] grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end text-xs">
                          <div>
                            <label className="block text-[10px] text-[#787b86] mb-1">
                              Short Label
                            </label>
                            <input
                              type="text"
                              value={editShortName}
                              onChange={e => setEditShortName(e.target.value)}
                              className="w-full bg-[#1e222d] border border-[#363a45] rounded-lg px-2.5 py-1.5 text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#787b86] mb-1">
                              Period / Length
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={1000}
                              value={editPeriod}
                              onChange={e => setEditPeriod(parseInt(e.target.value, 10) || 14)}
                              className="w-full bg-[#1e222d] border border-[#363a45] rounded-lg px-2.5 py-1.5 text-white font-mono tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#787b86] mb-1">
                              Multiplier & Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.1"
                                value={editMultiplier}
                                onChange={e =>
                                  setEditMultiplier(parseFloat(e.target.value) || 2.0)
                                }
                                className="flex-1 bg-[#1e222d] border border-[#363a45] rounded-lg px-2.5 py-1.5 text-white font-mono tabular-nums"
                              />
                              <input
                                type="color"
                                value={editColor}
                                onChange={e => setEditColor(e.target.value)}
                                className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveInlineEdit(ind)}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-[#089981] hover:bg-[#06806b] text-white font-bold cursor-pointer"
                            >
                              {isKm ? 'រក្សាទុក' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="py-1.5 px-3 rounded-lg bg-[#2a2e39] text-[#d1d4dc] cursor-pointer"
                            >
                              {isKm ? 'បិទ' : 'Close'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#131722] border-t border-[#2a2e39] flex items-center justify-between text-xs">
          <span className="text-[#787b86] font-mono tabular-nums">
            {isKm
              ? `កំពុងដំណើរការលើក្រាហ្វ៖ ${activeCount} Indicators`
              : `Active on Live TradingView Chart: ${activeCount} Indicators`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2962ff] hover:bg-[#1e53e5] text-white font-bold cursor-pointer"
          >
            {isKm ? 'រួចរាល់ (បង្ហាញលើក្រាហ្វ)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
