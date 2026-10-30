import React, { useState, useEffect } from 'react';
import { 
  Role, 
  Language, 
  TradingSignal, 
  SignalStatus,
  MembershipPlan, 
  PaymentRecord, 
  UserAccount, 
  WebhookLog,
  MT5Config,
  MT5Position,
  MT5ExecutionLog,
  VideoLesson,
  ChatMessage,
  ChatChannelId,
  StaffPosition,
  StaffAccount,
  StaffAuditLog,
  FinanceLedgerEntry,
  HRRequestItem,
  VideoProductionTask,
  CustomerRegistrationRecord
} from './types';
import { 
  INITIAL_PLANS, 
  INITIAL_SIGNALS, 
  INITIAL_USERS, 
  INITIAL_PAYMENTS, 
  DEFAULT_WEBHOOK_CONFIG,
  DEFAULT_MT5_CONFIG,
  INITIAL_MT5_POSITIONS,
  INITIAL_MT5_LOGS,
  INITIAL_LESSONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_STAFF_AUDIT_LOGS,
  INITIAL_FINANCE_LEDGER,
  INITIAL_HR_REQUESTS,
  INITIAL_VIDEO_TASKS,
  INITIAL_CUSTOMER_REGISTRATIONS,
  POSITION_DEFINITIONS
} from './data/mockData';
import { playSignalChime } from './utils/audio';

import { Navbar } from './components/Navbar';
import {
  PortalSwitcherBar,
  PortalMode,
  ManagementWorkspaceTab
} from './components/PortalSwitcherBar';
import { VisitorView } from './components/VisitorView';
import { MemberView } from './components/MemberView';
import { VipMemberView } from './components/VipMemberView';
import { AdminView } from './components/AdminView';
import { DashboardManagementView, ErpNavKey } from './components/DashboardManagementView';
import { LessonsAcademyView } from './components/LessonsAcademyView';
import { TelegramChatView } from './components/TelegramChatView';
import { TradingViewWebhookSimulator } from './components/TradingViewWebhookSimulator';
import { ArchitectureModal } from './components/ArchitectureModal';
import { MT5AutoTradingModal } from './components/MT5AutoTradingModal';
import { CustomerAuthGate, CustomerSignupPayload } from './components/CustomerAuthGate';
import { ManagementAuthGate, ManagementSignupPayload } from './components/ManagementAuthGate';
import { botEngine } from './services/tradingBotEngine';
import { ShieldCheck, Layers, Cpu, Bot, X } from 'lucide-react';

