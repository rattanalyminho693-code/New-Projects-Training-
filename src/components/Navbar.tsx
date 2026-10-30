import React from 'react';
import { Role, Language, UserAccount } from '../types';
import { Lock, LogOut, User, Zap, CreditCard } from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  setRole: (role: Role) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenArchitecture: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingPaymentCount: number;
  onOpenMT5?: () => void;
  mt5Enabled?: boolean;
  isMT5Authorized?: boolean;
  authenticatedCustomer?: UserAccount | null;
  onOpenCustomerAuth?: () => void;
  onLogoutCustomer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  lang,
  activeTab,
  setActiveTab,
  authenticatedCustomer,
  onOpenCustomerAuth,
  onLogoutCustomer
}) => {
  const isKm = lang === 'km';

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        {/* Zone 1: Customer Portal Context Label */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="text-xs font-bold tracking-wide text-slate-300 hover:text-amber-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {isKm ? 'ម៉ឺនុយអតិថិជន (Customer Menu)' : 'Customer Navigation'}
        </button>

        {/* Zone 2: 5 Purely Customer Navigation Links */}
        <nav className="flex items-center gap-5 sm:gap-7 text-sm font-medium overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'home' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKm ? 'ទំព័រដើម' : 'Home'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentRole === 'visitor') {
                setActiveTab('pricing');
              } else if (currentRole === 'member') {
                setActiveTab('payment');
              } else {
                setActiveTab('signals');
              }
            }}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'signals' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>VIP Signals</span>
            {currentRole !== 'vip' && <Lock className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academy')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'academy' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKm ? 'វីដេអូមេរៀន' : 'Academy'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'chat' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKm ? 'ឆាត Telegram' : 'Community'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'payment' || activeTab === 'pricing'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isKm ? 'កញ្ចប់តម្លៃ & បង់ប្រាក់' : 'Plans & Checkout'}</span>
          </button>
        </nav>

        {/* Zone 3: Customer Account Action Only */}
        <div className="flex items-center gap-2 shrink-0">
          {authenticatedCustomer ? (
            <button
              type="button"
              onClick={onLogoutCustomer}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
              title={isKm ? 'ចាកចេញពីគណនីអតិថិជន' : 'Sign Out Customer Account'}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[120px] truncate">{authenticatedCustomer.name}</span>
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCustomerAuth}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {currentRole === 'vip' ? <Zap className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              <span>{isKm ? 'ចូល / ចុះឈ្មោះ (Gmail)' : 'Customer Login / Sign Up'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
