import React, { useState, useEffect } from 'react';
import { IndicatorSettings, SignalMode, Language } from '../../types/tradingBot';
import { Sliders, X, RotateCcw } from 'lucide-react';

interface IndicatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: IndicatorSettings;
  onSave: (newSettings: IndicatorSettings) => void;
  onReset: () => void;
  lang: Language;
}

const SIGNAL_MODES: SignalMode[] = [
  'Fast Pivot (ចេញលឿន 1-Bar)',
  'Instant Breakout (ចេញភ្លាមៗ 0-Bar)',
  'Classic LuxAlgo (ដើម 24-Bar)'
];

export const IndicatorSettingsModal: React.FC<IndicatorSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onReset,
  lang
}) => {
  const [form, setForm] = useState<IndicatorSettings>(settings);
  const isKhmer = lang === 'km';

  useEffect(() => {
    setForm(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0d121c] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">
              {isKhmer
                ? 'ការកំណត់សូចនាករ LuxAlgo [ចេញភ្លាមៗ]'
                : 'LuxAlgo Instant Indicator Settings'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 text-xs overflow-y-auto max-h-[70vh]">
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              {isKhmer ? 'ប្រភេទសញ្ញា (Signal Mode)' : 'Signal Mode'}
            </label>
            <select
              value={form.signalMode}
              onChange={e =>
                setForm({ ...form, signalMode: e.target.value as SignalMode })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-teal-500 focus:outline-none"
            >
              {SIGNAL_MODES.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Pivot Left Bars
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={form.leftBars}
                onChange={e =>
                  setForm({
                    ...form,
                    leftBars: parseInt(e.target.value, 10) || 12
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono tabular-nums text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {isKhmer ? 'លំនាំដើម: 12' : 'Default: 12'}
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Pivot Right Bars
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={form.rightBars}
                onChange={e =>
                  setForm({
                    ...form,
                    rightBars: parseInt(e.target.value, 10) || 1
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono tabular-nums text-xs"
              />
              <span className="text-[10px] text-teal-400 mt-1 block">
                {isKhmer ? '1 = ចេញភ្លាមៗបន្ទាប់ពី 1 ទាន' : '1 = Instant 1-bar confirmation'}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              {isKhmer
                ? 'មេគុណ Risk-Reward Ratio (TP)'
                : 'Risk-Reward Ratio (TP Multiplier)'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={form.rrRatio}
                onChange={e =>
                  setForm({
                    ...form,
                    rrRatio: parseFloat(e.target.value) || 2.0
                  })
                }
                className="w-28 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono tabular-nums text-xs"
              />
              <span className="text-slate-400 text-[11px]">
                {isKhmer
                  ? 'ឧទាហរណ៍: 2.0 (ចំណេញ 2 ដងនៃការកាត់ខាត)'
                  : 'e.g. 2.0 sets TP at 2x SL distance'}
              </span>
            </div>
          </div>

          <label className="flex items-center justify-between pt-2 border-t border-slate-800 cursor-pointer">
            <div>
              <div className="font-medium text-slate-200">Backpaint Offset</div>
              <div className="text-[11px] text-slate-400">
                {isKhmer ? 'បង្ហាញបន្ទាត់ត្រឡប់ទៅអតីតកាល' : 'Offsets trailing lines into past bars'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.backpaint}
              onChange={e => setForm({ ...form, backpaint: e.target.checked })}
              className="w-4 h-4 accent-teal-500 cursor-pointer"
            />
          </label>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-3">
            <span className="font-medium text-slate-200">
              {isKhmer ? 'ពណ៌បន្ទាត់ Channel (Visual Styles)' : 'Channel Line Colors'}
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Trailing Max</span>
                <input
                  type="color"
                  value={form.maxCss}
                  onChange={e => setForm({ ...form, maxCss: e.target.value })}
                  className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Trailing Min</span>
                <input
                  type="color"
                  value={form.minCss}
                  onChange={e => setForm({ ...form, minCss: e.target.value })}
                  className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Trailing Avg</span>
                <input
                  type="color"
                  value={form.avgCss}
                  onChange={e => setForm({ ...form, avgCss: e.target.value })}
                  className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-[#090d14] border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isKhmer ? 'កំណត់លំនាំដើម' : 'Reset Defaults'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
            >
              {isKhmer ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {isKhmer ? 'យល់ព្រមអនុវត្ត' : 'Apply Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
