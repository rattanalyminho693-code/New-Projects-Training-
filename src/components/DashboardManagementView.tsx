import React, { useState, useEffect } from 'react';
import {
  Language,
  StaffPosition,
  StaffPermissionKey,
  StaffAccount,
  StaffAuditLog,
  TradingSignal,
  SignalStatus,
  ChatChannelId,
  VideoLesson,
  LessonCategory,
  VideoProductionTask,
  HRRequestItem,
  PaymentRecord,
  FinanceLedgerEntry,
  UserAccount,
  Role,
  MT5Config,
  MT5Position,
  MT5ExecutionLog,
  CustomerRegistrationRecord,
  TradingViewIndicator,
  WebhookLog
} from '../types';
import { POSITION_DEFINITIONS, DEFAULT_MT5_CONFIG } from '../data/mockData';
import { CustomerPaymentTable } from './CustomerPaymentTable';
import { CustomerSignupAssignmentPanel } from './CustomerSignupAssignmentPanel';
import { MT5AutoTradingEngineView } from './MT5AutoTradingModal';
import { TradingViewWebhookSimulator } from './TradingViewWebhookSimulator';
import {
  LayoutDashboard,
  KeyRound,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Gem,
  Users,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Check,
  X,
  Copy,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Download,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Bot,
  Briefcase,
  Radio,
  Film,
  Wallet,
  Sliders,
  Menu,
  Calendar,
  Bell,
  Settings,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronDown,
  FileBarChart,
  Building2,
  CreditCard,
  QrCode,
  Landmark,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface DashboardManagementViewProps {
  lang: Language;
  setLang?: (lang: Language) => void;
  staffAccounts: StaffAccount[];
  loggedInStaff: StaffAccount | null;
  onLoginStaff: (
    staffCode: string,
    password: string,
    selectedPosition?: StaffPosition | 'ALL'
  ) => { ok: boolean; errorKm?: string; errorEn?: string };
  onLogoutStaff: () => void;
  onCreateStaff: (
    newStaff: Omit<StaffAccount, 'id' | 'createdAt'>
  ) => { ok: boolean; errorKm?: string; errorEn?: string };
  onUpdateStaffCredentials: (
    staffId: string,
    updates: Partial<StaffAccount>
  ) => { ok: boolean; errorKm?: string; errorEn?: string };
  onDeleteStaff: (staffId: string) => void;
  auditLogs: StaffAuditLog[];
  onAddAuditLog: (
    actionEn: string,
    actionKm: string,
    status?: 'SUCCESS' | 'FAILED' | 'SECURITY'
  ) => void;
  signals: TradingSignal[];
  onBroadcastSignal: (signal: TradingSignal) => void;
  onUpdateSignalStatus: (signalId: string, status: SignalStatus, pips?: number) => void;
  onDeleteSignal: (signalId: string) => void;
  onPostChatAnnouncement: (
    channelId: ChatChannelId,
    textEn: string,
    textKm: string,
    isPinned: boolean
  ) => void;
  lessons: VideoLesson[];
  onAddLesson: (lesson: VideoLesson) => void;
  onUpdateLesson: (lesson: VideoLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  videoTasks: VideoProductionTask[];
  onAddVideoTask: (task: Omit<VideoProductionTask, 'id'>) => void;
  onAdvanceVideoTask: (taskId: string, nextStage: VideoProductionTask['stage']) => void;
  onDeleteVideoTask: (taskId: string) => void;
  hrRequests: HRRequestItem[];
  onAddHRRequest: (req: Omit<HRRequestItem, 'id' | 'submittedAt' | 'status'>) => void;
  onResolveHRRequest: (reqId: string, status: 'APPROVED' | 'REJECTED') => void;
  payments: PaymentRecord[];
  onApprovePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string, reason?: string) => void;
  financeLedger: FinanceLedgerEntry[];
  onAddFinanceEntry: (entry: Omit<FinanceLedgerEntry, 'id'>) => void;
  users: UserAccount[];
  onUpdateUserRole: (userId: string, role: Role) => void;
  onExtendVip: (userId: string, days: number) => void;
  onToggleMT5Permission: (userId: string) => void;
  webhookSecret: string;
  setWebhookSecret: (secret: string) => void;
  duplicateWindowSeconds: number;
  setDuplicateWindowSeconds: (sec: number) => void;
  onOpenMT5: () => void;
  autoApproveEnabled?: boolean;
  onToggleAutoApprove?: () => void;
  onAutoApproveAllPending?: () => void;
  onOpenMemberCheckout?: () => void;
  onDeletePayment?: (paymentId: string) => void;
  onUpdatePaymentNote?: (paymentId: string, note: string) => void;
  onRecordManualPayment?: (
    payment: Omit<PaymentRecord, 'id' | 'submittedAt' | 'status'>,
    approveImmediately: boolean
  ) => void;
  mt5Config?: MT5Config;
  onUpdateMT5Config?: (updated: Partial<MT5Config>) => void;
  mt5Positions?: MT5Position[];
  onCloseMT5Position?: (ticket: number) => void;
  onSetMT5Breakeven?: (ticket: number) => void;
  mt5Logs?: MT5ExecutionLog[];
  onSimulateMT5TestOrder?: () => void;
  initialNav?: ErpNavKey;
  customerRegistrations?: CustomerRegistrationRecord[];
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
  tvIndicators?: TradingViewIndicator[];
  onAddTvIndicator?: (indicator: Omit<TradingViewIndicator, 'id' | 'createdAt'>) => void;
  onUpdateTvIndicator?: (id: string, updates: Partial<TradingViewIndicator>) => void;
  onDeleteTvIndicator?: (id: string) => void;
  webhookLogs?: WebhookLog[];
  onAddWebhookLog?: (log: WebhookLog) => void;
}

export type ErpNavKey =
  | 'dashboard'
  | 'customer_signups'
  | 'all_staff'
  | 'billing_slips'
  | 'accounts_ledger'
  | 'customers'
  | 'signals_desk'
  | 'tradingview_desk'
  | 'mt5_bot'
  | 'video_studio'
  | 'reports'
  | 'settings';

const ALL_POSITIONS: StaffPosition[] = [
  'administrator',
  'editor',
  'videos_editor',
  'hr',
  'leadership_finance'
];

const PERMISSION_LABELS: Record<StaffPermissionKey, { en: string; km: string }> = {
  overview: { en: 'Dashboard Overview', km: 'ទិដ្ឋភាពរួម Dashboard' },
  staff_credentials: { en: 'Set Password & ID', km: 'កំណត់ ID & Password មុខតំណែង' },
  editorial_signals: { en: 'Editor & Signals', km: 'Editor & គ្រប់គ្រង Signal' },
  video_studio: { en: 'Videos Editor Studio', km: 'Videos Editor & មេរៀន' },
  hr_operations: { en: 'Employees & HR', km: 'HR & បុគ្គលិក' },
  leadership_finance: { en: 'Leadership Finnie', km: 'Leadership & ហិរញ្ញវត្ថុ' },
  members_vip: { en: 'VIP Customers', km: 'អតិថិជន & សមាជិក VIP' },
  system_security: { en: 'Webhook & Settings', km: 'សុវត្ថិភាពប្រព័ន្ធ' }
};

function generateSecurePassword(prefix = 'Alpha'): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const symbols = ['@', '#', '$', '!'];
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  return `${prefix}${sym}${digits}`;
}

