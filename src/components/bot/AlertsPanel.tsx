import React from 'react';
import { TradeAlert, Language } from '../../types/tradingBot';
import { Bell, Volume2, VolumeX, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AlertsPanelProps {
  alerts: TradeAlert[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  decimals?: number;
  lang: Language;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  soundEnabled,
  onToggleSound,
  decimals = 2,
  lang
}) => {
  const isKhmer = lang === 'km';

  return (
    <div className="flex flex-col gap-5 text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0d121c] border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-semibold text-white">
            {isKhmer
              ? 'ការជូនដំណឹងសញ្ញាផ្ទាល់ (Instant Signal Alerts Feed)'
              : 'Real-Time Bot & LuxAlgo Signal Alerts'}
          </h3>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            ({alerts.length} {isKhmer ? 'សញ្ញា' : 'signals'})
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
            soundEnabled
              ? 'bg-teal-950/60 border-teal-800 text-teal-300 hover:bg-teal-900/60'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'សំឡេងជូនដំណឹង: បើក' : 'Sound: ON'}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'សំឡេងជូនដំណឹង: បិទ' : 'Sound: OFF'}</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 bg-[#0d121c] border border-slate-800 rounded-xl">
            {isKhmer
              ? 'កំពុងតាមដានទីផ្សារផ្ទាល់... នៅពេលសញ្ញា BUY ឬ SELL ចេញ វានឹងបង្ហាញនៅទីនេះភ្លាមៗ!'
              : 'Monitoring live ticks... As soon as a BUY or SELL signal triggers, it will appear here instantly.'}
          </div>
        ) : (
          alerts.map(al => {
            const isBuy = al.type === 'BUY';
            const timeStr = new Date(al.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            const dateStr = new Date(al.time).toLocaleDateString([], {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={al.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isBuy
                    ? 'bg-teal-950/20 border-teal-800/70'
                    : 'bg-rose-950/20 border-rose-800/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isBuy
                        ? 'bg-teal-900/60 text-teal-300'
                        : 'bg-rose-900/60 text-rose-300'
                    }`}
                  >
                    {isBuy ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums">
                      <span
                        className={`text-xs font-bold ${
                          isBuy ? 'text-teal-300' : 'text-rose-300'
                        }`}
                      >
                        {al.type} SIGNAL
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="font-bold text-white text-sm">{al.symbol}</span>
                      <span className="text-xs text-slate-400">[{al.timeframe}]</span>
                    </div>

                    <div className="text-xs text-slate-300 mt-1 font-mono tabular-nums">
                      {isKhmer
                        ? `សញ្ញាស្វ័យប្រវត្តិ: ចូល @ $${al.entryPrice.toFixed(decimals)}`
                        : `Instant Signal: Entry @ $${al.entryPrice.toFixed(decimals)}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                  <div className="flex flex-col items-end">
                    <span className="text-rose-400">
                      SL: ${al.slPrice.toFixed(decimals)}
                    </span>
                    <span className="text-emerald-400">
                      TP: ${al.tpPrice.toFixed(decimals)}
                    </span>
                  </div>
                  <div className="text-right text-slate-400 text-[11px] border-l border-slate-800 pl-4">
                    <div>{timeStr}</div>
                    <div>{dateStr}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
