export type Role = 'visitor' | 'member' | 'vip' | 'admin';
export type Language = 'km' | 'en';

export type SignalAction = 'BUY' | 'SELL';
export type SignalStatus = 'ACTIVE' | 'HIT_TP1' | 'HIT_TP2' | 'HIT_TP3' | 'HIT_SL' | 'CLOSED';

export interface TradingSignal {
  id: string;
  ticker: string; // e.g. XAUUSD, BTCUSD, EURUSD
  assetName: string; // e.g. Gold Spot, Bitcoin, Euro
  action: SignalAction;
  entryPrice: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  status: SignalStatus;
  timeframe: string; // 15m, 1h, 4h
  strategy: string; // e.g. PineScript EMA Cross, OrderBlock Reversal
  source: 'TradingView Webhook' | 'Admin Manual' | 'MT5 Bridge' | 'MT5 Terminal';
  timestamp: string;
  pipsGained?: number;
  riskReward: string;
  notes?: string;
  isVipOnly: boolean;
  signature?: string; // used for duplicate check
}

export interface MembershipPlan {
  id: string;
  name: string;
  nameKm: string;
  price: number;
  billingPeriod: string;
  billingPeriodKm: string;
  targetAudience: string;
  targetAudienceKm: string;
  features: string[];
  featuresKm: string[];
  popular?: boolean;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  planId: string;
  planName: string;
  amount: number;
  paymentMethod: 'ABA KHQR' | 'Bakong' | 'USDT TRC20';
  transactionId: string;
  receiptImage?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalMode?: 'AUTO' | 'MANUAL';
  reviewedAt?: string;
  notes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  telegram?: string;
  password?: string;
  gmailVerified?: boolean;
  interestedPlanId?: string;
  role: Role;
  status: 'active' | 'suspended';
  vipExpiresAt?: string;
  joinedAt: string;
  totalPayments: number;
  mt5Allowed?: boolean; // Admin permission required for VIP Auto-Trading in MT5
}

export type CustomerSignupStage =
  | 'NEW_FOR_ADMIN'
  | 'ASSIGNED_TO_STAFF'
  | 'VERIFIED_COMPLETED'
  | 'REJECTED';

export interface CustomerRegistrationRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  gmailVerified: boolean;
  verifiedAt: string;
  phone: string;
  telegram?: string;
  interestedPlanId: string;
  interestedPlanName: string;
  interestedPlanPrice: number;
  customerNote?: string;
  submittedAt: string;
  workflowStage: CustomerSignupStage;
  assignedByAdminCode?: string;
  assignedByAdminName?: string;
  assignedToStaffId?: string;
  assignedToStaffCode?: string;
  assignedToStaffName?: string;
  assignedToPosition?: StaffPosition;
  assignedAt?: string;
  adminInstruction?: string;
  staffCheckNote?: string;
  checkedByStaffCode?: string;
  checkedByStaffName?: string;
  checkedAt?: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  ticker: string;
  action: SignalAction;
  secretProvided: string;
  status: 'SUCCESS' | 'INVALID_SECRET' | 'INVALID_DATA' | 'DUPLICATE_IGNORED';
  responseCode: number;
  message: string;
  rawPayload: any;
  stepsTrace: {
    step: string;
    stepKm: string;
    passed: boolean;
    details: string;
  }[];
}

export interface MT5Config {
  autoTradeEnabled: boolean;
  accountNumber: string;
  brokerServer: string;
  lotType: 'fixed' | 'risk_percent';
  fixedLotSize: number;
  riskPercent: number;
  magicNumber: number;
  maxSlippage: number;
  partialTakeProfit: boolean; // close 50% at TP1, move SL to breakeven
  connected: boolean;
  accountBalance: number;
  accountEquity: number;
}

export interface MT5Position {
  ticket: number;
  signalId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  openTime: string;
  profit: number;
  pips: number;
  comment: string;
}

export interface MT5ExecutionLog {
  id: string;
  ticket: number;
  timestamp: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  price: number;
  sl: number;
  tp: number;
  status: 'FILLED' | 'REJECTED' | 'SLIPPAGE_FAIL' | 'CLOSED';
  latencyMs: number;
  message: string;
}

export type LessonCategory = 'basics' | 'technical' | 'smc' | 'risk_management' | 'mt5_bot' | 'psychology';

export interface VideoLesson {
  id: string;
  title: string;
  titleKm: string;
  description: string;
  descriptionKm: string;
  videoUrl: string; // YouTube watch or embed URL, Vimeo, or direct MP4
  thumbnailUrl?: string;
  duration: string; // e.g. "14:20"
  category: LessonCategory;
  categoryKm: string;
  accessLevel: 'all' | 'member' | 'vip';
  createdAt: string;
  viewsCount?: number;
  instructor?: string;
  keyTakeaways?: string[];
  keyTakeawaysKm?: string[];
}

export type ChatChannelId = 'community' | 'vip';

export interface ChatAttachment {
  type: 'chart' | 'signal_card' | 'image';
  title: string;
  imageUrl?: string;
  details?: string;
}

export interface ChatMessage {
  id: string;
  channelId: ChatChannelId;
  senderId: string;
  senderName: string;
  senderRole: Role | 'analyst';
  senderAvatar?: string;
  text: string;
  textKm?: string;
  timestamp: string;
  isPinned?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  attachment?: ChatAttachment;
  reactions?: Record<string, number>;
}

export type StaffPosition =
  | 'administrator'
  | 'editor'
  | 'videos_editor'
  | 'hr'
  | 'leadership_finance';

export type StaffPermissionKey =
  | 'overview'
  | 'staff_credentials'
  | 'editorial_signals'
  | 'video_studio'
  | 'hr_operations'
  | 'leadership_finance'
  | 'members_vip'
  | 'system_security';

export interface StaffAccount {
  id: string;
  staffCode: string; // Login ID set per position, e.g. ADM-001, EDT-001, VID-001, HR-001, FIN-001
  password: string;
  fullName: string;
  fullNameKm: string;
  position: StaffPosition;
  email: string;
  phone: string;
  status: 'active' | 'suspended';
  dutyStatus: 'on_duty' | 'remote' | 'leave';
  shift: string;
  monthlySalary: number;
  permissions: StaffPermissionKey[];
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface StaffAuditLog {
  id: string;
  timestamp: string;
  staffCode: string;
  staffName: string;
  position: StaffPosition;
  action: string;
  actionKm: string;
  status: 'SUCCESS' | 'FAILED' | 'SECURITY';
}

export interface FinanceLedgerEntry {
  id: string;
  date: string;
  title: string;
  titleKm: string;
  category: 'subscription_revenue' | 'payroll' | 'infrastructure' | 'marketing' | 'operations';
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  paymentMethod: string;
  recordedBy: string;
  status: 'COMPLETED' | 'PENDING';
}

export interface HRRequestItem {
  id: string;
  staffId: string;
  staffCode: string;
  staffName: string;
  position: StaffPosition;
  requestType: 'leave' | 'shift_change' | 'equipment' | 'onboarding';
  reason: string;
  dateRange: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export interface VideoProductionTask {
  id: string;
  title: string;
  titleKm: string;
  assignedTo: string;
  category: LessonCategory;
  stage: 'script' | 'recording' | 'editing' | 'published';
  dueDate: string;
}