// Mini smooth sparkline SVG for top gradient KPI cards
const MiniSparkline: React.FC<{ points: number[] }> = ({ points }) => {
  const width = 180;
  const height = 38;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - 4 - ((val - min) / range) * (height - 10);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = `M ${coords.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-9 overflow-visible mt-1">
      <path d={areaPath} fill="rgba(255,255,255,0.18)" />
      <path
        d={linePath}
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const DashboardManagementView: React.FC<DashboardManagementViewProps> = ({
  lang,
  setLang,
  staffAccounts,
  loggedInStaff,
  onLoginStaff,
  onLogoutStaff,
  onCreateStaff,
  onUpdateStaffCredentials,
  onDeleteStaff,
  auditLogs,
  onAddAuditLog,
  signals,
  onBroadcastSignal,
  onUpdateSignalStatus,
  onDeleteSignal,
  onPostChatAnnouncement,
  lessons,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  videoTasks,
  onAddVideoTask,
  onAdvanceVideoTask,
  onDeleteVideoTask,
  hrRequests,
  onAddHRRequest,
  onResolveHRRequest,
  payments,
  onApprovePayment,
  onRejectPayment,
  financeLedger,
  onAddFinanceEntry,
  users,
  onUpdateUserRole,
  onExtendVip,
  onToggleMT5Permission,
  webhookSecret,
  setWebhookSecret,
  duplicateWindowSeconds,
  setDuplicateWindowSeconds,
  onOpenMT5,
  autoApproveEnabled = true,
  onToggleAutoApprove,
  onAutoApproveAllPending,
  onOpenMemberCheckout,
  onDeletePayment,
  onUpdatePaymentNote,
  onRecordManualPayment,
  mt5Config = DEFAULT_MT5_CONFIG,
  onUpdateMT5Config = () => {},
  mt5Positions = [],
  onCloseMT5Position = () => {},
  onSetMT5Breakeven = () => {},
  mt5Logs = [],
  onSimulateMT5TestOrder = () => {},
  initialNav = 'dashboard',
  customerRegistrations = [],
  onAssignRegistrationToStaff = () => {},
  onCompleteStaffCheck = () => {},
  tvIndicators,
  onAddTvIndicator,
  onUpdateTvIndicator,
  onDeleteTvIndicator,
  webhookLogs = [],
  onAddWebhookLog = () => {}
}) => {
  const isKm = lang === 'km';

  // ---------------- SHELL & TOP BAR CONTROLS ----------------
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'month' | 'year'>('month');
  const [chartPeriod, setChartPeriod] = useState<'this_month' | 'last_month'>('this_month');
  const [profitYearFilter, setProfitYearFilter] = useState<'this_year' | 'last_year'>('this_year');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // ---------------- ACTIVE SIDEBAR VIEW ----------------
  const [activeNav, setActiveNav] = useState<ErpNavKey>(initialNav);

  useEffect(() => {
    setActiveNav(initialNav);
  }, [initialNav]);

  // ---------------- LOGIN FORM STATE ----------------
  const [loginPositionFilter, setLoginPositionFilter] = useState<StaffPosition | 'ALL'>('ALL');
  const [loginStaffCode, setLoginStaffCode] = useState('ADM-001');
  const [loginPassword, setLoginPassword] = useState('Admin@2026');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showDemoPasswords, setShowDemoPasswords] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // ---------------- SELF PASSWORD MODAL ----------------
  const [isSelfPassModalOpen, setIsSelfPassModalOpen] = useState(false);
  const [selfNewPassword, setSelfNewPassword] = useState('');
  const [selfConfirmPassword, setSelfConfirmPassword] = useState('');
  const [selfPassFeedback, setSelfPassFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // ---------------- UNIFIED ALL STAFF LIST STATE ----------------
  const [staffPositionFilter, setStaffPositionFilter] = useState<StaffPosition | 'ALL'>('ALL');
  const [staffDutyFilter, setStaffDutyFilter] = useState<'ALL' | StaffAccount['dutyStatus']>('ALL');
  const [staffSearch, setStaffSearch] = useState('');
  const [revealedStaffIds, setRevealedStaffIds] = useState<Record<string, boolean>>({});
  const [copiedCredentialId, setCopiedCredentialId] = useState<string | null>(null);
  const [confirmDeleteStaffId, setConfirmDeleteStaffId] = useState<string | null>(null);
  const [isHrPanelOpen, setIsHrPanelOpen] = useState(false);

  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [newPosition, setNewPosition] = useState<StaffPosition>('editor');
  const [newStaffCode, setNewStaffCode] = useState('EDT-002');
  const [newStaffPassword, setNewStaffPassword] = useState('Editor@2026');
  const [newFullName, setNewFullName] = useState('');
  const [newFullNameKm, setNewFullNameKm] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newShift, setNewShift] = useState('09:00 - 18:00');
  const [newSalary, setNewSalary] = useState(1000);
  const [newPermissions, setNewPermissions] = useState<StaffPermissionKey[]>(
    POSITION_DEFINITIONS.editor.defaultPermissions
  );
  const [createStaffFeedback, setCreateStaffFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSelectNewPosition = (pos: StaffPosition) => {
    setNewPosition(pos);
    const prefix = POSITION_DEFINITIONS[pos].idPrefix;
    const existingCount = staffAccounts.filter(s => s.position === pos).length;
    const nextNum = String(existingCount + 1).padStart(3, '0');
    setNewStaffCode(`${prefix}-${nextNum}`);
    setNewStaffPassword(generateSecurePassword(POSITION_DEFINITIONS[pos].shortTitle.split(' ')[0]));
    setNewPermissions([...POSITION_DEFINITIONS[pos].defaultPermissions]);
  };

  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [editStaffCode, setEditStaffCode] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(true);
  const [editPosition, setEditPosition] = useState<StaffPosition>('editor');
  const [editFullName, setEditFullName] = useState('');
  const [editFullNameKm, setEditFullNameKm] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSalary, setEditSalary] = useState(1000);
  const [editShift, setEditShift] = useState('');
  const [editPermissions, setEditPermissions] = useState<StaffPermissionKey[]>([]);
  const [editFeedback, setEditFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const openEditCredentialsModal = (staff: StaffAccount) => {
    setEditingStaff(staff);
    setEditStaffCode(staff.staffCode);
    setEditPassword(staff.password);
    setEditPosition(staff.position);
    setEditFullName(staff.fullName);
    setEditFullNameKm(staff.fullNameKm);
    setEditPhone(staff.phone);
    setEditEmail(staff.email);
    setEditSalary(staff.monthlySalary);
    setEditShift(staff.shift);
    setEditPermissions([...staff.permissions]);
    setEditFeedback(null);
  };

  // ---------------- EDITOR & SIGNALS MODULE STATE ----------------
  const [sigTicker, setSigTicker] = useState('XAUUSD');
  const [sigAction, setSigAction] = useState<'BUY' | 'SELL'>('BUY');
  const [sigEntry, setSigEntry] = useState(2724.5);
  const [sigSL, setSigSL] = useState(2716.0);
  const [sigTP1, setSigTP1] = useState(2734.0);
  const [sigTP2, setSigTP2] = useState(2745.0);
  const [sigTP3, setSigTP3] = useState(2758.0);
  const [sigTimeframe, setSigTimeframe] = useState('15m');
  const [sigStrategy, setSigStrategy] = useState('OrderBlock + FVG Confirmation');
  const [sigNotes, setSigNotes] = useState('London/NY liquidity sweep setup.');
  const [sigBroadcastToast, setSigBroadcastToast] = useState(false);
  const [pipsInputs, setPipsInputs] = useState<Record<string, string>>({});
  const [confirmDeleteSigId, setConfirmDeleteSigId] = useState<string | null>(null);

  const [annChannel, setAnnChannel] = useState<ChatChannelId>('vip');
  const [annTextKm, setAnnTextKm] = useState('');
  const [annTextEn, setAnnTextEn] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [annSentToast, setAnnSentToast] = useState(false);

  // ---------------- VIDEOS EDITOR STUDIO STATE ----------------
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [vidTitleKm, setVidTitleKm] = useState('');
  const [vidTitleEn, setVidTitleEn] = useState('');
  const [vidUrl, setVidUrl] = useState('');
  const [vidDuration, setVidDuration] = useState('18:30');
  const [vidCategory, setVidCategory] = useState<LessonCategory>('smc');
  const [vidAccess, setVidAccess] = useState<'all' | 'member' | 'vip'>('vip');
  const [vidInstructor, setVidInstructor] = useState('Master Roth (Chief Analyst)');
  const [vidDescKm, setVidDescKm] = useState('');
  const [vidTakeawaysKm, setVidTakeawaysKm] = useState('');
  const [vidSavedToast, setVidSavedToast] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<VideoLesson | null>(null);
  const [confirmDeleteLessonId, setConfirmDeleteLessonId] = useState<string | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<LessonCategory>('smc');
  const [newTaskDue, setNewTaskDue] = useState('2026-11-10');

  // ---------------- HR OPERATIONS STATE ----------------
  const [hrReqType, setHrReqType] = useState<HRRequestItem['requestType']>('leave');
  const [hrReqStaffId, setHrReqStaffId] = useState(staffAccounts[0]?.id || 'stf_001');
  const [hrReqDates, setHrReqDates] = useState('2026-11-01 - 2026-11-02');
  const [hrReqReason, setHrReqReason] = useState('');
  const [hrSavedToast, setHrSavedToast] = useState(false);

  // ---------------- FINANCE & BILLING STATE ----------------
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [finEntryTitle, setFinEntryTitle] = useState('');
  const [finEntryType, setFinEntryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [finEntryCat, setFinEntryCat] = useState<FinanceLedgerEntry['category']>('operations');
  const [finEntryAmount, setFinEntryAmount] = useState(150);
  const [finEntryMethod, setFinEntryMethod] = useState('ABA Business');
  const [finSavedToast, setFinSavedToast] = useState(false);

  // ---------------- CUSTOMERS FILTER ----------------
  const [memberQuery, setMemberQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'ALL' | Role>('ALL');

  // Map sidebar keys to required permission
  const canAccessNav = (nav: ErpNavKey): boolean => {
    if (!loggedInStaff) return false;
    if (loggedInStaff.position === 'administrator') return true;
    const perms = loggedInStaff.permissions;
    switch (nav) {
      case 'dashboard':
      case 'customer_signups':
      case 'all_staff':
      case 'reports':
        return true;
      case 'signals_desk':
        return perms.includes('editorial_signals');
      case 'tradingview_desk':
        return perms.includes('editorial_signals') || perms.includes('system_security');
      case 'mt5_bot':
        return (
          perms.includes('editorial_signals') ||
          perms.includes('system_security') ||
          perms.includes('leadership_finance')
        );
      case 'video_studio':
        return perms.includes('video_studio');
      case 'customers':
        return perms.includes('members_vip');
      case 'billing_slips':
      case 'accounts_ledger':
        return perms.includes('leadership_finance');
      case 'settings':
        return perms.includes('system_security');
      default:
        return false;
    }
  };

  useEffect(() => {
    if (loggedInStaff && !canAccessNav(activeNav)) {
      setActiveNav('dashboard');
    }
  }, [loggedInStaff?.id]);

  // ================ HANDLERS ================
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = onLoginStaff(loginStaffCode.trim(), loginPassword, loginPositionFilter);
    if (!res.ok) {
      setLoginError(isKm ? res.errorKm || 'ការចូលប្រព័ន្ធបរាជ័យ' : res.errorEn || 'Login failed');
    }
  };

  const handleCopyCredentials = (staff: StaffAccount) => {
    const posTitle = isKm
      ? POSITION_DEFINITIONS[staff.position].labelKm
      : POSITION_DEFINITIONS[staff.position].labelEn;
    const text = `AlphaSignal VIP — Staff Credentials\nPosition: ${posTitle}\nStaff ID: ${staff.staffCode}\nPassword: ${staff.password}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedCredentialId(staff.id);
    setTimeout(() => setCopiedCredentialId(null), 2000);
  };

  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateStaffFeedback(null);
    if (!newStaffCode.trim() || !newStaffPassword.trim() || !newFullName.trim()) {
      setCreateStaffFeedback({
        ok: false,
        msg: isKm ? 'សូមបំពេញ ឈ្មោះ, Staff ID និង Password ឱ្យបានគ្រប់គ្រាន់។' : 'Please fill Name, Staff ID, and Password.'
      });
      return;
    }

    const res = onCreateStaff({
      staffCode: newStaffCode.trim().toUpperCase(),
      password: newStaffPassword,
      fullName: newFullName.trim(),
      fullNameKm: newFullNameKm.trim() || newFullName.trim(),
      position: newPosition,
      email: newEmail.trim() || `${newStaffCode.toLowerCase()}@alphasignal.vip`,
      phone: newPhone.trim() || '012 000 000',
      status: 'active',
      dutyStatus: 'on_duty',
      shift: newShift.trim() || '09:00 - 18:00',
      monthlySalary: Number(newSalary) || 0,
      permissions: newPermissions.length > 0 ? newPermissions : ['overview']
    });

    if (!res.ok) {
      setCreateStaffFeedback({
        ok: false,
        msg: isKm ? res.errorKm || 'បរាជ័យក្នុងការបង្កើត' : res.errorEn || 'Failed to create staff'
      });
      return;
    }

    setCreateStaffFeedback({
      ok: true,
      msg: isKm
        ? `បានបង្កើតគណនី ${newStaffCode.toUpperCase()} ជោគជ័យ!`
        : `Created staff account ${newStaffCode.toUpperCase()} successfully!`
    });
    setNewFullName('');
    setNewFullNameKm('');
    setNewEmail('');
    setNewPhone('');
    setTimeout(() => {
      setIsCreateStaffOpen(false);
      setCreateStaffFeedback(null);
    }, 1200);
  };

  const handleSaveEditedCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!editStaffCode.trim() || !editPassword.trim()) {
      setEditFeedback({
        ok: false,
        msg: isKm ? 'Staff ID និង Password មិនអាចទទេបានទេ។' : 'Staff ID and Password cannot be empty.'
      });
      return;
    }

    const res = onUpdateStaffCredentials(editingStaff.id, {
      staffCode: editStaffCode.trim().toUpperCase(),
      password: editPassword,
      position: editPosition,
      fullName: editFullName.trim() || editingStaff.fullName,
      fullNameKm: editFullNameKm.trim() || editingStaff.fullNameKm,
      phone: editPhone.trim() || editingStaff.phone,
      email: editEmail.trim() || editingStaff.email,
      monthlySalary: Number(editSalary) || 0,
      shift: editShift.trim() || editingStaff.shift,
      permissions: editPermissions.length > 0 ? editPermissions : ['overview'],
      updatedAt: new Date().toISOString()
    });

    if (!res.ok) {
      setEditFeedback({
        ok: false,
        msg: isKm ? res.errorKm || 'មិនអាចរក្សាទុកបានទេ' : res.errorEn || 'Could not update credentials'
      });
      return;
    }

    setEditFeedback({
      ok: true,
      msg: isKm
        ? `បានកំណត់ ID (${editStaffCode.toUpperCase()}) និង Password ថ្មីរួចរាល់!`
        : `Updated ID (${editStaffCode.toUpperCase()}) and Password!`
    });
    setTimeout(() => {
      setEditingStaff(null);
      setEditFeedback(null);
    }, 1000);
  };

  const handleSelfPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInStaff) return;
    if (selfNewPassword.length < 4) {
      setSelfPassFeedback({
        ok: false,
        msg: isKm ? 'លេខសម្ងាត់ត្រូវមានយ៉ាងតិច ៤ តួអក្សរ។' : 'Password must be at least 4 characters.'
      });
      return;
    }
    if (selfNewPassword !== selfConfirmPassword) {
      setSelfPassFeedback({
        ok: false,
        msg: isKm ? 'លេខសម្ងាត់បញ្ជាក់មិនត្រូវគ្នាទេ។' : 'Confirmation password does not match.'
      });
      return;
    }

    const res = onUpdateStaffCredentials(loggedInStaff.id, {
      password: selfNewPassword,
      updatedAt: new Date().toISOString()
    });
    if (res.ok) {
      setSelfPassFeedback({
        ok: true,
        msg: isKm ? 'បានប្តូរលេខសម្ងាត់ផ្ទាល់ខ្លួនជោគជ័យ!' : 'Your password has been updated!'
      });
      setSelfNewPassword('');
      setSelfConfirmPassword('');
      setTimeout(() => {
        setIsSelfPassModalOpen(false);
        setSelfPassFeedback(null);
      }, 1100);
    }
  };

  const handleEditorBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const newSig: TradingSignal = {
      id: `sig_edt_${Date.now().toString().slice(-4)}`,
      ticker: sigTicker.toUpperCase(),
      assetName: sigTicker.toUpperCase() === 'XAUUSD' ? 'Gold Spot / USD' : sigTicker.toUpperCase(),
      action: sigAction,
      entryPrice: Number(sigEntry),
      sl: Number(sigSL),
      tp1: Number(sigTP1),
      tp2: Number(sigTP2),
      tp3: Number(sigTP3),
      status: 'ACTIVE',
      timeframe: sigTimeframe,
      strategy: sigStrategy,
      source: 'Admin Manual',
      timestamp: new Date().toISOString(),
      riskReward: '1 : 2.8',
      notes: sigNotes,
      isVipOnly: true,
      signature: `${sigTicker}_${sigAction}_${sigEntry}_edt`
    };
    onBroadcastSignal(newSig);
    onAddAuditLog(
      `Broadcasted ${sigTicker.toUpperCase()} ${sigAction} @ ${sigEntry}`,
      `បានផ្សាយ Signal ${sigTicker.toUpperCase()} ${sigAction} @ ${sigEntry}`,
      'SUCCESS'
    );
    setSigBroadcastToast(true);
    setTimeout(() => setSigBroadcastToast(false), 3000);
  };

  const handleSendEditorialPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTextKm.trim() && !annTextEn.trim()) return;
    onPostChatAnnouncement(
      annChannel,
      annTextEn.trim() || annTextKm.trim(),
      annTextKm.trim() || annTextEn.trim(),
      annPinned
    );
    onAddAuditLog(
      `Published market commentary to ${annChannel.toUpperCase()} channel`,
      `បានបង្ហោះអត្ថបទវិភាគទៅកាន់បន្ទប់ ${annChannel.toUpperCase()}`,
      'SUCCESS'
    );
    setAnnTextKm('');
    setAnnTextEn('');
    setAnnPinned(false);
    setAnnSentToast(true);
    setTimeout(() => setAnnSentToast(false), 2800);
  };

  const startEditingLesson = (lesson: VideoLesson) => {
    setEditingLessonId(lesson.id);
    setVidTitleKm(lesson.titleKm);
    setVidTitleEn(lesson.title);
    setVidUrl(lesson.videoUrl);
    setVidDuration(lesson.duration);
    setVidCategory(lesson.category);
    setVidAccess(lesson.accessLevel);
    setVidInstructor(lesson.instructor || 'Master Roth');
    setVidDescKm(lesson.descriptionKm);
    setVidTakeawaysKm((lesson.keyTakeawaysKm || []).join('\n'));
  };

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setVidTitleKm('');
    setVidTitleEn('');
    setVidUrl('');
    setVidDuration('18:30');
    setVidCategory('smc');
    setVidAccess('vip');
    setVidDescKm('');
    setVidTakeawaysKm('');
  };

  const handleSaveVideoLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vidTitleKm.trim() && !vidTitleEn.trim()) return;
    if (!vidUrl.trim()) return;

    const categoryKmMap: Record<LessonCategory, string> = {
      basics: 'មូលដ្ឋានគ្រឹះ',
      technical: 'បច្ចេកទេស Trade',
      smc: 'SMC & OrderBlock',
      mt5_bot: 'MT5 Auto-Trading',
      risk_management: 'គ្រប់គ្រងដើមទុន',
      psychology: 'ចិត្តវិទ្យា Trader'
    };

    const parsedTakeaways = vidTakeawaysKm
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingLessonId) {
      const existing = lessons.find(l => l.id === editingLessonId);
      if (existing) {
        onUpdateLesson({
          ...existing,
          title: vidTitleEn.trim() || vidTitleKm.trim(),
          titleKm: vidTitleKm.trim() || vidTitleEn.trim(),
          videoUrl: vidUrl.trim(),
          duration: vidDuration.trim() || '15:00',
          category: vidCategory,
          categoryKm: categoryKmMap[vidCategory],
          accessLevel: vidAccess,
          instructor: vidInstructor.trim() || existing.instructor,
          descriptionKm: vidDescKm.trim() || existing.descriptionKm,
          description: vidDescKm.trim() || existing.description,
          keyTakeawaysKm: parsedTakeaways.length > 0 ? parsedTakeaways : existing.keyTakeawaysKm
        });
        onAddAuditLog(
          `Edited video lesson "${vidTitleEn || vidTitleKm}"`,
          `បានកែសម្រួលមេរៀនវីដេអូ "${vidTitleKm || vidTitleEn}"`,
          'SUCCESS'
        );
      }
    } else {
      const created: VideoLesson = {
        id: `lesson_${Date.now().toString().slice(-5)}`,
        title: vidTitleEn.trim() || vidTitleKm.trim(),
        titleKm: vidTitleKm.trim() || vidTitleEn.trim(),
        description: vidDescKm.trim() || 'Structured trading video lesson.',
        descriptionKm: vidDescKm.trim() || 'មេរៀនវីដេអូជួញដូរពិសេស។',
        videoUrl: vidUrl.trim(),
        duration: vidDuration.trim() || '15:00',
        category: vidCategory,
        categoryKm: categoryKmMap[vidCategory],
        accessLevel: vidAccess,
        createdAt: new Date().toISOString(),
        viewsCount: 1,
        instructor: vidInstructor.trim() || 'Videos Editor Studio',
        keyTakeaways: parsedTakeaways.length > 0 ? parsedTakeaways : ['Institutional market structure', 'Strict risk rules'],
        keyTakeawaysKm: parsedTakeaways.length > 0 ? parsedTakeaways : ['ការវិភាគរចនាសម្ព័ន្ធទីផ្សារ', 'វិន័យគ្រប់គ្រងហានិភ័យ']
      };
      onAddLesson(created);
      onAddAuditLog(
        `Uploaded new video lesson "${created.title}"`,
        `បានបង្ហោះមេរៀនវីដេអូថ្មី "${created.titleKm}"`,
        'SUCCESS'
      );
    }

    resetLessonForm();
    setVidSavedToast(true);
    setTimeout(() => setVidSavedToast(false), 2800);
  };

  const handleExportFinanceCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Title', 'Amount_USD', 'Method', 'RecordedBy'];
    const rows = financeLedger.map(item => [
      item.id,
      item.date,
      item.type,
      item.category,
      `"${item.title.replace(/"/g, '""')}"`,
      item.amount.toFixed(2),
      `"${item.paymentMethod}"`,
      item.recordedBy
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AlphaSignal_ERP_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ================ DERIVED ANALYTICS & METRICS ================
  const pendingPayments = payments.filter(p => p.status === 'PENDING');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const approvedPaymentsSum = payments
    .filter(p => p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.amount, 0);

  const periodMultiplier = dateFilter === 'today' ? 0.12 : dateFilter === 'month' ? 1 : 8.5;
  const baseMonthSales =
    11050 +
    financeLedger.filter(e => e.type === 'INCOME').reduce((sum, e) => sum + e.amount, 0) +
    approvedPaymentsSum;
  const baseExpenses =
    4800 + financeLedger.filter(e => e.type === 'EXPENSE').reduce((sum, e) => sum + e.amount, 0);

  const todaySales = Math.round(1240 + approvedPaymentsSum * 2.5);
  const displayMonthSales = Math.round(baseMonthSales * periodMultiplier);
  const displayProfit = Math.round((baseMonthSales - baseExpenses) * periodMultiplier);
  const totalPipsGained = signals.reduce((acc, s) => acc + Math.max(0, s.pipsGained || 0), 0) + 1480;
  const totalCustomersCount = 1245 + users.length;
  const totalMonthlyPayroll = staffAccounts
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.monthlySalary, 0);

  const pendingHrCount = hrRequests.filter(r => r.status === 'PENDING').length;
  const newSignupsForAdminCount = customerRegistrations.filter(
    r => r.workflowStage === 'NEW_FOR_ADMIN'
  ).length;
  const assignedToLoggedInCount = loggedInStaff
    ? customerRegistrations.filter(
        r =>
          r.workflowStage === 'ASSIGNED_TO_STAFF' &&
          (r.assignedToStaffId === loggedInStaff.id ||
            r.assignedToStaffCode === loggedInStaff.staffCode)
      ).length
    : 0;
  const signupNavBadge =
    loggedInStaff?.position === 'administrator'
      ? newSignupsForAdminCount
      : assignedToLoggedInCount;
  const totalAlertBadge = pendingPayments.length + pendingHrCount + signupNavBadge;

  // ============================================================================
  // VIEW A: ENTERPRISE ERP STAFF ID & PASSWORD SIGN-IN PORTAL
  // ============================================================================
  if (!loggedInStaff) {
    const visibleDirectory =
      loginPositionFilter === 'ALL'
        ? staffAccounts
        : staffAccounts.filter(s => s.position === loginPositionFilter);

    return (
      <div className="min-h-[calc(100vh-52px)] bg-[#eef2f8] text-slate-800 p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Left 5 Cols: Deep Royal Navy ERP Brand & Login Form */}
          <div className="lg:col-span-5 bg-[#081534] text-white p-7 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Gem className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    AlphaSignal ERP Management
                  </h1>
                  <p className="text-xs text-amber-300">
                    {isKm ? 'ប្រព័ន្ធគ្រប់គ្រងតាមមុខតំណែងទាំង ៥' : 'Smart Solutions for Trading Operations'}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  {isKm ? 'ចូលប្រព័ន្ធដោយ Staff ID & Password' : 'Position Sign-In Portal'}
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isKm
                    ? 'បញ្ចូល Staff ID និង Password តាមមុខតំណែង Administrator, Editor, Videos Editor, HR ឬ Leadership Finnie។'
                    : 'Enter your assigned Staff ID and Password to unlock your department dashboard.'}
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isKm ? 'មុខតំណែង (Position)' : 'Select Position'}
                  </label>
                  <select
                    value={loginPositionFilter}
                    onChange={e => setLoginPositionFilter(e.target.value as StaffPosition | 'ALL')}
                    className="w-full bg-[#0f224d] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="ALL">
                      {isKm ? 'គ្រប់មុខតំណែង (Auto-Detect by ID)' : 'All Positions (Auto-Detect)'}
                    </option>
                    {ALL_POSITIONS.map(pos => (
                      <option key={pos} value={pos}>
                        {isKm ? POSITION_DEFINITIONS[pos].labelKm : POSITION_DEFINITIONS[pos].labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isKm ? 'អត្តលេខបុគ្គលិក (Staff ID)' : 'Staff ID'}
                  </label>
                  <input
                    type="text"
                    required
                    value={loginStaffCode}
                    onChange={e => setLoginStaffCode(e.target.value.toUpperCase())}
                    placeholder="ADM-001"
                    className="w-full bg-[#0f224d] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono tabular-nums font-bold uppercase focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isKm ? 'លេខសម្ងាត់ (Password)' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-[#0f224d] border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(v => !v)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isKm ? 'ចូលកាន់ផ្ទាំង Dashboard Management' : 'Sign In to ERP Dashboard'}
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              {isKm
                ? 'Administrator (ADM-001) អាចកំណត់ និងផ្លាស់ប្តូរ ID & Password សម្រាប់គ្រប់មុខតំណែងទាំងអស់។'
                : 'Sign in as Administrator (ADM-001) to configure Staff IDs and Passwords for every role.'}
            </div>
          </div>

          {/* Right 7 Cols: Light Crisp Position Directory for 1-Click Testing */}
          <div className="lg:col-span-7 p-7 sm:p-8 bg-white space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isKm ? 'គណនីតាមមុខតំណែងទាំង ៥ (Quick Role Access)' : '5 Department Position Accounts'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isKm
                    ? 'ជ្រើសរើសមុខតំណែងណាមួយខាងក្រោមដើម្បីសាកល្បងចូលប្រព័ន្ធភ្លាមៗ'
                    : 'Click Quick Sign In on any position to preview its permission-scoped ERP workspace'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {setLang && (
                  <button
                    type="button"
                    onClick={() => setLang(isKm ? 'en' : 'km')}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                  >
                    {isKm ? 'EN' : 'ខ្មែរ'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDemoPasswords(v => !v)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {showDemoPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showDemoPasswords ? (isKm ? 'លាក់ Password' : 'Hide Passwords') : (isKm ? 'មើល Password' : 'Show Passwords')}</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {visibleDirectory.map(staff => {
                const posInfo = POSITION_DEFINITIONS[staff.position];
                const isSuspended = staff.status === 'suspended';
                return (
                  <div
                    key={staff.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {posInfo.shortTitle}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-medium text-slate-600">
                          {isKm ? staff.fullNameKm : staff.fullName}
                        </span>
                        {isSuspended && (
                          <span className="text-xs font-semibold text-rose-600">· Suspended</span>
                        )}
                      </div>
                      <div className="text-xs font-mono tabular-nums text-slate-500">
                        ID: <strong className="text-blue-600">{staff.staffCode}</strong> · Pass:{' '}
                        <strong className="text-slate-800">
                          {showDemoPasswords ? staff.password : '••••••••'}
                        </strong>
                      </div>
                      <p className="text-[11px] text-slate-500">{isKm ? posInfo.descKm : posInfo.descEn}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginPositionFilter(staff.position);
                          setLoginStaffCode(staff.staffCode);
                          setLoginPassword(staff.password);
                          setLoginError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer whitespace-nowrap"
                      >
                        {isKm ? 'បំពេញ ID' : 'Fill'}
                      </button>
                      <button
                        type="button"
                        disabled={isSuspended}
                        onClick={() => {
                          const res = onLoginStaff(staff.staffCode, staff.password, staff.position);
                          if (!res.ok) {
                            setLoginError(isKm ? res.errorKm || 'បរាជ័យ' : res.errorEn || 'Login failed');
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                          isSuspended
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm'
                        }`}
                      >
                        {isKm ? 'ចូលភ្លាម →' : 'Sign In →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW B: FULL ENTERPRISE ERP SHELL (MATCHING REFERENCE SCREENSHOT)
  // ============================================================================
  const currentPosInfo = POSITION_DEFINITIONS[loggedInStaff.position];

  const canManageStaffCredentials =
    loggedInStaff.position === 'administrator' ||
    loggedInStaff.permissions.includes('staff_credentials');
  const canManageHR =
    loggedInStaff.position === 'administrator' ||
    loggedInStaff.permissions.includes('hr_operations');
  const canViewSalary =
    loggedInStaff.position === 'administrator' ||
    loggedInStaff.permissions.includes('hr_operations') ||
    loggedInStaff.permissions.includes('leadership_finance');

  const handleExportStaffCSV = () => {
    const headers = [
      'No',
      'Staff ID',
      'Full Name (KH)',
      'Full Name (EN)',
      'Position',
      'Phone',
      'Email',
      'Work Shift',
      'Duty Status',
      'Monthly Salary (USD)',
      'Account Status'
    ];
    const rows = filteredStaffList.map((s, idx) => [
      idx + 1,
      `"${s.staffCode}"`,
      `"${(s.fullNameKm || '').replace(/"/g, '""')}"`,
      `"${(s.fullName || '').replace(/"/g, '""')}"`,
      `"${POSITION_DEFINITIONS[s.position].shortTitle}"`,
      `"${s.phone}"`,
      `"${s.email}"`,
      `"${s.shift}"`,
      `"${s.dutyStatus}"`,
      canViewSalary ? s.monthlySalary.toFixed(2) : '"Protected"',
      `"${s.status.toUpperCase()}"`
    ]);
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AlphaSignal_All_Staff_List_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sidebarItems: {
    key: ErpNavKey;
    labelEn: string;
    labelKm: string;
    icon: React.FC<{ className?: string }>;
    iconColor: string;
    badge?: number;
  }[] = [
    {
      key: 'dashboard',
      labelEn: 'Dashboard',
      labelKm: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-sky-400'
    },
    {
      key: 'customer_signups',
      labelEn: 'Sign-Ups & Assign',
      labelKm: 'ចុះឈ្មោះថ្មី & ចាត់តាំងឆែក',
      icon: UserPlus,
      iconColor: 'text-emerald-400',
      badge: signupNavBadge || undefined
    },
    {
      key: 'all_staff',
      labelEn: 'All Staff List',
      labelKm: 'បញ្ជីបុគ្គលិកទាំងអស់',
      icon: Briefcase,
      iconColor: 'text-amber-400',
      badge: pendingHrCount || undefined
    },
    {
      key: 'billing_slips',
      labelEn: 'Customer Payments',
      labelKm: 'បញ្ជីអតិថិជនបង់ប្រាក់',
      icon: CreditCard,
      iconColor: 'text-cyan-400',
      badge: pendingPayments.length || undefined
    },
    {
      key: 'accounts_ledger',
      labelEn: 'Accounts (Finnie)',
      labelKm: 'គណនេយ្យ & ចំណាយ',
      icon: Wallet,
      iconColor: 'text-teal-400'
    },
    {
      key: 'customers',
      labelEn: 'Customers (VIP)',
      labelKm: 'អតិថិជន VIP',
      icon: Users,
      iconColor: 'text-rose-400'
    },
    {
      key: 'signals_desk',
      labelEn: 'Signals (Editor)',
      labelKm: 'គ្រប់គ្រង Signal',
      icon: Radio,
      iconColor: 'text-emerald-400'
    },
    {
      key: 'tradingview_desk',
      labelEn: 'TradingView & Indicators',
      labelKm: 'TradingView & Indicators',
      icon: TrendingUp,
      iconColor: 'text-sky-400',
      badge: tvIndicators ? tvIndicators.filter(i => i.active).length : undefined
    },
    {
      key: 'mt5_bot',
      labelEn: 'MT5 & Bot Auto',
      labelKm: 'MT5 & Bot Auto Trading',
      icon: Bot,
      iconColor: 'text-teal-400'
    },
    {
      key: 'video_studio',
      labelEn: 'Videos Editor',
      labelKm: 'វីដេអូមេរៀន',
      icon: Film,
      iconColor: 'text-purple-400'
    },
    {
      key: 'reports',
      labelEn: 'Reports',
      labelKm: 'របាយការណ៍',
      icon: FileBarChart,
      iconColor: 'text-lime-400'
    },
    {
      key: 'settings',
      labelEn: 'Settings & MT5',
      labelKm: 'ការកំណត់ប្រព័ន្ធ',
      icon: Settings,
      iconColor: 'text-slate-300'
    }
  ];

  // Chart Data for Sales & Profit Overview (SVG Dual Line Chart)
  const chartPointsSales =
    chartPeriod === 'this_month'
      ? [5.2, 10.4, 10.1, 12.8, 14.6, 12.1, 15.6, 13.4, 11.5, 16.8, 15.9, 19.6]
      : [4.5, 8.2, 9.0, 10.5, 11.8, 10.2, 12.9, 11.5, 10.8, 13.6, 14.0, 15.4];
  const chartPointsProfit =
    chartPeriod === 'this_month'
      ? [1.4, 3.2, 3.8, 5.9, 4.8, 7.1, 6.2, 5.4, 7.8, 7.6, 8.9, 10.8]
      : [1.1, 2.5, 3.1, 4.2, 3.9, 5.5, 4.9, 4.4, 6.0, 6.2, 7.1, 8.2];
  const chartDates = ['01 Oct', '05 Oct', '10 Oct', '15 Oct', '20 Oct', '25 Oct', '28 Oct'];

  const buildSmoothLineCoords = (arr: number[], w: number, h: number, maxVal = 22) =>
    arr.map((v, i) => ({
      x: 34 + (i / (arr.length - 1)) * (w - 48),
      y: h - 26 - (v / maxVal) * (h - 44)
    }));

  const salesCoords = buildSmoothLineCoords(chartPointsSales, 460, 210);
  const profitCoords = buildSmoothLineCoords(chartPointsProfit, 460, 210);

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const salesLine = toPath(salesCoords);
  const salesArea = `${salesLine} L ${salesCoords[salesCoords.length - 1].x.toFixed(1)} 184 L ${salesCoords[0].x.toFixed(1)} 184 Z`;
  const profitLine = toPath(profitCoords);
  const profitArea = `${profitLine} L ${profitCoords[profitCoords.length - 1].x.toFixed(1)} 184 L ${profitCoords[0].x.toFixed(1)} 184 Z`;

  // Filtered collections for sub-views
  const searchLower = globalSearch.trim().toLowerCase();

  const filteredStaffList = staffAccounts.filter(s => {
    if (staffPositionFilter !== 'ALL' && s.position !== staffPositionFilter) return false;
    if (staffDutyFilter !== 'ALL' && s.dutyStatus !== staffDutyFilter) return false;
    const q = (staffSearch || globalSearch).trim().toLowerCase();
    if (!q) return true;
    return (
      s.staffCode.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.fullNameKm.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const filteredMembers = users.filter(u => {
    if (memberRoleFilter !== 'ALL' && u.role !== memberRoleFilter) return false;
    const q = (memberQuery || globalSearch).trim().toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
  });

  const filteredLedger = financeLedger.filter(e => {
    if (ledgerTypeFilter !== 'ALL' && e.type !== ledgerTypeFilter) return false;
    if (!searchLower) return true;
    return e.title.toLowerCase().includes(searchLower) || e.recordedBy.toLowerCase().includes(searchLower);
  });

  // Action Required Alert Rows (matching right card in Row 3 of screenshot)
  const alertRows: {
    id: string;
    name: string;
    dept: string;
    metric: string;
    severity: 'Urgent' | 'Low';
    targetNav: ErpNavKey;
  }[] = [
    ...customerRegistrations
      .filter(r => r.workflowStage === 'NEW_FOR_ADMIN')
      .map(r => ({
        id: r.id,
        name: `${r.fullName} (Sign Up)`,
        dept: 'Admin',
        metric: 'Assign Staff',
        severity: 'Urgent' as const,
        targetNav: 'customer_signups' as ErpNavKey
      })),
    ...pendingPayments.map(p => ({
      id: p.id,
      name: `${p.userName} (${p.paymentMethod})`,
      dept: 'Finnie',
      metric: `$${p.amount}`,
      severity: 'Urgent' as const,
      targetNav: 'billing_slips' as ErpNavKey
    })),
    ...hrRequests
      .filter(r => r.status === 'PENDING')
      .map(r => ({
        id: r.id,
        name: `${r.staffName} (${r.requestType})`,
        dept: 'HR',
        metric: r.staffCode,
        severity: 'Low' as const,
        targetNav: 'all_staff' as ErpNavKey
      })),
    ...videoTasks
      .filter(t => t.stage !== 'published')
      .slice(0, 2)
      .map(t => ({
        id: t.id,
        name: t.title.slice(0, 26),
        dept: 'Video',
        metric: t.stage,
        severity: 'Low' as const,
        targetNav: 'video_studio' as ErpNavKey
      }))
  ].slice(0, 4);

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-[#eef2f8] text-slate-800 overflow-hidden'
          : 'min-h-[calc(100vh-52px)] flex flex-col bg-[#eef2f8] text-slate-800'
      }
    >
      {/* ==================== TOP ROYAL NAVY ERP HEADER BAR ==================== */}
      <header className="h-16 bg-[#071330] text-white px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 border-b border-[#132654] shadow-md">
        {/* Left: Gold Emblem + Brand Title + Sidebar Hamburger */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Gem className="w-5 h-5" />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                AlphaSignal Management
              </div>
              <div className="text-[11px] text-amber-300 font-medium whitespace-nowrap">
                {isKm
                  ? 'ប្រព័ន្ធគ្រប់គ្រងតាមមុខតំណែងឆ្លាតវៃ'
                  : 'Smart Solutions for Trading Business'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileSidebarOpen(v => !v);
              } else {
                setSidebarCollapsed(v => !v);
              }
            }}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Clean White Rounded Global Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder={isKm ? 'ស្វែងរក Staff ID, សមាជិក, វិក្កយបត្រ...' : 'Search here...'}
              className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-full pl-10 pr-9 py-2 text-xs font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Date Selector + Bell + Gear + Fullscreen + Active Staff Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* White Rounded Date / Period Pill */}
          <div className="hidden md:flex items-center bg-white text-slate-800 rounded-full px-3.5 py-1.5 text-xs font-semibold gap-2 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as 'today' | 'month' | 'year')}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="today">{isKm ? 'ថ្ងៃនេះ (28 Oct 2026)' : '28 Oct 2026 (Today)'}</option>
              <option value="month">{isKm ? 'ខែនេះ (Oct 2026)' : 'Oct 2026 (Month)'}</option>
              <option value="year">{isKm ? 'ឆ្នាំនេះ (2026)' : 'FY 2026 (Year)'}</option>
            </select>
          </div>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen(v => !v);
                setProfileMenuOpen(false);
              }}
              className="relative p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {totalAlertBadge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                  {totalAlertBadge}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-3 z-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900">
                    {isKm ? 'ការជូនដំណឹងបន្ទាន់' : 'Pending Notifications'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {pendingPayments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (canAccessNav('billing_slips')) setActiveNav('billing_slips');
                      setNotifOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-medium text-slate-700">
                      {pendingPayments.length} Payment Slips Pending
                    </span>
                    <span className="text-blue-600 font-bold">Review →</span>
                  </button>
                )}
                {pendingHrCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav('all_staff');
                      setIsHrPanelOpen(true);
                      setNotifOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-medium text-slate-700">
                      {pendingHrCount} HR Leave / Shift Requests
                    </span>
                    <span className="text-blue-600 font-bold">Open →</span>
                  </button>
                )}
                {totalAlertBadge === 0 && (
                  <div className="py-4 text-center text-xs text-slate-400">All queues cleared</div>
                )}
              </div>
            )}
          </div>

          {/* Shortcut to Unified Staff List or Self Password */}
          <button
            type="button"
            onClick={() => {
              if (canManageStaffCredentials) {
                setActiveNav('all_staff');
              } else {
                setIsSelfPassModalOpen(true);
              }
            }}
            className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isKm ? 'បញ្ជីបុគ្គលិកទាំងអស់' : 'All Staff List'}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(v => !v)}
            className="hidden sm:flex p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen ERP Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Staff Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(v => !v);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-slate-200 text-[#071330] font-extrabold text-xs flex items-center justify-center border-2 border-emerald-400 shrink-0">
                {loggedInStaff.fullName
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-bold text-white whitespace-nowrap">
                  {currentPosInfo.shortTitle}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono font-semibold whitespace-nowrap">
                  {loggedInStaff.staffCode}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300 hidden sm:block" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">
                    {isKm ? loggedInStaff.fullNameKm : loggedInStaff.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {loggedInStaff.staffCode} · {currentPosInfo.shortTitle}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveNav('all_staff');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isKm ? 'បញ្ជីបុគ្គលិកទាំងអស់' : 'All Staff List'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelfPassFeedback(null);
                    setIsSelfPassModalOpen(true);
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isKm ? 'ប្តូរលេខសម្ងាត់ផ្ទាល់ខ្លួន' : 'Change My Password'}</span>
                </button>

                {setLang && (
                  <button
                    type="button"
                    onClick={() => {
                      setLang(isKm ? 'en' : 'km');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>{isKm ? 'ប្តូរភាសា (Language)' : 'Language'}</span>
                    <span className="font-bold text-blue-600">{isKm ? 'English' : 'ភាសាខ្មែរ'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogoutStaff();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isKm ? 'ប្តូរមុខតំណែង / ចាកចេញ' : 'Switch Position / Logout'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==================== BODY: LEFT NAVY SIDEBAR + LIGHT CANVAS ==================== */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/50 z-30 lg:hidden"
          />
        )}

        {/* Left Dark Navy Sidebar */}
        <aside
          className={`${
            mobileSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 z-40 pt-16 lg:pt-0' : '-translate-x-full lg:translate-x-0 hidden lg:flex'
          } ${
            sidebarCollapsed ? 'lg:w-20' : 'w-60'
          } bg-[#091738] text-slate-200 flex-col justify-between shrink-0 border-r border-[#142959] select-none overflow-y-auto`}
        >
          <div className="p-3 space-y-1">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const allowed = canAccessNav(item.key);
              const isActive = activeNav === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={!allowed}
                  onClick={() => {
                    if (allowed) {
                      setActiveNav(item.key);
                      setMobileSidebarOpen(false);
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1d63ed] to-[#2575fc] text-white font-bold shadow-md shadow-blue-950/50 cursor-pointer'
                      : allowed
                      ? 'text-slate-200 hover:bg-white/10 font-medium cursor-pointer'
                      : 'text-slate-500 opacity-45 cursor-not-allowed'
                  }`}
                  title={isKm ? item.labelKm : item.labelEn}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.iconColor}`} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{isKm ? item.labelKm : item.labelEn}</span>
                    )}
                  </div>

                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!allowed ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : item.badge ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold leading-none">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`}
                        />
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Logout Item in Sidebar */}
            <button
              type="button"
              onClick={onLogoutStaff}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/15 flex items-center gap-3 transition-colors cursor-pointer mt-2"
            >
              <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
              {!sidebarCollapsed && (
                <span>{isKm ? 'ចាកចេញ (Logout)' : 'Logout'}</span>
              )}
            </button>
          </div>

          {/* Bottom Sidebar Live Gold & Crypto Rate Widget (Matching Screenshot!) */}
          {!sidebarCollapsed && (
            <div className="m-3 p-3.5 rounded-2xl bg-[#061029] border border-[#193066] space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs border-b border-[#162957] pb-2">
                <TrendingUp className="w-4 h-4" />
                <span>{isKm ? 'ហាងឆេងមាសផ្ទាល់ (Live Gold)' : 'Live Gold & Market'}</span>
              </div>

              <div className="space-y-2 text-[11px] font-mono tabular-nums">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-[10px] font-sans">Gold Spot (XAUUSD)</div>
                    <div className="text-white font-bold">$ 2,724.50 / oz</div>
                  </div>
                  <span className="text-emerald-400 font-semibold">▲ 0.65%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-[10px] font-sans">Bitcoin (BTCUSD)</div>
                    <div className="text-white font-bold">$ 68,420.00</div>
                  </div>
                  <span className="text-emerald-400 font-semibold">▲ 1.18%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-[10px] font-sans">EUR / USD</div>
                    <div className="text-white font-bold">1.0865</div>
                  </div>
                  <span className="text-emerald-400 font-semibold">▲ 0.40%</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-1 border-t border-[#162957]">
                Role: <span className="text-amber-300 font-mono">{loggedInStaff.staffCode}</span>
              </div>
            </div>
          )}
        </aside>

        {/* ==================== MAIN LIGHT ERP CONTENT VIEWPORT ==================== */}
        <div className="flex-1 min-w-0 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* ==================== VIEW 1: EXECUTIVE ERP DASHBOARD ==================== */}
          {activeNav === 'dashboard' && (
            <div className="space-y-4">
              {/* ROW 1: 6 Colorful Gradient KPI Cards with Sparklines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
                {/* Card 1: Purple-Indigo */}
                <div
                  onClick={() => canAccessNav('billing_slips') && setActiveNav('billing_slips')}
                  className="rounded-2xl p-4 text-white bg-gradient-to-br from-[#635bff] to-[#4f46e5] shadow-sm relative overflow-hidden cursor-pointer hover:brightness-105 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-white/90">
                        {isKm ? 'ចំណូលថ្ងៃនេះ' : "Today's Revenue"}
                      </div>
                      <div className="text-xl font-extrabold font-mono tabular-nums mt-1">
                        $ {todaySales.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-white/90 mt-1.5">
                    ▲ 12.8% vs Yesterday
                  </div>
                  <MiniSparkline points={[12, 16, 14, 21, 18, 25, 22, 29]} />
                </div>

                {/* Card 2: Emerald-Green */}
                <div
                  onClick={() => canAccessNav('accounts_ledger') && setActiveNav('accounts_ledger')}
                  className="rounded-2xl p-4 text-white bg-gradient-to-br from-[#10b981] to-[#059669] shadow-sm relative overflow-hidden cursor-pointer hover:brightness-105 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-white/90">
                        {isKm ? 'ចំណូលខែនេះ' : 'This Month Sales'}
                      </div>
                      <div className="text-xl font-extrabold font-mono tabular-nums mt-1">
                        $ {displayMonthSales.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-white/90 mt-1.5">
                    ▲ 18.6% vs Last Month
                  </div>
                  <MiniSparkline points={[10, 13, 18, 15, 22, 20, 27, 32]} />
                </div>

                {/* Card 3: Orange-Amber */}
                <div
                  onClick={() => canAccessNav('accounts_ledger') && setActiveNav('accounts_ledger')}
                  className="rounded-2xl p-4 text-white bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-sm relative overflow-hidden cursor-pointer hover:brightness-105 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-white/90">
                        {isKm ? 'ប្រាក់ចំណេញសុទ្ធ' : 'Net Profit'}
                      </div>
                      <div className="text-xl font-extrabold font-mono tabular-nums mt-1">
                        $ {displayProfit.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white text-orange-600 flex items-center justify-center shrink-0 font-extrabold text-base">
                      $
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-white/90 mt-1.5">
                    ▲ 10.4% vs Last Month
                  </div>
                  <MiniSparkline points={[8, 12, 11, 15, 14, 19, 17, 23]} />
                </div>

                {/* Card 4: Royal Blue */}
                <div
                  onClick={() => canAccessNav('signals_desk') && setActiveNav('signals_desk')}
                  className="rounded-2xl p-4 text-white bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] shadow-sm relative overflow-hidden cursor-pointer hover:brightness-105 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-white/90">
                        {isKm ? 'ពិន្ទុ Signal សរុប' : 'Total Signal Pips'}
                      </div>
                      <div className="text-xl font-extrabold font-mono tabular-nums mt-1">
                        +{totalPipsGained.toLocaleString()} p
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Gem className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-white/90 mt-1.5">
                    ▲ 84.6% Win Rate
                  </div>
                  <MiniSparkline points={[15, 14, 19, 21, 18, 24, 26, 30]} />
                </div>

                {/* Card 5: Pink-Rose */}
                <div
                  onClick={() => canAccessNav('customers') && setActiveNav('customers')}
                  className="rounded-2xl p-4 text-white bg-gradient-to-br from-[#f43f5e] to-[#db2777] shadow-sm relative overflow-hidden cursor-pointer hover:brightness-105 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-white/90">
                        {isKm ? 'អតិថិជនសរុប' : 'Total Customers'}
                      </div>
                      <div className="text-xl font-extrabold font-mono tabular-nums mt-1">
                        {totalCustomersCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-white/90 mt-1.5">
                    ▲ 7.1% vs Last Month
                  </div>
                  <MiniSparkline points={[11, 15, 13, 17, 16, 20, 24, 28]} />
                </div>

                {/* Card 6: Teal-Cyan */}
                <div
                  onClick={() => setActiveNav('all_staff')}
                  className="rounded-2xl p-4 text-white bg-gradient-to-br from-[#14b8a6] to-[#0891b2] shadow-sm relative overflow-hidden cursor-pointer hover:brightness-105 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-white/90">
                        {isKm ? 'គណនីមុខតំណែង ID' : 'Staff Role IDs'}
                      </div>
                      <div className="text-xl font-extrabold font-mono tabular-nums mt-1">
                        {staffAccounts.length} / 5 Roles
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <KeyRound className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-white/90 mt-1.5">
                    {pendingPayments.length} Pending ($ {pendingAmount})
                  </div>
                  <MiniSparkline points={[18, 16, 20, 19, 23, 21, 25, 27]} />
                </div>
              </div>

              {/* ROW 2: Sales Overview Line Chart + Category Donut + Collection Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left 5 Cols: Revenue & Profit Overview Dual Line Chart */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {isKm ? 'ទិដ្ឋភាពចំណូល & ប្រាក់ចំណេញ (ខែនេះ)' : 'Revenue Overview (This Month)'}
                    </h3>
                    <select
                      value={chartPeriod}
                      onChange={e => setChartPeriod(e.target.value as 'this_month' | 'last_month')}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
                    >
                      <option value="this_month">{isKm ? 'ខែនេះ (This Month)' : 'This Month'}</option>
                      <option value="last_month">{isKm ? 'ខែមុន (Last Month)' : 'Last Month'}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-5 text-xs font-medium text-slate-600 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-full bg-blue-600 inline-block" />
                      <span>{isKm ? 'ចំណូល ($)' : 'Revenue ($)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span>{isKm ? 'ចំណេញសុទ្ធ ($)' : 'Profit ($)'}</span>
                    </div>
                  </div>

                  <svg viewBox="0 0 460 210" className="w-full h-48 overflow-visible">
                    <defs>
                      <linearGradient id="erpSalesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
                      </linearGradient>
                      <linearGradient id="erpProfitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines & Y Labels */}
                    {[0, 5, 10, 15, 20].map(val => {
                      const y = 184 - (val / 22) * 166;
                      return (
                        <g key={val}>
                          <line
                            x1="34"
                            y1={y}
                            x2="448"
                            y2={y}
                            stroke="#e2e8f0"
                            strokeDasharray="3 3"
                          />
                          <text x="4" y={y + 4} className="text-[10px] fill-slate-400 font-mono">
                            {val === 0 ? '0' : `${val}k`}
                          </text>
                        </g>
                      );
                    })}

                    <path d={salesArea} fill="url(#erpSalesGrad)" />
                    <path d={profitArea} fill="url(#erpProfitGrad)" />

                    <path
                      d={salesLine}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d={profitLine}
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {salesCoords.map((pt, i) => (
                      <circle
                        key={`s_${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth="2"
                      />
                    ))}
                    {profitCoords.map((pt, i) => (
                      <circle
                        key={`p_${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#16a34a"
                        strokeWidth="2"
                      />
                    ))}

                    {chartDates.map((lbl, idx) => {
                      const x = 34 + (idx / (chartDates.length - 1)) * (460 - 48);
                      return (
                        <text
                          key={lbl}
                          x={x}
                          y="202"
                          textAnchor="middle"
                          className="text-[10px] fill-slate-500 font-mono"
                        >
                          {lbl}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                {/* Middle 3.5 / 4 Cols: Revenue by Membership Category Donut Chart */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {isKm ? 'ចំណូលតាមកញ្ចប់សមាជិក' : 'Sales by Plan Tier'}
                  </h3>

                  <div className="flex flex-col xl:flex-row items-center justify-between gap-4 my-auto py-2">
                    {/* SVG Multi-segment Donut */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        {/* r=44, circumference = 276.46 */}
                        <circle cx="60" cy="60" r="44" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                        {/* 65% Gold/Amber */}
                        <circle
                          cx="60"
                          cy="60"
                          r="44"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="18"
                          strokeDasharray="179.7 276.5"
                          strokeDashoffset="0"
                        />
                        {/* 18% Blue */}
                        <circle
                          cx="60"
                          cy="60"
                          r="44"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="18"
                          strokeDasharray="49.8 276.5"
                          strokeDashoffset="-179.7"
                        />
                        {/* 10% Green */}
                        <circle
                          cx="60"
                          cy="60"
                          r="44"
                          fill="none"
                          stroke="#16a34a"
                          strokeWidth="18"
                          strokeDasharray="27.6 276.5"
                          strokeDashoffset="-229.5"
                        />
                        {/* 7% Purple */}
                        <circle
                          cx="60"
                          cy="60"
                          r="44"
                          fill="none"
                          stroke="#7c3aed"
                          strokeWidth="18"
                          strokeDasharray="19.4 276.5"
                          strokeDashoffset="-257.1"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                        <Gem className="w-7 h-7" />
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="w-full space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span>VIP Pro 3M</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pl-4">$ 9,680</div>
                        </div>
                        <span className="font-bold font-mono text-slate-900">65%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            <span>Lifetime VIP</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pl-4">$ 2,680</div>
                        </div>
                        <span className="font-bold font-mono text-slate-900">18%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            <span>Standard 1M</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pl-4">$ 1,490</div>
                        </div>
                        <span className="font-bold font-mono text-slate-900">10%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                            <span>MT5 Bot</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pl-4">$ 1,040</div>
                        </div>
                        <span className="font-bold font-mono text-slate-900">7%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Collection Summary (Gateways) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    {isKm ? 'សង្ខេបការប្រមូលប្រាក់ (Collection)' : 'Collection Summary (Gateways)'}
                  </h3>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-700">ABA KHQR</span>
                      </div>
                      <div className="flex items-center gap-5 font-mono tabular-nums">
                        <span className="font-bold text-slate-900">$ 8,340</span>
                        <span className="text-slate-500 w-8 text-right">56%</span>
                      </div>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-700">Bakong QR</span>
                      </div>
                      <div className="flex items-center gap-5 font-mono tabular-nums">
                        <span className="font-bold text-slate-900">$ 3,720</span>
                        <span className="text-slate-500 w-8 text-right">25%</span>
                      </div>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-700">USDT TRC-20</span>
                      </div>
                      <div className="flex items-center gap-5 font-mono tabular-nums">
                        <span className="font-bold text-slate-900">$ 1,935</span>
                        <span className="text-slate-500 w-8 text-right">13%</span>
                      </div>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-700">Bank Transfer</span>
                      </div>
                      <div className="flex items-center gap-5 font-mono tabular-nums">
                        <span className="font-bold text-slate-900">$ 895</span>
                        <span className="text-slate-500 w-8 text-right">6%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {isKm ? 'ចំណូលប្រមូលបានសរុប' : 'Total Collection'}
                    </span>
                    <span className="text-base font-extrabold text-emerald-600 font-mono tabular-nums">
                      $ {displayMonthSales.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ROW 3: Top 5 Signals + Staff/System Summary + Action Required Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left 4 Cols: Top 5 Performing Signals */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                      {isKm ? 'Top 5 Signals & ផលិតផលល្អបំផុត' : 'Top 5 Best Performing Signals'}
                    </h3>
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2">#</th>
                          <th className="py-2 px-2">{isKm ? 'គូជួញដូរ' : 'Signal Pair'}</th>
                          <th className="py-2 px-2 text-right">Entry</th>
                          <th className="py-2 px-2 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {signals.slice(0, 5).map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-2 px-2 font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-2 font-semibold text-slate-800">
                              {s.ticker} {s.action}
                            </td>
                            <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-600">
                              {s.entryPrice}
                            </td>
                            <td className="py-2 px-2 text-right font-mono tabular-nums font-bold text-emerald-600">
                              {s.status.replace('HIT_', '')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      canAccessNav('signals_desk') && setActiveNav('signals_desk')
                    }
                    className="mt-3 pt-2 border-t border-slate-100 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{isKm ? 'មើល Signals ទាំងអស់' : 'View All Signals'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Middle 4 Cols: Position & Platform Summary */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                      {isKm ? 'សង្ខេបប្រព័ន្ធ & មុខតំណែង (Summary)' : 'Operations & Role Summary'}
                    </h3>
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
                            <KeyRound className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-slate-700 font-medium">
                            {isKm ? 'គណនីបុគ្គលិកទាំង ៥ មុខតំណែង' : 'Active Staff IDs (5 Roles)'}
                          </span>
                        </div>
                        <span className="font-bold font-mono tabular-nums text-slate-900">
                          {staffAccounts.length} IDs
                        </span>
                      </div>

                      <div className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-rose-500 text-white flex items-center justify-center">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-slate-700 font-medium">
                            {isKm ? 'សមាជិក VIP សកម្ម' : 'Active VIP Subscribers'}
                          </span>
                        </div>
                        <span className="font-bold font-mono tabular-nums text-slate-900">
                          {users.filter(u => u.role === 'vip').length} VIPs
                        </span>
                      </div>

                      <div className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center">
                            <Film className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-slate-700 font-medium">
                            {isKm ? 'មេរៀន Video Academy' : 'Academy Video Lessons'}
                          </span>
                        </div>
                        <span className="font-bold font-mono tabular-nums text-slate-900">
                          {lessons.length} Videos
                        </span>
                      </div>

                      <div className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-slate-600 text-white flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-slate-700 font-medium">
                            {isKm ? 'គណនីបើក MT5 Auto-Trade' : 'MT5 Authorized Accounts'}
                          </span>
                        </div>
                        <span className="font-bold font-mono tabular-nums text-slate-900">
                          {users.filter(u => u.mt5Allowed).length} Linked
                        </span>
                      </div>

                      <div className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-violet-600 text-white flex items-center justify-center">
                            <Wallet className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-slate-700 font-medium">
                            {isKm ? 'ប្រាក់ខែបុគ្គលិកប្រចាំខែ' : 'Monthly Staff Payroll'}
                          </span>
                        </div>
                        <span className="font-bold font-mono tabular-nums text-slate-900">
                          $ {totalMonthlyPayroll.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveNav('all_staff')}
                    className="mt-3 pt-2 border-t border-slate-100 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>
                      {isKm ? 'មើលបញ្ជីបុគ្គលិកទាំងអស់' : 'Open All Staff List'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right 4 Cols: Soft Rose Alert Card (Matching "Low Stock Alert" in Screenshot) */}
                <div className="lg:col-span-4 bg-[#fff5f5] rounded-2xl border border-rose-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-rose-600 flex items-center gap-1.5 mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        {isKm
                          ? `ការងារត្រូវពិនិត្យបន្ទាន់ (${alertRows.length} Items)`
                          : `Pending Action Alerts (${alertRows.length} Items)`}
                      </span>
                    </h3>

                    <table className="w-full text-xs text-left">
                      <thead className="bg-rose-100/60 text-slate-600 border-b border-rose-200/60">
                        <tr>
                          <th className="py-2 px-2">Item / Request</th>
                          <th className="py-2 px-2">Role</th>
                          <th className="py-2 px-2">Ref</th>
                          <th className="py-2 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100">
                        {alertRows.map(row => (
                          <tr key={row.id}>
                            <td className="py-2.5 px-2 font-medium text-slate-800 truncate max-w-[130px]">
                              {row.name}
                            </td>
                            <td className="py-2.5 px-2 text-slate-600">{row.dept}</td>
                            <td className="py-2.5 px-2 font-mono tabular-nums text-slate-700">
                              {row.metric}
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  canAccessNav(row.targetNav) && setActiveNav(row.targetNav)
                                }
                                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white cursor-pointer ${
                                  row.severity === 'Urgent'
                                    ? 'bg-orange-500 hover:bg-orange-600'
                                    : 'bg-rose-500 hover:bg-rose-600'
                                }`}
                              >
                                {row.severity}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      canAccessNav('billing_slips')
                        ? setActiveNav('billing_slips')
                        : setActiveNav('reports')
                    }
                    className="mt-3 pt-2 border-t border-rose-200/60 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{isKm ? 'ពិនិត្យសំណើទាំងអស់' : 'View All Pending Actions'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ROW 4: Monthly Profit Bar Chart + Recent Transactions + 5-Position Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left 4 Cols: Monthly Profit Trend Vertical Bar Chart */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      {isKm ? 'និន្នាការប្រាក់ចំណេញប្រចាំខែ' : 'Monthly Profit Trend'}
                    </h3>
                    <select
                      value={profitYearFilter}
                      onChange={e =>
                        setProfitYearFilter(e.target.value as 'this_year' | 'last_year')
                      }
                      className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 bg-slate-50 cursor-pointer"
                    >
                      <option value="this_year">This Year</option>
                      <option value="last_year">Last Year</option>
                    </select>
                  </div>

                  <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-200">
                    {(profitYearFilter === 'this_year'
                      ? [
                          { m: 'Apr', h: 46, val: '$5.2k' },
                          { m: 'May', h: 62, val: '$7.1k' },
                          { m: 'Jun', h: 72, val: '$8.4k' },
                          { m: 'Jul', h: 70, val: '$8.1k' },
                          { m: 'Aug', h: 78, val: '$9.0k' },
                          { m: 'Sep', h: 66, val: '$7.6k' },
                          { m: 'Oct', h: 92, val: '$10.8k' }
                        ]
                      : [
                          { m: 'Apr', h: 38, val: '$4.1k' },
                          { m: 'May', h: 48, val: '$5.2k' },
                          { m: 'Jun', h: 55, val: '$6.0k' },
                          { m: 'Jul', h: 52, val: '$5.8k' },
                          { m: 'Aug', h: 64, val: '$7.0k' },
                          { m: 'Sep', h: 58, val: '$6.4k' },
                          { m: 'Oct', h: 74, val: '$8.2k' }
                        ]
                    ).map(bar => (
                      <div
                        key={bar.m}
                        className="flex-1 flex flex-col items-center justify-end h-full group"
                      >
                        <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                          {bar.val}
                        </span>
                        <div
                          style={{ height: `${bar.h}%` }}
                          className="w-full max-w-[26px] rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500 font-mono">
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                  </div>
                </div>

                {/* Middle 4 Cols: Recent Transactions & Staff Logs */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      {isKm ? 'ប្រតិបត្តិការ & សកម្មភាពថ្មីៗ' : 'Recent Transactions & Logs'}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        canAccessNav('billing_slips')
                          ? setActiveNav('billing_slips')
                          : setActiveNav('reports')
                      }
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {payments.slice(0, 3).map(pay => (
                      <div key={pay.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 font-mono truncate">
                              {pay.transactionId}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              Member: {pay.userName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono tabular-nums">
                          <div className="font-bold text-slate-900">$ {pay.amount}</div>
                          <div className="text-[10px] text-slate-400">{pay.paymentMethod}</div>
                        </div>
                      </div>
                    ))}

                    {auditLogs.slice(0, 2).map(log => (
                      <div key={log.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <KeyRound className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 font-mono truncate">
                              {log.staffCode} · {log.staffName}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {isKm ? log.actionKm : log.action}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 shrink-0">
                          {log.timestamp.slice(-5)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 4 Cols: Position / Department Wise Activity (Horizontal Bars) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    {isKm
                      ? 'សមិទ្ធផលតាមមុខតំណែងទាំង ៥ (Positions)'
                      : 'Position Wise Activity (This Month)'}
                  </h3>

                  <div className="space-y-3.5 text-xs my-auto">
                    {[
                      {
                        label: 'Administrator',
                        code: 'ADM-001',
                        pct: 94,
                        color: 'bg-blue-600',
                        stat: 'Full Control'
                      },
                      {
                        label: 'Leadership Finnie',
                        code: 'FIN-001',
                        pct: 82,
                        color: 'bg-emerald-500',
                        stat: `$${displayMonthSales.toLocaleString()}`
                      },
                      {
                        label: 'Editor (Signals)',
                        code: 'EDT-001',
                        pct: 68,
                        color: 'bg-amber-500',
                        stat: `${signals.length} Signals`
                      },
                      {
                        label: 'Videos Editor',
                        code: 'VID-001',
                        pct: 54,
                        color: 'bg-violet-500',
                        stat: `${lessons.length} Videos`
                      },
                      {
                        label: 'HR Management',
                        code: 'HR-001',
                        pct: 44,
                        color: 'bg-rose-500',
                        stat: `${staffAccounts.length} Staff`
                      }
                    ].map(dept => (
                      <div key={dept.code} className="grid grid-cols-12 items-center gap-2">
                        <div className="col-span-4 font-medium text-slate-700 truncate">
                          {dept.label}
                        </div>
                        <div className="col-span-5 bg-slate-100 rounded-r-md h-4 overflow-hidden">
                          <div
                            style={{ width: `${dept.pct}%` }}
                            className={`h-full ${dept.color} rounded-r-md`}
                          />
                        </div>
                        <div className="col-span-3 text-right font-mono tabular-nums font-bold text-slate-800 text-[11px]">
                          {dept.stat}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100% KPI Target</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 2: UNIFIED ALL STAFF LIST (បញ្ជីបុគ្គលិកទាំងអស់ - តែមួយ List) ==================== */}
          {activeNav === 'all_staff' && (
            <div className="space-y-4">
              {/* Top 4 KPI Summary Strip for All Staff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{isKm ? 'បុគ្គលិកសរុបទាំងអស់' : 'Total Staff Members'}</span>
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-1.5 text-2xl font-extrabold font-mono tabular-nums text-slate-900">
                    {staffAccounts.length} {isKm ? 'នាក់' : 'Staff'}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {isKm ? 'រួមបញ្ចូលគ្រប់មុខតំណែងទាំង ៥ ក្នុងបញ្ជីតែមួយ' : 'Across all 5 organizational positions'}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{isKm ? 'វត្តមានប្រចាំការថ្ងៃនេះ' : 'On Duty & Remote'}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-1.5 text-2xl font-extrabold font-mono tabular-nums text-emerald-600">
                    {staffAccounts.filter(s => s.dutyStatus !== 'leave').length} / {staffAccounts.length}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-mono">
                    On Duty: {staffAccounts.filter(s => s.dutyStatus === 'on_duty').length} · Remote:{' '}
                    {staffAccounts.filter(s => s.dutyStatus === 'remote').length} · Leave:{' '}
                    {staffAccounts.filter(s => s.dutyStatus === 'leave').length}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{isKm ? 'គណនីបុគ្គលិកសកម្ម (IDs)' : 'Active Staff IDs'}</span>
                    <KeyRound className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-1.5 text-2xl font-extrabold font-mono tabular-nums text-slate-900">
                    {staffAccounts.filter(s => s.status === 'active').length}{' '}
                    <span className="text-xs font-semibold text-emerald-600 font-sans">Active</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {isKm ? 'ADM · EDT · VID · HR · FIN' : 'ADM · EDT · VID · HR · FIN'}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{isKm ? 'ប្រាក់ខែសរុបប្រចាំខែ' : 'Monthly Payroll Total'}</span>
                    <Wallet className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="mt-1.5 text-2xl font-extrabold font-mono tabular-nums text-slate-900">
                    {canViewSalary ? `$${totalMonthlyPayroll.toLocaleString()}` : '••••••'}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
                    {canViewSalary
                      ? `≈ ${(totalMonthlyPayroll * 4050).toLocaleString()} ៛ / ខែ`
                      : isKm
                      ? 'សម្រាប់ Admin / HR / Financial'
                      : 'Restricted to Admin / HR / Financial'}
                  </div>
                </div>
              </div>

              {/* Unified Header + Action & Filter Toolbar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {isKm
                        ? 'បញ្ជីបុគ្គលិកទាំងអស់ (All Staff Master List)'
                        : 'All Staff Master List (Unified Directory)'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isKm
                        ? 'តារាងបញ្ជីតែមួយសម្រាប់គ្រប់គ្រងបុគ្គលិកទាំង ៥ មុខតំណែង (Staff ID, Password, វេនធ្វើការ, វត្តមាន និងប្រាក់ខែ)'
                        : 'Single unified table for all 5 positions: Staff ID, Password, Contact, Shift, Duty Status & Payroll'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsHrPanelOpen(v => !v)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                        isHrPanelOpen
                          ? 'bg-[#091738] text-white border-[#091738]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {isKm ? 'សំណើច្បាប់ / វេនការងារ' : 'Leave & Shift Requests'}
                      </span>
                      {pendingHrCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold leading-none">
                          {pendingHrCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleExportStaffCSV}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isKm ? 'ទាញយក CSV (Excel)' : 'Export CSV'}</span>
                    </button>

                    {canManageStaffCredentials && (
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectNewPosition('editor');
                          setIsCreateStaffOpen(v => !v);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{isKm ? '+ បន្ថែមបុគ្គលិកថ្មី' : '+ Add New Staff'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Position Tabs + Duty Status Filter + Search */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStaffPositionFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                        staffPositionFilter === 'ALL'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isKm ? 'បុគ្គលិកទាំងអស់' : 'All Staff'} ({staffAccounts.length})
                    </button>
                    {ALL_POSITIONS.map(pos => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setStaffPositionFilter(pos)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                          staffPositionFilter === pos
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {POSITION_DEFINITIONS[pos].shortTitle} (
                        {staffAccounts.filter(s => s.position === pos).length})
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={staffDutyFilter}
                      onChange={e =>
                        setStaffDutyFilter(e.target.value as 'ALL' | StaffAccount['dutyStatus'])
                      }
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="ALL">{isKm ? 'គ្រប់វត្តមាន (All Duty)' : 'All Duty Status'}</option>
                      <option value="on_duty">{isKm ? 'ប្រចាំការ (On Duty)' : 'On Duty'}</option>
                      <option value="remote">{isKm ? 'ពីចម្ងាយ (Remote)' : 'Remote'}</option>
                      <option value="leave">{isKm ? 'ច្បាប់សម្រាក (On Leave)' : 'On Leave'}</option>
                    </select>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={staffSearch}
                        onChange={e => setStaffSearch(e.target.value)}
                        placeholder={
                          isKm ? 'ស្វែងរក ID, ឈ្មោះ ឬទូរស័ព្ទ...' : 'Search ID, name or phone...'
                        }
                        className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-56"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Collapsible Leave / Shift Requests Drawer (Hidden by default so screen stays ONE clean list) */}
              {isHrPanelOpen && (
                <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      {isKm
                        ? 'សំណើច្បាប់សម្រាក និងប្តូរវេនធ្វើការ (HR Requests)'
                        : 'Staff Leave & Shift Change Requests'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsHrPanelOpen(false)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const stf =
                          staffAccounts.find(x => x.id === hrReqStaffId) || staffAccounts[0];
                        if (!stf || !hrReqReason.trim()) return;
                        onAddHRRequest({
                          staffId: stf.id,
                          staffCode: stf.staffCode,
                          staffName: stf.fullName,
                          position: stf.position,
                          requestType: hrReqType,
                          reason: hrReqReason.trim(),
                          dateRange: hrReqDates.trim() || '2026-11-01'
                        });
                        setHrReqReason('');
                        setHrSavedToast(true);
                        setTimeout(() => setHrSavedToast(false), 2200);
                      }}
                      className="lg:col-span-5 space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200"
                    >
                      <div className="text-xs font-bold text-slate-800">
                        {isKm ? 'ដាក់សំណើថ្មី' : 'Submit New Request'}
                      </div>
                      {hrSavedToast && (
                        <div className="p-2 rounded-lg bg-emerald-50 text-xs text-emerald-700 font-medium">
                          {isKm ? 'បានបញ្ជូនសំណើរួចរាល់!' : 'Request submitted!'}
                        </div>
                      )}
                      <select
                        value={hrReqStaffId}
                        onChange={e => setHrReqStaffId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      >
                        {staffAccounts.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.staffCode} · {isKm ? s.fullNameKm : s.fullName}
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={hrReqType}
                          onChange={e => setHrReqType(e.target.value as HRRequestItem['requestType'])}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        >
                          <option value="leave">{isKm ? 'ច្បាប់សម្រាក (Leave)' : 'Leave'}</option>
                          <option value="shift_change">{isKm ? 'ប្តូរវេន (Shift)' : 'Shift Change'}</option>
                          <option value="equipment">{isKm ? 'សម្ភារៈការងារ' : 'Equipment'}</option>
                          <option value="onboarding">Onboarding</option>
                        </select>
                        <input
                          type="text"
                          value={hrReqDates}
                          onChange={e => setHrReqDates(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={hrReqReason}
                        onChange={e => setHrReqReason(e.target.value)}
                        placeholder={isKm ? 'មូលហេតុនៃសំណើ...' : 'Reason for request...'}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        {isKm ? 'បញ្ជូនសំណើ' : 'Submit Request'}
                      </button>
                    </form>

                    <div className="lg:col-span-7 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                      {hrRequests.map(req => (
                        <div
                          key={req.id}
                          className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              <span className="font-mono text-blue-600 mr-1.5">{req.staffCode}</span>
                              {req.staffName} · <span className="text-slate-500">{req.dateRange}</span>
                            </div>
                            <div className="text-slate-600 mt-0.5">{req.reason}</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {req.status === 'PENDING' && canManageHR ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onResolveHRRequest(req.id, 'APPROVED')}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                                >
                                  {isKm ? 'អនុម័ត' : 'Approve'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onResolveHRRequest(req.id, 'REJECTED')}
                                  className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 font-semibold cursor-pointer"
                                >
                                  {isKm ? 'បដិសេធ' : 'Decline'}
                                </button>
                              </>
                            ) : (
                              <span
                                className={`font-mono font-bold ${
                                  req.status === 'APPROVED'
                                    ? 'text-emerald-600'
                                    : req.status === 'REJECTED'
                                    ? 'text-rose-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {req.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Create New Staff ID & Password Card */}
              {isCreateStaffOpen && canManageStaffCredentials && (
                <div className="bg-white rounded-2xl border-2 border-blue-500/40 shadow-md p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      {isKm
                        ? 'បន្ថែមបុគ្គលិកថ្មី និងកំណត់ Staff ID / Password'
                        : 'Add New Staff Member & Set ID / Password'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsCreateStaffOpen(false)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {createStaffFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium ${
                        createStaffFeedback.ok
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-rose-50 border border-rose-200 text-rose-700'
                      }`}
                    >
                      {createStaffFeedback.msg}
                    </div>
                  )}

                  <form onSubmit={handleCreateStaffSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isKm ? 'មុខតំណែង (Position) *' : 'Position *'}
                        </label>
                        <select
                          value={newPosition}
                          onChange={e => handleSelectNewPosition(e.target.value as StaffPosition)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        >
                          {ALL_POSITIONS.map(pos => (
                            <option key={pos} value={pos}>
                              {isKm ? POSITION_DEFINITIONS[pos].labelKm : POSITION_DEFINITIONS[pos].labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isKm ? 'កំណត់អត្តលេខ (Set Staff ID) *' : 'Set Staff ID *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={newStaffCode}
                          onChange={e => setNewStaffCode(e.target.value.toUpperCase())}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-blue-700 font-mono tabular-nums font-bold uppercase focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isKm ? 'កំណត់លេខសម្ងាត់ (Set Password) *' : 'Set Password *'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            required
                            value={newStaffPassword}
                            onChange={e => setNewStaffPassword(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewStaffPassword(
                                generateSecurePassword(POSITION_DEFINITIONS[newPosition].shortTitle.split(' ')[0])
                              )
                            }
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Generate Password"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name (EN) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newFullName}
                          onChange={e => setNewFullName(e.target.value)}
                          placeholder="e.g. Dara Chan"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          ឈ្មោះភាសាខ្មែរ
                        </label>
                        <input
                          type="text"
                          value={newFullNameKm}
                          onChange={e => setNewFullNameKm(e.target.value)}
                          placeholder="ឧ. តារា ចាន់"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isKm ? 'លេខទូរស័ព្ទ' : 'Phone'}
                        </label>
                        <input
                          type="text"
                          value={newPhone}
                          onChange={e => setNewPhone(e.target.value)}
                          placeholder="012 889 900"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={e => setNewEmail(e.target.value)}
                          placeholder="staff@alphasignal.vip"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Work Shift
                        </label>
                        <input
                          type="text"
                          value={newShift}
                          onChange={e => setNewShift(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Salary ($)
                        </label>
                        <input
                          type="number"
                          value={newSalary}
                          onChange={e => setNewSalary(Number(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        {isKm ? 'សិទ្ធិចូលប្រើប្រាស់ម៉ូឌុល' : 'Permitted Modules'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(Object.keys(PERMISSION_LABELS) as StaffPermissionKey[]).map(permKey => {
                          const checked = newPermissions.includes(permKey);
                          return (
                            <label
                              key={permKey}
                              className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 cursor-pointer ${
                                checked
                                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  if (checked) {
                                    setNewPermissions(prev => prev.filter(p => p !== permKey));
                                  } else {
                                    setNewPermissions(prev => [...prev, permKey]);
                                  }
                                }}
                                className="accent-blue-600"
                              />
                              <span className="truncate">
                                {isKm ? PERMISSION_LABELS[permKey].km : PERMISSION_LABELS[permKey].en}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreateStaffOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        {isKm ? 'បោះបង់' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                      >
                        {isKm ? 'រក្សាទុកក្នុងបញ្ជីបុគ្គលិក' : 'Save Staff Member'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* THE SINGLE UNIFIED MASTER STAFF LIST TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4 whitespace-nowrap">
                          {isKm ? '# / អត្តលេខ ID' : '# / Staff ID'}
                        </th>
                        <th className="py-3.5 px-4 whitespace-nowrap">
                          {isKm ? 'ឈ្មោះបុគ្គលិក & ទំនាក់ទំនង' : 'Staff Member & Contact'}
                        </th>
                        <th className="py-3.5 px-4 whitespace-nowrap">
                          {isKm ? 'មុខតំណែង & សិទ្ធិ' : 'Position & Role'}
                        </th>
                        <th className="py-3.5 px-4 whitespace-nowrap">
                          {isKm ? 'លេខសម្ងាត់ (Password)' : 'Password'}
                        </th>
                        <th className="py-3.5 px-4 whitespace-nowrap">
                          {isKm ? 'វេនធ្វើការ & វត្តមាន' : 'Shift & Duty Status'}
                        </th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isKm ? 'ប្រាក់ខែ/ខែ' : 'Monthly Salary'}
                        </th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isKm ? 'គ្រប់គ្រង' : 'Actions'}
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredStaffList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-400">
                            {isKm
                              ? 'មិនមានទិន្នន័យបុគ្គលិកត្រូវតាមការស្វែងរកនោះទេ'
                              : 'No staff members match your current filter'}
                          </td>
                        </tr>
                      ) : (
                        filteredStaffList.map((staff, idx) => {
                          const posInfo = POSITION_DEFINITIONS[staff.position];
                          const isRevealed = !!revealedStaffIds[staff.id];
                          const isSelf = staff.id === loggedInStaff.id;

                          return (
                            <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Col 1: # & Staff ID */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="text-[11px] font-mono text-slate-400">
                                  #{String(idx + 1).padStart(2, '0')}
                                </div>
                                <div className="font-mono tabular-nums font-bold text-blue-600 text-xs mt-0.5">
                                  {staff.staffCode}
                                </div>
                              </td>

                              {/* Col 2: Name & Phone/Email */}
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900">
                                  {isKm ? staff.fullNameKm : staff.fullName}
                                  {isSelf && (
                                    <span className="ml-1.5 text-[11px] text-blue-600 font-semibold">
                                      ({isKm ? 'អ្នក' : 'You'})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  {staff.phone} · <span className="font-sans">{staff.email}</span>
                                </div>
                              </td>

                              {/* Col 3: Position & Module Scope */}
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-800">{posInfo.shortTitle}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {staff.permissions.length}{' '}
                                  {isKm ? 'ម៉ូឌុលសិទ្ធិប្រើប្រាស់' : 'module permissions'}
                                </div>
                              </td>

                              {/* Col 4: Password & Copy */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {canManageStaffCredentials || isSelf ? (
                                  <div className="flex items-center gap-1.5 font-mono tabular-nums">
                                    <span className="text-slate-800 font-semibold">
                                      {isRevealed ? staff.password : '••••••••••'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setRevealedStaffIds(prev => ({
                                          ...prev,
                                          [staff.id]: !prev[staff.id]
                                        }))
                                      }
                                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                      title={isRevealed ? 'Hide Password' : 'Show Password'}
                                    >
                                      {isRevealed ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCredentials(staff)}
                                      className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                                      title={isKm ? 'ចម្លង ID & Password' : 'Copy ID & Password'}
                                    >
                                      {copiedCredentialId === staff.id ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-mono text-slate-400">
                                    •••••••• (Admin)
                                  </span>
                                )}
                              </td>

                              {/* Col 5: Shift & Duty Status */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-mono text-slate-600 text-[11px] mb-1">
                                  {staff.shift}
                                </div>
                                {canManageHR ? (
                                  <div className="inline-flex items-center gap-1">
                                    {(['on_duty', 'remote', 'leave'] as const).map(ds => (
                                      <button
                                        key={ds}
                                        type="button"
                                        onClick={() =>
                                          onUpdateStaffCredentials(staff.id, { dutyStatus: ds })
                                        }
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                                          staff.dutyStatus === ds
                                            ? ds === 'on_duty'
                                              ? 'bg-emerald-600 text-white'
                                              : ds === 'remote'
                                              ? 'bg-blue-600 text-white'
                                              : 'bg-amber-500 text-white'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                      >
                                        {ds === 'on_duty'
                                          ? isKm
                                            ? 'ប្រចាំការ'
                                            : 'On Duty'
                                          : ds === 'remote'
                                          ? isKm
                                            ? 'ពីចម្ងាយ'
                                            : 'Remote'
                                          : isKm
                                          ? 'ច្បាប់'
                                          : 'Leave'}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <span
                                    className={`font-semibold text-[11px] ${
                                      staff.dutyStatus === 'on_duty'
                                        ? 'text-emerald-600'
                                        : staff.dutyStatus === 'remote'
                                        ? 'text-blue-600'
                                        : 'text-amber-600'
                                    }`}
                                  >
                                    {staff.dutyStatus === 'on_duty'
                                      ? isKm
                                        ? 'ប្រចាំការ (On Duty)'
                                        : 'On Duty'
                                      : staff.dutyStatus === 'remote'
                                      ? isKm
                                        ? 'ពីចម្ងាយ (Remote)'
                                        : 'Remote'
                                      : isKm
                                      ? 'ច្បាប់សម្រាក (Leave)'
                                      : 'On Leave'}
                                  </span>
                                )}
                              </td>

                              {/* Col 6: Salary & Account Status */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="font-mono tabular-nums font-bold text-slate-900">
                                  {canViewSalary
                                    ? `$${staff.monthlySalary.toLocaleString()}.00`
                                    : '••••••'}
                                </div>
                                <div className="text-[11px] mt-0.5 flex items-center justify-end gap-1.5">
                                  {canViewSalary && (
                                    <span className="font-mono tabular-nums text-slate-400">
                                      {(staff.monthlySalary * 4050).toLocaleString()} ៛ ·
                                    </span>
                                  )}
                                  <span
                                    className={`font-semibold ${
                                      staff.status === 'active'
                                        ? 'text-emerald-600'
                                        : 'text-rose-600'
                                    }`}
                                  >
                                    {staff.status === 'active' ? 'Active' : 'Suspended'}
                                  </span>
                                </div>
                              </td>

                              {/* Col 7: Actions */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                {canManageStaffCredentials ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditCredentialsModal(staff)}
                                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                                    >
                                      {isKm ? 'កែប្រែ / ID & Pass' : 'Edit / ID & Pass'}
                                    </button>

                                    {!isSelf && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onUpdateStaffCredentials(staff.id, {
                                            status:
                                              staff.status === 'active' ? 'suspended' : 'active'
                                          })
                                        }
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                                      >
                                        {staff.status === 'active'
                                          ? isKm
                                            ? 'ផ្អាក'
                                            : 'Suspend'
                                          : isKm
                                          ? 'បើក'
                                          : 'Activate'}
                                      </button>
                                    )}

                                    {!isSelf &&
                                      (confirmDeleteStaffId === staff.id ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onDeleteStaff(staff.id);
                                            setConfirmDeleteStaffId(null);
                                          }}
                                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold cursor-pointer"
                                        >
                                          {isKm ? 'បញ្ជាក់?' : 'Confirm'}
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteStaffId(staff.id)}
                                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                                          title={isKm ? 'លុបបុគ្គលិក' : 'Delete Staff'}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      ))}
                                  </div>
                                ) : isSelf ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelfPassFeedback(null);
                                      setIsSelfPassModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                                  >
                                    {isKm ? 'ប្តូរលេខសម្ងាត់ខ្ញុំ' : 'My Password'}
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400">View Only</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>

                    {/* Table Accounting & Roster Summary Footer */}
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs">
                      <tr>
                        <td colSpan={5} className="py-3.5 px-4 font-semibold text-slate-700">
                          {isKm
                            ? `បង្ហាញបុគ្គលិកចំនួន ${filteredStaffList.length} នាក់ ក្នុងចំណោមសរុប ${staffAccounts.length} នាក់ (គ្រប់មុខតំណែងទាំង ៥)`
                            : `Showing ${filteredStaffList.length} of ${staffAccounts.length} total staff members across 5 positions`}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-extrabold text-slate-900 whitespace-nowrap">
                          {canViewSalary ? (
                            <>
                              <div>
                                $
                                {filteredStaffList
                                  .filter(s => s.status === 'active')
                                  .reduce((acc, s) => acc + s.monthlySalary, 0)
                                  .toLocaleString()}
                                .00
                              </div>
                              <div className="text-[10px] font-normal text-slate-500">
                                ≈{' '}
                                {(
                                  filteredStaffList
                                    .filter(s => s.status === 'active')
                                    .reduce((acc, s) => acc + s.monthlySalary, 0) * 4050
                                ).toLocaleString()}{' '}
                                ៛
                              </div>
                            </>
                          ) : (
                            '••••••'
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[11px] text-slate-500 whitespace-nowrap">
                          {isKm ? 'សរុបបញ្ជីបុគ្គលិក' : 'Active Payroll'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 3: SIGNALS (EDITOR DESK) ==================== */}
          {activeNav === 'signals_desk' && canAccessNav('signals_desk') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      {isKm ? 'ផ្សាយ Signal ជួញដូរថ្មី (Editor Desk)' : 'Broadcast New VIP Signal'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveNav('tradingview_desk')}
                      className="px-3 py-1.5 rounded-xl bg-[#131722] hover:bg-[#1e222d] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[#2962ff]" />
                      <span>
                        {isKm ? 'បើក TradingView & Indicators' : 'TradingView & Indicators'}
                      </span>
                    </button>
                  </div>

                  {sigBroadcastToast && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                      {isKm ? 'Signal ត្រូវបានបញ្ជូនទៅកាន់ VIP រួចរាល់!' : 'Signal broadcasted to VIPs & Telegram!'}
                    </div>
                  )}

                  <form onSubmit={handleEditorBroadcast} className="space-y-3.5">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Pair</label>
                        <input
                          type="text"
                          value={sigTicker}
                          onChange={e => setSigTicker(e.target.value.toUpperCase())}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Side</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSigAction('BUY')}
                            className={`py-2 rounded-xl text-xs font-bold cursor-pointer ${
                              sigAction === 'BUY'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            BUY
                          </button>
                          <button
                            type="button"
                            onClick={() => setSigAction('SELL')}
                            className={`py-2 rounded-xl text-xs font-bold cursor-pointer ${
                              sigAction === 'SELL'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            SELL
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Timeframe</label>
                        <select
                          value={sigTimeframe}
                          onChange={e => setSigTimeframe(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                        >
                          <option value="15m">15m</option>
                          <option value="30m">30m</option>
                          <option value="1h">1h</option>
                          <option value="4h">4h</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Entry</label>
                        <input
                          type="number"
                          step="any"
                          value={sigEntry}
                          onChange={e => setSigEntry(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">SL</label>
                        <input
                          type="number"
                          step="any"
                          value={sigSL}
                          onChange={e => setSigSL(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-rose-600 font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">TP1</label>
                        <input
                          type="number"
                          step="any"
                          value={sigTP1}
                          onChange={e => setSigTP1(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-emerald-600 font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">TP2</label>
                        <input
                          type="number"
                          step="any"
                          value={sigTP2}
                          onChange={e => setSigTP2(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-emerald-600 font-mono tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">TP3</label>
                        <input
                          type="number"
                          step="any"
                          value={sigTP3}
                          onChange={e => setSigTP3(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-emerald-600 font-mono tabular-nums"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Strategy</label>
                        <input
                          type="text"
                          value={sigStrategy}
                          onChange={e => setSigStrategy(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isKm ? 'ផ្សាយ Signal ឥឡូវនេះ' : 'Broadcast Signal Now'}</span>
                    </button>
                  </form>
                </div>

                {/* Editorial Channel Commentary */}
                <div className="xl:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    {isKm ? 'បង្ហោះអត្ថបទវិភាគទីផ្សារចូលឆានែល' : 'Publish Editorial Market Commentary'}
                  </h3>

                  {annSentToast && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                      {isKm ? 'បានបង្ហោះចូលបន្ទប់ឆាតជោគជ័យ!' : 'Commentary posted to Telegram channel!'}
                    </div>
                  )}

                  <form onSubmit={handleSendEditorialPost} className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAnnChannel('vip')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            annChannel === 'vip'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          VIP Channel
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnnChannel('community')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            annChannel === 'community'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Community Public
                        </button>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={annPinned}
                          onChange={e => setAnnPinned(e.target.checked)}
                          className="accent-blue-600"
                        />
                        <span>Pin Post</span>
                      </label>
                    </div>

                    <textarea
                      rows={3}
                      value={annTextKm}
                      onChange={e => setAnnTextKm(e.target.value)}
                      placeholder={isKm ? 'សរសេរអត្ថបទវិភាគជាភាសាខ្មែរ...' : 'Khmer commentary...'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <textarea
                      rows={2}
                      value={annTextEn}
                      onChange={e => setAnnTextEn(e.target.value)}
                      placeholder="English summary (optional)..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      {isKm ? 'បង្ហោះអត្ថបទវិភាគ' : 'Publish Commentary'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Signal Outcome Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {isKm ? 'បញ្ជីកែប្រែស្ថានភាព Signal ផ្ទាល់' : 'Live Signal Outcome Control'}
                  </h3>
                  <span className="text-xs font-mono text-slate-500">{signals.length} signals</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Pair</th>
                        <th className="py-3 px-4">Entry · SL · TP1</th>
                        <th className="py-3 px-4">Current Status</th>
                        <th className="py-3 px-4">Pips</th>
                        <th className="py-3 px-4 text-right">Update Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {signals.map(sig => (
                        <tr key={sig.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                            {sig.ticker}{' '}
                            <span className={sig.action === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}>
                              {sig.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                            {sig.entryPrice} · {sig.sl} · {sig.tp1}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-600">{sig.status}</td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              placeholder={sig.pipsGained !== undefined ? String(sig.pipsGained) : '0'}
                              value={pipsInputs[sig.id] ?? ''}
                              onChange={e =>
                                setPipsInputs(prev => ({ ...prev, [sig.id]: e.target.value }))
                              }
                              className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono tabular-nums"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              {(['ACTIVE', 'HIT_TP1', 'HIT_TP2', 'HIT_TP3', 'HIT_SL', 'CLOSED'] as SignalStatus[]).map(
                                st => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => {
                                      const p =
                                        pipsInputs[sig.id] !== undefined && pipsInputs[sig.id] !== ''
                                          ? Number(pipsInputs[sig.id])
                                          : sig.pipsGained;
                                      onUpdateSignalStatus(sig.id, st, p);
                                    }}
                                    className={`px-2 py-1 rounded text-[10px] font-mono font-semibold cursor-pointer ${
                                      sig.status === st
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {st.replace('HIT_', '')}
                                  </button>
                                )
                              )}
                              {confirmDeleteSigId === sig.id ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteSignal(sig.id);
                                    setConfirmDeleteSigId(null);
                                  }}
                                  className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteSigId(sig.id)}
                                  className="p-1 rounded hover:bg-rose-50 text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 4: VIDEOS EDITOR STUDIO ==================== */}
          {activeNav === 'video_studio' && canAccessNav('video_studio') && (
            <div className="space-y-4">
              {/* Video Production Pipeline */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {isKm ? 'តារាងផលិត និងកាត់តវីដេអូ (Videos Editor)' : 'Video Production Workflow'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Track lessons from Scriptwriting to Recording, Editing, and Published
                    </p>
                  </div>

                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (!newTaskTitle.trim()) return;
                      onAddVideoTask({
                        title: newTaskTitle.trim(),
                        titleKm: newTaskTitle.trim(),
                        assignedTo: `${loggedInStaff.staffCode} · ${loggedInStaff.fullName}`,
                        category: newTaskCategory,
                        stage: 'script',
                        dueDate: newTaskDue
                      });
                      setNewTaskTitle('');
                    }}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      placeholder={isKm ? 'ចំណងជើងគម្រោងវីដេអូថ្មី...' : 'New episode title...'}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={e => setNewTaskDue(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                    >
                      + Add Episode
                    </button>
                  </form>
                </div>

                <div className="divide-y divide-slate-100">
                  {videoTasks.map(task => (
                    <div
                      key={task.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{isKm ? task.titleKm : task.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {task.assignedTo} · Due {task.dueDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {(['script', 'recording', 'editing', 'published'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => onAdvanceVideoTask(task.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize cursor-pointer ${
                              task.stage === st
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => onDeleteVideoTask(task.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload / Edit Video Form + Published Catalog */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      {editingLessonId
                        ? isKm
                          ? 'កែសម្រួលមេរៀន Video'
                          : 'Edit Video Lesson'
                        : isKm
                        ? 'បង្ហោះមេរៀន Video ថ្មី'
                        : 'Upload New Video Lesson'}
                    </h3>
                    {editingLessonId && (
                      <button
                        type="button"
                        onClick={resetLessonForm}
                        className="text-xs font-semibold text-blue-600 cursor-pointer"
                      >
                        + New
                      </button>
                    )}
                  </div>

                  {vidSavedToast && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                      Saved to Academy successfully!
                    </div>
                  )}

                  <form onSubmit={handleSaveVideoLesson} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Title (Khmer) *
                      </label>
                      <input
                        type="text"
                        required
                        value={vidTitleKm}
                        onChange={e => setVidTitleKm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Title (English)
                      </label>
                      <input
                        type="text"
                        value={vidTitleEn}
                        onChange={e => setVidTitleEn(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        YouTube / Embed URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={vidUrl}
                        onChange={e => setVidUrl(e.target.value)}
                        placeholder="https://www.youtube.com/embed/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                        <select
                          value={vidCategory}
                          onChange={e => setVidCategory(e.target.value as LessonCategory)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900"
                        >
                          <option value="basics">Basics</option>
                          <option value="technical">Technical</option>
                          <option value="smc">SMC & OrderBlock</option>
                          <option value="mt5_bot">MT5 Auto-Bot</option>
                          <option value="risk_management">Risk Management</option>
                          <option value="psychology">Psychology</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Access</label>
                        <select
                          value={vidAccess}
                          onChange={e => setVidAccess(e.target.value as 'all' | 'member' | 'vip')}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-semibold"
                        >
                          <option value="vip">VIP Exclusive</option>
                          <option value="member">Member</option>
                          <option value="all">Public Free</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={vidDuration}
                        onChange={e => setVidDuration(e.target.value)}
                        placeholder="18:30"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                      />
                      <input
                        type="text"
                        value={vidInstructor}
                        onChange={e => setVidInstructor(e.target.value)}
                        placeholder="Instructor"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={vidDescKm}
                      onChange={e => setVidDescKm(e.target.value)}
                      placeholder="Summary..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {editingLessonId ? 'Update Video Lesson' : 'Publish to Academy'}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Published Academy Videos ({lessons.length})
                  </h3>
                  <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
                    {lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {isKm ? lesson.titleKm : lesson.title}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {lesson.duration} · {lesson.accessLevel.toUpperCase()} ·{' '}
                            {lesson.viewsCount || 0} views
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditingLesson(lesson)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewLesson(lesson)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteLessonId === lesson.id ? (
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteLesson(lesson.id);
                                setConfirmDeleteLessonId(null);
                              }}
                              className="px-2 py-1 rounded bg-rose-600 text-white font-bold cursor-pointer"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteLessonId(lesson.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 4.8: CUSTOMER SIGN-UP INTAKE & STAFF CHECK ASSIGNMENT ==================== */}
          {activeNav === 'customer_signups' && canAccessNav('customer_signups') && (
            <CustomerSignupAssignmentPanel
              lang={lang}
              theme="light"
              registrations={customerRegistrations}
              staffAccounts={staffAccounts}
              loggedInStaff={loggedInStaff}
              onAssignToStaff={onAssignRegistrationToStaff}
              onCompleteStaffCheck={onCompleteStaffCheck}
              onSwitchStaffSession={staff => {
                if (loggedInStaff.id !== staff.id) {
                  onLoginStaff(staff.staffCode, staff.password, staff.position);
                }
              }}
            />
          )}

          {/* ==================== VIEW 5: CUSTOMERS (VIP & MEMBERS) ==================== */}
          {activeNav === 'customers' && canAccessNav('customers') && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {(['ALL', 'vip', 'member', 'visitor'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMemberRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        memberRoleFilter === r
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {r === 'ALL' ? 'All Customers' : r.toUpperCase()}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={memberQuery}
                  onChange={e => setMemberQuery(e.target.value)}
                  placeholder="Search customer..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Customer Name</th>
                        <th className="py-3.5 px-4">Tier</th>
                        <th className="py-3.5 px-4">VIP Expiry</th>
                        <th className="py-3.5 px-4">MT5 Auto-Trade</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.map(u => {
                        const isVip = u.role === 'vip';
                        return (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {u.email} · {u.phone}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono uppercase font-bold text-blue-600">
                              {u.role}
                            </td>
                            <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                              {u.vipExpiresAt ? new Date(u.vipExpiresAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-3.5 px-4">
                              {isVip ? (
                                <button
                                  type="button"
                                  onClick={() => onToggleMT5Permission(u.id)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                                    u.mt5Allowed
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {u.mt5Allowed ? 'MT5 Enabled ✓' : 'Grant MT5'}
                                </button>
                              ) : (
                                <span className="text-slate-400">VIP Required</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isVip ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onExtendVip(u.id, 30)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                                    >
                                      +30d
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateUserRole(u.id, 'member')}
                                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium cursor-pointer"
                                    >
                                      Demote
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onUpdateUserRole(u.id, 'vip')}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                                  >
                                    Upgrade VIP
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

          {/* ==================== VIEW 6: CUSTOMER PAYMENT MANAGEMENT TABLE (ADMIN & FINANCIAL) ==================== */}
          {activeNav === 'billing_slips' && canAccessNav('billing_slips') && (
            <div className="space-y-4">
              {/* Quick Admin & Financial Operator Switcher Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="font-bold text-slate-900">
                    {isKm ? 'សិទ្ធិគ្រប់គ្រងតារាងបង់ប្រាក់៖' : 'Authorized Table Managers:'}
                  </span>
                  <span className="text-slate-500">
                    {isKm
                      ? 'សម្រាប់តែមុខតំណែង Administrator និង Leadership Finnie (Financial)'
                      : 'Restricted to Administrator & Leadership Finnie (Financial)'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {staffAccounts
                    .filter(
                      s =>
                        s.status === 'active' &&
                        (s.position === 'administrator' || s.position === 'leadership_finance')
                    )
                    .map(mgr => {
                      const isCurrent = loggedInStaff.id === mgr.id;
                      const posMeta = POSITION_DEFINITIONS[mgr.position];
                      return (
                        <button
                          key={mgr.id}
                          type="button"
                          onClick={() => {
                            if (!isCurrent) {
                              onLoginStaff(mgr.staffCode, mgr.password, mgr.position);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                            isCurrent
                              ? 'bg-[#091738] text-white border-[#091738] shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="font-mono">{mgr.staffCode}</span>
                          <span>·</span>
                          <span>
                            {mgr.position === 'administrator'
                              ? isKm
                                ? 'Admin (អ្នកគ្រប់គ្រង)'
                                : 'Administrator'
                              : isKm
                              ? 'Financial (ហិរញ្ញវត្ថុ)'
                              : posMeta.shortTitle}
                          </span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                </div>
              </div>

              <CustomerPaymentTable
                lang={lang}
                theme="light"
                payments={payments}
                users={users}
                managerLabel={
                  isKm
                    ? `គ្រប់គ្រងដោយ ${loggedInStaff.staffCode} · ${
                        loggedInStaff.position === 'administrator'
                          ? 'Administrator (Admin)'
                          : 'Leadership Finnie (Financial)'
                      }`
                    : `Managed by ${loggedInStaff.staffCode} · ${currentPosInfo.shortTitle}`
                }
                autoApproveEnabled={autoApproveEnabled}
                onToggleAutoApprove={onToggleAutoApprove}
                onAutoApproveAllPending={onAutoApproveAllPending}
                onApprovePayment={payId => {
                  onApprovePayment(payId);
                  onAddAuditLog(
                    `Approved customer payment #${payId}`,
                    `បានអនុម័តការបង់ប្រាក់អតិថិជន #${payId}`,
                    'SUCCESS'
                  );
                }}
                onRejectPayment={(payId, reason) => {
                  onRejectPayment(payId, reason || 'Declined by Finance');
                  onAddAuditLog(
                    `Rejected customer payment #${payId}`,
                    `បានបដិសេធការបង់ប្រាក់អតិថិជន #${payId}`,
                    'SECURITY'
                  );
                }}
                onDeletePayment={onDeletePayment}
                onUpdatePaymentNote={onUpdatePaymentNote}
                onRecordManualPayment={onRecordManualPayment}
                onOpenMemberCheckout={onOpenMemberCheckout}
              />
            </div>
          )}

          {/* ==================== VIEW 7: ACCOUNTS & P&L LEDGER (LEADERSHIP FINNIE) ==================== */}
          {activeNav === 'accounts_ledger' && canAccessNav('accounts_ledger') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    {isKm ? 'កត់ត្រាចំណូល-ចំណាយ (Leadership Finnie)' : 'Record Ledger Transaction'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      onAddFinanceEntry({
                        date: new Date().toISOString().slice(0, 10),
                        title: `Monthly Staff Payroll (${staffAccounts.filter(s => s.status === 'active').length} Staff)`,
                        titleKm: `បើកប្រាក់ខែបុគ្គលិកប្រចាំខែ`,
                        category: 'payroll',
                        type: 'EXPENSE',
                        amount: totalMonthlyPayroll,
                        paymentMethod: 'ABA Corporate',
                        recordedBy: loggedInStaff.staffCode,
                        status: 'COMPLETED'
                      });
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    + Log Payroll (${totalMonthlyPayroll})
                  </button>
                </div>

                {finSavedToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                    Recorded in ledger!
                  </div>
                )}

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!finEntryTitle.trim() || finEntryAmount <= 0) return;
                    onAddFinanceEntry({
                      date: new Date().toISOString().slice(0, 10),
                      title: finEntryTitle.trim(),
                      titleKm: finEntryTitle.trim(),
                      category: finEntryCat,
                      type: finEntryType,
                      amount: Number(finEntryAmount),
                      paymentMethod: finEntryMethod,
                      recordedBy: loggedInStaff.staffCode,
                      status: 'COMPLETED'
                    });
                    setFinEntryTitle('');
                    setFinSavedToast(true);
                    setTimeout(() => setFinSavedToast(false), 2200);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFinEntryType('INCOME')}
                      className={`py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        finEntryType === 'INCOME'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      + Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinEntryType('EXPENSE')}
                      className={`py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        finEntryType === 'EXPENSE'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      - Expense
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={finEntryTitle}
                    onChange={e => setFinEntryTitle(e.target.value)}
                    placeholder="Transaction description..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="any"
                      value={finEntryAmount}
                      onChange={e => setFinEntryAmount(Number(e.target.value) || 0)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono tabular-nums text-slate-900"
                    />
                    <select
                      value={finEntryCat}
                      onChange={e => setFinEntryCat(e.target.value as FinanceLedgerEntry['category'])}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900"
                    >
                      <option value="subscription_revenue">Subscriptions</option>
                      <option value="payroll">Staff Payroll</option>
                      <option value="infrastructure">Cloud VPS / API</option>
                      <option value="marketing">Marketing</option>
                      <option value="operations">Operations</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Save Entry
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">General Financial Ledger</h3>
                  <div className="flex items-center gap-2">
                    {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setLedgerTypeFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          ledgerTypeFilter === f
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleExportFinanceCSV}
                      className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
                  {filteredLedger.map(item => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">
                          {isKm ? item.titleKm : item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.date} · {item.paymentMethod} · By {item.recordedBy}
                        </div>
                      </div>
                      <span
                        className={`font-mono tabular-nums font-bold ${
                          item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.type === 'INCOME' ? '+' : '-'}${item.amount.toLocaleString()}.00
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 10: REPORTS & AUDIT LOGS ==================== */}
          {activeNav === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isKm ? 'របាយការណ៍សកម្មភាព និងសវនកម្មប្រព័ន្ធ' : 'Executive Audit & Financial Reports'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Complete chronological log of position logins, credential updates, and approvals
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportFinanceCSV}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV Report</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {isKm ? log.actionKm : log.action}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        <strong className="text-blue-600">{log.staffCode}</strong> · {log.staffName}{' '}
                        · {POSITION_DEFINITIONS[log.position].shortTitle}
                      </div>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== VIEW 10.5: MT5 AUTO-TRADING ENGINE & BOT AUTO TRADING ==================== */}
          {activeNav === 'mt5_bot' && canAccessNav('mt5_bot') && (
            <MT5AutoTradingEngineView
              lang={lang}
              config={mt5Config}
              onUpdateConfig={onUpdateMT5Config}
              positions={mt5Positions}
              onClosePosition={onCloseMT5Position}
              onSetBreakeven={onSetMT5Breakeven}
              logs={mt5Logs}
              onSimulateTestOrder={onSimulateMT5TestOrder}
              embedded={true}
            />
          )}

          {/* ==================== VIEW 10.8: TRADINGVIEW & ADMINISTRATOR INDICATORS ==================== */}
          {activeNav === 'tradingview_desk' && canAccessNav('tradingview_desk') && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2962ff]" />
                    <span>
                      {isKm
                        ? 'មជ្ឈមណ្ឌលក្រាហ្វ TradingView & ការគ្រប់គ្រង Indicators (Administrator)'
                        : 'TradingView Charting & Administrator Indicator Management'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {loggedInStaff.position === 'administrator'
                      ? isKm
                        ? `អ្នកកំពុងចូលជា Administrator (${loggedInStaff.staffCode}) — មានសិទ្ធិពេញលេញក្នុងការបន្ថែម Technical Indicators និងបង្កើតកូដ Pine Script v5 ថ្មី។`
                        : `Signed in as Administrator (${loggedInStaff.staffCode}) — Full permission to add, edit, and attach TradingView Indicators.`
                      : isKm
                      ? 'សម្រាប់មុខតំណែងក្រៅពី Administrator អាចមើលក្រាហ្វ និងបាញ់ Signal ប៉ុន្តែមិនអាចបន្ថែម ឬកែប្រែ Indicator បានទេ។'
                      : 'Only Administrators can add or modify TradingView Indicators.'}
                  </p>
                </div>

                {loggedInStaff.position !== 'administrator' && (
                  <button
                    type="button"
                    onClick={() => {
                      const adminAcc = staffAccounts.find(
                        s => s.position === 'administrator' && s.status === 'active'
                      );
                      if (adminAcc) {
                        onLoginStaff(adminAcc.staffCode, adminAcc.password, 'administrator');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#091738] hover:bg-blue-900 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    {isKm ? 'ចូលជា Administrator (ADM-001)' : 'Sign In as Administrator'}
                  </button>
                )}
              </div>

              <TradingViewWebhookSimulator
                lang={lang}
                onDispatchSignal={onBroadcastSignal}
                webhookSecret={webhookSecret}
                duplicateWindowSeconds={duplicateWindowSeconds}
                recentSignals={signals}
                logs={webhookLogs}
                onAddLog={onAddWebhookLog}
                isAdmin={loggedInStaff.position === 'administrator'}
                indicators={tvIndicators}
                onAddIndicator={onAddTvIndicator}
                onUpdateIndicator={onUpdateTvIndicator}
                onDeleteIndicator={onDeleteTvIndicator}
                adminActorLabel={`${loggedInStaff.staffCode} (${loggedInStaff.fullName})`}
                nonAdminStaffLabel={`${loggedInStaff.staffCode} · ${POSITION_DEFINITIONS[loggedInStaff.position].shortTitle}`}
                onQuickSwitchToAdmin={() => {
                  const adminAcc = staffAccounts.find(
                    s => s.position === 'administrator' && s.status === 'active'
                  );
                  if (adminAcc) {
                    onLoginStaff(adminAcc.staffCode, adminAcc.password, 'administrator');
                  }
                }}
              />
            </div>
          )}

          {/* ==================== VIEW 11: SETTINGS & WEBHOOK / MT5 ==================== */}
          {activeNav === 'settings' && canAccessNav('settings') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    TradingView Webhook & MT5 Bridge Settings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Administrator security parameters for automated signal ingestion
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav('mt5_bot')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Open MT5 & Bot Auto-Trading Engine</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Webhook Secret Token
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={webhookSecret}
                      onChange={e => setWebhookSecret(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-blue-700 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setWebhookSecret(
                          `TV_SECRET_${Math.random().toString(36).substring(2, 8).toUpperCase()}_2026`
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Rotate</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Duplicate Suppression Window
                    </label>
                    <span className="text-xs font-mono font-bold text-blue-600">
                      {duplicateWindowSeconds}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={duplicateWindowSeconds}
                    onChange={e => setDuplicateWindowSeconds(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              {onToggleAutoApprove && (
                <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {isKm
                        ? 'មុខងារ Approve Auto សម្រាប់កញ្ចប់ VIP (ABA KHQR / Bakong / USDT)'
                        : 'VIP Package Instant Auto-Approve Gateway'}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isKm
                        ? 'នៅពេលបើក សមាជិកដែលជ្រើសរើសកញ្ចប់ VIP និងបាញ់ប្រាក់រួចរាល់ នឹងទទួលបានសិទ្ធិ VIP ភ្លាមៗដោយស្វ័យប្រវត្តិ។'
                        : 'Automatically verifies transfers and activates VIP memberships without manual waiting.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleAutoApprove}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer shrink-0 ${
                      autoApproveEnabled
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {autoApproveEnabled
                      ? isKm
                        ? 'Approve Auto កំពុងបើក (ON)'
                        : 'Auto-Approve: ON'
                      : isKm
                      ? 'បើកមុខងារ Approve Auto'
                      : 'Enable Auto-Approve'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================ MODAL 1: SET STAFF ID & PASSWORD MODAL ================ */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-mono font-bold text-blue-600">
                  {POSITION_DEFINITIONS[editingStaff.position].shortTitle}
                </p>
                <h3 className="text-base font-bold text-slate-900">
                  {isKm
                    ? `កំណត់ ID & Password៖ ${editingStaff.fullNameKm}`
                    : `Set Staff ID & Password: ${editingStaff.fullName}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  editFeedback.ok
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}
              >
                {editFeedback.msg}
              </div>
            )}

            <form onSubmit={handleSaveEditedCredentials} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Position
                  </label>
                  <select
                    value={editPosition}
                    onChange={e => {
                      const nextPos = e.target.value as StaffPosition;
                      setEditPosition(nextPos);
                      setEditPermissions([...POSITION_DEFINITIONS[nextPos].defaultPermissions]);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    {ALL_POSITIONS.map(pos => (
                      <option key={pos} value={pos}>
                        {isKm ? POSITION_DEFINITIONS[pos].labelKm : POSITION_DEFINITIONS[pos].labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffCode}
                    onChange={e => setEditStaffCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-blue-700 font-mono tabular-nums font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Set Password *
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      required
                      value={editPassword}
                      onChange={e => setEditPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(v => !v)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditPassword(
                        generateSecurePassword(POSITION_DEFINITIONS[editPosition].shortTitle.split(' ')[0])
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Full Name (EN)
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    placeholder="Name (EN)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ឈ្មោះភាសាខ្មែរ
                  </label>
                  <input
                    type="text"
                    value={editFullNameKm}
                    onChange={e => setEditFullNameKm(e.target.value)}
                    placeholder="ឈ្មោះខ្មែរ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {isKm ? 'លេខទូរស័ព្ទ' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {isKm ? 'វេនធ្វើការ' : 'Work Shift'}
                  </label>
                  <input
                    type="text"
                    value={editShift}
                    onChange={e => setEditShift(e.target.value)}
                    placeholder="Shift"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {isKm ? 'ប្រាក់ខែ ($)' : 'Salary ($)'}
                  </label>
                  <input
                    type="number"
                    value={editSalary}
                    onChange={e => setEditSalary(Number(e.target.value) || 0)}
                    placeholder="Salary"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono tabular-nums text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Module Access Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PERMISSION_LABELS) as StaffPermissionKey[]).map(permKey => {
                    const checked = editPermissions.includes(permKey);
                    return (
                      <label
                        key={permKey}
                        className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 cursor-pointer ${
                          checked
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setEditPermissions(prev => prev.filter(p => p !== permKey));
                            } else {
                              setEditPermissions(prev => [...prev, permKey]);
                            }
                          }}
                          className="accent-blue-600"
                        />
                        <span className="truncate">
                          {isKm ? PERMISSION_LABELS[permKey].km : PERMISSION_LABELS[permKey].en}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  Save ID & Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================ MODAL 2: SELF PASSWORD CHANGE ================ */}
      {isSelfPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Change My Password ({loggedInStaff.staffCode})
              </h3>
              <button
                type="button"
                onClick={() => setIsSelfPassModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {selfPassFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  selfPassFeedback.ok
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}
              >
                {selfPassFeedback.msg}
              </div>
            )}
            <form onSubmit={handleSelfPasswordSubmit} className="space-y-3">
              <input
                type="password"
                required
                placeholder="New Password"
                value={selfNewPassword}
                onChange={e => setSelfNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
              />
              <input
                type="password"
                required
                placeholder="Confirm New Password"
                value={selfConfirmPassword}
                onChange={e => setSelfConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSelfPassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================ MODAL 3: VIDEO PREVIEW ================ */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {isKm ? previewLesson.titleKm : previewLesson.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={
                  previewLesson.videoUrl.includes('/embed/')
                    ? previewLesson.videoUrl
                    : `https://www.youtube.com/embed/${previewLesson.videoUrl.slice(-11)}`
                }
                title={previewLesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
