import React, { useEffect, useRef, useState } from 'react';
import { Language, TradingViewIndicator } from '../types';
import { INITIAL_TV_INDICATORS } from '../data/mockData';
import { TradingViewIndicatorModal } from './TradingViewIndicatorModal';
import {
  Lock,
  Plus,
  Eye,
  EyeOff,
  Sliders,
  X,
  Code2,
  ShieldCheck,
  Crown
} from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  timeframe: string;
  isAdmin?: boolean;
  lang?: Language;
  viewerScope?: 'management' | 'customer';
  indicators?: TradingViewIndicator[];
  onAddIndicator?: (indicator: Omit<TradingViewIndicator, 'id' | 'createdAt'>) => void;
  onUpdateIndicator?: (id: string, updates: Partial<TradingViewIndicator>) => void;
  onDeleteIndicator?: (id: string) => void;
  adminActorLabel?: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  timeframe,
  isAdmin = false,
  lang = 'km',
  viewerScope,
  indicators,
  onAddIndicator,
  onUpdateIndicator,
  onDeleteIndicator,
  adminActorLabel = 'ADM-001 (Administrator)'
}) => {
  const isKm = lang === 'km';
  const containerRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'catalog' | 'custom_pine' | 'active_list'>(
    'catalog'
  );
  const [modalEditId, setModalEditId] = useState<string | null>(null);

  const resolvedScope = viewerScope || (isAdmin ? 'management' : 'customer');
  const allIndicators = indicators ?? INITIAL_TV_INDICATORS;

  // In Customer Portal, show only indicators that Administrator marked vipVisible; in Management, show all
  const scopedIndicators =
    resolvedScope === 'customer'
      ? allIndicators.filter(ind => ind.vipVisible)
      : allIndicators;

  const activeIndicators = scopedIndicators.filter(ind => ind.active);

  // Extract TradingView Advanced Chart official study codes
  const activeTvStudies = activeIndicators
    .map(ind => ind.tvStudyId)
    .filter((id): id is string => Boolean(id && id.trim().length > 0));

  const studiesSignature = activeIndicators
    .map(i => `${i.id}:${i.tvStudyId || 'custom'}:${i.period || 0}:${i.multiplier || 0}`)
    .join('|');

  const activeCustomPineIndicators = activeIndicators.filter(
    ind => ind.category === 'custom_pine' || Boolean(ind.pineScript)
  );

  const canManage = Boolean(isAdmin && onAddIndicator && onUpdateIndicator && onDeleteIndicator);

  // Map symbols to TradingView standard exchange symbols
  const getTvSymbol = (sym: string) => {
    const s = sym.toUpperCase().trim();
    if (s.includes('XAU') || s.includes('GOLD')) return 'OANDA:XAUUSD';
    if (s.includes('BTC')) return 'BINANCE:BTCUSDT';
    if (s.includes('ETH')) return 'BINANCE:ETHUSDT';
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
      // Unlock TradingView native Indicators (fx), Drawing Tools & Symbol Search for Administrators
      hide_top_toolbar: !isAdmin,
      hide_side_toolbar: !isAdmin,
      allow_symbol_change: isAdmin,
      hide_legend: false,
      save_image: isAdmin,
      calendar: false,
      hide_volume: false,
      studies: activeTvStudies,
      support_host: 'https://www.tradingview.com'
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol, tvInterval, isAdmin, studiesSignature]);

  const openModalAt = (
    tab: 'catalog' | 'custom_pine' | 'active_list',
    editId: string | null = null
  ) => {
    setModalInitialTab(tab);
    setModalEditId(editId);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#2a2e39] bg-[#131722] flex flex-col">
      {/* Top TradingView Indicator Control & Legend Bar (Never blocks iframe buttons) */}
      <div className="px-3.5 py-2.5 bg-[#181b24] border-b border-[#2a2e39] flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Active / Attached Indicators Legend Chips */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-mono font-bold text-[#787b86] mr-1 whitespace-nowrap">
            fx Indicators ({activeIndicators.length}):
          </span>

          {scopedIndicators.length === 0 ? (
            <span className="text-[11px] text-[#787b86] italic">
              {isKm ? 'មិនទាន់មាន Indicator' : 'No indicators attached'}
            </span>
          ) : (
            scopedIndicators.map(ind => (
              <div
                key={ind.id}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-mono tabular-nums transition-colors ${
                  ind.active
                    ? 'bg-[#131722] border-[#2a2e39] text-[#d1d4dc]'
                    : 'bg-[#131722]/40 border-[#2a2e39]/50 text-[#787b86] line-through opacity-70'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: ind.color }}
                />
                <span className="font-semibold text-white whitespace-nowrap">{ind.shortName}</span>

                {ind.vipVisible && resolvedScope === 'management' && (
                  <span title="Shared on VIP Customer Chart" className="inline-flex items-center">
                    <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                  </span>
                )}

                {canManage && onUpdateIndicator && onDeleteIndicator && (
                  <div className="inline-flex items-center gap-0.5 pl-1 ml-0.5 border-l border-[#2a2e39]">
                    <button
                      type="button"
                      onClick={() => onUpdateIndicator(ind.id, { active: !ind.active })}
                      className="p-0.5 text-[#787b86] hover:text-white cursor-pointer"
                      title={ind.active ? (isKm ? 'លាក់ពីក្រាហ្វ' : 'Hide') : isKm ? 'បង្ហាញលើក្រាហ្វ' : 'Show'}
                    >
                      {ind.active ? (
                        <Eye className="w-3 h-3 text-[#089981]" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openModalAt('active_list', ind.id)}
                      className="p-0.5 text-[#787b86] hover:text-[#2962ff] cursor-pointer"
                      title={isKm ? 'កែប្រែតម្លៃ Indicator' : 'Indicator Settings'}
                    >
                      <Sliders className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteIndicator(ind.id)}
                      className="p-0.5 text-[#787b86] hover:text-[#f23645] cursor-pointer"
                      title={isKm ? 'លុប Indicator' : 'Remove Indicator'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right: Administrator Add Indicator Controls OR Non-Admin Lock Badge */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {canManage ? (
            <>
              <button
                type="button"
                onClick={() => openModalAt('catalog')}
                className="px-3 py-1.5 rounded-lg bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isKm ? 'បន្ថែម Indicator (fx)' : 'Add Indicator (fx)'}</span>
              </button>

              <button
                type="button"
                onClick={() => openModalAt('custom_pine')}
                className="px-2.5 py-1.5 rounded-lg bg-[#089981]/15 hover:bg-[#089981]/25 border border-[#089981]/40 text-[#22ab94] text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{isKm ? '+ បង្កើត Pine Script' : '+ Custom Pine'}</span>
              </button>

              <span className="hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-mono whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>Administrator Unlocked</span>
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#131722] border border-[#2a2e39] text-[#787b86] text-[11px] font-mono rounded-lg whitespace-nowrap">
              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
              <span>
                {isKm
                  ? 'បន្ថែម Indicator: សម្រាប់តែ Administrator'
                  : 'Add Indicators: Administrator Only'}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Live TradingView Advanced Candlestick Chart Canvas */}
      <div className="relative w-full h-[520px] bg-[#131722]">
        <div ref={containerRef} className="tradingview-widget-container w-full h-full" />

        {/* Active Custom Pine Script Strategy HUD (Bottom-Left) */}
        {activeCustomPineIndicators.length > 0 && (
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none flex flex-col gap-1.5 max-w-xs">
            {activeCustomPineIndicators.map(pineInd => (
              <div
                key={pineInd.id}
                className="px-2.5 py-1.5 rounded-lg bg-[#1e222d]/90 backdrop-blur-md border border-[#2a2e39] text-[11px] font-mono text-[#d1d4dc] flex items-center gap-2 shadow-lg"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: pineInd.color }}
                />
                <span className="font-bold text-white">{pineInd.shortName}</span>
                <span className="text-[#089981]">Pine v5 Active</span>
                <span className="text-[#787b86]">· {symbol}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Administrator Indicator & Pine Script Modal */}
      {canManage && onAddIndicator && onUpdateIndicator && onDeleteIndicator && (
        <TradingViewIndicatorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          lang={lang}
          indicators={allIndicators}
          onAddIndicator={onAddIndicator}
          onUpdateIndicator={onUpdateIndicator}
          onDeleteIndicator={onDeleteIndicator}
          adminActorLabel={adminActorLabel}
          initialTab={modalInitialTab}
          initialEditingId={modalEditId}
        />
      )}
    </div>
  );
};
