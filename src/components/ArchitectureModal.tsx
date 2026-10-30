import React from 'react';
import { Language } from '../types';
import { X, CheckCircle2, ShieldAlert, ArrowRight, Zap, Database, Lock, Eye } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenWebhookTester: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenWebhookTester
}) => {
  if (!isOpen) return null;
  const isKm = lang === 'km';

  const pipelineSteps = [
    {
      num: '01',
      titleKm: 'TradingView Pine Script',
      titleEn: 'TradingView Pine Script',
      descKm: 'សរសេរ Code Strategy/Indicator (ឧ. EMA Cross, OrderBlock, RSI Breakout) ក្នុង TradingView Pine Script v5។',
      descEn: 'Write strategy or custom indicator logic in TradingView Pine Script v5.',
      icon: Zap,
      color: 'text-amber-400 bg-amber-400/10'
    },
    {
      num: '02',
      titleKm: 'BUY / SELL Alert Trigger',
      titleEn: 'BUY / SELL Alert Trigger',
      descKm: 'នៅពេលលក្ខខណ្ឌជួញដូរផ្ទៀងផ្ទាត់ត្រឹមត្រូវ Alert នឹងបង្កើតឡើងដោយស្វ័យប្រវត្តិនឹងបាញ់ JSON Payload។',
      descEn: 'When entry conditions trigger, an automated alert fires containing price, SL, and TP targets.',
      icon: ArrowRight,
      color: 'text-emerald-400 bg-emerald-400/10'
    },
    {
      num: '03',
      titleKm: 'Webhook HTTPS Request',
      titleEn: 'Webhook HTTPS Request',
      descKm: 'TradingView បញ្ជូន HTTP POST Request មកកាន់ HTTPS Server Webhook Endpoint របស់ប្រព័ន្ធ។',
      descEn: 'TradingView dispatches an encrypted HTTPS POST payload to our server endpoint.',
      icon: ArrowRight,
      color: 'text-sky-400 bg-sky-400/10'
    },
    {
      num: '04',
      titleKm: 'Validate Secret (សុវត្ថិភាព)',
      titleEn: 'Validate Secret Token',
      descKm: 'ផ្ទៀងផ្ទាត់ Secret Token ក្នុង Payload។ ប្រសិនបើខុស នឹងច្រានចោល (Reject Request 401 Unauthorized)។',
      descEn: 'Check incoming token against Admin API secret. If invalid, reject request with 401.',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-400/10'
    },
    {
      num: '05',
      titleKm: 'Validate Signal & Check Duplicate',
      titleEn: 'Validate Data & Duplicate Filter',
      descKm: 'ពិនិត្យទិន្នន័យ (Ticker, Entry, TP, SL) និងចម្រោះ Signal ស្ទួនក្នុងរយៈពេលកំណត់ (Ignore Duplicate)។',
      descEn: 'Verify signal parameters and suppress repetitive duplicate signals within timeframe window.',
      icon: CheckCircle2,
      color: 'text-indigo-400 bg-indigo-400/10'
    },
    {
      num: '06',
      titleKm: 'Save to Database & Update VIP',
      titleEn: 'Save DB & Update VIP Dashboard',
      descKm: 'កត់ត្រាទិន្នន័យក្នុង Database និងផ្សាយបន្តផ្ទាល់ភ្លាមៗ (Realtime Broadcast) ទៅកាន់ផ្ទាំងគ្រប់គ្រង។',
      descEn: 'Persist valid signal and broadcast instantly to VIP dashboard channels with audio chime.',
      icon: Database,
      color: 'text-purple-400 bg-purple-400/10'
    },
    {
      num: '07',
      titleKm: 'Check Member Access (សិទ្ធិមើល)',
      titleEn: 'Check Member Access',
      descKm: 'សមាជិក VIP Active នឹងឃើញទិន្នន័យពេញលេញ (Display Signal)។ អ្នកមិនទាន់ VIP នឹងលាក់ព័ត៌មាន (Hide VIP Signal)។',
      descEn: 'Active VIP members receive instant entry/TP/SL. Standard visitors & unpaid members see blurred preview.',
      icon: Lock,
      color: 'text-teal-400 bg-teal-400/10'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-amber-400">
              {isKm ? 'ស្ថាបត្យកម្មប្រព័ន្ធ' : 'System Architecture Flowchart'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {isKm 
                ? 'លំហូរការងារ TradingView Webhook ទៅកាន់ VIP Member' 
                : 'TradingView Webhook to VIP Member Flow'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 2-Column layout with diagram image + explained steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
          {/* Left Column: Mermaid diagram image uploaded by user */}
          <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5 self-start">
              <Eye className="w-4 h-4 text-amber-400" />
              {isKm ? 'ដ្យាក្រាមដើមរបស់គម្រោង (Mermaid Flowchart):' : 'Original Workflow Diagram:'}
            </span>
            
            <div className="w-full bg-slate-900/50 rounded-lg p-2 border border-slate-800 flex justify-center">
              <img
                src="/public/assets/aistudio/mermaid-diagram_b3969f73.png"
                alt="TradingView Webhook Flowchart"
                referrerPolicy="no-referrer"
                className="max-h-[500px] w-auto object-contain rounded"
              />
            </div>
            
            <button
              onClick={() => {
                onClose();
                onOpenWebhookTester();
              }}
              className="w-full mt-4 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{isKm ? 'សាកល្បងដំណើរការ Simulator នេះ' : 'Test Live Webhook Simulator'}</span>
            </button>
          </div>

          {/* Right Column: Step by step breakdown */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">
              {isKm ? 'ការពន្យល់ជំហាននីមួយៗក្នុងប្រព័ន្ធ' : 'Detailed Pipeline Stages'}
            </h3>

            <div className="space-y-2.5">
              {pipelineSteps.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.num}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex gap-3.5"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500">{s.num}</span>
                        <h4 className="text-xs font-semibold text-white">
                          {isKm ? s.titleKm : s.titleEn}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {isKm ? s.descKm : s.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-medium">✓ HTTPS Webhook Ready</span>
            <span>·</span>
            <span>Secret SHA-256 Auth</span>
            <span>·</span>
            <span>Zero Duplicates Filter</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors font-medium"
          >
            {isKm ? 'បិទផ្ទាំង' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
