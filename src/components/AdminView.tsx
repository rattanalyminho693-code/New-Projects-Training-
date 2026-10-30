import React, { useState } from 'react';
import { Language, PaymentRecord, Role, SignalStatus, TradingSignal, UserAccount, VideoLesson, LessonCategory, CustomerRegistrationRecord, StaffAccount, TradingViewIndicator, WebhookLog } from '../types';
import { CustomerPaymentTable } from './CustomerPaymentTable';
import { CustomerSignupAssignmentPanel } from './CustomerSignupAssignmentPanel';
import { TradingViewWebhookSimulator } from './TradingViewWebhookSimulator';
import { 
  LayoutDashboard,
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Eye, 
  UserCheck, 
  Users, 
  Clock, 
  Radio, 
  Key, 
  Sliders, 
  Search, 
  Send,
  Plus,
  RefreshCw,
  Crown,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Activity,
  CreditCard,
  QrCode,
  Zap,
  CheckCircle2,
  AlertCircle,
  Filter,
  BarChart3,
  Film,
  Video,
  Trash2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Lock,
  Unlock,
  Bot,
  Shield
} from 'lucide-react';

interface AdminViewProps {
  lang: Language;
  payments: PaymentRecord[];
  onApprovePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string, reason?: string) => void;
  users: UserAccount[];
  onUpdateUserRole: (userId: string, newRole: Role) => void;
  onExtendVip: (userId: string, days: number) => void;
  onBroadcastManualSignal: (signal: TradingSignal) => void;
  webhookSecret: string;
  setWebhookSecret: (secret: string) => void;
  duplicateWindowSeconds: number;
  setDuplicateWindowSeconds: (sec: number) => void;
  signals?: TradingSignal[];
  onUpdateSignalStatus?: (signalId: string, newStatus: SignalStatus, pips?: number) => void;
  onOpenMT5?: () => void;
  lessons?: VideoLesson[];
  onAddLesson?: (lesson: VideoLesson) => void;
  onDeleteLesson?: (lessonId: string) => void;
  onUpdateLesson?: (lesson: VideoLesson) => void;
  onToggleMT5Permission?: (userId: string) => void;
  onOpenManagement?: () => void;
  autoApproveEnabled?: boolean;
  onToggleAutoApprove?: () => void;
  onAutoApproveAllPending?: () => void;
  onDeletePayment?: (paymentId: string) => void;
  onUpdatePaymentNote?: (paymentId: string, note: string) => void;
  onRecordManualPayment?: (
    payment: Omit<PaymentRecord, 'id' | 'submittedAt' | 'status'>,
    approveImmediately: boolean
  ) => void;
  onOpenMemberCheckout?: () => void;
  customerRegistrations?: CustomerRegistrationRecord[];
  staffAccounts?: StaffAccount[];
  onAssignRegistrationToStaff?: (
    registrationId: string,
    targetStaff: StaffAccount,
    adminInstruction: string
  ) => void;
  onCompleteStaffCheck?: (
    registrationId: string,
    decision: 'VERIFIED_COMPLETED' | 'REJECTED',
    staffCheckNote: string,
    upgradeToVip: boolean
  ) => void;
  isAdministrator?: boolean;
  adminActorLabel?: string;
  nonAdminStaffLabel?: string;
  tvIndicators?: TradingViewIndicator[];
  onAddTvIndicator?: (indicator: Omit<TradingViewIndicator, 'id' | 'createdAt'>) => void;
  onUpdateTvIndicator?: (id: string, updates: Partial<TradingViewIndicator>) => void;
  onDeleteTvIndicator?: (id: string) => void;
  webhookLogs?: WebhookLog[];
  onAddWebhookLog?: (log: WebhookLog) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  lang,
  payments,
  onApprovePayment,
  onRejectPayment,
  users,
  onUpdateUserRole,
  onExtendVip,
  onBroadcastManualSignal,
  webhookSecret,
  setWebhookSecret,
  duplicateWindowSeconds,
  setDuplicateWindowSeconds,
  signals = [],
  onUpdateSignalStatus,
  onOpenMT5,
  lessons = [],
  onAddLesson,
  onDeleteLesson,
  onUpdateLesson,
  onToggleMT5Permission,
  onOpenManagement,
  autoApproveEnabled = true,
  onToggleAutoApprove,
  onAutoApproveAllPending,
  onDeletePayment,
  onUpdatePaymentNote,
  onRecordManualPayment,
  onOpenMemberCheckout,
  customerRegistrations = [],
  staffAccounts = [],
  onAssignRegistrationToStaff = () => {},
  onCompleteStaffCheck = () => {},
  isAdministrator = true,
  adminActorLabel = 'ADM-001 (Administrator)',
  nonAdminStaffLabel,
  tvIndicators,
  onAddTvIndicator,
  onUpdateTvIndicator,
  onDeleteTvIndicator,
  webhookLogs = [],
  onAddWebhookLog = () => {}
}) => {
  const isKm = lang === 'km';

  // Admin tabs
  const [adminTab, setAdminTab] = useState<'overview' | 'signups' | 'payments' | 'members' | 'signals' | 'broadcast' | 'tradingview' | 'lessons' | 'settings'>('signups');
  const [confirmDeleteLessonId, setConfirmDeleteLessonId] = useState<string | null>(null);

  // Video Lesson Form State
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTitleKm, setLessonTitleKm] = useState('');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('15:00');
  const [lessonCategory, setLessonCategory] = useState<LessonCategory>('basics');
  const [lessonAccessLevel, setLessonAccessLevel] = useState<'all' | 'member' | 'vip'>('vip');
  const [lessonInstructor, setLessonInstructor] = useState('Master Roth (Chief Analyst)');
  const [lessonThumbnail, setLessonThumbnail] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonDescKm, setLessonDescKm] = useState('');
  const [lessonTakeaways, setLessonTakeaways] = useState('');
  const [lessonTakeawaysKm, setLessonTakeawaysKm] = useState('');
  const [lessonPublishSuccess, setLessonPublishSuccess] = useState(false);
  const [previewingLesson, setPreviewingLesson] = useState<VideoLesson | null>(null);
  const [lessonSearch, setLessonSearch] = useState('');
  const [lessonCategoryFilter, setLessonCategoryFilter] = useState<'ALL' | LessonCategory>('ALL');

  // Receipt modal state
  const [viewingReceipt, setViewingReceipt] = useState<PaymentRecord | null>(null);

  // Member search & filter
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role | 'vip_mt5'>('ALL');

  // Manual Signal Broadcaster states
  const [manualTicker, setManualTicker] = useState('XAUUSD');
  const [manualAction, setManualAction] = useState<'BUY' | 'SELL'>('BUY');
  const [manualEntry, setManualEntry] = useState(2385.00);
  const [manualSL, setManualSL] = useState(2376.00);
  const [manualTP1, setManualTP1] = useState(2394.00);
  const [manualTP2, setManualTP2] = useState(2405.00);
  const [manualTP3, setManualTP3] = useState(2420.00);
  const [manualTimeframe, setManualTimeframe] = useState('15m');
  const [manualStrategy, setManualStrategy] = useState('Admin Desk OrderBlock Setup');
  const [manualNotes, setManualNotes] = useState('High conviction demand zone reaction.');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Analytics calculations
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const approvedPayments = payments.filter((p) => p.status === 'APPROVED');
  const totalRevenue = approvedPayments.reduce((acc, p) => acc + p.amount, 0) + 3840; // baseline historical + active
  const vipCount = users.filter((u) => u.role === 'vip').length;
  const standardCount = users.filter((u) => u.role === 'member').length;
  const mt5VipCount = users.filter((u) => u.role === 'vip' && u.mt5Allowed).length;

  // Revenue by method
  const abaRevenue = approvedPayments.filter(p => p.paymentMethod === 'ABA KHQR').reduce((acc, p) => acc + p.amount, 0) + 2650;
  const bakongRevenue = approvedPayments.filter(p => p.paymentMethod === 'Bakong').reduce((acc, p) => acc + p.amount, 0) + 890;
  const usdtRevenue = approvedPayments.filter(p => p.paymentMethod === 'USDT TRC20').reduce((acc, p) => acc + p.amount, 0) + 300;
  const grandTotal = abaRevenue + bakongRevenue + usdtRevenue;

  const abaPercent = Math.round((abaRevenue / grandTotal) * 100);
  const bakongPercent = Math.round((bakongRevenue / grandTotal) * 100);
  const usdtPercent = 100 - abaPercent - bakongPercent;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(memberSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (roleFilter === 'vip_mt5') return u.role === 'vip' && !!u.mt5Allowed;
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    return true;
  });

  const handleManualBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const newSignal: TradingSignal = {
      id: `sig_admin_${Date.now().toString().slice(-4)}`,
      ticker: manualTicker,
      assetName: manualTicker === 'XAUUSD' ? 'Gold Spot' : manualTicker,
      action: manualAction,
      entryPrice: Number(manualEntry),
      sl: Number(manualSL),
      tp1: Number(manualTP1),
      tp2: Number(manualTP2),
      tp3: Number(manualTP3),
      status: 'ACTIVE',
      timeframe: manualTimeframe,
      strategy: manualStrategy,
      source: 'Admin Manual',
      timestamp: new Date().toISOString(),
      riskReward: '1 : 3.0',
      notes: manualNotes,
      isVipOnly: true,
      signature: `${manualTicker}_${manualAction}_${manualEntry}_admin`
    };

    onBroadcastManualSignal(newSignal);
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handlePublishLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !lessonUrl) return;

    const newLesson: VideoLesson = {
      id: `lesson_${Date.now().toString().slice(-5)}`,
      title: lessonTitle,
      titleKm: lessonTitleKm || lessonTitle,
      description: lessonDesc || 'Trading strategy video lesson.',
      descriptionKm: lessonDescKm || lessonDesc || 'មេរៀនវីដេអូយុទ្ធសាស្ត្រជួញដូរ។',
      videoUrl: lessonUrl,
      thumbnailUrl: lessonThumbnail || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      duration: lessonDuration || '15:00',
      category: lessonCategory,
      categoryKm: lessonCategory === 'basics' ? 'មូលដ្ឋានគ្រឹះ'
        : lessonCategory === 'technical' ? 'បច្ចេកទេស Trade'
        : lessonCategory === 'smc' ? 'SMC & OrderBlock'
        : lessonCategory === 'mt5_bot' ? 'MT5 Auto-Trading'
        : lessonCategory === 'risk_management' ? 'គ្រប់គ្រងដើមទុន'
        : 'ចិត្តវិទ្យា Trader',
      accessLevel: lessonAccessLevel,
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      instructor: lessonInstructor || 'Admin Desk',
      keyTakeaways: lessonTakeaways ? lessonTakeaways.split('\n').filter(Boolean) : [
        'Market structure analysis and confirmation',
        'Strict risk to reward ratio adherence'
      ],
      keyTakeawaysKm: lessonTakeawaysKm ? lessonTakeawaysKm.split('\n').filter(Boolean) : [
        'រចនាសម្ព័ន្ធទីផ្សារ និងចំណុចចូលច្បាស់លាស់',
        'ការអនុវត្តវិន័យ Risk to Reward ខ្ជាប់ខ្ជួន'
      ]
    };

    if (onAddLesson) {
      onAddLesson(newLesson);
    }
    setLessonPublishSuccess(true);
    setLessonTitle('');
    setLessonTitleKm('');
    setLessonUrl('');
    setLessonDesc('');
    setLessonDescKm('');
    setLessonTakeaways('');
    setLessonTakeawaysKm('');
    setTimeout(() => setLessonPublishSuccess(false), 3500);
  };

  const handleToggleVip = (lesson: VideoLesson) => {
    if (!onUpdateLesson) return;
    const updated: VideoLesson = {
      ...lesson,
      accessLevel: lesson.accessLevel === 'vip' ? 'member' : 'vip'
    };
    onUpdateLesson(updated);
  };

  const filteredAdminLessons = lessons.filter(l => {
    const titleMatch = l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
                       l.titleKm.toLowerCase().includes(lessonSearch.toLowerCase()) ||
                       (l.instructor && l.instructor.toLowerCase().includes(lessonSearch.toLowerCase()));
    if (!titleMatch) return false;
    if (lessonCategoryFilter !== 'ALL' && l.category !== lessonCategoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 py-2">
      {/* Admin Executive Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
              {isKm ? 'ផ្ទាំងបញ្ជាប្រតិបត្តិការ Admin (Admin Control Center)' : 'Admin Operations Control'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            {isKm ? 'Dashboard គ្រប់គ្រងទូទៅ & ផ្ទៀងផ្ទាត់' : 'Admin Operations Dashboard'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isKm 
              ? 'ត្រួតពិនិត្យចំណូល, ផ្ទៀងផ្ទាត់វិក្កយបត្រ ABA KHQR/Bakong, គ្រប់គ្រងសមាជិក VIP និងសុវត្ថិភាព Webhook' 
              : 'Monitor revenue KPIs, review payment proofs, manage member access, and monitor webhook feeds.'}
          </p>
        </div>

        {/* Quick status pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">{isKm ? 'រង់ចាំផ្ទៀងផ្ទាត់' : 'Pending Review'}</div>
            <div className="text-lg font-extrabold text-amber-400 font-mono tabular-nums">
              {pendingCount}
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">{isKm ? 'សមាជិក VIP' : 'Active VIPs'}</div>
            <div className="text-lg font-extrabold text-emerald-400 font-mono tabular-nums">
              {vipCount}
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-sky-900/50 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">{isKm ? 'សិទ្ធិ MT5 VIP' : 'MT5 Authorized'}</div>
            <div className="text-lg font-extrabold text-sky-400 font-mono tabular-nums">
              {mt5VipCount} <span className="text-xs text-slate-500 font-normal">/ {vipCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab: Overview (Dashboard) */}
          <button
            onClick={() => setAdminTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              adminTab === 'overview'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{isKm ? 'ទិដ្ឋភាពរួម Dashboard' : 'Dashboard Overview'}</span>
          </button>

          {/* Tab: New Sign-Ups & Staff Assignment */}
          <button
            onClick={() => setAdminTab('signups')}
            className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              adminTab === 'signups'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isKm ? 'ចុះឈ្មោះថ្មី & ចាត់តាំងបុគ្គលិក' : 'New Sign-Ups & Assign Staff'}</span>
            {customerRegistrations.filter(r => r.workflowStage === 'NEW_FOR_ADMIN').length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-full font-bold font-mono tabular-nums">
                {customerRegistrations.filter(r => r.workflowStage === 'NEW_FOR_ADMIN').length}
              </span>
            )}
          </button>

          {/* Tab: Payments */}
          <button
            onClick={() => setAdminTab('payments')}
            className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              adminTab === 'payments'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isKm ? 'ផ្ទៀងផ្ទាត់ការបង់ប្រាក់' : 'Payment Verification'}</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Tab: Members */}
          <button
            onClick={() => setAdminTab('members')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              adminTab === 'members'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isKm ? 'គ្រប់គ្រងសមាជិក' : 'Member Directory'}</span>
          </button>

          {/* Tab: Manual Broadcast */}
          <button
            onClick={() => setAdminTab('broadcast')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              adminTab === 'broadcast'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isKm ? 'បញ្ជូន Signal ផ្ទាល់' : 'Broadcast Signal'}</span>
          </button>

          {/* Tab: TradingView & Indicators (Administrator) */}
          <button
            onClick={() => setAdminTab('tradingview')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              adminTab === 'tradingview'
                ? 'bg-[#2962ff] text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isKm ? 'TradingView & Indicators' : 'TradingView & Indicators'}</span>
            {tvIndicators && (
              <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 text-[10px] rounded font-mono tabular-nums font-bold">
                {tvIndicators.filter(i => i.active).length}
              </span>
            )}
          </button>

          {/* Tab: Video Lessons Management */}
          <button
            onClick={() => setAdminTab('lessons')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              adminTab === 'lessons'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>{isKm ? 'គ្រប់គ្រងមេរៀន Video' : 'Video Lessons'}</span>
            <span className="px-1.5 py-0.2 bg-purple-900/60 text-purple-200 text-[10px] rounded-full font-bold">
              {lessons.length}
            </span>
          </button>

          {/* Tab: Settings */}
          <button
            onClick={() => setAdminTab('settings')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              adminTab === 'settings'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isKm ? 'សុវត្ថិភាព Webhook' : 'Webhook Settings'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenManagement && (
            <button
              onClick={onOpenManagement}
              className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isKm ? 'កំណត់ ID & Password តាមមុខតំណែង (5 Positions)' : 'Set Staff ID & Password (5 Positions)'}</span>
            </button>
          )}

          {onOpenMT5 && (
            <button
              onClick={onOpenMT5}
              className="px-3.5 py-2 rounded-lg bg-[#2962ff]/15 hover:bg-[#2962ff]/25 border border-[#2962ff]/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Open MT5 Auto-Trade Terminal"
            >
              <span>MT5 Auto-Trade Gateway</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= TAB 0.5: NEW CUSTOMER SIGN-UPS & STAFF ASSIGNMENT ================= */}
      {adminTab === 'signups' && (
        <CustomerSignupAssignmentPanel
          lang={lang}
          theme="dark"
          registrations={customerRegistrations}
          staffAccounts={staffAccounts}
          loggedInStaff={null}
          onAssignToStaff={onAssignRegistrationToStaff}
          onCompleteStaffCheck={onCompleteStaffCheck}
        />
      )}

      {/* ================= TAB 1: EXECUTIVE DASHBOARD OVERVIEW ================= */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Financial & User KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Revenue */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{isKm ? 'ចំណូលសរុប (Total Revenue)' : 'Total Gross Revenue'}</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                ${totalRevenue.toLocaleString()}.00
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18.4% {isKm ? 'ធៀបនឹងខែមុន' : 'vs last month'}</span>
              </div>
            </div>

            {/* KPI 2: Pending Verifications */}
            <div 
              onClick={() => setAdminTab('payments')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{isKm ? 'រង់ចាំផ្ទៀងផ្ទាត់បង់ប្រាក់' : 'Pending Verifications'}</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
                {pendingCount} {isKm ? 'ប្រតិបត្តិការ' : 'Requests'}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <span>{isKm ? 'ចុចដើម្បីផ្ទៀងផ្ទាត់ភ្លាមៗ' : 'Click to inspect & approve'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>

            {/* KPI 3: VIP Conversion */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{isKm ? 'សមាជិក VIP សកម្ម' : 'Active VIP Subscribers'}</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {vipCount} / {users.length}
              </div>
              <div className="text-xs text-purple-400 flex items-center gap-1 font-medium">
                <span>{Math.round((vipCount / (users.length || 1)) * 100)}% {isKm ? 'អត្រា Upgrade ជោគជ័យ' : 'VIP Conversion'}</span>
              </div>
            </div>

            {/* KPI 4: Webhook Gateway Status */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{isKm ? 'ម៉ាស៊ីន Webhook Engine' : 'TradingView Gateway'}</span>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums flex items-center gap-2">
                <span>100%</span>
                <span className="text-xs font-sans text-slate-400 font-normal">Uptime</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Latency: <span className="text-emerald-400">~38ms</span> · Window: {duplicateWindowSeconds}s
              </div>
            </div>
          </div>

          {/* Middle Grid: Revenue Share by Method & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Cambodian & Crypto Payment Method Distribution */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>{isKm ? 'ចំណូលតាមវិធីសាស្ត្រទូទាត់ (Payment Breakdown)' : 'Payment Channel Distribution'}</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {isKm ? 'ស្ថិតិការបង់ប្រាក់តាម ABA Bank KHQR, Bakong និង USDT' : 'Revenue generated per banking gateway'}
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">${grandTotal.toLocaleString()} USD</span>
              </div>

              {/* Progress bar split */}
              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
                  <div style={{ width: `${abaPercent}%` }} className="bg-sky-500" title={`ABA KHQR: ${abaPercent}%`}></div>
                  <div style={{ width: `${bakongPercent}%` }} className="bg-rose-500" title={`Bakong: ${bakongPercent}%`}></div>
                  <div style={{ width: `${usdtPercent}%` }} className="bg-emerald-500" title={`USDT: ${usdtPercent}%`}></div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      <span>ABA KHQR</span>
                    </div>
                    <div className="text-base font-bold text-white font-mono">${abaRevenue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{abaPercent}% of total volume</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>Bakong QR</span>
                    </div>
                    <div className="text-base font-bold text-white font-mono">${bakongRevenue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{bakongPercent}% of total volume</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>USDT TRC-20</span>
                    </div>
                    <div className="text-base font-bold text-white font-mono">${usdtRevenue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{usdtPercent}% of total volume</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Hub */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>{isKm ? 'សកម្មភាពរហ័ស (Quick Actions)' : 'Quick Operations Hub'}</span>
              </h3>

              <div className="space-y-2.5">
                <button
                  onClick={() => setAdminTab('payments')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isKm ? 'ផ្ទៀងផ្ទាត់វិក្កយបត្រដែលនៅសល់' : 'Review Pending Payments'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {pendingCount} {isKm ? 'រង់ចាំការពិនិត្យ' : 'requests waiting for approval'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    Review
                  </span>
                </button>

                {onToggleAutoApprove && (
                  <button
                    type="button"
                    onClick={onToggleAutoApprove}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${
                      autoApproveEnabled
                        ? 'bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-950/50'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        autoApproveEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {isKm ? 'មុខងារ Approve Auto (កញ្ចប់ VIP)' : 'VIP Payment Auto-Approve'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {autoApproveEnabled
                            ? (isKm ? 'បាញ់ប្រាក់រួច បើកសិទ្ធិ VIP ស្វ័យប្រវត្តិ' : 'Instant VIP activation on transfer')
                            : (isKm ? 'កំពុងបិទ (តម្រូវអោយ Admin អនុម័ត)' : 'Disabled (Manual review required)')}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                      autoApproveEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {autoApproveEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setAdminTab('broadcast')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isKm ? 'ផ្សាយ Signal បន្ទាន់ទៅកាន់ VIP' : 'Broadcast Manual Signal'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {isKm ? 'ផ្ញើ Signal ផ្ទាល់សម្រាប់ CPI/NFP' : 'Push trade setup directly to members'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                    Create
                  </span>
                </button>

                <button
                  onClick={() => setAdminTab('settings')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isKm ? 'គ្រប់គ្រង Secret Key & Webhook' : 'Rotate Webhook Secret Token'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {webhookSecret.slice(0, 14)}...
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    Settings
                  </span>
                </button>

                <button
                  onClick={() => {
                    setAdminTab('members');
                    setRoleFilter('vip');
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-sky-900/40 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isKm ? 'កំណត់សិទ្ធិ MT5 Auto-Trade សម្រាប់ VIP' : 'Manage VIP MT5 Auto-Trade'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {isKm ? `${mt5VipCount} នៃ ${vipCount} VIP ត្រូវបានបើកសិទ្ធិ` : `${mt5VipCount} of ${vipCount} VIPs authorized`}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    Configure
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Overview Section: Recent Payment Requests with Fast 1-Click Approve */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{isKm ? 'ការបង់ប្រាក់ចូលចុងក្រោយ (Recent Submissions)' : 'Recent Transaction Feed'}</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {isKm ? 'ចុច Approve ដើម្បីបើកសិទ្ធិ VIP ភ្លាមៗ' : 'Instant 1-click verification from dashboard'}
                </div>
              </div>

              <button
                onClick={() => setAdminTab('payments')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <span>{isKm ? 'មើលទាំងអស់' : 'View Full Queue'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {payments.slice(0, 4).map((pay) => {
                const isPending = pay.status === 'PENDING';
                const isApproved = pay.status === 'APPROVED';

                return (
                  <div
                    key={pay.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isPending ? 'bg-amber-500/20 text-amber-400' : isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {pay.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{pay.userName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">Ref: {pay.transactionId}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <span className="text-amber-400 font-medium">{pay.planName}</span> · <span className="font-mono text-white font-bold">${pay.amount} USD</span> · <span className="text-sky-400">{pay.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {pay.receiptImage && (
                        <button
                          onClick={() => setViewingReceipt(pay)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-sky-400" />
                          <span>Slip</span>
                        </button>
                      )}

                      {isPending ? (
                        <>
                          <button
                            onClick={() => onApprovePayment(pay.id)}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>{isKm ? 'អនុម័ត VIP' : 'Approve VIP'}</span>
                          </button>
                          <button
                            onClick={() => onRejectPayment(pay.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 text-rose-300 text-xs rounded"
                          >
                            {isKm ? 'បដិសេធ' : 'Reject'}
                          </button>
                        </>
                      ) : (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isApproved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {pay.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CUSTOMER PAYMENT MANAGEMENT TABLE ================= */}
      {adminTab === 'payments' && (
        <CustomerPaymentTable
          lang={lang}
          theme="dark"
          payments={payments}
          users={users}
          managerLabel={
            isKm
              ? 'គ្រប់គ្រងដោយផ្នែក Admin & Financial'
              : 'Admin & Financial Payment Management'
          }
          autoApproveEnabled={autoApproveEnabled}
          onToggleAutoApprove={onToggleAutoApprove}
          onAutoApproveAllPending={onAutoApproveAllPending}
          onApprovePayment={onApprovePayment}
          onRejectPayment={onRejectPayment}
          onDeletePayment={onDeletePayment}
          onUpdatePaymentNote={onUpdatePaymentNote}
          onRecordManualPayment={onRecordManualPayment}
          onOpenMemberCheckout={onOpenMemberCheckout}
        />
      )}

      {/* ================= TAB 3: MEMBER DIRECTORY ================= */}
      {adminTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={isKm ? 'ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល...' : 'Search by name or email...'}
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(['ALL', 'vip', 'vip_mt5', 'member', 'visitor'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r as any)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    roleFilter === r
                      ? 'bg-purple-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'ALL' && (isKm ? 'ទាំងអស់' : 'All')}
                  {r === 'vip' && 'VIP Only'}
                  {r === 'vip_mt5' && (isKm ? '⚡ MT5 VIP (បើក)' : '⚡ MT5 Authorized')}
                  {r === 'member' && 'Standard Member'}
                  {r === 'visitor' && 'Visitor'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{isKm ? 'ឈ្មោះសមាជិក' : 'Member Name'}</th>
                    <th className="py-3 px-4">{isKm ? 'ទំនាក់ទំនង' : 'Contact'}</th>
                    <th className="py-3 px-4">{isKm ? 'តួនាទី (Role)' : 'Role'}</th>
                    <th className="py-3 px-4">{isKm ? 'សុពលភាព VIP' : 'VIP Expiry'}</th>
                    <th className="py-3 px-4">{isKm ? 'សិទ្ធិ MT5 Auto-Trade' : 'MT5 Auto-Trade (Admin)'}</th>
                    <th className="py-3 px-4 text-right">{isKm ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => {
                    const isVip = u.role === 'vip';
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {isVip && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{u.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {u.id}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-300">{u.email}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.phone}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase font-mono ${
                              isVip
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : u.role === 'member'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {u.vipExpiresAt ? (
                            <span className="text-emerald-400">
                              {new Date(u.vipExpiresAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* MT5 Auto-Trade Column - Only for VIP members as configured by Admin */}
                        <td className="py-3 px-4">
                          {isVip ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] inline-flex items-center gap-1 ${
                                  u.mt5Allowed
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                <Bot className="w-3 h-3 text-sky-400" />
                                <span>{u.mt5Allowed ? (isKm ? 'អនុញ្ញាត ✓' : 'Authorized ✓') : (isKm ? 'មិនទាន់អនុញ្ញាត ✕' : 'Disabled ✕')}</span>
                              </span>

                              {onToggleMT5Permission && (
                                <button
                                  onClick={() => onToggleMT5Permission(u.id)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                                    u.mt5Allowed
                                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                                      : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30'
                                  }`}
                                  title={u.mt5Allowed ? (isKm ? 'បិទសិទ្ធិ MT5 Auto-Trade' : 'Revoke MT5 Auto-Trade permission') : (isKm ? 'បើកសិទ្ធិ MT5 Auto-Trade' : 'Authorize MT5 Auto-Trade')}
                                >
                                  {u.mt5Allowed ? (isKm ? 'បិទសិទ្ធិ' : 'Revoke') : (isKm ? '⚡ បើកសិទ្ធិ' : '⚡ Grant')}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                              <Lock className="w-3 h-3 text-slate-600" />
                              <span>{isKm ? 'តម្រូវឱ្យ VIP ជាមុន' : 'VIP Required'}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isVip ? (
                              <>
                                <button
                                  onClick={() => onExtendVip(u.id, 30)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[11px] font-medium"
                                  title="Extend VIP by 30 days"
                                >
                                  +30 ថ្ងៃ
                                </button>
                                <button
                                  onClick={() => onUpdateUserRole(u.id, 'member')}
                                  className="px-2 py-1 bg-slate-800 hover:bg-rose-950 text-rose-300 rounded text-[11px]"
                                >
                                  {isKm ? 'ទម្លាក់សិទ្ធិ' : 'Demote'}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => onUpdateUserRole(u.id, 'vip')}
                                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-semibold"
                              >
                                {isKm ? 'តម្លើង VIP' : 'Upgrade VIP'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: MANUAL SIGNAL BROADCAST ================= */}
      {adminTab === 'broadcast' && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              <span>{isKm ? 'បញ្ជូន Signal ដោយផ្ទាល់ពី Admin Desk' : 'Manual Signal Broadcaster'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isKm 
                ? 'ផ្សាយ Signal បន្ទាន់សម្រាប់ព្រឹត្តិការណ៍ព័ត៌មានសេដ្ឋកិច្ច (CPI, NFP) ឬការវិភាគបច្ចេកទេសពិសេស' 
                : 'Broadcast urgent market calls, news event setups, or private analyst setups directly to VIPs.'}
            </p>
          </div>

          <form onSubmit={handleManualBroadcast} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Ticker</label>
                <input
                  type="text"
                  value={manualTicker}
                  onChange={(e) => setManualTicker(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualAction('BUY')}
                    className={`py-2 text-xs font-bold rounded-lg cursor-pointer ${
                      manualAction === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualAction('SELL')}
                    className={`py-2 text-xs font-bold rounded-lg cursor-pointer ${
                      manualAction === 'SELL' ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stop Loss (SL)</label>
                <input
                  type="number"
                  step="any"
                  value={manualSL}
                  onChange={(e) => setManualSL(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-rose-400 font-mono tabular-nums focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Take Profit 1</label>
                <input
                  type="number"
                  step="any"
                  value={manualTP1}
                  onChange={(e) => setManualTP1(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono tabular-nums focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Take Profit 2</label>
                <input
                  type="number"
                  step="any"
                  value={manualTP2}
                  onChange={(e) => setManualTP2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono tabular-nums focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Analyst Notes</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20"
            >
              <Send className="w-4 h-4" />
              <span>{isKm ? 'ផ្សាយ Signal នេះទៅកាន់ VIP ទាំងអស់' : 'Broadcast Signal to All VIPs'}</span>
            </button>
          </form>

          {broadcastSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{isKm ? 'Signal ត្រូវបានផ្សាយផ្ទាល់ជូន VIP រួចរាល់!' : 'Signal broadcasted to all active VIP members!'}</span>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: WEBHOOK SECURITY SETTINGS ================= */}
      {adminTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>{isKm ? 'សុវត្ថិភាព និងការកំណត់ Webhook' : 'Webhook Security & Dedup Controls'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isKm 
                ? 'គ្រប់គ្រង Secret Key សម្រាប់ផ្ទៀងផ្ទាត់ HTTPS Request និងកំណត់រយៈពេលចម្រោះ Signal ស្ទួន' 
                : 'Configure API tokens and duplicate signal suppression window.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {isKm ? 'កូដសម្ងាត់ Webhook (Secret API Token)' : 'Webhook Secret Key'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => setWebhookSecret(`TV_SECRET_${Math.random().toString(36).substring(2, 8).toUpperCase()}_2026`)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 shrink-0"
                  title="Generate new secret"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isKm ? 'បង្កើតថ្មី' : 'Generate'}</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {isKm 
                  ? 'ត្រូវតែផ្គូផ្គងជាមួយ secret ក្នុង Pine Script payload ដើម្បីឆ្លងកាត់ការផ្ទៀងផ្ទាត់' 
                  : 'Must match incoming JSON "secret" field to pass 401 authentication.'}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-400">
                  {isKm ? 'រយៈពេលទប់ស្កាត់ Signal ស្ទួន (Duplicate Filter Window)' : 'Duplicate Suppression Window'}
                </label>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {duplicateWindowSeconds} seconds
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={duplicateWindowSeconds}
                onChange={(e) => setDuplicateWindowSeconds(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                {isKm 
                  ? 'រាល់ Alert ដែលមាន Ticker និង Action ដូចគ្នាដែលចូលក្នុងរយៈពេលនេះ នឹងត្រូវចាត់ទុកថាស្ទួន និងមិនបញ្ជូន' 
                  : 'Prevents multiple alert fires on volatile candle wicks within the specified duration.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: VIDEO LESSONS MANAGEMENT ================= */}
      {adminTab === 'lessons' && (
        <div className="space-y-6">
          {/* Lessons KPI Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">{isKm ? 'មេរៀនសរុប' : 'Total Lessons'}</span>
                <span className="text-2xl font-extrabold text-white font-mono">{lessons.length}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">{isKm ? 'មេរៀន VIP ផ្តាច់មុខ' : 'VIP Exclusive'}</span>
                <span className="text-2xl font-extrabold text-amber-400 font-mono">
                  {lessons.filter(l => l.accessLevel === 'vip').length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">{isKm ? 'មេរៀនទូទៅ (Free)' : 'Standard Access'}</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {lessons.filter(l => l.accessLevel !== 'vip').length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">{isKm ? 'ចំនួនមើលសរុប' : 'Total Student Views'}</span>
                <span className="text-2xl font-extrabold text-sky-400 font-mono">
                  {lessons.reduce((acc, l) => acc + (l.viewsCount || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Form & List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Upload Form (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {isKm ? 'បង្ហោះមេរៀន Video ថ្មី' : 'Upload / Add Video Lesson'}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  {isKm ? 'សម្រាប់សមាជិកមើល' : 'Published to Academy'}
                </span>
              </div>

              {lessonPublishSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isKm ? 'មេរៀនត្រូវបានបង្ហោះជោគជ័យ! សមាជិកអាចទស្សនាបានភ្លាមៗ។' : 'Video lesson published successfully! Instantly visible in Member Academy.'}
                  </span>
                </div>
              )}

              <form onSubmit={handlePublishLesson} className="space-y-3.5">
                {/* Title KM & EN */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isKm ? 'ចំណងជើងមេរៀន (ភាសាខ្មែរ) *' : 'Lesson Title (Khmer) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonTitleKm}
                    onChange={(e) => setLessonTitleKm(e.target.value)}
                    placeholder="ឧ. បច្ចេកទេស Trade SMC & OrderBlock លើមាស"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isKm ? 'ចំណងជើងជាភាសាអង់គ្លេស (English Title) *' : 'Lesson Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g. SMC & Institutional Order Blocks Strategy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      {isKm ? 'តំណភ្ជាប់ Video (YouTube / Vimeo / Embed URL) *' : 'Video Link (YouTube / Vimeo / MP4) *'}
                    </label>
                    {lessonUrl && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ✓ Ready
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={lessonUrl}
                    onChange={(e) => setLessonUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... ឬ embed link"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {isKm 
                      ? 'គាំទ្រតំណភ្ជាប់ YouTube ធម្មតា ឬ Embed link ប្រព័ន្ធនឹងបម្លែងស្វ័យប្រវត្តិ' 
                      : 'Supports standard YouTube, Vimeo, or direct embed links.'}
                  </span>
                </div>

                {/* Category & Access Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {isKm ? 'ផ្នែក / ប្រភេទមេរៀន' : 'Category'}
                    </label>
                    <select
                      value={lessonCategory}
                      onChange={(e) => setLessonCategory(e.target.value as LessonCategory)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="basics">{isKm ? 'មូលដ្ឋានគ្រឹះ (Basics)' : 'Basics'}</option>
                      <option value="technical">{isKm ? 'បច្ចេកទេស Trade (Technical)' : 'Technical'}</option>
                      <option value="smc">{isKm ? 'SMC & OrderBlock' : 'SMC & Banks'}</option>
                      <option value="mt5_bot">{isKm ? 'MT5 Auto-Trading Bot' : 'MT5 Auto-Bot'}</option>
                      <option value="risk_management">{isKm ? 'គ្រប់គ្រងដើមទុន (Risk)' : 'Risk Management'}</option>
                      <option value="psychology">{isKm ? 'ចិត្តវិទ្យា (Psychology)' : 'Psychology'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {isKm ? 'សិទ្ធិចូលទស្សនា' : 'Access Level'}
                    </label>
                    <select
                      value={lessonAccessLevel}
                      onChange={(e) => setLessonAccessLevel(e.target.value as 'all' | 'member' | 'vip')}
                      className={`w-full bg-slate-950 border rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none ${
                        lessonAccessLevel === 'vip' 
                          ? 'border-amber-500/60 text-amber-400' 
                          : 'border-slate-800 text-slate-200'
                      }`}
                    >
                      <option value="vip">👑 {isKm ? 'សមាជិក VIP ផ្តាច់មុខ (VIP Only)' : 'VIP Exclusive'}</option>
                      <option value="member">👥 {isKm ? 'សមាជិកទូទៅ (Member)' : 'Member Access'}</option>
                      <option value="all">🌐 {isKm ? 'ទាំងអស់គ្នា (Free For All)' : 'Public / Free'}</option>
                    </select>
                  </div>
                </div>

                {/* Duration & Instructor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {isKm ? 'រយៈពេល (Duration)' : 'Duration (mm:ss)'}
                    </label>
                    <input
                      type="text"
                      value={lessonDuration}
                      onChange={(e) => setLessonDuration(e.target.value)}
                      placeholder="18:30"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {isKm ? 'ឈ្មោះគ្រូ / Instructor' : 'Instructor Name'}
                    </label>
                    <input
                      type="text"
                      value={lessonInstructor}
                      onChange={(e) => setLessonInstructor(e.target.value)}
                      placeholder="Master Roth (Chief Analyst)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Thumbnail Image URL */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isKm ? 'រូបភាពតំណាង Thumbnail (ស្រេចចិត្ត)' : 'Thumbnail Image URL (Optional)'}
                  </label>
                  <input
                    type="url"
                    value={lessonThumbnail}
                    onChange={(e) => setLessonThumbnail(e.target.value)}
                    placeholder="https://... ឬទុកទទេដើម្បីប្រើរូបដើម"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Description KM */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isKm ? 'ការពិពណ៌នាសង្ខេប (Khmer Description)' : 'Khmer Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={lessonDescKm}
                    onChange={(e) => setLessonDescKm(e.target.value)}
                    placeholder="សេចក្តីពន្យល់ពីគោលបំណង និងយុទ្ធសាស្ត្រក្នុងវីដេអូ..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                  ></textarea>
                </div>

                {/* Key Takeaways */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isKm ? 'ចំណុចសំខាន់ៗដែលទទួលបាន (មួយបន្ទាត់មួយចំណុច)' : 'Key Takeaways (one per line)'}
                  </label>
                  <textarea
                    rows={2}
                    value={lessonTakeawaysKm}
                    onChange={(e) => setLessonTakeawaysKm(e.target.value)}
                    placeholder="ចំណុចទី១: របៀបកំណត់ Order Block&#10;ចំណុចទី២: ការដាក់ Stop Loss ត្រឹមត្រូវ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isKm ? 'បង្ហោះមេរៀននេះជាផ្លូវការ (Publish to Members)' : 'Publish Lesson to Academy'}</span>
                </button>
              </form>
            </div>

            {/* Right: Uploaded Lessons Catalog & Controls (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    <span>{isKm ? 'កាតាឡុកមេរៀនដែលបានបង្ហោះ' : 'Published Lessons Catalog'}</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {isKm ? 'ចុចលើ Lock ដើម្បីផ្លាស់ប្តូរសិទ្ធិ VIP ឬលុបមេរៀន' : 'Toggle VIP lock or preview content'}
                  </span>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={lessonSearch}
                      onChange={(e) => setLessonSearch(e.target.value)}
                      placeholder={isKm ? 'ស្វែងរក...' : 'Filter...'}
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Table of Lessons */}
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredAdminLessons.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    {isKm ? 'មិនមានមេរៀនត្រូវគ្នានឹងការស្វែងរកទេ' : 'No video lessons found'}
                  </div>
                ) : (
                  filteredAdminLessons.map((lesson) => {
                    const isVipOnly = lesson.accessLevel === 'vip';

                    return (
                      <div
                        key={lesson.id}
                        className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Mini Thumbnail */}
                          <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden relative shrink-0 border border-slate-800">
                            {lesson.thumbnailUrl ? (
                              <img 
                                src={lesson.thumbnailUrl} 
                                alt={lesson.title} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                                <Film className="w-4 h-4" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              {isVipOnly ? (
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Film className="w-3.5 h-3.5 text-white/80" />
                              )}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-purple-400 font-semibold">
                                {lesson.id}
                              </span>
                              <span className="text-[10px] text-slate-500">·</span>
                              <span className="text-[10px] text-slate-400">
                                {lesson.categoryKm || lesson.category}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({lesson.duration})
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-white truncate mt-0.5" title={lesson.titleKm}>
                              {isKm ? lesson.titleKm : lesson.title}
                            </h4>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {lesson.instructor} · <span className="font-mono text-sky-400">{lesson.viewsCount || 0} views</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {/* Toggle VIP Button */}
                          <button
                            onClick={() => handleToggleVip(lesson)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isVipOnly
                                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                            title={isVipOnly ? 'Click to make available to all members' : 'Click to lock as VIP only'}
                          >
                            {isVipOnly ? (
                              <>
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>VIP Only</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3 text-emerald-400" />
                                <span>Free Access</span>
                              </>
                            )}
                          </button>

                          {/* Quick Preview Button */}
                          <button
                            onClick={() => setPreviewingLesson(lesson)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title={isKm ? 'មើលសាកល្បង' : 'Preview Video'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          {onDeleteLesson && (
                            confirmDeleteLessonId === lesson.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    onDeleteLesson(lesson.id);
                                    setConfirmDeleteLessonId(null);
                                  }}
                                  className="px-2 py-1 rounded bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  {isKm ? 'លុបពិត' : 'Confirm'}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteLessonId(null)}
                                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteLessonId(lesson.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                title={isKm ? 'លុបមេរៀន' : 'Delete Lesson'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Video Preview Modal */}
      {previewingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-purple-400 uppercase">
                  {isKm ? 'ការមើលសាកល្បង Video' : 'Admin Video Preview'}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {isKm ? previewingLesson.titleKm : previewingLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewingLesson(null)}
                className="text-slate-400 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={previewingLesson.videoUrl.includes('/embed/') ? previewingLesson.videoUrl : `https://www.youtube.com/embed/${previewingLesson.videoUrl.slice(-11)}`}
                title={previewingLesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{isKm ? 'សិទ្ធិ:' : 'Access:'}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  previewingLesson.accessLevel === 'vip' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {previewingLesson.accessLevel === 'vip' ? 'VIP Only' : 'All Members'}
                </span>
              </div>
              <button
                onClick={() => setPreviewingLesson(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                {isKm ? 'បិទ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TradingView & Administrator Indicators Tab */}
      {adminTab === 'tradingview' && (
        <TradingViewWebhookSimulator
          lang={lang}
          onDispatchSignal={onBroadcastManualSignal}
          webhookSecret={webhookSecret}
          duplicateWindowSeconds={duplicateWindowSeconds}
          recentSignals={signals}
          logs={webhookLogs}
          onAddLog={onAddWebhookLog}
          isAdmin={isAdministrator}
          indicators={tvIndicators}
          onAddIndicator={onAddTvIndicator}
          onUpdateIndicator={onUpdateTvIndicator}
          onDeleteIndicator={onDeleteTvIndicator}
          adminActorLabel={adminActorLabel}
          nonAdminStaffLabel={nonAdminStaffLabel}
        />
      )}

      {/* Slip Modal View */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {isKm ? 'វិក្កយបត្របង់ប្រាក់:' : 'Payment Slip Proof:'} {viewingReceipt.userName}
              </h3>
              <button
                onClick={() => setViewingReceipt(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex justify-center">
              <img
                src={viewingReceipt.receiptImage}
                alt="Receipt Proof"
                className="max-h-72 object-contain rounded"
              />
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <div>Ref ID: <span className="font-mono text-white">{viewingReceipt.transactionId}</span></div>
              <div>Amount: <span className="font-mono text-amber-400 font-bold">${viewingReceipt.amount} USD</span></div>
              <div>Method: <span className="text-sky-400">{viewingReceipt.paymentMethod}</span></div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onApprovePayment(viewingReceipt.id);
                  setViewingReceipt(null);
                }}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
              >
                {isKm ? 'អនុម័តសិទ្ធិ VIP' : 'Approve VIP Access'}
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                {isKm ? 'បិទ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
