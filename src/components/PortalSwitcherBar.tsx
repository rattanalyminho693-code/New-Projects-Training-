import React from 'react';
import { Language, Role, StaffAccount, UserAccount } from '../types';
import { POSITION_DEFINITIONS } from '../data/mockData';
import {
  TrendingUp,
  User,
  ShieldCheck,
  Globe,
  Eye,
  UserCheck,
  Crown,
  LayoutDashboard,
  Sliders,
  Cpu,
  LogOut,
  Bot
} from 'lucide-react';

export type PortalMode = 'customer' | 'management';
export type ManagementWorkspaceTab = 'erp' | 'admin_ops' | 'webhook';

interface PortalSwitcherBarProps {
  portalMode: PortalMode;
  onSelectPortal: (portal: PortalMode) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  // Customer Portal context
  isCustomerAuthOpen: boolean;
  authenticatedCustomer: UserAccount | null;
  customerRole: Role;
  onSelectCustomerRole: (role: 'visitor' | 'member' | 'vip') => void;
  onOpenCustomerAuth: () => void;
  onOpenMT5Modal?: () => void;
  // Management Portal context
  loggedInStaff: StaffAccount | null;
  managementTab: ManagementWorkspaceTab;
  onSelectManagementTab: (tab: ManagementWorkspaceTab) => void;
  onLogoutStaff: () => void;
  pendingAlertCount: number;
}

export const PortalSwitcherBar: React.FC<PortalSwitcherBarProps> = ({
  portalMode,
  onSelectPortal,
  lang,
  setLang,
  isCustomerAuthOpen,
  authenticatedCustomer,
  customerRole,
  onSelectCustomerRole,
  onOpenCustomerAuth,
  onOpenMT5Modal,
  loggedInStaff,
  managementTab,
  onSelectManagementTab,
  onLogoutStaff,
  pendingAlertCount
}) => {
  const isKm = lang === 'km';

  return (
    <div className="bg-slate-950 border-b border-slate-800/90 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Dual-Portal Segmented Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0 pr-2 border-r border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              AlphaSignal<span className="text-amber-500">.VIP</span>
            </span>
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => onSelectPortal('customer')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                portalMode === 'customer'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {isKm ? '១. ផ្ទាំងសម្រាប់អតិថិជន (Customer)' : '1. Customer Portal'}
              </span>
              {authenticatedCustomer && (
                <span
                  className={`font-mono text-[11px] ${
                    portalMode === 'customer' ? 'text-slate-900' : 'text-emerald-400'
                  }`}
                >
                  · ✓
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectPortal('management')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                portalMode === 'management'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {isKm ? '២. ផ្ទាំងសម្រាប់អ្នកគ្រប់គ្រង (Management)' : '2. Management Portal'}
              </span>
              {pendingAlertCount > 0 && (
                <span
                  className={`font-mono tabular-nums text-[11px] font-bold ${
                    portalMode === 'management' ? 'text-slate-950' : 'text-amber-400'
                  }`}
                >
                  ({pendingAlertCount})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Portal-Scoped Contextual Controls + Language Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Contextual controls ONLY when inside Customer Workspace */}
          {portalMode === 'customer' && !isCustomerAuthOpen && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenCustomerAuth}
                className="px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isKm ? 'ផ្ទាំង Login & Sign Up' : 'Login & Sign Up'}</span>
              </button>

              <div className="hidden sm:inline-flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 gap-0.5">
                {(
                  [
                    { id: 'visitor' as const, labelKm: 'Visitor', labelEn: 'Visitor', icon: Eye },
                    { id: 'member' as const, labelKm: 'Member', labelEn: 'Member', icon: UserCheck },
                    { id: 'vip' as const, labelKm: 'VIP', labelEn: 'VIP', icon: Crown }
                  ]
                ).map(item => {
                  const Icon = item.icon;
                  const active = customerRole === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectCustomerRole(item.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-slate-800 text-amber-400 border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{isKm ? item.labelKm : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              {onOpenMT5Modal && (
                <button
                  type="button"
                  onClick={onOpenMT5Modal}
                  className="px-2.5 py-1.5 rounded-lg border border-teal-500/40 bg-teal-950/40 text-teal-300 hover:bg-teal-900/50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Bot className="w-3.5 h-3.5 text-teal-400" />
                  <span>MT5 Auto</span>
                </button>
              )}
            </div>
          )}

          {/* Contextual controls ONLY when Authenticated inside Management Portal */}
          {portalMode === 'management' && loggedInStaff && (
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 gap-0.5">
                <button
                  type="button"
                  onClick={() => onSelectManagementTab('erp')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                    managementTab === 'erp'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{isKm ? 'ប្រព័ន្ធ ERP & បុគ្គលិក' : 'ERP Management'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectManagementTab('admin_ops')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                    managementTab === 'admin_ops'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isKm ? 'ផ្ទាំង Admin រហ័ស' : 'Admin Desk'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectManagementTab('webhook')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                    managementTab === 'webhook'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{isKm ? 'TradingView & Indicators' : 'TradingView & Indicators'}</span>
                </button>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono tabular-nums text-sky-300 whitespace-nowrap shrink-0">
                {loggedInStaff.staffCode} · {POSITION_DEFINITIONS[loggedInStaff.position].shortTitle}
              </div>

              <button
                type="button"
                onClick={onLogoutStaff}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold text-rose-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title={isKm ? 'ចាកចេញពីផ្ទាំងអ្នកគ្រប់គ្រង' : 'Sign Out Management Portal'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isKm ? 'ចាកចេញ' : 'Logout'}</span>
              </button>
            </div>
          )}

          {/* Global Language Toggle */}
          <button
            type="button"
            onClick={() => setLang(isKm ? 'en' : 'km')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{isKm ? 'EN' : 'ខ្មែរ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