export default function App() {
  // Application Language: Khmer (km) default
  const [lang, setLang] = useState<Language>('km');

  // Top-Level Dual-Portal State: 'customer' (Portal 1) | 'management' (Portal 2)
  const [portalMode, setPortalMode] = useState<PortalMode>(() => {
    const saved = sessionStorage.getItem('alphasignal_portal_mode');
    return saved === 'management' ? 'management' : 'customer';
  });

  // Portal 1: Customer Auth Session & Gate
  const [authenticatedCustomerId, setAuthenticatedCustomerId] = useState<string | null>(() => {
    return sessionStorage.getItem('alphasignal_customer_auth_id') || null;
  });
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState<boolean>(() => {
    return !sessionStorage.getItem('alphasignal_customer_auth_id');
  });

  // Customer tier inside Portal 1: 'visitor' | 'member' | 'vip'
  const [currentRole, setCurrentRole] = useState<Role>('visitor');

  // Active Customer view tab ('home' | 'pricing' | 'signals' | 'payment' | 'academy' | 'chat')
  const [activeTab, setActiveTab] = useState<string>('home');

  // Active Management workspace sub-tab ('erp' | 'admin_ops' | 'webhook')
  const [managementTab, setManagementTab] = useState<ManagementWorkspaceTab>('erp');
  const [erpNavTarget, setErpNavTarget] = useState<ErpNavKey>('customer_signups');

  // Architecture modal state
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // MT5 Auto-Trading Modal state
  const [isMT5ModalOpen, setIsMT5ModalOpen] = useState(false);

  // Audio Notification toggle
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Dynamic Data States
  const [signals, setSignals] = useState<TradingSignal[]>(() => {
    const saved = localStorage.getItem('alphasignal_signals');
    return saved ? JSON.parse(saved) : INITIAL_SIGNALS;
  });

  const [plans] = useState<MembershipPlan[]>(INITIAL_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>(INITIAL_PLANS[1]);

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('alphasignal_users');
    if (!saved) return INITIAL_USERS;
    try {
      const parsed: UserAccount[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(u => u.id));
      const missingSeeds = INITIAL_USERS.filter(u => !existingIds.has(u.id));
      return missingSeeds.length > 0 ? [...parsed, ...missingSeeds] : parsed;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('alphasignal_payments');
    if (!saved) {
      localStorage.setItem('alphasignal_payments_table_seeded_v2', 'true');
      return INITIAL_PAYMENTS;
    }
    try {
      const parsed: PaymentRecord[] = JSON.parse(saved);
      const alreadySeededV2 = localStorage.getItem('alphasignal_payments_table_seeded_v2') === 'true';
      if (!alreadySeededV2) {
        localStorage.setItem('alphasignal_payments_table_seeded_v2', 'true');
        const existingIds = new Set(parsed.map(p => p.id));
        const missingSeeds = INITIAL_PAYMENTS.filter(p => !existingIds.has(p.id));
        return missingSeeds.length > 0 ? [...parsed, ...missingSeeds] : parsed;
      }
      return parsed;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  // VIP Package Instant Auto-Approve toggle (enabled by default)
  const [autoApproveEnabled, setAutoApproveEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('alphasignal_auto_approve_vip');
    return saved !== null ? saved === 'true' : true;
  });

  const [webhookSecret, setWebhookSecret] = useState(DEFAULT_WEBHOOK_CONFIG.secretKey);
  const [duplicateWindowSeconds, setDuplicateWindowSeconds] = useState(DEFAULT_WEBHOOK_CONFIG.duplicateWindowSeconds);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);

  // MT5 Auto-Trading States
  const [mt5Config, setMt5Config] = useState<MT5Config>(() => {
    const saved = localStorage.getItem('alphasignal_mt5_config');
    return saved ? JSON.parse(saved) : DEFAULT_MT5_CONFIG;
  });

  const [mt5Positions, setMt5Positions] = useState<MT5Position[]>(() => {
    const saved = localStorage.getItem('alphasignal_mt5_positions');
    return saved ? JSON.parse(saved) : INITIAL_MT5_POSITIONS;
  });

  const [mt5Logs, setMt5Logs] = useState<MT5ExecutionLog[]>(() => {
    const saved = localStorage.getItem('alphasignal_mt5_logs');
    return saved ? JSON.parse(saved) : INITIAL_MT5_LOGS;
  });

  // Video Lessons State
  const [lessons, setLessons] = useState<VideoLesson[]>(() => {
    const saved = localStorage.getItem('alphasignal_lessons');
    return saved ? JSON.parse(saved) : INITIAL_LESSONS;
  });

  // Telegram Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('alphasignal_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  // Staff RBAC & Position Management States (Administrator, Editor, Videos Editor, HR, Leadership Finnie)
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(() => {
    const saved = localStorage.getItem('alphasignal_staff_accounts');
    if (!saved) return INITIAL_STAFF_ACCOUNTS;
    try {
      const parsed: StaffAccount[] = JSON.parse(saved);
      // Migrate legacy @alphasignal.vip seed emails to @gmail.com for Gmail OTP Login
      return parsed.map(acc => {
        if (acc.email.endsWith('@alphasignal.vip')) {
          return {
            ...acc,
            email: acc.email.replace('@alphasignal.vip', '@gmail.com')
          };
        }
        return acc;
      });
    } catch {
      return INITIAL_STAFF_ACCOUNTS;
    }
  });

  // Portal 2: Management Auth Session (requires Management Login / Sign Up + Gmail 6-Digit OTP)
  const [loggedInStaffId, setLoggedInStaffId] = useState<string | null>(() => {
    return sessionStorage.getItem('alphasignal_management_auth_id') || null;
  });

  const [staffAuditLogs, setStaffAuditLogs] = useState<StaffAuditLog[]>(() => {
    const saved = localStorage.getItem('alphasignal_staff_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_AUDIT_LOGS;
  });

  const [financeLedger, setFinanceLedger] = useState<FinanceLedgerEntry[]>(() => {
    const saved = localStorage.getItem('alphasignal_finance_ledger');
    return saved ? JSON.parse(saved) : INITIAL_FINANCE_LEDGER;
  });

  const [hrRequests, setHrRequests] = useState<HRRequestItem[]>(() => {
    const saved = localStorage.getItem('alphasignal_hr_requests');
    return saved ? JSON.parse(saved) : INITIAL_HR_REQUESTS;
  });

  const [videoTasks, setVideoTasks] = useState<VideoProductionTask[]>(() => {
    const saved = localStorage.getItem('alphasignal_video_tasks');
    return saved ? JSON.parse(saved) : INITIAL_VIDEO_TASKS;
  });

  // Customer Sign-Up Intake & Administrator -> Staff Assignment Records
  const [customerRegistrations, setCustomerRegistrations] = useState<CustomerRegistrationRecord[]>(() => {
    const saved = localStorage.getItem('alphasignal_customer_registrations');
    if (!saved) return INITIAL_CUSTOMER_REGISTRATIONS;
    try {
      const parsed: CustomerRegistrationRecord[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(r => r.id));
      const missingSeeds = INITIAL_CUSTOMER_REGISTRATIONS.filter(r => !existingIds.has(r.id));
      return missingSeeds.length > 0 ? [...parsed, ...missingSeeds] : parsed;
    } catch {
      return INITIAL_CUSTOMER_REGISTRATIONS;
    }
  });

  const loggedInStaff = staffAccounts.find(s => s.id === loggedInStaffId && s.status === 'active') || null;

  // Auto-Trade Floating Notification Toast
  const [autoTradeToast, setAutoTradeToast] = useState<{
    ticket: number;
    symbol: string;
    type: 'BUY' | 'SELL';
    volume: number;
    price: number;
    sl: number;
    tp: number;
  } | null>(null);

  // Synchronize state to localStorage for session persistence
  useEffect(() => {
    localStorage.setItem('alphasignal_signals', JSON.stringify(signals));
  }, [signals]);

  useEffect(() => {
    localStorage.setItem('alphasignal_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('alphasignal_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('alphasignal_auto_approve_vip', String(autoApproveEnabled));
  }, [autoApproveEnabled]);

  useEffect(() => {
    localStorage.setItem('alphasignal_mt5_config', JSON.stringify(mt5Config));
  }, [mt5Config]);

  useEffect(() => {
    localStorage.setItem('alphasignal_mt5_positions', JSON.stringify(mt5Positions));
  }, [mt5Positions]);

  useEffect(() => {
    localStorage.setItem('alphasignal_mt5_logs', JSON.stringify(mt5Logs));
  }, [mt5Logs]);

  useEffect(() => {
    localStorage.setItem('alphasignal_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('alphasignal_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('alphasignal_staff_accounts', JSON.stringify(staffAccounts));
  }, [staffAccounts]);

  useEffect(() => {
    sessionStorage.setItem('alphasignal_portal_mode', portalMode);
  }, [portalMode]);

  useEffect(() => {
    if (loggedInStaffId) {
      sessionStorage.setItem('alphasignal_management_auth_id', loggedInStaffId);
    } else {
      sessionStorage.removeItem('alphasignal_management_auth_id');
    }
  }, [loggedInStaffId]);

  useEffect(() => {
    localStorage.setItem('alphasignal_staff_audit_logs', JSON.stringify(staffAuditLogs));
  }, [staffAuditLogs]);

  useEffect(() => {
    localStorage.setItem('alphasignal_finance_ledger', JSON.stringify(financeLedger));
  }, [financeLedger]);

  useEffect(() => {
    localStorage.setItem('alphasignal_hr_requests', JSON.stringify(hrRequests));
  }, [hrRequests]);

  useEffect(() => {
    localStorage.setItem('alphasignal_video_tasks', JSON.stringify(videoTasks));
  }, [videoTasks]);

  useEffect(() => {
    localStorage.setItem('alphasignal_customer_registrations', JSON.stringify(customerRegistrations));
  }, [customerRegistrations]);

  useEffect(() => {
    if (authenticatedCustomerId) {
      sessionStorage.setItem('alphasignal_customer_auth_id', authenticatedCustomerId);
    } else {
      sessionStorage.removeItem('alphasignal_customer_auth_id');
    }
  }, [authenticatedCustomerId]);

  // Staff RBAC & Audit Handlers
  const appendStaffLog = (
    staff: { staffCode: string; fullName: string; position: StaffPosition },
    actionEn: string,
    actionKm: string,
    status: 'SUCCESS' | 'FAILED' | 'SECURITY' = 'SUCCESS'
  ) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newEntry: StaffAuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      timestamp: nowStr,
      staffCode: staff.staffCode,
      staffName: staff.fullName,
      position: staff.position,
      action: actionEn,
      actionKm,
      status
    };
    setStaffAuditLogs(prev => [newEntry, ...prev]);
  };

  const handleLoginStaff = (
    staffCode: string,
    password: string,
    selectedPosition: StaffPosition | 'ALL' = 'ALL'
  ): { ok: boolean; errorKm?: string; errorEn?: string } => {
    const normalizedCode = staffCode.trim().toUpperCase();
    const matched = staffAccounts.find(s => s.staffCode.toUpperCase() === normalizedCode);

    if (!matched || matched.password !== password) {
      appendStaffLog(
        {
          staffCode: normalizedCode || 'UNKNOWN',
          fullName: 'Unverified Attempt',
          position: selectedPosition === 'ALL' ? 'administrator' : selectedPosition
        },
        `Failed login attempt for Staff ID "${normalizedCode}"`,
        `ការព្យាយាមចូលប្រព័ន្ធបរាជ័យសម្រាប់ ID "${normalizedCode}"`,
        'FAILED'
      );
      return {
        ok: false,
        errorKm: 'អត្តលេខ Staff ID ឬលេខសម្ងាត់មិនត្រឹមត្រូវ! សូមពិនិត្យម្តងទៀត។',
        errorEn: 'Invalid Staff ID or Password. Please verify your credentials.'
      };
    }

    if (selectedPosition !== 'ALL' && matched.position !== selectedPosition) {
      const actualTitle = POSITION_DEFINITIONS[matched.position].shortTitle;
      return {
        ok: false,
        errorKm: `អត្តលេខ ${matched.staffCode} ជារបស់មុខតំណែង "${actualTitle}" មិនមែនមុខតំណែងដែលបានជ្រើសរើសទេ។`,
        errorEn: `Staff ID ${matched.staffCode} belongs to "${actualTitle}", not the selected position.`
      };
    }

    if (matched.status === 'suspended') {
      return {
        ok: false,
        errorKm: `គណនីបុគ្គលិក ${matched.staffCode} ត្រូវបានផ្អាកសិទ្ធិជាបណ្តោះអាសន្នដោយ Administrator។`,
        errorEn: `Staff account ${matched.staffCode} is currently suspended by Administrator.`
      };
    }

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setStaffAccounts(prev =>
      prev.map(s => (s.id === matched.id ? { ...s, lastLoginAt: nowStr } : s))
    );
    setLoggedInStaffId(matched.id);
    appendStaffLog(
      matched,
      `Signed into ${POSITION_DEFINITIONS[matched.position].shortTitle} Dashboard`,
      `បានចូលកាន់ផ្ទាំងគ្រប់គ្រង ${POSITION_DEFINITIONS[matched.position].shortTitle} ដោយជោគជ័យ`,
      'SUCCESS'
    );
    if (audioEnabled) {
      playSignalChime('SUCCESS');
    }
    return { ok: true };
  };

  const handleLogoutStaff = () => {
    if (loggedInStaff) {
      appendStaffLog(
        loggedInStaff,
        'Signed out of Management Portal',
        'បានចាកចេញពីផ្ទាំងអ្នកគ្រប់គ្រង',
        'SUCCESS'
      );
    }
    setLoggedInStaffId(null);
  };

  // Portal 2: Management Gmail OTP Login Handler
  const handleAuthenticatedStaffLogin = (staff: StaffAccount) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setStaffAccounts(prev =>
      prev.map(s => (s.id === staff.id ? { ...s, lastLoginAt: nowStr } : s))
    );
    setLoggedInStaffId(staff.id);
    setManagementTab('erp');
    appendStaffLog(
      staff,
      `Authenticated via Gmail 6-Digit OTP into ${POSITION_DEFINITIONS[staff.position].shortTitle} Portal`,
      `បានផ្ទៀងផ្ទាត់ Gmail OTP និងចូលកាន់ផ្ទាំងអ្នកគ្រប់គ្រង (${POSITION_DEFINITIONS[staff.position].shortTitle})`,
      'SUCCESS'
    );
    if (audioEnabled) {
      playSignalChime('SUCCESS');
    }
  };

  // Portal 2: Management Gmail OTP Sign Up Handler
  const handleCompletedStaffSignup = (
    payload: ManagementSignupPayload
  ): { ok: boolean; staff?: StaffAccount; errorKm?: string; errorEn?: string } => {
    if (staffAccounts.some(s => s.email.toLowerCase() === payload.email.toLowerCase())) {
      return {
        ok: false,
        errorKm: 'គណនី Gmail នេះមានក្នុងប្រព័ន្ធអ្នកគ្រប់គ្រងរួចហើយ!',
        errorEn: 'This Gmail is already registered in Management.'
      };
    }

    const posDef = POSITION_DEFINITIONS[payload.position];
    const prefix = posDef.idPrefix;
    const existingNums = staffAccounts
      .filter(s => s.staffCode.startsWith(`${prefix}-`))
      .map(s => parseInt(s.staffCode.split('-')[1] || '0', 10))
      .filter(n => !isNaN(n));
    const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : 0) + 1;
    const generatedCode = `${prefix}-${String(nextNum).padStart(3, '0')}`;

    const salaryDefaults: Record<StaffPosition, number> = {
      administrator: 2200,
      leadership_finance: 1800,
      hr: 1100,
      editor: 1200,
      videos_editor: 950
    };

    const created: StaffAccount = {
      id: `stf_${Date.now().toString().slice(-5)}`,
      staffCode: generatedCode,
      password: payload.password,
      fullName: payload.fullName,
      fullNameKm: payload.fullNameKm || payload.fullName,
      position: payload.position,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      status: 'active',
      dutyStatus: 'on_duty',
      shift: payload.shift || '08:00 - 18:00',
      monthlySalary: salaryDefaults[payload.position],
      permissions: [...posDef.defaultPermissions],
      createdAt: new Date().toISOString().slice(0, 10),
      lastLoginAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setStaffAccounts(prev => [created, ...prev]);
    appendStaffLog(
      created,
      `Registered new ${posDef.shortTitle} account ${created.staffCode} (${created.email}) via Gmail OTP`,
      `បានចុះឈ្មោះគណនីអ្នកគ្រប់គ្រងថ្មី ${created.staffCode} (${posDef.shortTitle}) តាមរយៈ Gmail OTP`,
      'SECURITY'
    );

    if (audioEnabled) {
      playSignalChime('SUCCESS');
    }

    return { ok: true, staff: created };
  };

  const handleCreateStaff = (
    newStaff: Omit<StaffAccount, 'id' | 'createdAt'>
  ): { ok: boolean; errorKm?: string; errorEn?: string } => {
    const normalizedCode = newStaff.staffCode.trim().toUpperCase();
    if (staffAccounts.some(s => s.staffCode.toUpperCase() === normalizedCode)) {
      return {
        ok: false,
        errorKm: `អត្តលេខ Staff ID "${normalizedCode}" មានរួចហើយ! សូមកំណត់ ID ផ្សេង។`,
        errorEn: `Staff ID "${normalizedCode}" already exists. Choose a unique ID.`
      };
    }

    const created: StaffAccount = {
      ...newStaff,
      staffCode: normalizedCode,
      id: `stf_${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setStaffAccounts(prev => [...prev, created]);

    if (loggedInStaff) {
      appendStaffLog(
        loggedInStaff,
        `Created ${POSITION_DEFINITIONS[created.position].shortTitle} ID "${created.staffCode}" (${created.fullName})`,
        `បានបង្កើត ID "${created.staffCode}" សម្រាប់មុខតំណែង ${POSITION_DEFINITIONS[created.position].shortTitle}`,
        'SECURITY'
      );
    }
    return { ok: true };
  };

  const handleUpdateStaffCredentials = (
    staffId: string,
    updates: Partial<StaffAccount>
  ): { ok: boolean; errorKm?: string; errorEn?: string } => {
    if (updates.staffCode) {
      const normalizedCode = updates.staffCode.trim().toUpperCase();
      const conflict = staffAccounts.find(
        s => s.id !== staffId && s.staffCode.toUpperCase() === normalizedCode
      );
      if (conflict) {
        return {
          ok: false,
          errorKm: `អត្តលេខ Staff ID "${normalizedCode}" ជាន់គ្នាជាមួយ ${conflict.fullName}!`,
          errorEn: `Staff ID "${normalizedCode}" is already assigned to ${conflict.fullName}.`
        };
      }
      updates.staffCode = normalizedCode;
    }

    const target = staffAccounts.find(s => s.id === staffId);
    setStaffAccounts(prev => prev.map(s => (s.id === staffId ? { ...s, ...updates } : s)));

    if (loggedInStaff && target && (updates.password || updates.staffCode || updates.position)) {
      appendStaffLog(
        loggedInStaff,
        `Updated credentials/permissions for ${updates.staffCode || target.staffCode}`,
        `បានកែប្រែ ID/Password ឬសិទ្ធិសម្រាប់ ${updates.staffCode || target.staffCode}`,
        'SECURITY'
      );
    }
    return { ok: true };
  };

  const handleDeleteStaff = (staffId: string) => {
    const target = staffAccounts.find(s => s.id === staffId);
    setStaffAccounts(prev => prev.filter(s => s.id !== staffId));
    if (loggedInStaff && target) {
      appendStaffLog(
        loggedInStaff,
        `Removed staff account ${target.staffCode} (${target.fullName})`,
        `បានលុបគណនីបុគ្គលិក ${target.staffCode} (${target.fullName})`,
        'SECURITY'
      );
    }
  };

  const handleUpdateSignalStatus = (signalId: string, status: SignalStatus, pips?: number) => {
    setSignals(prev =>
      prev.map(s =>
        s.id === signalId
          ? {
              ...s,
              status,
              pipsGained: pips !== undefined ? pips : s.pipsGained
            }
          : s
      )
    );
  };

  const handleDeleteSignal = (signalId: string) => {
    setSignals(prev => prev.filter(s => s.id !== signalId));
  };

  // Video Lessons Handlers
  const handleAddLesson = (newLesson: VideoLesson) => {
    setLessons(prev => [newLesson, ...prev]);
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  };

  const handleUpdateLesson = (updatedLesson: VideoLesson) => {
    setLessons(prev => prev.map(l => l.id === updatedLesson.id ? updatedLesson : l));
  };

  // Telegram Chat Handlers
  const handleSendMessage = (msgData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeString
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleDeleteChatMessage = (messageId: string) => {
    setChatMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const handleTogglePinChatMessage = (messageId: string) => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return { ...m, isPinned: !m.isPinned };
      }
      return m;
    }));
  };

  const handleAddChatReaction = (messageId: string, emoji: string) => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const reactions = { ...(m.reactions || {}) };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...m, reactions };
      }
      return m;
    }));
  };

  // Simulated active VIP user ID (defaults to 'usr_001' Sokha Chan, who is MT5 authorized by Admin)
  const [simulatedVipUserId, setSimulatedVipUserId] = useState<string>('usr_001');

  const authenticatedCustomer = authenticatedCustomerId
    ? users.find(u => u.id === authenticatedCustomerId) || null
    : null;

  // Current logged in or simulated user based on active role
  const currentUser = authenticatedCustomer
    ? authenticatedCustomer
    : currentRole === 'vip'
    ? (users.find(u => u.id === simulatedVipUserId) || users.find(u => u.role === 'vip') || users[0])
    : (users.find(u => u.role === 'member') || users.find(u => u.id === 'usr_002') || users[1]);

  const currentCustomerRegistration = currentUser
    ? customerRegistrations.find(
        r => r.userId === currentUser.id || r.email.toLowerCase() === currentUser.email.toLowerCase()
      ) || null
    : null;

  // Customer Login & Sign Up (Gmail OTP) Handlers
  const handleAuthenticatedCustomerLogin = (user: UserAccount) => {
    setAuthenticatedCustomerId(user.id);
    if (user.role === 'vip') {
      setSimulatedVipUserId(user.id);
      setCurrentRole('vip');
      setActiveTab('signals');
    } else {
      const preferredPlan = plans.find(p => p.id === user.interestedPlanId);
      if (preferredPlan) setSelectedPlan(preferredPlan);
      setCurrentRole('member');
      setActiveTab('payment');
    }
    setIsCustomerAuthOpen(false);
    if (audioEnabled) {
      playSignalChime('SUCCESS');
    }
  };

  const handleCompletedCustomerSignup = (
    payload: CustomerSignupPayload
  ): { user: UserAccount; registration: CustomerRegistrationRecord } => {
    const nowIso = new Date().toISOString();
    const userId = `usr_${Date.now().toString().slice(-5)}`;
    const chosenPlan = plans.find(p => p.id === payload.interestedPlanId) || plans[1];

    const newUser: UserAccount = {
      id: userId,
      name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      telegram: payload.telegram || undefined,
      password: payload.password,
      gmailVerified: true,
      interestedPlanId: chosenPlan.id,
      role: 'member',
      status: 'active',
      joinedAt: nowIso.slice(0, 10),
      totalPayments: 0,
      mt5Allowed: false
    };

    const newRegistration: CustomerRegistrationRecord = {
      id: `REG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 899)}`,
      userId,
      fullName: payload.fullName,
      email: payload.email,
      gmailVerified: true,
      verifiedAt: payload.verifiedAt || nowIso,
      phone: payload.phone,
      telegram: payload.telegram || undefined,
      interestedPlanId: chosenPlan.id,
      interestedPlanName: `${chosenPlan.nameKm} ($${chosenPlan.price})`,
      interestedPlanPrice: chosenPlan.price,
      customerNote: payload.customerNote || undefined,
      submittedAt: nowIso,
      workflowStage: 'NEW_FOR_ADMIN'
    };

    setUsers(prev => [newUser, ...prev]);
    setCustomerRegistrations(prev => [newRegistration, ...prev]);
    setSelectedPlan(chosenPlan);

    // Sync to Express backend asynchronously
    fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRegistration)
    }).catch(() => {});

    appendStaffLog(
      {
        staffCode: 'ADM-001',
        fullName: 'Administrator Intake',
        position: 'administrator'
      },
      `New Gmail-verified Customer Sign-Up ${newRegistration.id}: ${payload.fullName} (${payload.email}) — awaiting Administrator staff assignment`,
      `អតិថិជនចុះឈ្មោះថ្មី ${newRegistration.id}៖ ${payload.fullName} (${payload.email}) បានផ្ញើទិន្នន័យចូល Administrator រង់ចាំចាត់តាំងបុគ្គលិកឆែកបន្ត`,
      'SUCCESS'
    );

    if (audioEnabled) {
      playSignalChime('SUCCESS');
    }

    return { user: newUser, registration: newRegistration };
  };

  const handleLogoutCustomer = () => {
    setAuthenticatedCustomerId(null);
    setCurrentRole('visitor');
    setIsCustomerAuthOpen(true);
  };

  // Administrator assigns a Staff Member to check a Customer Sign-Up
  const handleAssignRegistrationToStaff = (
    registrationId: string,
    targetStaff: StaffAccount,
    adminInstruction: string
  ) => {
    const nowIso = new Date().toISOString();
    const adminActor =
      loggedInStaff && loggedInStaff.position === 'administrator'
        ? loggedInStaff
        : staffAccounts.find(s => s.position === 'administrator') || {
            staffCode: 'ADM-001',
            fullName: 'Master Sovann',
            position: 'administrator' as StaffPosition
          };

    const updates: Partial<CustomerRegistrationRecord> = {
      workflowStage: 'ASSIGNED_TO_STAFF',
      assignedByAdminCode: adminActor.staffCode,
      assignedByAdminName: adminActor.fullName,
      assignedToStaffId: targetStaff.id,
      assignedToStaffCode: targetStaff.staffCode,
      assignedToStaffName: targetStaff.fullName,
      assignedToPosition: targetStaff.position,
      assignedAt: nowIso,
      adminInstruction: adminInstruction || undefined
    };

    setCustomerRegistrations(prev =>
      prev.map(r => (r.id === registrationId ? { ...r, ...updates } : r))
    );

    fetch(`/api/registrations/${registrationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});

    const targetReg = customerRegistrations.find(r => r.id === registrationId);
    appendStaffLog(
      {
        staffCode: adminActor.staffCode,
        fullName: adminActor.fullName,
        position: 'administrator'
      },
      `Assigned customer sign-up ${registrationId} (${targetReg?.fullName || ''}) to ${targetStaff.staffCode} (${targetStaff.fullName}) for verification`,
      `Administrator បានចាត់តាំងឱ្យបុគ្គលិក ${targetStaff.staffCode} (${targetStaff.fullName}) ឆែកបន្តលើទិន្នន័យអតិថិជន ${targetReg?.fullName || registrationId}`,
      'SUCCESS'
    );
  };

  // Assigned Staff Member (or Admin) completes verification check on Customer Sign-Up
  const handleCompleteStaffCheck = (
    registrationId: string,
    decision: 'VERIFIED_COMPLETED' | 'REJECTED',
    staffCheckNote: string,
    upgradeToVip: boolean
  ) => {
    const nowIso = new Date().toISOString();
    const targetReg = customerRegistrations.find(r => r.id === registrationId);
    const checker = loggedInStaff || {
      staffCode: targetReg?.assignedToStaffCode || 'ADM-001',
      fullName: targetReg?.assignedToStaffName || 'Administrator',
      position: (targetReg?.assignedToPosition || 'administrator') as StaffPosition
    };

    const updates: Partial<CustomerRegistrationRecord> = {
      workflowStage: decision,
      staffCheckNote: staffCheckNote || undefined,
      checkedByStaffCode: checker.staffCode,
      checkedByStaffName: checker.fullName,
      checkedAt: nowIso
    };

    setCustomerRegistrations(prev =>
      prev.map(r => (r.id === registrationId ? { ...r, ...updates } : r))
    );

    fetch(`/api/registrations/${registrationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});

    if (decision === 'VERIFIED_COMPLETED' && upgradeToVip && targetReg) {
      const days = getPlanDays(targetReg.interestedPlanId);
      setUsers(prev =>
        prev.map(u =>
          u.id === targetReg.userId || u.email.toLowerCase() === targetReg.email.toLowerCase()
            ? {
                ...u,
                role: 'vip',
                vipExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * days).toISOString(),
                mt5Allowed: targetReg.interestedPlanId !== 'plan_starter' ? true : u.mt5Allowed
              }
            : u
        )
      );
    }

    appendStaffLog(
      {
        staffCode: checker.staffCode,
        fullName: checker.fullName,
        position: checker.position
      },
      `${decision === 'VERIFIED_COMPLETED' ? 'Verified' : 'Rejected'} customer sign-up ${registrationId} (${targetReg?.fullName || ''})`,
      `បុគ្គលិក ${checker.staffCode} បាន${decision === 'VERIFIED_COMPLETED' ? 'ឆែកផ្ទៀងផ្ទាត់រួចរាល់' : 'បដិសេធ'}លើទិន្នន័យចុះឈ្មោះអតិថិជន ${targetReg?.fullName || registrationId}`,
      decision === 'VERIFIED_COMPLETED' ? 'SUCCESS' : 'SECURITY'
    );

    if (audioEnabled && decision === 'VERIFIED_COMPLETED') {
      playSignalChime('SUCCESS');
    }
  };

  // MT5 Auto-Trade clearance: authorized for Management Portal or VIP members authorized by Admin
  const isMT5Authorized =
    (portalMode === 'management' && !!loggedInStaff) ||
    (currentRole === 'vip' && !!currentUser?.mt5Allowed);

  // VIP members available for demonstration / simulation
  const availableVipUsers = users.filter(u => u.role === 'vip');

  // Toggle user's MT5 permission (Admin action)
  const handleToggleUserMT5 = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          mt5Allowed: !u.mt5Allowed
        };
      }
      return u;
    }));
  };

  // Switch Customer tier inside Portal 1
  const handleCustomerRoleChange = (newRole: 'visitor' | 'member' | 'vip') => {
    setCurrentRole(newRole);
    if (newRole === 'visitor') {
      setActiveTab('home');
    } else if (newRole === 'member') {
      setActiveTab('payment');
    } else if (newRole === 'vip') {
      setActiveTab('signals');
    }
  };

  // MT5 Auto-Trade Execution Engine
  const executeMT5Order = (signal: TradingSignal) => {
    // Permission check: only authorized VIP members or Admin can execute MT5 orders
    if (!isMT5Authorized) {
      console.warn('MT5 Auto-Trade rejected: Account not authorized by Administrator');
      return;
    }

    // 1. Calculate lot volume according to user MT5 configuration
    let volume = mt5Config.fixedLotSize;
    if (mt5Config.lotType === 'risk_percent') {
      const riskCapital = (mt5Config.accountBalance * (mt5Config.riskPercent / 100));
      const slDistance = Math.max(0.5, Math.abs(signal.entryPrice - signal.sl));
      volume = Number((riskCapital / (slDistance * 10)).toFixed(2));
      if (volume <= 0) volume = 0.01;
      if (volume > 5.0) volume = 5.0; // risk guard
    }

    const newTicket = Math.floor(892000 + Math.random() * 7999);

    const newPosition: MT5Position = {
      ticket: newTicket,
      signalId: signal.id,
      symbol: signal.ticker,
      type: signal.action,
      volume,
      openPrice: signal.entryPrice,
      currentPrice: signal.entryPrice,
      sl: signal.sl,
      tp: signal.tp1,
      openTime: new Date().toISOString(),
      profit: 0.00,
      pips: 0,
      comment: `AlphaVIP AutoTrade #${signal.id.slice(-4)}`
    };

    const newLog: MT5ExecutionLog = {
      id: `mt5_exec_${Date.now()}`,
      ticket: newTicket,
      timestamp: new Date().toISOString(),
      symbol: signal.ticker,
      type: signal.action,
      volume,
      price: signal.entryPrice,
      sl: signal.sl,
      tp: signal.tp1,
      status: 'FILLED',
      latencyMs: Math.floor(28 + Math.random() * 42),
      message: `Auto-Trade Order #${newTicket} filled on ${mt5Config.brokerServer} (${signal.ticker} ${signal.action} ${volume} Lots)`
    };

    setMt5Positions(prev => [newPosition, ...prev]);
    setMt5Logs(prev => [newLog, ...prev]);

    // Audio chime specifically for MT5 order fill
    if (audioEnabled) {
      setTimeout(() => {
        playSignalChime('MT5_ORDER');
      }, 200);
    }

    // Trigger visual toast
    setAutoTradeToast({
      ticket: newTicket,
      symbol: signal.ticker,
      type: signal.action,
      volume,
      price: signal.entryPrice,
      sl: signal.sl,
      tp: signal.tp1
    });

    setTimeout(() => {
      setAutoTradeToast(null);
    }, 6000);
  };

  // Dispatch Signal from TradingView Webhook or Admin broadcast
  const handleDispatchSignal = (newSignal: TradingSignal) => {
    setSignals(prev => [newSignal, ...prev]);
    if (audioEnabled) {
      playSignalChime(newSignal.action);
    }

    // Automatically post new signal into VIP Telegram Channel
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const autoSignalChatMsg: ChatMessage = {
      id: `msg_auto_${Date.now()}`,
      channelId: 'vip',
      senderId: 'usr_webhook_bot',
      senderName: 'Alpha TradingView Bot 🤖',
      senderRole: 'admin',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      text: `🚨 [VIP SIGNAL] #${newSignal.ticker} ${newSignal.action} @ ${newSignal.entryPrice.toFixed(2)} | SL: ${newSignal.sl.toFixed(2)} | TP1: ${newSignal.tp1.toFixed(2)}`,
      textKm: `🚨 [VIP SIGNAL ថ្មី] #${newSignal.ticker} ${newSignal.action} តម្លៃ ${newSignal.entryPrice.toFixed(2)} | SL: ${newSignal.sl.toFixed(2)} | TP1: ${newSignal.tp1.toFixed(2)}`,
      timestamp: timeString,
      attachment: {
        type: 'signal_card',
        title: `${newSignal.ticker} ${newSignal.action} Alert (${newSignal.timeframe})`,
        details: `Strategy: ${newSignal.strategy} • R:R ${newSignal.riskReward}`
      },
      reactions: { '🔥': 2 }
    };
    setChatMessages(prev => [...prev, autoSignalChatMsg]);

    // AUTO TRADE IN MT5: strictly executed only if enabled AND user is authorized by Admin
    if (mt5Config.autoTradeEnabled && isMT5Authorized) {
      executeMT5Order(newSignal);
    }

    // Also forward signal to Bot Auto Trading Engine when running
    const mappedBotSymbol =
      newSignal.ticker === 'XAUUSD'
        ? 'XAU/USD'
        : newSignal.ticker === 'BTCUSD' || newSignal.ticker === 'BTCUSDT'
        ? 'BTC/USDT'
        : newSignal.ticker === 'ETHUSD' || newSignal.ticker === 'ETHUSDT'
        ? 'ETH/USDT'
        : newSignal.ticker === 'EURUSD'
        ? 'EUR/USD'
        : newSignal.ticker;
    botEngine.executeSignal(
      mappedBotSymbol,
      newSignal.action,
      newSignal.entryPrice,
      newSignal.sl,
      newSignal.tp1,
      'ADMIN_SIGNAL'
    );
  };

  // Register MT5 Forward Handler so AutoBot signals can automatically open MT5 Tickets when enabled
  useEffect(() => {
    botEngine.setMT5ForwardHandler(order => {
      if (!mt5Config.autoTradeEnabled || !isMT5Authorized) return;
      executeMT5Order({
        id: `sig_bot_${Date.now().toString().slice(-4)}`,
        ticker: order.symbol,
        assetName: order.symbol,
        action: order.action,
        entryPrice: order.entryPrice,
        sl: order.sl,
        tp1: order.tp,
        tp2: order.tp,
        tp3: order.tp,
        status: 'ACTIVE',
        timeframe: '15m',
        strategy: order.sourceLabel,
        source: 'MT5 Terminal',
        timestamp: new Date().toISOString(),
        riskReward: '1 : 2.0',
        notes: 'Dispatched automatically by Bot Auto Trading Engine.',
        isVipOnly: true
      });
    });
    return () => botEngine.setMT5ForwardHandler(null);
  }, [mt5Config.autoTradeEnabled, isMT5Authorized, mt5Config.brokerServer, mt5Config.lotType, mt5Config.fixedLotSize, mt5Config.riskPercent, mt5Config.accountBalance]);

  // Close MT5 Position
  const handleClosePosition = (ticket: number) => {
    const target = mt5Positions.find(p => p.ticket === ticket);
    if (!target) return;

    setMt5Positions(prev => prev.filter(p => p.ticket !== ticket));

    const closeLog: MT5ExecutionLog = {
      id: `mt5_exec_${Date.now()}`,
      ticket,
      timestamp: new Date().toISOString(),
      symbol: target.symbol,
      type: target.type,
      volume: target.volume,
      price: target.currentPrice,
      sl: target.sl,
      tp: target.tp,
      status: 'CLOSED',
      latencyMs: 31,
      message: `Position #${ticket} closed manually. PnL: ${target.profit >= 0 ? '+' : ''}$${target.profit.toFixed(2)}`
    };
    setMt5Logs(prev => [closeLog, ...prev]);
    playSignalChime('SUCCESS');
  };

  // Set Stop Loss to Breakeven on MT5 Position
  const handleSetBreakeven = (ticket: number) => {
    setMt5Positions(prev => prev.map(p => {
      if (p.ticket === ticket) {
        return {
          ...p,
          sl: p.openPrice
        };
      }
      return p;
    }));

    const pos = mt5Positions.find(p => p.ticket === ticket);
    if (pos) {
      const beLog: MT5ExecutionLog = {
        id: `mt5_exec_${Date.now()}`,
        ticket,
        timestamp: new Date().toISOString(),
        symbol: pos.symbol,
        type: pos.type,
        volume: pos.volume,
        price: pos.openPrice,
        sl: pos.openPrice,
        tp: pos.tp,
        status: 'FILLED',
        latencyMs: 25,
        message: `Order #${ticket} modified: Stop Loss set to Breakeven (${pos.openPrice})`
      };
      setMt5Logs(prev => [beLog, ...prev]);
    }
  };

  // Update MT5 Settings
  const handleUpdateMT5Config = (updated: Partial<MT5Config>) => {
    setMt5Config(prev => ({
      ...prev,
      ...updated
    }));
  };

  // Simulate a test order on MT5
  const handleSimulateTestOrder = () => {
    const sampleSignal: TradingSignal = {
      id: `sig_test_${Date.now()}`,
      ticker: 'XAUUSD',
      assetName: 'Gold / US Dollar',
      action: 'BUY',
      entryPrice: 2386.40,
      sl: 2378.00,
      tp1: 2394.50,
      tp2: 2405.00,
      tp3: 2418.00,
      status: 'ACTIVE',
      timeframe: '15m',
      strategy: 'MT5 Quick Test Execution',
      source: 'MT5 Terminal',
      timestamp: new Date().toISOString(),
      riskReward: '1 : 2.5',
      notes: 'Diagnostic test order sent to MetaTrader 5 Expert Advisor.',
      isVipOnly: true
    };
    executeMT5Order(sampleSignal);
  };

  // 1-Click Manual MT5 Auto-Trade trigger from any signal card
  const handleManualAutoTrade = (signal: TradingSignal) => {
    if (!isMT5Authorized) {
      setIsMT5ModalOpen(true);
      return;
    }
    executeMT5Order(signal);
  };

  // Add a webhook log entry
  const handleAddLog = (log: WebhookLog) => {
    setWebhookLogs(prev => [log, ...prev]);
  };

  const getPlanDays = (planId: string): number => {
    if (planId === 'plan_lifetime') return 3650;
    if (planId === 'plan_vip_pro') return 90;
    return 30;
  };

  // Submit Member Payment -> Runs Instant Auto-Approve if autoApproveEnabled is ON
  const handleSubmitPayment = (paymentData: Omit<PaymentRecord, 'id' | 'submittedAt' | 'status'>) => {
    const nowIso = new Date().toISOString();
    const days = getPlanDays(paymentData.planId);

    if (autoApproveEnabled) {
      const approvedRecord: PaymentRecord = {
        ...paymentData,
        id: `pay_${Date.now().toString().slice(-5)}`,
        submittedAt: nowIso,
        reviewedAt: nowIso,
        status: 'APPROVED',
        approvalMode: 'AUTO'
      };
      setPayments(prev => [approvedRecord, ...prev]);

      // Automatically upgrade member to VIP & unlock MT5 for Pro/Lifetime plans
      setUsers(prev =>
        prev.map(u => {
          if (u.id === paymentData.userId || u.email === paymentData.userEmail) {
            const baseExp =
              u.role === 'vip' && u.vipExpiresAt ? Math.max(Date.now(), new Date(u.vipExpiresAt).getTime()) : Date.now();
            return {
              ...u,
              role: 'vip' as Role,
              vipExpiresAt: new Date(baseExp + 1000 * 60 * 60 * 24 * days).toISOString(),
              totalPayments: (u.totalPayments || 0) + paymentData.amount,
              mt5Allowed: paymentData.planId !== 'plan_starter' ? true : u.mt5Allowed
            };
          }
          return u;
        })
      );

      // Keep user logged into their newly upgraded VIP account
      setSimulatedVipUserId(paymentData.userId);
      setCurrentRole('vip');

      // Record in Finance Ledger & Audit Log automatically
      setFinanceLedger(prev => [
        {
          id: `fin_${Date.now().toString().slice(-4)}`,
          date: nowIso.slice(0, 10),
          title: `Auto-Approved VIP: ${paymentData.planName} (${paymentData.userName})`,
          titleKm: `[Approve Auto] ចំណូលកញ្ចប់ ${paymentData.planName} (${paymentData.userName})`,
          category: 'subscription_revenue',
          type: 'INCOME',
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          recordedBy: 'AUTO-SYSTEM',
          status: 'COMPLETED'
        },
        ...prev
      ]);

      appendStaffLog(
        {
          staffCode: 'AUTO-BOT',
          fullName: 'Approve Auto Engine',
          position: 'leadership_finance'
        },
        `Auto-Approved VIP package "${paymentData.planName}" ($${paymentData.amount}) for ${paymentData.userName}`,
        `បានអនុម័តស្វ័យប្រវត្តិ (Approve Auto) កញ្ចប់ "${paymentData.planName}" ($${paymentData.amount}) ជូន ${paymentData.userName}`,
        'SUCCESS'
      );

      if (audioEnabled) {
        playSignalChime('SUCCESS');
      }
      return;
    }

    // Manual Review Mode when Auto-Approve is OFF
    const pendingRecord: PaymentRecord = {
      ...paymentData,
      id: `pay_${Date.now().toString().slice(-5)}`,
      submittedAt: nowIso,
      status: 'PENDING',
      approvalMode: 'MANUAL'
    };
    setPayments(prev => [pendingRecord, ...prev]);
  };

  // Approve single pending payment -> upgrades user to VIP & syncs finance ledger
  const handleApprovePayment = (paymentId: string, mode: 'AUTO' | 'MANUAL' = 'MANUAL') => {
    const nowIso = new Date().toISOString();
    const payment = payments.find(p => p.id === paymentId);
    const wasAlreadyApproved = payment?.status === 'APPROVED';

    setPayments(prev =>
      prev.map(p => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'APPROVED',
            approvalMode: mode,
            reviewedAt: nowIso
          };
        }
        return p;
      })
    );

    if (payment && !wasAlreadyApproved) {
      const days = getPlanDays(payment.planId);
      setUsers(prev => {
        const exists = prev.some(u => u.id === payment.userId || u.email === payment.userEmail);
        if (!exists) {
          const newUser: UserAccount = {
            id: payment.userId,
            name: payment.userName,
            email: payment.userEmail,
            phone: payment.userPhone || '—',
            role: 'vip',
            vipExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * days).toISOString(),
            joinedAt: nowIso,
            totalPayments: payment.amount,
            status: 'active',
            mt5Allowed: payment.planId !== 'plan_starter'
          };
          return [newUser, ...prev];
        }
        return prev.map(u => {
          if (u.id === payment.userId || u.email === payment.userEmail) {
            const baseExp =
              u.role === 'vip' && u.vipExpiresAt ? Math.max(Date.now(), new Date(u.vipExpiresAt).getTime()) : Date.now();
            return {
              ...u,
              role: 'vip' as Role,
              vipExpiresAt: new Date(baseExp + 1000 * 60 * 60 * 24 * days).toISOString(),
              totalPayments: (u.totalPayments || 0) + payment.amount,
              mt5Allowed: payment.planId !== 'plan_starter' ? true : u.mt5Allowed
            };
          }
          return u;
        });
      });

      setFinanceLedger(prev => [
        {
          id: `fin_${Date.now().toString().slice(-4)}_${Math.random().toString(36).slice(2, 4)}`,
          date: nowIso.slice(0, 10),
          title: `VIP Payment Approved: ${payment.planName} (${payment.userName})`,
          titleKm: `ចំណូលអតិថិជនបង់ប្រាក់ ${payment.planName} (${payment.userName})`,
          category: 'subscription_revenue',
          type: 'INCOME',
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          recordedBy: mode === 'AUTO' ? 'AUTO-SYSTEM' : loggedInStaff?.staffCode || 'ADM-001',
          status: 'COMPLETED'
        },
        ...prev
      ]);

      setSimulatedVipUserId(payment.userId);
      if (currentRole === 'member') {
        setCurrentRole('vip');
      }
      if (audioEnabled) {
        playSignalChime('SUCCESS');
      }
    }
  };

  const handleToggleAutoApprove = () => {
    setAutoApproveEnabled(prev => !prev);
  };

  const handleAutoApproveAllPending = () => {
    const pendingList = payments.filter(p => p.status === 'PENDING');
    if (pendingList.length === 0) return;
    pendingList.forEach(p => handleApprovePayment(p.id, 'AUTO'));
  };

  // Admin or Financial rejects payment
  const handleRejectPayment = (paymentId: string, reason?: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'REJECTED',
          reviewedAt: new Date().toISOString(),
          notes: reason || p.notes || 'Transaction could not be verified'
        };
      }
      return p;
    }));
  };

  // Admin or Financial deletes a payment record
  const handleDeletePayment = (paymentId: string) => {
    const target = payments.find(p => p.id === paymentId);
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    if (target) {
      const actor = loggedInStaff
        ? { staffCode: loggedInStaff.staffCode, fullName: loggedInStaff.fullName, position: loggedInStaff.position }
        : { staffCode: 'ADM-001', fullName: 'Administrator', position: 'administrator' as StaffPosition };
      appendStaffLog(
        actor,
        `Deleted customer payment #${paymentId} (${target.userName} · $${target.amount})`,
        `បានលុបកំណត់ត្រាបង់ប្រាក់ #${paymentId} (${target.userName} · $${target.amount})`,
        'SECURITY'
      );
    }
  };

  // Admin or Financial updates financial verification note on a payment record
  const handleUpdatePaymentNote = (paymentId: string, note: string) => {
    setPayments(prev =>
      prev.map(p => (p.id === paymentId ? { ...p, notes: note } : p))
    );
    const actor = loggedInStaff
      ? { staffCode: loggedInStaff.staffCode, fullName: loggedInStaff.fullName, position: loggedInStaff.position }
      : { staffCode: 'FIN-001', fullName: 'Financial Desk', position: 'leadership_finance' as StaffPosition };
    appendStaffLog(
      actor,
      `Updated financial note on payment #${paymentId}`,
      `បានកែប្រែកំណត់សម្គាល់ហិរញ្ញវត្ថុលើវិក្កយបត្រ #${paymentId}`,
      'SUCCESS'
    );
  };

  // Admin or Financial records a manual customer payment directly into the table
  const handleRecordManualPayment = (
    paymentData: Omit<PaymentRecord, 'id' | 'submittedAt' | 'status'>,
    approveImmediately: boolean
  ) => {
    const nowIso = new Date().toISOString();
    const newPaymentId = `pay_${Date.now().toString().slice(-5)}`;
    const days = getPlanDays(paymentData.planId);
    const actor = loggedInStaff
      ? { staffCode: loggedInStaff.staffCode, fullName: loggedInStaff.fullName, position: loggedInStaff.position }
      : { staffCode: 'FIN-001', fullName: 'Financial Desk', position: 'leadership_finance' as StaffPosition };

    if (approveImmediately) {
      const approvedRecord: PaymentRecord = {
        ...paymentData,
        id: newPaymentId,
        submittedAt: nowIso,
        reviewedAt: nowIso,
        status: 'APPROVED',
        approvalMode: 'MANUAL'
      };
      setPayments(prev => [approvedRecord, ...prev]);

      setUsers(prev => {
        const exists = prev.some(u => u.id === paymentData.userId || u.email === paymentData.userEmail);
        if (!exists) {
          const newUser: UserAccount = {
            id: paymentData.userId,
            name: paymentData.userName,
            email: paymentData.userEmail,
            phone: paymentData.userPhone || '—',
            role: 'vip',
            vipExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * days).toISOString(),
            joinedAt: nowIso,
            totalPayments: paymentData.amount,
            status: 'active',
            mt5Allowed: paymentData.planId !== 'plan_starter'
          };
          return [newUser, ...prev];
        }
        return prev.map(u => {
          if (u.id === paymentData.userId || u.email === paymentData.userEmail) {
            const baseExp =
              u.role === 'vip' && u.vipExpiresAt ? Math.max(Date.now(), new Date(u.vipExpiresAt).getTime()) : Date.now();
            return {
              ...u,
              role: 'vip' as Role,
              vipExpiresAt: new Date(baseExp + 1000 * 60 * 60 * 24 * days).toISOString(),
              totalPayments: (u.totalPayments || 0) + paymentData.amount,
              mt5Allowed: paymentData.planId !== 'plan_starter' ? true : u.mt5Allowed
            };
          }
          return u;
        });
      });

      setFinanceLedger(prev => [
        {
          id: `fin_${Date.now().toString().slice(-4)}`,
          date: nowIso.slice(0, 10),
          title: `Customer VIP Payment: ${paymentData.planName} (${paymentData.userName})`,
          titleKm: `បញ្ចូលការបង់ប្រាក់អតិថិជន ${paymentData.planName} (${paymentData.userName})`,
          category: 'subscription_revenue',
          type: 'INCOME',
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          recordedBy: actor.staffCode,
          status: 'COMPLETED'
        },
        ...prev
      ]);

      appendStaffLog(
        actor,
        `Recorded & Approved VIP payment ($${paymentData.amount}) for ${paymentData.userName}`,
        `បានបញ្ចូល និងអនុម័តការបង់ប្រាក់ ($${paymentData.amount}) ជូនអតិថិជន ${paymentData.userName}`,
        'SUCCESS'
      );

      if (audioEnabled) {
        playSignalChime('SUCCESS');
      }
    } else {
      const pendingRecord: PaymentRecord = {
        ...paymentData,
        id: newPaymentId,
        submittedAt: nowIso,
        status: 'PENDING',
        approvalMode: 'MANUAL'
      };
      setPayments(prev => [pendingRecord, ...prev]);

      setUsers(prev => {
        const exists = prev.some(u => u.id === paymentData.userId || u.email === paymentData.userEmail);
        if (!exists) {
          const newMember: UserAccount = {
            id: paymentData.userId,
            name: paymentData.userName,
            email: paymentData.userEmail,
            phone: paymentData.userPhone || '—',
            role: 'member',
            joinedAt: nowIso,
            totalPayments: 0,
            status: 'active',
            mt5Allowed: false
          };
          return [newMember, ...prev];
        }
        return prev;
      });

      appendStaffLog(
        actor,
        `Recorded pending payment ($${paymentData.amount}) for ${paymentData.userName}`,
        `បានកត់ត្រាការបង់ប្រាក់រង់ចាំពិនិត្យ ($${paymentData.amount}) របស់អតិថិជន ${paymentData.userName}`,
        'SUCCESS'
      );
    }
  };

  // Admin updates user role directly
  const handleUpdateUserRole = (userId: string, newRole: Role) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole,
          vipExpiresAt: newRole === 'vip' ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() : undefined
        };
      }
      return u;
    }));
  };

  // Admin extends VIP expiry
  const handleExtendVip = (userId: string, days: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const currentExp = u.vipExpiresAt ? new Date(u.vipExpiresAt).getTime() : Date.now();
        return {
          ...u,
          vipExpiresAt: new Date(currentExp + 1000 * 60 * 60 * 24 * days).toISOString()
        };
      }
      return u;
    }));
    playSignalChime('SUCCESS');
  };

  const pendingPaymentCount = payments.filter(p => p.status === 'PENDING').length;
  const newSignupCount = customerRegistrations.filter(r => r.workflowStage === 'NEW_FOR_ADMIN').length;
  const isKm = lang === 'km';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top-Level Dual-Portal Switcher: 1. Customer Portal | 2. Management Portal */}
      <PortalSwitcherBar
        portalMode={portalMode}
        onSelectPortal={nextPortal => {
          setPortalMode(nextPortal);
        }}
        lang={lang}
        setLang={setLang}
        isCustomerAuthOpen={isCustomerAuthOpen}
        authenticatedCustomer={authenticatedCustomer}
        customerRole={currentRole}
        onSelectCustomerRole={handleCustomerRoleChange}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        onOpenMT5Modal={() => setIsMT5ModalOpen(true)}
        loggedInStaff={loggedInStaff}
        managementTab={managementTab}
        onSelectManagementTab={tab => setManagementTab(tab)}
        onLogoutStaff={handleLogoutStaff}
        pendingAlertCount={pendingPaymentCount + newSignupCount}
      />

      {/* ===================================================================== */}
      {/* PORTAL 1: សម្រាប់អតិថិជន (CUSTOMER PORTAL)                              */}
      {/* ===================================================================== */}
      {portalMode === 'customer' && (
        <>
          {isCustomerAuthOpen ? (
            <CustomerAuthGate
              lang={lang}
              setLang={setLang}
              users={users}
              plans={plans}
              onAuthenticatedLogin={handleAuthenticatedCustomerLogin}
              onCompletedSignup={handleCompletedCustomerSignup}
              onOpenStaffPortal={() => {
                setErpNavTarget('customer_signups');
                setManagementTab('erp');
                setPortalMode('management');
              }}
              onContinueAsGuest={() => {
                setIsCustomerAuthOpen(false);
                setCurrentRole('visitor');
                setActiveTab('home');
              }}
            />
          ) : (
            <>
              <Navbar
                currentRole={currentRole}
                setRole={r => {
                  if (r === 'visitor' || r === 'member' || r === 'vip') {
                    handleCustomerRoleChange(r);
                  }
                }}
                lang={lang}
                setLang={setLang}
                onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                pendingPaymentCount={pendingPaymentCount}
                onOpenMT5={() => setIsMT5ModalOpen(true)}
                mt5Enabled={mt5Config.autoTradeEnabled}
                isMT5Authorized={isMT5Authorized}
                authenticatedCustomer={authenticatedCustomer}
                onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
                onLogoutCustomer={handleLogoutCustomer}
              />

              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Customer View: VIP Signals Terminal */}
                {activeTab === 'signals' &&
                  (currentRole === 'vip' ? (
                    <VipMemberView
                      lang={lang}
                      currentUser={currentUser}
                      signals={signals}
                      audioEnabled={audioEnabled}
                      setAudioEnabled={setAudioEnabled}
                      onOpenWebhookSimulator={() => {
                        setManagementTab('webhook');
                        setPortalMode('management');
                      }}
                      isAdmin={false}
                      onOpenMT5={() => setIsMT5ModalOpen(true)}
                      mt5Config={mt5Config}
                      mt5Positions={mt5Positions}
                      onManualAutoTrade={handleManualAutoTrade}
                      isMT5Authorized={isMT5Authorized}
                      availableVipUsers={availableVipUsers}
                      onSelectVipUser={uid => setSimulatedVipUserId(uid)}
                    />
                  ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-2xl mx-auto space-y-4 my-8">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {isKm ? 'តម្រូវឱ្យមានសិទ្ធិ VIP Member' : 'VIP Member Access Required'}
                      </h2>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {isKm
                          ? 'ទំព័រនេះសម្រាប់តែសមាជិក VIP ដែលបានបង់ប្រាក់ និងផ្ទៀងផ្ទាត់ត្រឹមត្រូវ។ សូមជ្រើសរើសកញ្ចប់ VIP ដើម្បីបើកសិទ្ធិភ្លាមៗ។'
                          : 'Live trading signals and historic win rates are restricted to verified VIP members.'}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            setCurrentRole('member');
                            setActiveTab('payment');
                          }}
                          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          {isKm ? 'បង់ប្រាក់ Upgrade VIP ឥឡូវនេះ' : 'Upgrade to VIP Now'}
                        </button>
                        <button
                          onClick={() => handleCustomerRoleChange('vip')}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                          {isKm ? 'សាកល្បងជា VIP Member' : 'Switch to VIP Role (Simulate)'}
                        </button>
                      </div>
                    </div>
                  ))}

                {/* Customer View: Member VIP Package Selection & KHQR Checkout */}
                {activeTab === 'payment' && (
                  <MemberView
                    lang={lang}
                    currentUser={currentUser}
                    plans={plans}
                    selectedPlan={selectedPlan}
                    onSelectPlan={plan => setSelectedPlan(plan)}
                    userPayments={payments}
                    onSubmitPayment={handleSubmitPayment}
                    autoApproveEnabled={autoApproveEnabled}
                    onToggleAutoApprove={handleToggleAutoApprove}
                    onApprovePendingPayment={id => handleApprovePayment(id, 'AUTO')}
                    onOpenVipSignals={() => {
                      setCurrentRole('vip');
                      setActiveTab('signals');
                    }}
                    onSwitchToAdmin={() => {
                      setManagementTab('admin_ops');
                      setPortalMode('management');
                    }}
                    onOpenAcademy={() => setActiveTab('academy')}
                    customerRegistration={currentCustomerRegistration}
                    onOpenAdminSignups={() => {
                      setErpNavTarget('customer_signups');
                      setManagementTab('erp');
                      setPortalMode('management');
                    }}
                  />
                )}

                {/* Customer View: Video Lessons & Academy */}
                {activeTab === 'academy' && (
                  <LessonsAcademyView
                    lang={lang}
                    currentRole={currentRole}
                    lessons={lessons}
                    onUpgradeToVip={() => {
                      if (currentRole === 'visitor') {
                        setCurrentRole('member');
                      }
                      setActiveTab('payment');
                    }}
                    onOpenAdminManager={() => {
                      setErpNavTarget('video_studio');
                      setManagementTab('erp');
                      setPortalMode('management');
                    }}
                  />
                )}

                {/* Customer View: Community & VIP Telegram Chat */}
                {activeTab === 'chat' && (
                  <TelegramChatView
                    lang={lang}
                    currentRole={currentRole}
                    currentUser={currentUser}
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteChatMessage}
                    onTogglePin={handleTogglePinChatMessage}
                    onAddReaction={handleAddChatReaction}
                    onUpgradeToVip={() => {
                      if (currentRole === 'visitor') {
                        setCurrentRole('member');
                      }
                      setActiveTab('payment');
                    }}
                    onSimulateVipRole={() => handleCustomerRoleChange('vip')}
                  />
                )}

                {/* Customer View: Visitor Homepage & Pricing */}
                {(activeTab === 'home' || activeTab === 'pricing') && (
                  <VisitorView
                    lang={lang}
                    plans={plans}
                    signals={signals}
                    autoApproveEnabled={autoApproveEnabled}
                    onSelectPlan={plan => {
                      setSelectedPlan(plan);
                      setCurrentRole('member');
                      setActiveTab('payment');
                    }}
                    onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
                    onOpenWebhookTester={() => {
                      setManagementTab('webhook');
                      setPortalMode('management');
                    }}
                  />
                )}
              </main>

              <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300">AlphaSignal.VIP</span>
                    <span>·</span>
                    <span>
                      {isKm
                        ? 'ផ្ទាំងអតិថិជន · ប្រព័ន្ធ Signal ស្វ័យប្រវត្តិ និងសមាជិកភាព VIP'
                        : 'Customer Portal · VIP Signals & Automated Trading Membership'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsMT5ModalOpen(true)}
                      className="hover:text-sky-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>MT5 Auto-Trade</span>
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => setIsArchitectureModalOpen(true)}
                      className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isKm ? 'ដ្យាក្រាមប្រព័ន្ធ' : 'System Diagram'}</span>
                    </button>
                  </div>
                </div>
              </footer>
            </>
          )}
        </>
      )}

      {/* ===================================================================== */}
      {/* PORTAL 2: សម្រាប់អ្នកគ្រប់គ្រង (MANAGEMENT & ADMIN PORTAL)               */}
      {/* ===================================================================== */}
      {portalMode === 'management' && (
        <>
          {!loggedInStaff ? (
            <ManagementAuthGate
              lang={lang}
              staffAccounts={staffAccounts}
              onAuthenticatedStaffLogin={handleAuthenticatedStaffLogin}
              onCompletedStaffSignup={handleCompletedStaffSignup}
              onSwitchToCustomerPortal={() => setPortalMode('customer')}
            />
          ) : (
            <main
              className={
                managementTab === 'erp'
                  ? 'flex-1 w-full'
                  : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'
              }
            >
              {managementTab === 'erp' && (
                <DashboardManagementView
                  lang={lang}
                  setLang={setLang}
                  staffAccounts={staffAccounts}
                  loggedInStaff={loggedInStaff}
                  onLoginStaff={handleLoginStaff}
                  onLogoutStaff={handleLogoutStaff}
                  onCreateStaff={handleCreateStaff}
                  onUpdateStaffCredentials={handleUpdateStaffCredentials}
                  onDeleteStaff={handleDeleteStaff}
                  auditLogs={staffAuditLogs}
                  onAddAuditLog={(actionEn, actionKm, status) => {
                    if (loggedInStaff) {
                      appendStaffLog(loggedInStaff, actionEn, actionKm, status);
                    }
                  }}
                  signals={signals}
                  onBroadcastSignal={handleDispatchSignal}
                  onUpdateSignalStatus={handleUpdateSignalStatus}
                  onDeleteSignal={handleDeleteSignal}
                  onPostChatAnnouncement={(
                    channelId: ChatChannelId,
                    textEn: string,
                    textKm: string,
                    isPinned: boolean
                  ) => {
                    handleSendMessage({
                      channelId,
                      senderId: loggedInStaff?.id || 'usr_editor',
                      senderName: loggedInStaff
                        ? `${loggedInStaff.fullName} (${POSITION_DEFINITIONS[loggedInStaff.position].shortTitle})`
                        : 'Editorial Desk',
                      senderRole: 'analyst',
                      text: textEn,
                      textKm,
                      isPinned
                    });
                  }}
                  lessons={lessons}
                  onAddLesson={handleAddLesson}
                  onUpdateLesson={handleUpdateLesson}
                  onDeleteLesson={handleDeleteLesson}
                  videoTasks={videoTasks}
                  onAddVideoTask={task =>
                    setVideoTasks(prev => [
                      { ...task, id: `vtask_${Date.now().toString().slice(-4)}` },
                      ...prev
                    ])
                  }
                  onAdvanceVideoTask={(taskId, nextStage) =>
                    setVideoTasks(prev =>
                      prev.map(t => (t.id === taskId ? { ...t, stage: nextStage } : t))
                    )
                  }
                  onDeleteVideoTask={taskId =>
                    setVideoTasks(prev => prev.filter(t => t.id !== taskId))
                  }
                  hrRequests={hrRequests}
                  onAddHRRequest={req =>
                    setHrRequests(prev => [
                      {
                        ...req,
                        id: `hrr_${Date.now().toString().slice(-4)}`,
                        status: 'PENDING',
                        submittedAt: new Date().toISOString().slice(0, 10)
                      },
                      ...prev
                    ])
                  }
                  onResolveHRRequest={(reqId, status) =>
                    setHrRequests(prev =>
                      prev.map(r => (r.id === reqId ? { ...r, status } : r))
                    )
                  }
                  payments={payments}
                  onApprovePayment={handleApprovePayment}
                  onRejectPayment={handleRejectPayment}
                  financeLedger={financeLedger}
                  onAddFinanceEntry={entry =>
                    setFinanceLedger(prev => [
                      { ...entry, id: `fin_${Date.now().toString().slice(-4)}` },
                      ...prev
                    ])
                  }
                  users={users}
                  onUpdateUserRole={handleUpdateUserRole}
                  onExtendVip={handleExtendVip}
                  onToggleMT5Permission={handleToggleUserMT5}
                  webhookSecret={webhookSecret}
                  setWebhookSecret={setWebhookSecret}
                  duplicateWindowSeconds={duplicateWindowSeconds}
                  setDuplicateWindowSeconds={setDuplicateWindowSeconds}
                  onOpenMT5={() => setIsMT5ModalOpen(true)}
                  autoApproveEnabled={autoApproveEnabled}
                  onToggleAutoApprove={handleToggleAutoApprove}
                  onAutoApproveAllPending={handleAutoApproveAllPending}
                  onDeletePayment={handleDeletePayment}
                  onUpdatePaymentNote={handleUpdatePaymentNote}
                  onRecordManualPayment={handleRecordManualPayment}
                  mt5Config={mt5Config}
                  onUpdateMT5Config={handleUpdateMT5Config}
                  mt5Positions={mt5Positions}
                  onCloseMT5Position={handleClosePosition}
                  onSetMT5Breakeven={handleSetBreakeven}
                  mt5Logs={mt5Logs}
                  onSimulateMT5TestOrder={handleSimulateTestOrder}
                  initialNav={erpNavTarget}
                  customerRegistrations={customerRegistrations}
                  onAssignRegistrationToStaff={handleAssignRegistrationToStaff}
                  onCompleteStaffCheck={handleCompleteStaffCheck}
                  onOpenMemberCheckout={() => {
                    setPortalMode('customer');
                    setIsCustomerAuthOpen(false);
                    setCurrentRole('member');
                    setActiveTab('payment');
                  }}
                />
              )}

              {managementTab === 'admin_ops' && (
                <AdminView
                  lang={lang}
                  payments={payments}
                  onApprovePayment={id => handleApprovePayment(id, 'MANUAL')}
                  onRejectPayment={handleRejectPayment}
                  users={users}
                  onUpdateUserRole={handleUpdateUserRole}
                  onExtendVip={handleExtendVip}
                  onBroadcastManualSignal={handleDispatchSignal}
                  webhookSecret={webhookSecret}
                  setWebhookSecret={setWebhookSecret}
                  duplicateWindowSeconds={duplicateWindowSeconds}
                  setDuplicateWindowSeconds={setDuplicateWindowSeconds}
                  signals={signals}
                  onUpdateSignalStatus={handleUpdateSignalStatus}
                  onOpenMT5={() => setIsMT5ModalOpen(true)}
                  lessons={lessons}
                  onAddLesson={handleAddLesson}
                  onDeleteLesson={handleDeleteLesson}
                  onUpdateLesson={handleUpdateLesson}
                  onToggleMT5Permission={handleToggleUserMT5}
                  onOpenManagement={() => {
                    setErpNavTarget('customer_signups');
                    setManagementTab('erp');
                  }}
                  autoApproveEnabled={autoApproveEnabled}
                  onToggleAutoApprove={handleToggleAutoApprove}
                  onAutoApproveAllPending={handleAutoApproveAllPending}
                  onDeletePayment={handleDeletePayment}
                  onUpdatePaymentNote={handleUpdatePaymentNote}
                  onRecordManualPayment={handleRecordManualPayment}
                  onOpenMemberCheckout={() => {
                    setPortalMode('customer');
                    setIsCustomerAuthOpen(false);
                    setCurrentRole('member');
                    setActiveTab('payment');
                  }}
                  customerRegistrations={customerRegistrations}
                  staffAccounts={staffAccounts}
                  onAssignRegistrationToStaff={handleAssignRegistrationToStaff}
                  onCompleteStaffCheck={handleCompleteStaffCheck}
                />
              )}

              {managementTab === 'webhook' && (
                <TradingViewWebhookSimulator
                  lang={lang}
                  onDispatchSignal={handleDispatchSignal}
                  webhookSecret={webhookSecret}
                  duplicateWindowSeconds={duplicateWindowSeconds}
                  recentSignals={signals}
                  logs={webhookLogs}
                  onAddLog={handleAddLog}
                  isAdmin={true}
                />
              )}
            </main>
          )}
        </>
      )}

      {/* Shared Modals */}
      <MT5AutoTradingModal
        isOpen={isMT5ModalOpen}
        onClose={() => setIsMT5ModalOpen(false)}
        lang={lang}
        config={mt5Config}
        onUpdateConfig={handleUpdateMT5Config}
        positions={mt5Positions}
        onClosePosition={handleClosePosition}
        onSetBreakeven={handleSetBreakeven}
        logs={mt5Logs}
        onSimulateTestOrder={handleSimulateTestOrder}
        userRole={portalMode === 'management' && loggedInStaff ? 'admin' : currentRole}
        isMT5Authorized={isMT5Authorized}
        currentUser={currentUser}
        onUpgradeToVip={() => {
          setIsMT5ModalOpen(false);
          setPortalMode('customer');
          setIsCustomerAuthOpen(false);
          if (currentRole === 'visitor') {
            setCurrentRole('member');
          }
          setActiveTab('payment');
        }}
        onSwitchToAdmin={() => {
          setIsMT5ModalOpen(false);
          setManagementTab('admin_ops');
          setPortalMode('management');
        }}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
        lang={lang}
        onOpenWebhookTester={() => {
          setIsArchitectureModalOpen(false);
          setManagementTab('webhook');
          setPortalMode('management');
        }}
      />

      {/* Floating MT5 Auto-Trade Execution Notification Toast */}
      {autoTradeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-sky-500/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isKm ? 'MT5 Auto-Trade បានបញ្ជូន!' : 'MT5 Auto-Trade Executed!'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono tabular-nums rounded font-bold">
                    #{autoTradeToast.ticket}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono tabular-nums mt-0.5">
                  <strong className={autoTradeToast.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                    {autoTradeToast.type}
                  </strong>{' '}
                  {autoTradeToast.volume} Lots {autoTradeToast.symbol} @ {autoTradeToast.price}
                </div>
              </div>
            </div>

            <button
              onClick={() => setAutoTradeToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">
              Broker: {mt5Config.brokerServer}
            </span>
            <button
              onClick={() => {
                setAutoTradeToast(null);
                setIsMT5ModalOpen(true);
              }}
              className="text-sky-400 hover:text-sky-300 font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>{isKm ? 'មើលក្នុង MT5' : 'View MT5'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
