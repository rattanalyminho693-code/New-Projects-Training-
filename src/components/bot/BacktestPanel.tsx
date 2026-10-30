import React, { useState } from 'react';
import { BacktestMetrics, Trade, TradeStatus, Language } from '../../types/tradingBot';
import {
  TrendingUp,
  Target,
  Percent,
  BarChart3,
  Clock,
  Award,
  Download
} from 'lucide-react';

interface BacktestPanelProps {
  metrics: BacktestMetrics;
  trades: Trade[];
  onSelectTrade?: (entryIndex: number) => void;
  decimals?: number;
  symbol: string;
  lang: Language;
}

export const BacktestPanel: React.FC<BacktestPanelProps> = ({
  metrics,
  trades,
  onSelectTrade,
  decimals = 2,
  symbol,
  lang
}) => {
  const isKhmer = lang === 'km';
  const [filter, setFilter] = useState<'ALL' | TradeStatus>('ALL');

  const filteredTrades = trades
    .filter(t => (filter === 'ALL' ? true : t.status === filter))
    .slice()
    .reverse();

  const exportCsv = () => {
    const headers = [
      'ID',
      'Symbol',
      'Type',
      'EntryTime',
      'EntryPrice',
      'StopLoss',
      'TakeProfit',
      'ExitPrice',
      'Status',
      'R_Multiple',
      'PnL_Percent',
      'DurationBars'
    ];
    const rows = trades.map(t => [
      t.id,
      symbol,
      t.type,
      new Date(t.entryTime).toISOString(),
      t.entryPrice.toFixed(decimals),
      t.slPrice.toFixed(decimals),
      t.tpPrice.toFixed(decimals),
      (t.exitPrice ?? t.entryPrice).toFixed(decimals),
      t.status,
      t.rMultiple.toFixed(2),
      t.pnlPercent.toFixed(2),
      t.durationBars
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LuxAlgo_Bot_Backtest_${symbol.replace('/', '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5 text-slate-200">
      {/* 6 Quantitative Backtest KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="p-3.5 bg-[#0d121c] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isKhmer ? 'អត្រាឈ្នះ (Win Rate)' : 'Win Rate'}</span>
            <Target className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-teal-400 mt-1">
            {metrics.winRate}%
          </div>
          <div className="text-[11px] font-mono tabular-nums text-slate-400 mt-0.5">
            {metrics.winCount}W / {metrics.lossCount}L
          </div>
        </div>

        <div className="p-3.5 bg-[#0d121c] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Profit Factor</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {metrics.profitFactor}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {metrics.profitFactor >= 1.5
              ? isKhmer
                ? 'ល្អប្រសើរ'
                : 'Strong Edge'
              : isKhmer
              ? 'មធ្យម'
              : 'Moderate'}
          </div>
        </div>

        <div className="p-3.5 bg-[#0d121c] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isKhmer ? 'ផលចំណេញសុទ្ធ' : 'Net Return (R)'}</span>
            <Percent className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div
            className={`text-xl font-bold font-mono tabular-nums mt-1 ${
              metrics.netR >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {metrics.netR >= 0 ? '+' : ''}
            {metrics.netR} R
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono tabular-nums">
            Avg: {metrics.avgR >= 0 ? '+' : ''}
            {metrics.avgR} R
          </div>
        </div>

        <div className="p-3.5 bg-[#0d121c] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isKhmer ? 'ការខាតអតិបរមា' : 'Max Drawdown'}</span>
            <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-400 mt-1">
            -{metrics.maxDrawdownR} R
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {isKhmer ? 'កម្រិតសុវត្ថិភាពទុន' : 'Peak-to-valley R'}
          </div>
        </div>

        <div className="p-3.5 bg-[#0d121c] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isKhmer ? 'ចំនួនសរុប' : 'Total Trades'}</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {metrics.totalTrades}
          </div>
          <div className="text-[11px] font-mono tabular-nums text-slate-400 mt-0.5">
            {metrics.openCount} {isKhmer ? 'កំពុងដំណើរការ' : 'open'}
          </div>
        </div>

        <div className="p-3.5 bg-[#0d121c] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isKhmer ? 'ល្អ / អន់បំផុត' : 'Best / Worst'}</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-bold font-mono tabular-nums text-slate-200 mt-1.5">
            <span className="text-emerald-400">+{metrics.bestTradeR}R</span> /{' '}
            <span className="text-rose-400">{metrics.worstTradeR}R</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {isKhmer ? 'ទិន្នន័យជាក់ស្ដែង' : 'Historical R-dist'}
          </div>
        </div>
      </div>

      {/* Cumulative R Equity Curve */}
      <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-white">
            {isKhmer
              ? 'ក្រាហ្វិកកំណើនទុន (Cumulative R Equity Curve)'
              : 'Cumulative Strategy Equity Curve (R Multiples)'}
          </div>
          <div className="text-[11px] font-mono tabular-nums text-slate-400">
            {Math.max(0, metrics.equityCurve.length - 1)}{' '}
            {isKhmer ? 'បញ្ជាជួញដូរ' : 'trades evaluated'}
          </div>
        </div>

        {metrics.equityCurve.length > 1 ? (
          <div className="h-32 w-full pt-2">
            <svg
              viewBox="0 0 1000 110"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {(() => {
                const points = metrics.equityCurve;
                const rValues = points.map(p => p.cumulativeR);
                const minVal = Math.min(0, ...rValues);
                const maxVal = Math.max(1, ...rValues);
                const range = maxVal - minVal || 1;
                const svgWidth = 1000;
                const svgHeight = 110;
                const getSvgX = (i: number) => (i / (points.length - 1)) * svgWidth;
                const getSvgY = (v: number) =>
                  svgHeight - ((v - minVal) / range) * (svgHeight - 16) - 8;
                const zeroY = getSvgY(0);
                const pathD = points
                  .map(
                    (p, idx) =>
                      `${idx === 0 ? 'M' : 'L'} ${getSvgX(idx).toFixed(1)} ${getSvgY(
                        p.cumulativeR
                      ).toFixed(1)}`
                  )
                  .join(' ');
                const areaD = `${pathD} L ${svgWidth} ${zeroY.toFixed(1)} L 0 ${zeroY.toFixed(1)} Z`;

                return (
                  <>
                    <line
                      x1="0"
                      y1={zeroY}
                      x2={svgWidth}
                      y2={zeroY}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <path d={areaD} fill="rgba(20, 184, 166, 0.16)" />
                    <path d={pathD} fill="none" stroke="#14b8a6" strokeWidth="2.2" />
                  </>
                );
              })()}
            </svg>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            {isKhmer
              ? 'មិនទាន់មានទិន្នន័យក្រាហ្វិកគ្រប់គ្រាន់'
              : 'Not enough trades to plot equity curve.'}
          </div>
        )}
      </div>

      {/* Trade Log Table */}
      <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {isKhmer
                ? 'ប្រវត្តិសញ្ញាជួញដូរលម្អិត (Backtest Trade History)'
                : 'Executed Signal & Trade Log'}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              ({filteredTrades.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              {(['ALL', 'WIN', 'LOSS', 'OPEN'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    filter === st
                      ? 'bg-slate-800 text-teal-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL'
                    ? isKhmer
                      ? 'ទាំងអស់'
                      : 'All'
                    : st === 'WIN'
                    ? isKhmer
                      ? 'ឈ្នះ (Wins)'
                      : 'Wins'
                    : st === 'LOSS'
                    ? isKhmer
                      ? 'ចាញ់ (Losses)'
                      : 'Losses'
                    : isKhmer
                    ? 'កំពុងរង់ចាំ'
                    : 'Open'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'ទាញយក CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-slate-800/80 rounded-xl bg-[#090d14]">
            {isKhmer ? 'មិនមានទិន្នន័យត្រូវនឹងតម្រងនេះទេ។' : 'No trades match the selected filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">{isKhmer ? 'ពេលវេលា' : 'Time'}</th>
                  <th className="py-2.5 px-3">{isKhmer ? 'ប្រភេទ' : 'Side'}</th>
                  <th className="py-2.5 px-3 text-right">{isKhmer ? 'តម្លៃចូល' : 'Entry'}</th>
                  <th className="py-2.5 px-3 text-right text-rose-400">SL</th>
                  <th className="py-2.5 px-3 text-right text-emerald-400">TP</th>
                  <th className="py-2.5 px-3">{isKhmer ? 'ស្ថានភាព' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-right">R-Multiple</th>
                  <th className="py-2.5 px-3 text-right">P&L %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTrades.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTrade && onSelectTrade(t.entryIndex)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    title={
                      isKhmer
                        ? 'ចុចដើម្បីមើលទីតាំងទានលើក្រាហ្វ'
                        : 'Click to inspect candle on live chart'
                    }
                  >
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(t.entryTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold ${
                          t.type === 'BUY' ? 'text-teal-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      ${t.entryPrice.toFixed(decimals)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-400">
                      ${t.slPrice.toFixed(decimals)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">
                      ${t.tpPrice.toFixed(decimals)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold ${
                          t.status === 'WIN'
                            ? 'text-emerald-400'
                            : t.status === 'LOSS'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        t.rMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.rMultiple >= 0 ? '+' : ''}
                      {t.rMultiple}R
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right ${
                        t.pnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.pnlPercent >= 0 ? '+' : ''}
                      {t.pnlPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
