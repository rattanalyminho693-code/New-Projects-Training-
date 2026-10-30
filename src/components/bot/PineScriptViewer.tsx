import React, { useState } from 'react';
import { Copy, Check, FileCode2, BookOpen, Code2 } from 'lucide-react';
import { Language } from '../../types/tradingBot';
import { SAMPLE_MQL5_EA } from '../../data/mockData';

interface PineScriptViewerProps {
  lang: Language;
}

export const PineScriptViewer: React.FC<PineScriptViewerProps> = ({ lang }) => {
  const isKhmer = lang === 'km';
  const [copied, setCopied] = useState(false);
  const [scriptType, setScriptType] = useState<'pinescript' | 'mql5'>('pinescript');

  const pineScriptCode = `// This work is licensed under a Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) https://creativecommons.org/licenses/by-nc-sa/4.0/
// © LuxAlgo & Modified [Instant / ចេញភ្លាមៗ]
//@version=5
indicator("Pivot Based Buy & Sell with SL/TP [Instant / ចេញភ្លាមៗ]", "LuxAlgo - Buy/Sell SL & TP [Instant]", overlay = true, max_bars_back = 500, max_lines_count = 500)

//------------------------------------------------------------------------------
// Settings / ការកំណត់ល្បឿនសញ្ញា
//-----------------------------------------------------------------------------{
signal_mode = input.string("Fast Pivot (ចេញលឿន 1-Bar)", "Signal Mode / ប្រភេទសញ្ញា", options=["Fast Pivot (ចេញលឿន 1-Bar)", "Instant Breakout (ចេញភ្លាមៗ 0-Bar)", "Classic LuxAlgo (ដើម 24-Bar)"])
left_bars   = input.int(12, minval = 2, maxval = 500, title="Pivot Left Bars (ស្វែងរកកម្រិតទាប/ខ្ពស់)")
right_bars  = input.int(1, minval = 1, maxval = 50, title="Pivot Right Bars (1 = ចេញភ្លាមៗបន្ទាប់ពី 1 ទាន)")
rr_ratio    = input.float(2.0, title="Risk-Reward Ratio (TP multiplier)", minval=0.1)
backpaint   = input(false, tooltip = 'Backpainting offset displayed elements in the past.')

// Style
maxCss = input.color(color.teal, 'Trailing Maximum Color', group = 'Style')
minCss = input.color(color.red , 'Trailing Minimum Color', group = 'Style')
avgCss = input.color(#ff5d00   , 'Trailing Average Color', group = 'Style')
bullFill = input.color(color.new(color.teal,80), 'Uptrend Area', group = 'Style')
bearFill = input.color(color.new(color.red,80) , 'Downtrend Area', group = 'Style')

//-----------------------------------------------------------------------------}
// Calculation
//-----------------------------------------------------------------------------{
var float max = na
var float min = na

effective_right = signal_mode == "Classic LuxAlgo (ដើម 24-Bar)" ? left_bars : right_bars
offset = backpaint ? left_bars : 0

ph = ta.pivothigh(left_bars, effective_right)
pl = ta.pivotlow(left_bars, effective_right)

if ph or pl
    max := high[effective_right]
    min := low[effective_right]

max := math.max(high[offset], max)
min := math.min(low[offset], min)
avg = math.avg(max, min)

//-----------------------------------------------------------------------------}
// Buy & Sell Signals (ចេញភ្លាមៗ)
//-----------------------------------------------------------------------------{
// 1. Pivot Trigger: ពេល right_bars = 1 សញ្ញាចេញភ្លាមៗនៅពេលទានបន្ទាប់បិទ (1-Bar Delay)
is_buy_pivot  = not na(pl)
is_sell_pivot = not na(ph)

// 2. Breakout Trigger: ចេញភ្លាមៗពេលតម្លៃទម្លុះ Trailing Channel (0-Bar Delay)
is_buy_break  = ta.crossover(close, max[1])
is_sell_break = ta.crossunder(close, min[1])

is_buy  = signal_mode == "Instant Breakout (ចេញភ្លាមៗ 0-Bar)" ? is_buy_break  : is_buy_pivot
is_sell = signal_mode == "Instant Breakout (ចេញភ្លាមៗ 0-Bar)" ? is_sell_break : is_sell_pivot

var float entry_price = na
var float sl_price = na
var float tp_price = na

if is_buy
    entry_price := close
    sl_price := signal_mode == "Instant Breakout (ចេញភ្លាមៗ 0-Bar)" ? ta.lowest(low, 5) : low[effective_right]
    if sl_price >= entry_price
        sl_price := entry_price * 0.99
    tp_price := entry_price + (entry_price - sl_price) * rr_ratio
    label.new(bar_index - offset, low, text="BUY\\nEntry: " + str.tostring(entry_price, "#.##") + "\\nSL: " + str.tostring(sl_price, "#.##") + "\\nTP: " + str.tostring(tp_price, "#.##"), color=color.teal, textcolor=color.white, style=label.style_label_up, size=size.small)

if is_sell
    entry_price := close
    sl_price := signal_mode == "Instant Breakout (ចេញភ្លាមៗ 0-Bar)" ? ta.highest(high, 5) : high[effective_right]
    if sl_price <= entry_price
        sl_price := entry_price * 1.01
    tp_price := entry_price - (sl_price - entry_price) * rr_ratio
    label.new(bar_index - offset, high, text="SELL\\nEntry: " + str.tostring(entry_price, "#.##") + "\\nSL: " + str.tostring(sl_price, "#.##") + "\\nTP: " + str.tostring(tp_price, "#.##"), color=color.red, textcolor=color.white, style=label.style_label_down, size=size.small)

// Alert Conditions សម្រាប់ TradingView (ជូនដំណឹងលឿនបំផុត)
alertcondition(is_buy, title="BUY Alert [ចេញភ្លាមៗ]", message="LuxAlgo BUY Signal! Entry: {{close}}")
alertcondition(is_sell, title="SELL Alert [ចេញភ្លាមៗ]", message="LuxAlgo SELL Signal! Entry: {{close}}")

//-----------------------------------------------------------------------------}
// Plots
//-----------------------------------------------------------------------------{
fill_css = fixnan(ph ? bearFill : pl ? bullFill : na)
plot1 = plot(max, 'Trailing Maximum', ph or pl ? na : maxCss, 1, plot.style_linebr, offset = -offset)
plot2 = plot(min, 'Trailing Minimum', ph or pl ? na : minCss, 1, plot.style_linebr, offset = -offset)
plot(avg, 'Average', ph or pl ? na : avgCss, 1, plot.style_linebr, offset = -offset)
fill(plot1, plot2, ph or pl ? na : fill_css)`;

  const activeCode = scriptType === 'pinescript' ? pineScriptCode : SAMPLE_MQL5_EA;

  const handleCopyCode = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(activeCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 text-slate-200">
      {/* Explanation Banner */}
      <div className="p-4 bg-[#0d121c] border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">
              {isKhmer
                ? 'ការណែនាំដំឡើងលើ TradingView និងភ្ជាប់ MT5 / Bot Auto Trading'
                : 'TradingView Pine Script v5 & MetaTrader 5 EA Setup Guide'}
            </h3>
          </div>

          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setScriptType('pinescript')}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer whitespace-nowrap ${
                scriptType === 'pinescript'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pine Script v5 (TradingView)
            </button>
            <button
              type="button"
              onClick={() => setScriptType('mql5')}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer whitespace-nowrap ${
                scriptType === 'mql5'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MQL5 EA (MetaTrader 5)
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isKhmer
            ? 'កូដ Pine Script v5 នេះត្រូវបានកែសម្រួលដើម្បីឱ្យសញ្ញា BUY និង SELL ចេញភ្លាមៗ (1-Bar ឬ 0-Bar Delay) ព្រមទាំងគណនា Stop Loss (SL) និង Take Profit (TP) ដោយស្វ័យប្រវត្តិ និងអាចបញ្ជូន Webhook ទៅកាន់ Bot Auto Trading និង MetaTrader 5 បានភ្លាមៗ។'
            : 'This Pine Script v5 indicator generates instant BUY & SELL signals (1-bar Fast Pivot or 0-bar Channel Breakout) with automated SL/TP brackets ready for webhook dispatch into Bot Auto Trading and MetaTrader 5.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-[#111724] border border-slate-800/80 rounded-lg">
            <span className="text-[11px] font-bold text-teal-400">
              {isKhmer ? '01. ចម្លងកូដស្គ្រីប' : '01. Copy Source Code'}
            </span>
            <p className="text-[11px] text-slate-300 mt-1">
              {isKhmer
                ? 'ចុចប៊ូតុងចម្លងកូដខាងក្រោមសម្រាប់ TradingView Pine Editor ឬ MT5 MetaEditor។'
                : 'Click Copy Code below for TradingView Pine Editor or MT5 MetaEditor.'}
            </p>
          </div>
          <div className="p-3 bg-[#111724] border border-slate-800/80 rounded-lg">
            <span className="text-[11px] font-bold text-teal-400">
              {isKhmer ? '02. ដាក់លើ Chart / Compile' : '02. Add to Chart / Compile'}
            </span>
            <p className="text-[11px] text-slate-300 mt-1">
              {isKhmer
                ? 'បើក Pine Editor លើ TradingView -> Paste -> ចុច "Add to chart"។'
                : 'Paste into TradingView Pine Editor and click "Add to chart" (or Compile in MT5).'}
            </p>
          </div>
          <div className="p-3 bg-[#111724] border border-slate-800/80 rounded-lg">
            <span className="text-[11px] font-bold text-teal-400">
              {isKhmer ? '03. ភ្ជាប់ Alert Webhook' : '03. Connect Alert Webhook'}
            </span>
            <p className="text-[11px] text-slate-300 mt-1">
              {isKhmer
                ? 'ចុច Create Alert -> គូសធីក Webhook URL -> ដាក់ JSON ពីផ្ទាំង Bot Auto Trading!'
                : 'Create Alert -> Enable Webhook URL -> Paste JSON payload from the Bot tab.'}
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex flex-col bg-[#0d121c] border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#090d14] border-b border-slate-800">
          <div className="flex items-center gap-2">
            {scriptType === 'pinescript' ? (
              <FileCode2 className="w-4 h-4 text-teal-400" />
            ) : (
              <Code2 className="w-4 h-4 text-sky-400" />
            )}
            <span className="text-xs font-mono font-semibold text-slate-200">
              {scriptType === 'pinescript'
                ? 'Pivot Based Buy & Sell with SL/TP [Instant / ចេញភ្លាមៗ].pine'
                : 'AlphaSignal_MT5_AutoTrader.mq5'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isKhmer ? 'បានចម្លងរួចរាល់' : 'Code Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>
                  {scriptType === 'pinescript'
                    ? isKhmer
                      ? 'ចម្លងកូដ Pine Script'
                      : 'Copy Pine Script'
                    : isKhmer
                    ? 'ចម្លងកូដ MQL5'
                    : 'Copy MQL5 EA'}
                </span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-[#080c14] font-mono text-xs text-slate-300 overflow-x-auto max-h-[460px] leading-relaxed selection:bg-teal-500/30">
          {activeCode}
        </pre>
      </div>
    </div>
  );
};
