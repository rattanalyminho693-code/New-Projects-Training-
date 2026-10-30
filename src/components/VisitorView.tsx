import React from 'react';
import { Language, MembershipPlan, TradingSignal } from '../types';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Check, 
  ArrowRight, 
  Cpu, 
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface VisitorViewProps {
  lang: Language;
  plans: MembershipPlan[];
  signals: TradingSignal[];
  onSelectPlan: (plan: MembershipPlan) => void;
  onOpenArchitecture: () => void;
  onOpenWebhookTester: () => void;
  autoApproveEnabled?: boolean;
}

export const VisitorView: React.FC<VisitorViewProps> = ({
  lang,
  plans,
  signals,
  onSelectPlan,
  onOpenArchitecture,
  onOpenWebhookTester,
  autoApproveEnabled = true
}) => {
  const isKm = lang === 'km';

  const liveTickers = [
    { symbol: 'XAUUSD', name: 'Gold Spot', price: '2,384.80', change: '+1.42%', up: true },
    { symbol: 'BTCUSD', name: 'Bitcoin', price: '67,850.00', change: '+2.18%', up: true },
    { symbol: 'EURUSD', name: 'Euro / USD', price: '1.0865', change: '-0.14%', up: false },
    { symbol: 'US30', name: 'Dow Jones', price: '39,240.00', change: '+0.65%', up: true },
    { symbol: 'GBPUSD', name: 'British Pound', price: '1.2725', change: '+0.21%', up: true }
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Realtime Live Ticker Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 overflow-x-auto">
        <div className="flex items-center justify-between gap-6 min-w-max text-xs">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {isKm ? 'ទីផ្សារផ្ទាល់ (Live Markets):' : 'Live Markets:'}
          </span>
          <div className="flex items-center gap-6">
            {liveTickers.map((t) => (
              <div key={t.symbol} className="flex items-center gap-2 font-mono">
                <span className="text-white font-bold">{t.symbol}</span>
                <span className="text-slate-300 tabular-nums">{t.price}</span>
                <span className={`text-[11px] font-semibold tabular-nums ${t.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono tracking-wide">
            <span>TradingView Pine Script</span>
            <span aria-hidden="true">·</span>
            <span>Automated Webhook HTTPS</span>
            <span aria-hidden="true">·</span>
            <span>VIP Channel</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight" style={{ textWrap: 'balance' }}>
            {isKm ? (
              <>
                ទទួល <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Trading Signals គុណភាពខ្ពស់</span> ផ្ទាល់ពី TradingView ស្វ័យប្រវត្តិ
              </>
            ) : (
              <>
                Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Trading Signals</span> Direct from TradingView
              </>
            )}
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
            {isKm 
              ? 'ប្រព័ន្ធស្វ័យប្រវត្តិកម្មកម្រិតខ្ពស់ដែលទទួល Alert ពី Pine Script តាមរយៈ HTTPS Webhook ផ្ទៀងផ្ទាត់កូដសម្ងាត់ ការពារទិន្នន័យស្ទួន និងបញ្ជូនចំណុចទិញ-លក់ Entry, Stop Loss, និង Take Profit ដល់សមាជិក VIP ភ្លាមៗ។'
              : 'Enterprise-grade trading infrastructure connecting TradingView Pine Script alerts to VIP members with automated cryptographic validation, deduplication filters, and sub-second signal delivery.'}
          </p>

          {/* Social Proof & Quantitative Proof */}
          <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-800 text-slate-300">
            <div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">84.6%</div>
              <div className="text-xs text-slate-400 mt-0.5">{isKm ? 'អត្រាឈ្នះ (Win Rate)' : 'Verified Win Rate'}</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">+4,280</div>
              <div className="text-xs text-slate-400 mt-0.5">{isKm ? 'Pips ប្រចាំខែ' : 'Monthly Pips'}</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-sky-400 font-mono tabular-nums">1,280+</div>
              <div className="text-xs text-slate-400 mt-0.5">{isKm ? 'សមាជិក VIP' : 'Active VIP Traders'}</div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#pricing-section"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{isKm ? 'មើលតម្លៃ និងចូលរួម VIP' : 'Explore VIP Memberships'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenArchitecture}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>{isKm ? 'មើលដ្យាក្រាមលំហូរប្រព័ន្ធ' : 'System Flowchart'}</span>
            </button>
          </div>
        </div>

        {/* Hero Visual: High-Fidelity Generated Terminal Image */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
            <img
              src="/src/assets/images/trading_charts_dashboard_1792849367121.jpg"
              alt="TradingView Trading Terminal and Charts"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">{isKm ? 'ប្រភព Signal' : 'Signal Engine'}</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>TradingView Webhook Integration</span>
                </div>
              </div>
              <button
                onClick={onOpenWebhookTester}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors"
              >
                {isKm ? 'សាកល្បង' : 'Test Webhook'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blurred VIP Signal Preview for Visitors */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              {isKm ? 'ការផ្សាយ Signal ផ្ទាល់' : 'Live Signal Feed Preview'}
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              {isKm ? 'Signal ជាក់ស្តែងក្នុងប្រព័ន្ធ (គំរូសម្រាប់ទស្សនា)' : 'Recent Signals Stream'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isKm 
                ? 'សមាជិក VIP ទទួលបានទិន្នន័យពេញលេញ (Entry, SL, TP1, TP2, TP3)។ អ្នកទស្សនាអាចមើលត្រឹមតែព័ត៌មានទូទៅ។'
                : 'VIP members get instant uncensored access. Standard visitors view blurred teaser data.'}
            </p>
          </div>

          <a
            href="#pricing-section"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{isKm ? 'ដោះសោ Signal ទាំងអស់ឥឡូវនេះ' : 'Unlock Full VIP Signals'}</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {signals.slice(0, 3).map((sig) => {
            const isBuy = sig.action === 'BUY';
            return (
              <div
                key={sig.id}
                className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden transition-all hover:border-slate-700"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">{sig.timeframe} · {sig.source}</span>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2 mt-0.5">
                      <span>{sig.ticker}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {sig.action}
                      </span>
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Body with intentional blur for non-VIP visitor */}
                <div className="py-4 space-y-2 relative">
                  <div className="filter blur-sm select-none opacity-50 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entry Price:</span>
                      <span className="text-white font-bold">{sig.entryPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stop Loss:</span>
                      <span className="text-rose-400">{sig.sl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target TP1:</span>
                      <span className="text-emerald-400">{sig.tp1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target TP2:</span>
                      <span className="text-emerald-400">{sig.tp2}</span>
                    </div>
                  </div>

                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-lg">
                    <Lock className="w-6 h-6 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-white text-center">
                      {isKm ? 'ទិន្នន័យត្រូវបានចាក់សោសម្រាប់ VIP' : 'VIP Locked Signal'}
                    </span>
                    <span className="text-[11px] text-slate-300 text-center mt-0.5">
                      {isKm ? 'ចុះឈ្មោះ ឬបង់ប្រាក់ដើម្បីមើល' : 'Upgrade to view entry & target levels'}
                    </span>
                  </div>
                </div>

                {/* Footer status */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate max-w-[180px]">{sig.strategy}</span>
                  <span className="font-mono text-amber-400 font-semibold">{sig.riskReward} R:R</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing & Membership Section (Mandatory Visitor Feature: មើលតម្លៃសមាជិក) */}
      <section id="pricing-section" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono tracking-wider text-amber-400">
            {isKm ? 'កញ្ចប់តម្លៃសមាជិកភាព VIP' : 'VIP Membership Pricing'}
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isKm ? 'ជ្រើសរើសកញ្ចប់ VIP របស់អ្នក' : 'Select Your VIP Plan'}
          </h2>
          <p className="text-sm text-slate-400">
            {autoApproveEnabled
              ? isKm
                ? 'ស្កេនបាញ់ប្រាក់តាម ABA KHQR, Bakong QR ឬ USDT TRC-20 រួចរាល់ ប្រព័ន្ធ Approve Auto នឹងបើកសិទ្ធិ VIP ជូនអ្នកភ្លាមៗដោយស្វ័យប្រវត្តិ!'
                : 'Scan via ABA KHQR, Bakong QR, or USDT TRC-20 for instant automatic VIP activation (Auto-Approve).'
              : isKm
              ? 'ទទួលយកការទូទាត់ងាយស្រួលតាម ABA Bank KHQR, Bakong KHQR និង USDT TRC-20 ជាមួយការផ្ទៀងផ្ទាត់រហ័ស។'
              : 'Instant activation via ABA Bank KHQR, Bakong QR, and USDT TRC20 with prompt admin verification.'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isPopular = p.popular;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  isPopular
                    ? 'bg-slate-900 border-2 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[11px] rounded-full uppercase tracking-wider shadow-md">
                    {isKm ? 'ពេញនិយមបំផុត (Best Value)' : 'Most Popular'}
                  </div>
                )}

                <div>
                  <div className="text-xs text-slate-400 font-medium">
                    {isKm ? p.targetAudienceKm : p.targetAudience}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {isKm ? p.nameKm : p.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-4 pb-4 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white font-mono tabular-nums">
                        ${p.price}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {isKm ? p.billingPeriodKm : p.billingPeriod}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {isKm ? `ស្មើនឹងប្រហែល ~${(p.price * 4080).toLocaleString()} រៀល (KHR)` : `Approx. ~${(p.price * 4080).toLocaleString()} KHR`}
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="py-5 space-y-3">
                    {(isKm ? p.featuresKm : p.features).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button to register/pay */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => onSelectPlan(p)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>
                      {autoApproveEnabled
                        ? isKm
                          ? 'ជ្រើសរើសកញ្ចប់ & បាញ់ប្រាក់ (Approve Auto)'
                          : 'Select Plan & Auto-Approve'
                        : isKm
                        ? 'ជ្រើសរើសកញ្ចប់ និងបង់ប្រាក់'
                        : 'Select Plan & Proceed'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Methods Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{isKm ? 'វិធីសាស្ត្រទូទាត់ប្រាក់:' : 'Supported Payment Methods:'}</span>
            <span>ABA Bank Mobile KHQR</span>
            <span>·</span>
            <span>Bakong National QR</span>
            <span>·</span>
            <span>USDT (TRC-20 Network)</span>
          </div>
          <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>
              {autoApproveEnabled
                ? isKm
                  ? 'ប្រព័ន្ធ Approve Auto បើកដំណើរការ ២៤/៧ — បាញ់ប្រាក់រួច បើកសិទ្ធិ VIP ភ្លាមៗ'
                  : '24/7 Auto-Approve Active — Instant VIP Unlock upon Transfer'
                : isKm
                ? 'ផ្ទៀងផ្ទាត់ដោយផ្ទាល់ពី Admin ក្នុងរយៈពេល ២-១០ នាទី'
                : 'Fast Admin verification within 2-10 mins'}
            </span>
          </div>
        </div>
      </section>

      {/* How the System Works (Mermaid Pipeline Explained) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-sky-400 uppercase tracking-wider">
              {isKm ? 'របៀបដំណើរការប្រព័ន្ធ' : 'Automated Workflow Pipeline'}
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              {isKm ? 'ពី TradingView Alert រហូតដល់ VIP Dashboard' : 'From TradingView Alert to VIP Terminal'}
            </h2>
          </div>
          <button
            onClick={onOpenArchitecture}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-2 self-start transition-colors"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>{isKm ? 'មើលដ្យាក្រាមពេញលេញ' : 'View Full Diagram'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-amber-400 font-bold">01. Pine Script Alert</div>
            <div className="text-sm font-semibold text-white">TradingView Strategy</div>
            <div className="text-xs text-slate-400">
              {isKm ? 'យុទ្ធសាស្ត្រជួញដូរវិភាគតម្លៃ និងបង្កើត Alert BUY/SELL' : 'Calculates technical edge and triggers alert event.'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-sky-400 font-bold">02. Webhook HTTPS</div>
            <div className="text-sm font-semibold text-white">Encrypted Payload</div>
            <div className="text-xs text-slate-400">
              {isKm ? 'បញ្ជូនទិន្នន័យ JSON ដោយសុវត្ថិភាពខ្ពស់មកកាន់ Server' : 'Dispatches secure JSON payload to webhook receiver.'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-indigo-400 font-bold">03. Validate & Dedup</div>
            <div className="text-sm font-semibold text-white">Security & Duplicate Filter</div>
            <div className="text-xs text-slate-400">
              {isKm ? 'ផ្ទៀងផ្ទាត់ Secret Token និងច្រោះចោល Signal ស្ទួន' : 'Authenticates secret token and suppresses duplicates.'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-emerald-400 font-bold">04. VIP Broadcast</div>
            <div className="text-sm font-semibold text-white">Instant Audio Alert</div>
            <div className="text-xs text-slate-400">
              {isKm ? 'បង្ហាញ Signal ពេញលេញជូន VIP ជាមួយសំឡេងជូនដំណឹង' : 'Delivers actionable trade parameters with live chime.'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
