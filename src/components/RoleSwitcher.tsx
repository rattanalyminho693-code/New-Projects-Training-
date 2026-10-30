import React from 'react';
import { Role, Language, StaffAccount } from '../types';
import { POSITION_DEFINITIONS } from '../data/mockData';
import { Eye, UserCheck, Crown, ShieldAlert, Cpu, KeyRound, Bot } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: Role;
  setRole: (role: Role) => void;
  lang: Language;
  onOpenTradingView: () => void;
  onOpenManagement: () => void;
  onOpenMT5Bot?: () => void;
  onOpenCustomerAuth?: () => void;
  isManagementActive?: boolean;
  loggedInStaff?: StaffAccount | null;
  pendingPaymentCount: number;
  newSignupCount?: number;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  setRole,
  lang,
  onOpenTradingView,
  onOpenManagement,
  onOpenMT5Bot,
  onOpenCustomerAuth,
  isManagementActive = false,
  loggedInStaff = null,
  pendingPaymentCount,
  newSignupCount = 0
}) => {
  const isKm = lang === 'km';

  const roles = [
    {
      id: 'visitor' as Role,
      labelKm: 'Visitor (អ្នកទស្សនា)',
      labelEn: 'Visitor',
      actionKm: 'មើលទំព័រដើម & តម្លៃសមាជិក',
      actionEn: 'View Homepage & Pricing',
      icon: Eye,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
    },
    {
      id: 'member' as Role,
      labelKm: 'Member (សមាជិក)',
      labelEn: 'Member',
      actionKm: 'បង់ប្រាក់ KHQR & មើល Video មេរៀន',
      actionEn: 'Register, Pay & Watch Lessons',
      icon: UserCheck,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'vip' as Role,
      labelKm: 'VIP Member',
      labelEn: 'VIP Member',
      actionKm: 'មើល Signal, MT5 & មេរៀន VIP',
      actionEn: 'Live Signals, MT5 & VIP Lessons',
      icon: Crown,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'admin' as Role,
      labelKm: 'Admin (គ្រប់គ្រង)',
      labelEn: 'Admin',
      actionKm: 'ផ្ទៀងផ្ទាត់ & ចាត់តាំងបុគ្គលិកឆែក',
      actionEn: 'Approve Slips & Assign Staff',
      icon: ShieldAlert,
      badge: pendingPaymentCount + newSignupCount > 0 ? pendingPaymentCount + newSignupCount : undefined,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    }
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs tracking-wide text-slate-400 font-semibold whitespace-nowrap">
            {isKm ? 'តួនាទីអ្នកប្រើប្រាស់ & មុខតំណែងបុគ្គលិក:' : 'Role & Staff Position Simulator:'}
          </span>
        </div>

        {/* Roles segmented buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenCustomerAuth && (
            <button
              onClick={onOpenCustomerAuth}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title={isKm ? 'បើកផ្ទាំង Customer Login & Sign Up (Gmail OTP)' : 'Open Customer Login & Sign Up (Gmail OTP)'}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isKm ? 'Login / Sign Up (Gmail)' : 'Customer Login'}</span>
            </button>
          )}

          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = !isManagementActive && currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? `${r.color} font-semibold ring-1 ring-amber-400/50`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={isKm ? r.actionKm : r.actionEn}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isKm ? r.labelKm : r.labelEn}</span>
                {r.badge !== undefined && (
                  <span className="font-mono tabular-nums text-[11px] font-bold text-rose-400">
                    ({r.badge})
                  </span>
                )}
              </button>
            );
          })}

          {/* Dedicated 5-Position Staff ID & Password Dashboard Management Portal */}
          <button
            onClick={onOpenManagement}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              isManagementActive
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
            title={
              isKm
                ? 'ចូលប្រព័ន្ធ Dashboard Management និងកំណត់ ID & Password តាមមុខតំណែងទាំង ៥'
                : 'Open Dashboard Management & Set Password/ID for Administrator, Editor, Videos Editor, HR & Leadership Finnie'
            }
          >
            <KeyRound className="w-3.5 h-3.5" />
            {loggedInStaff ? (
              <span className="font-mono tabular-nums font-semibold">
                {loggedInStaff.staffCode} · {POSITION_DEFINITIONS[loggedInStaff.position].shortTitle}
              </span>
            ) : (
              <span className="font-semibold">
                {isKm ? 'គ្រប់គ្រងមុខតំណែង (ID & Password)' : 'Staff Portal (ID & Password)'}
              </span>
            )}
          </button>

          {/* Dedicated MT5 & Bot Auto-Trading Engine Button */}
          {onOpenMT5Bot && (
            <button
              onClick={onOpenMT5Bot}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-teal-500/40 bg-teal-950/40 text-teal-300 hover:bg-teal-900/50 hover:text-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title={isKm ? 'បើក MT5 Auto-Trading Engine & Bot Auto Trading' : 'Open MT5 Auto-Trading Engine & Bot Auto Trading'}
            >
              <Bot className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold">MT5 & Bot Auto</span>
            </button>
          )}

          {/* Dedicated TradingView Pine Script Webhook Pipeline Button */}
          <button
            onClick={onOpenTradingView}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50 hover:text-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            title={isKm ? 'TradingView: បង្កើត Alert និងបញ្ជូន Signal Webhook' : 'TradingView: Create Alert & Send Webhook Signal'}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">Webhook</span>
          </button>
        </div>
      </div>
    </div>
  );
};

