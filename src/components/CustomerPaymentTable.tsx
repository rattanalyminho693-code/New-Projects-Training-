import React, { useState, useEffect } from 'react';
import { Language, MembershipPlan, PaymentRecord, UserAccount } from '../types';
import { INITIAL_PLANS } from '../data/mockData';
import {
  Search,
  Download,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Copy,
  Check,
  Zap,
  ArrowUpDown,
  X,
  FileText
} from 'lucide-react';

interface CustomerPaymentTableProps {
  lang: Language;
  theme?: 'light' | 'dark';
  payments: PaymentRecord[];
  users?: UserAccount[];
  plans?: MembershipPlan[];
  managerLabel?: string;
  autoApproveEnabled?: boolean;
  onToggleAutoApprove?: () => void;
  onAutoApproveAllPending?: () => void;
  onApprovePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string, reason?: string) => void;
  onDeletePayment?: (paymentId: string) => void;
  onUpdatePaymentNote?: (paymentId: string, note: string) => void;
  onRecordManualPayment?: (
    payment: Omit<PaymentRecord, 'id' | 'submittedAt' | 'status'>,
    approveImmediately: boolean
  ) => void;
  onOpenMemberCheckout?: () => void;
}

type StatusFilterType = 'ALL' | 'PENDING' | 'APPROVED' | 'AUTO_ONLY' | 'REJECTED';
type GatewayFilterType = 'ALL' | 'ABA KHQR' | 'Bakong' | 'USDT TRC20';
type SortField = 'date' | 'amount';

export const CustomerPaymentTable: React.FC<CustomerPaymentTableProps> = ({
  lang,
  theme = 'light',
  payments,
  users = [],
  plans = INITIAL_PLANS,
  managerLabel,
  autoApproveEnabled = true,
  onToggleAutoApprove,
  onAutoApproveAllPending,
  onApprovePayment,
  onRejectPayment,
  onDeletePayment,
  onUpdatePaymentNote,
  onRecordManualPayment,
  onOpenMemberCheckout
}) => {
  const isKm = lang === 'km';
  const isLight = theme === 'light';

  // Table Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
  const [gatewayFilter, setGatewayFilter] = useState<GatewayFilterType>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Interactive Row States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [inspectingPayment, setInspectingPayment] = useState<PaymentRecord | null>(null);
  const [editableNote, setEditableNote] = useState('');
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  // Add New Customer Payment Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExistingUserId, setSelectedExistingUserId] = useState<string>('CUSTOM');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newPlanId, setNewPlanId] = useState<string>(plans[1]?.id || 'plan_vip_pro');
  const [newMethod, setNewMethod] = useState<'ABA KHQR' | 'Bakong' | 'USDT TRC20'>('ABA KHQR');
  const [newTxnRef, setNewTxnRef] = useState('');
  const [newNote, setNewNote] = useState('');
  const [approveNewImmediately, setApproveNewImmediately] = useState(true);

  useEffect(() => {
    if (inspectingPayment) {
      setEditableNote(inspectingPayment.notes || '');
      setNoteSavedToast(false);
    }
  }, [inspectingPayment]);

  // Summary Metrics
  const approvedList = payments.filter(p => p.status === 'APPROVED');
  const pendingList = payments.filter(p => p.status === 'PENDING');
  const autoApprovedCount = approvedList.filter(p => p.approvalMode === 'AUTO').length;
  const manualApprovedCount = approvedList.length - autoApprovedCount;

  const totalApprovedUsd = approvedList.reduce((acc, p) => acc + p.amount, 0);
  const totalPendingUsd = pendingList.reduce((acc, p) => acc + p.amount, 0);

  const abaApprovedUsd = approvedList
    .filter(p => p.paymentMethod === 'ABA KHQR')
    .reduce((acc, p) => acc + p.amount, 0);
  const bakongApprovedUsd = approvedList
    .filter(p => p.paymentMethod === 'Bakong')
    .reduce((acc, p) => acc + p.amount, 0);
  const usdtApprovedUsd = approvedList
    .filter(p => p.paymentMethod === 'USDT TRC20')
    .reduce((acc, p) => acc + p.amount, 0);

  // Filtered & Sorted Rows
  const q = searchQuery.trim().toLowerCase();
  const filteredRows = payments
    .filter(p => {
      if (statusFilter === 'PENDING' && p.status !== 'PENDING') return false;
      if (statusFilter === 'APPROVED' && p.status !== 'APPROVED') return false;
      if (statusFilter === 'AUTO_ONLY' && !(p.status === 'APPROVED' && p.approvalMode === 'AUTO')) {
        return false;
      }
      if (statusFilter === 'REJECTED' && p.status !== 'REJECTED') return false;

      if (gatewayFilter !== 'ALL' && p.paymentMethod !== gatewayFilter) return false;
      if (planFilter !== 'ALL' && p.planId !== planFilter) return false;

      if (!q) return true;
      return (
        p.userName.toLowerCase().includes(q) ||
        p.userEmail.toLowerCase().includes(q) ||
        (p.userPhone || '').toLowerCase().includes(q) ||
        p.transactionId.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.planName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortField === 'amount') {
        return sortAsc ? a.amount - b.amount : b.amount - a.amount;
      }
      const timeA = new Date(a.submittedAt).getTime();
      const timeB = new Date(b.submittedAt).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    });

  const filteredSumUsd = filteredRows
    .filter(r => r.status !== 'REJECTED')
    .reduce((acc, r) => acc + r.amount, 0);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(prev => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Export UTF-8 BOM CSV for Excel compatibility with Khmer text
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Invoice ID',
      'Customer Name',
      'Phone',
      'Email',
      'VIP Package',
      'Gateway',
      'Transaction Ref',
      'Amount (USD)',
      'Amount (KHR)',
      'Status',
      'Approval Mode',
      'Submitted Date',
      'Notes'
    ];

    const rows = filteredRows.map((p, index) => [
      String(index + 1),
      p.id.toUpperCase(),
      `"${p.userName.replace(/"/g, '""')}"`,
      `"${(p.userPhone || '—').replace(/"/g, '""')}"`,
      p.userEmail,
      `"${p.planName.replace(/"/g, '""')}"`,
      p.paymentMethod,
      p.transactionId,
      p.amount.toFixed(2),
      String(p.amount * 4080),
      p.status,
      p.approvalMode || 'MANUAL',
      new Date(p.submittedAt).toISOString().slice(0, 16).replace('T', ' '),
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customer_payments_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSelectExistingCustomer = (uid: string) => {
    setSelectedExistingUserId(uid);
    if (uid === 'CUSTOM') {
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      return;
    }
    const found = users.find(u => u.id === uid);
    if (found) {
      setNewCustomerName(found.name);
      setNewCustomerPhone(found.phone);
      setNewCustomerEmail(found.email);
    }
  };

  const handleCreateRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onRecordManualPayment || !newCustomerName.trim()) return;

    const chosenPlan = plans.find(pl => pl.id === newPlanId) || plans[0];
    const refCode =
      newTxnRef.trim() ||
      `${newMethod === 'ABA KHQR' ? 'ABA' : newMethod === 'Bakong' ? 'BKG' : 'TRC20'}-${Math.floor(
        1000000 + Math.random() * 9000000
      )}`;

    onRecordManualPayment(
      {
        userId: selectedExistingUserId !== 'CUSTOM' ? selectedExistingUserId : `usr_${Date.now().toString().slice(-4)}`,
        userName: newCustomerName.trim(),
        userEmail: newCustomerEmail.trim() || `${newCustomerName.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        userPhone: newCustomerPhone.trim() || '012 000 000',
        planId: chosenPlan.id,
        planName: isKm ? chosenPlan.nameKm : chosenPlan.name,
        amount: chosenPlan.price,
        paymentMethod: newMethod,
        transactionId: refCode,
        notes: newNote.trim() || `Recorded by ${managerLabel || 'Admin / Finance'}`
      },
      approveNewImmediately
    );

    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerEmail('');
    setNewTxnRef('');
    setNewNote('');
    setSelectedExistingUserId('CUSTOM');
    setIsAddModalOpen(false);
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const datePart = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart} · ${timePart}`;
  };

  // Surface styling tokens based on Light ERP vs Dark Admin Console
  const cardSurface = isLight
    ? 'bg-white border border-slate-200 text-slate-800 shadow-xs'
    : 'bg-slate-900 border border-slate-800 text-slate-100';
  const subSurface = isLight
    ? 'bg-slate-50 border border-slate-200/90 text-slate-800'
    : 'bg-slate-950 border border-slate-800 text-slate-200';
  const inputSurface = isLight
    ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500'
    : 'bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-400';
  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';
  const strongText = isLight ? 'text-slate-900' : 'text-white';
  const dividerBorder = isLight ? 'border-slate-200' : 'border-slate-800';

  return (
    <div className="space-y-4">
      {/* 1. Top Header & Financial Summary Strip */}
      <div className={`rounded-2xl p-5 sm:p-6 space-y-5 ${cardSurface}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
          <div>
            <div className={`text-xs font-medium ${isLight ? 'text-blue-600' : 'text-amber-400'}`}>
              {managerLabel ||
                (isKm
                  ? 'គ្រប់គ្រងដោយផ្នែក Admin & Financial (Leadership Finnie)'
                  : 'Managed by Administrator & Financial Department')}
            </div>
            <h2 className={`text-lg font-bold mt-0.5 ${strongText}`}>
              {isKm
                ? 'តារាងបញ្ជីអតិថិជនបង់ប្រាក់ (Customer Payment Ledger)'
                : 'Customer Payment Management Table'}
            </h2>
            <p className={`text-xs mt-0.5 ${mutedText}`}>
              {isKm
                ? 'ត្រួតពិនិត្យ រាល់ប្រតិបត្តិការបង់ប្រាក់តាម ABA KHQR, Bakong និង USDT TRC-20 ផ្ទៀងផ្ទាត់ស្វ័យប្រវត្តិ (Approve Auto) និងទាញយករបាយការណ៍ហិរញ្ញវត្ថុ។'
                : 'Centralized ledger of customer VIP subscription payments for Admin and Financial verification, auto-approval, and CSV export.'}
            </p>
          </div>

          {/* Primary Management Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onToggleAutoApprove && (
              <button
                type="button"
                onClick={onToggleAutoApprove}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  autoApproveEnabled
                    ? isLight
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {isKm ? 'Approve Auto:' : 'Auto-Approve:'}{' '}
                  {autoApproveEnabled ? (isKm ? 'បើក (ON)' : 'ON') : isKm ? 'បិទ (OFF)' : 'OFF'}
                </span>
              </button>
            )}

            {pendingList.length > 0 && onAutoApproveAllPending && (
              <button
                type="button"
                onClick={onAutoApproveAllPending}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                {isKm
                  ? `អនុម័តទាំងអស់ (${pendingList.length})`
                  : `Approve All (${pendingList.length})`}
              </button>
            )}

            {onRecordManualPayment && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isLight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isKm ? 'បញ្ចូលការបង់ប្រាក់ថ្មី' : 'Add Payment'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isKm ? 'ទាញយក CSV (Excel)' : 'Export CSV'}</span>
            </button>

            {onOpenMemberCheckout && (
              <button
                type="button"
                onClick={onOpenMemberCheckout}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-blue-700'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-amber-400'
                }`}
              >
                {isKm ? 'ទំព័របាញ់ប្រាក់ VIP →' : 'VIP Checkout →'}
              </button>
            )}
          </div>
        </div>

        {/* 4 Financial Metric Summary Cells */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          <div className={`p-4 rounded-xl ${subSurface}`}>
            <div className={`text-xs ${mutedText}`}>
              {isKm ? 'ចំណូលអនុម័តសរុប (Approved Revenue)' : 'Total Approved Revenue'}
            </div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              ${totalApprovedUsd.toLocaleString()}.00
            </div>
            <div className={`text-[11px] font-mono tabular-nums mt-0.5 ${mutedText}`}>
              {(totalApprovedUsd * 4080).toLocaleString()} ៛ (KHR)
            </div>
          </div>

          <div className={`p-4 rounded-xl ${subSurface}`}>
            <div className={`text-xs ${mutedText}`}>
              {isKm ? 'ចំនួនអតិថិជនបង់ប្រាក់សរុប' : 'Total Payment Records'}
            </div>
            <div className={`text-2xl font-extrabold font-mono tabular-nums mt-1 ${strongText}`}>
              {payments.length}
            </div>
            <div className={`text-[11px] mt-0.5 ${mutedText}`}>
              Approve Auto: <strong className="font-mono">{autoApprovedCount}</strong> · Manual:{' '}
              <strong className="font-mono">{manualApprovedCount}</strong>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${subSurface}`}>
            <div className={`text-xs ${mutedText}`}>
              {isKm ? 'កំពុងរង់ចាំពិនិត្យ (Pending Queue)' : 'Pending Verification'}
            </div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-500 mt-1">
              {pendingList.length}{' '}
              <span className="text-sm font-semibold">
                (${totalPendingUsd.toLocaleString()}.00)
              </span>
            </div>
            <div className={`text-[11px] mt-0.5 ${mutedText}`}>
              {pendingList.length === 0
                ? isKm
                  ? 'ផ្ទៀងផ្ទាត់រួចរាល់ទាំងអស់'
                  : 'All transactions cleared'
                : isKm
                ? 'រង់ចាំ Admin ឬ Financial អនុម័ត'
                : 'Awaiting Admin / Financial action'}
            </div>
          </div>

          <div className={`p-4 rounded-xl ${subSurface}`}>
            <div className={`text-xs ${mutedText}`}>
              {isKm ? 'ចំណូលតាមច្រកទូទាត់ (By Gateway)' : 'Approved by Gateway'}
            </div>
            <div className={`text-xs font-mono tabular-nums space-y-1 mt-1.5 ${strongText}`}>
              <div className="flex justify-between">
                <span className={mutedText}>ABA KHQR:</span>
                <strong>${abaApprovedUsd.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>Bakong QR:</span>
                <strong>${bakongApprovedUsd.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>USDT TRC-20:</span>
                <strong>${usdtApprovedUsd.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Multi-Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Status Segmented Tabs */}
          <div
            className={`inline-flex flex-wrap items-center gap-1 p-1 rounded-xl ${
              isLight ? 'bg-slate-100' : 'bg-slate-950 border border-slate-800'
            }`}
          >
            {(
              [
                { id: 'ALL', km: `ទាំងអស់ (${payments.length})`, en: `All (${payments.length})` },
                {
                  id: 'PENDING',
                  km: `រង់ចាំ (${pendingList.length})`,
                  en: `Pending (${pendingList.length})`
                },
                {
                  id: 'APPROVED',
                  km: `បានអនុម័ត (${approvedList.length})`,
                  en: `Approved (${approvedList.length})`
                },
                {
                  id: 'AUTO_ONLY',
                  km: `Approve Auto (${autoApprovedCount})`,
                  en: `Auto (${autoApprovedCount})`
                },
                {
                  id: 'REJECTED',
                  km: 'បដិសេធ',
                  en: 'Rejected'
                }
              ] as { id: StatusFilterType; km: string; en: string }[]
            ).map(tab => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? isLight
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'bg-amber-400 text-slate-950'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isKm ? tab.km : tab.en}
                </button>
              );
            })}
          </div>

          {/* Search + Gateway + Package Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  isKm
                    ? 'ស្វែងរកឈ្មោះ, លេខទូរស័ព្ទ, លេខ TXN...'
                    : 'Search customer, phone, TXN...'
                }
                className={`w-full rounded-xl pl-8 pr-7 py-2 text-xs focus:outline-none ${inputSurface}`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={gatewayFilter}
              onChange={e => setGatewayFilter(e.target.value as GatewayFilterType)}
              className={`rounded-xl px-3 py-2 text-xs font-medium focus:outline-none cursor-pointer ${inputSurface}`}
            >
              <option value="ALL">{isKm ? 'គ្រប់ធនាគារ (All Gateways)' : 'All Gateways'}</option>
              <option value="ABA KHQR">ABA KHQR</option>
              <option value="Bakong">Bakong QR</option>
              <option value="USDT TRC20">USDT TRC-20</option>
            </select>

            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              className={`rounded-xl px-3 py-2 text-xs font-medium focus:outline-none cursor-pointer ${inputSurface}`}
            >
              <option value="ALL">{isKm ? 'គ្រប់កញ្ចប់ VIP' : 'All VIP Plans'}</option>
              {plans.map(pl => (
                <option key={pl.id} value={pl.id}>
                  {isKm ? pl.nameKm : pl.name} (${pl.price})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Structured Customer Payment Data Table (ប្រភេទតារាងបញ្ជី) */}
      <div className={`rounded-2xl overflow-hidden ${cardSurface}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead
              className={
                isLight
                  ? 'bg-slate-100/90 text-slate-700 border-b border-slate-200'
                  : 'bg-slate-950 text-slate-300 border-b border-slate-800'
              }
            >
              <tr>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">
                  {isKm ? 'ល.រ / វិក្កយបត្រ' : '# / Invoice'}
                </th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">
                  {isKm ? 'អតិថិជន & ទំនាក់ទំនង' : 'Customer & Contact'}
                </th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">
                  {isKm ? 'កញ្ចប់ VIP' : 'VIP Package'}
                </th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">
                  {isKm ? 'ធនាគារ & លេខប្រតិបត្តិការ' : 'Gateway & Reference'}
                </th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleSort('date')}
                    className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{isKm ? 'ថ្ងៃខែបង់ប្រាក់' : 'Payment Date'}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </button>
                </th>
                <th className="py-3.5 px-4 font-bold text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleSort('amount')}
                    className="inline-flex items-center justify-end gap-1 hover:underline cursor-pointer ml-auto"
                  >
                    <span>{isKm ? 'ចំនួនទឹកប្រាក់' : 'Amount'}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </button>
                </th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">
                  {isKm ? 'ស្ថានភាពអនុម័ត' : 'Approval Status'}
                </th>
                <th className="py-3.5 px-4 font-bold text-right whitespace-nowrap">
                  {isKm ? 'គ្រប់គ្រង' : 'Actions'}
                </th>
              </tr>
            </thead>

            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className={`text-sm font-semibold ${strongText}`}>
                      {isKm
                        ? 'មិនមានទិន្នន័យការបង់ប្រាក់ក្នុងបញ្ជីស្វែងរកនេះទេ'
                        : 'No matching customer payment records'}
                    </div>
                    <p className={`text-xs mt-1 ${mutedText}`}>
                      {isKm
                        ? 'សូមសាកល្បងផ្លាស់ប្តូរតម្រងស្វែងរក ឬចុច «បញ្ចូលការបង់ប្រាក់ថ្មី» ខាងលើ។'
                        : 'Adjust filters above or click Add Payment to log a new customer transaction.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((pay, index) => {
                  const matchedUser = users.find(
                    u => u.id === pay.userId || u.email === pay.userEmail
                  );
                  const isPending = pay.status === 'PENDING';
                  const isApproved = pay.status === 'APPROVED';
                  const isAuto = pay.approvalMode === 'AUTO';

                  return (
                    <tr
                      key={pay.id}
                      className={
                        isLight
                          ? 'hover:bg-blue-50/40 transition-colors'
                          : 'hover:bg-slate-800/40 transition-colors'
                      }
                    >
                      {/* Col 1: Index + Invoice ID */}
                      <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                        <div className={`font-bold ${strongText}`}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className={`text-[11px] ${mutedText}`}>#{pay.id.toUpperCase()}</div>
                      </td>

                      {/* Col 2: Customer Name + Phone + Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${strongText}`}>{pay.userName}</span>
                          {matchedUser && (
                            <span
                              className={`text-[11px] font-mono ${
                                matchedUser.role === 'vip'
                                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                  : mutedText
                              }`}
                            >
                              · {matchedUser.role.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] font-mono tabular-nums mt-0.5 ${mutedText}`}>
                          {pay.userPhone || matchedUser?.phone || '—'} · {pay.userEmail}
                        </div>
                      </td>

                      {/* Col 3: Plan Name */}
                      <td className="py-3 px-4">
                        <div className={`font-semibold ${strongText}`}>{pay.planName}</div>
                        <div className={`text-[11px] ${mutedText}`}>
                          {pay.planId === 'plan_lifetime'
                            ? isKm
                              ? 'ពេញមួយជីវិត (Lifetime)'
                              : 'Lifetime'
                            : pay.planId === 'plan_vip_pro'
                            ? isKm
                              ? 'សុពលភាព ៣ ខែ (90 ថ្ងៃ)'
                              : '90 Days'
                            : isKm
                            ? 'សុពលភាព ១ ខែ (30 ថ្ងៃ)'
                            : '30 Days'}
                        </div>
                      </td>

                      {/* Col 4: Payment Gateway & Reference ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div
                          className={`font-semibold ${
                            pay.paymentMethod === 'ABA KHQR'
                              ? isLight
                                ? 'text-blue-700'
                                : 'text-sky-400'
                              : pay.paymentMethod === 'Bakong'
                              ? isLight
                                ? 'text-rose-700'
                                : 'text-rose-400'
                              : isLight
                              ? 'text-emerald-700'
                              : 'text-emerald-400'
                          }`}
                        >
                          {pay.paymentMethod}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`font-mono tabular-nums text-[11px] ${mutedText}`}>
                            {pay.transactionId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(pay.transactionId, pay.id)}
                            className={`p-0.5 rounded hover:opacity-80 cursor-pointer ${mutedText}`}
                            title="Copy Reference ID"
                          >
                            {copiedId === pay.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Col 5: Submitted Timestamp */}
                      <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                        <div className={strongText}>{formatDateTime(pay.submittedAt)}</div>
                        {pay.reviewedAt && (
                          <div className={`text-[10px] ${mutedText}`}>
                            {isKm ? 'ពិនិត្យ៖ ' : 'Verified: '}
                            {new Date(pay.reviewedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </td>

                      {/* Col 6: Amount (USD + KHR right-aligned) */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <div
                          className={`text-sm font-extrabold ${
                            isLight ? 'text-slate-900' : 'text-amber-400'
                          }`}
                        >
                          ${pay.amount.toFixed(2)}
                        </div>
                        <div className={`text-[11px] ${mutedText}`}>
                          {(pay.amount * 4080).toLocaleString()} ៛
                        </div>
                      </td>

                      {/* Col 7: Status & Mode */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isApproved ? (
                          <div>
                            <div className="font-bold text-emerald-600 dark:text-emerald-400">
                              {isAuto
                                ? isKm
                                  ? 'អនុម័តស្វ័យប្រវត្តិ (AUTO)'
                                  : 'APPROVED AUTO'
                                : isKm
                                ? 'បានអនុម័ត (MANUAL)'
                                : 'APPROVED'}
                            </div>
                            <div className={`text-[11px] ${mutedText}`}>
                              {isAuto ? 'KHQR Auto-Verified' : 'Admin / Financial'}
                            </div>
                          </div>
                        ) : isPending ? (
                          <div>
                            <div className="font-bold text-amber-600 dark:text-amber-400">
                              {isKm ? 'រង់ចាំអនុម័ត (PENDING)' : 'PENDING'}
                            </div>
                            <div className={`text-[11px] ${mutedText}`}>
                              {isKm ? 'រង់ចាំត្រួតពិនិត្យ' : 'Needs verification'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-rose-600 dark:text-rose-400">
                              {isKm ? 'បានបដិសេធ (REJECTED)' : 'REJECTED'}
                            </div>
                            <div className={`text-[11px] truncate max-w-[140px] ${mutedText}`}>
                              {pay.notes || 'Declined'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Col 8: Management Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectingPayment(pay)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                              isLight
                                ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                                : 'border-slate-700 hover:bg-slate-800 text-slate-200'
                            }`}
                            title={isKm ? 'មើលព័ត៌មានលម្អិត & វិក្កយបត្រ' : 'Inspect Invoice & Slip'}
                          >
                            {pay.receiptImage ? (
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>{isKm ? 'លម្អិត' : 'Details'}</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => onApprovePayment(pay.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isKm ? 'អនុម័ត' : 'Approve'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onRejectPayment(pay.id, 'Declined by Admin / Financial')
                                }
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                  isLight
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                                    : 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300'
                                }`}
                              >
                                {isKm ? 'បដិសេធ' : 'Reject'}
                              </button>
                            </>
                          )}

                          {onDeletePayment &&
                            (confirmDeleteId === pay.id ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeletePayment(pay.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  {isKm ? 'លុបពិត' : 'Confirm'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className={`px-1.5 py-1 rounded text-[11px] cursor-pointer ${
                                    isLight
                                      ? 'bg-slate-200 text-slate-700'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(pay.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title={isKm ? 'លុបកំណត់ត្រា' : 'Delete Record'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Accounting Footer Total */}
            {filteredRows.length > 0 && (
              <tfoot
                className={
                  isLight
                    ? 'bg-slate-50 border-t border-slate-200 text-slate-800'
                    : 'bg-slate-950 border-t border-slate-800 text-slate-200'
                }
              >
                <tr>
                  <td colSpan={5} className="py-3.5 px-4 font-semibold">
                    {isKm
                      ? `បង្ហាញ ${filteredRows.length} ប្រតិបត្តិការ (មិនរាប់បញ្ចូលវិក្កយបត្របដិសេធ)`
                      : `Showing ${filteredRows.length} records (excluding rejected slips)`}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${filteredSumUsd.toLocaleString()}.00 USD
                    </div>
                    <div className={`text-[11px] ${mutedText}`}>
                      {(filteredSumUsd * 4080).toLocaleString()} ៛
                    </div>
                  </td>
                  <td colSpan={2} className={`py-3.5 px-4 text-right text-[11px] ${mutedText}`}>
                    {isKm ? 'អត្រាប្តូរប្រាក់៖ $1 = 4,080 ៛' : 'Exchange Rate: $1 = 4,080 KHR'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* MODAL A: Inspect Invoice, Slip & Financial Notes */}
      {inspectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className={`max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${cardSurface}`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${dividerBorder}`}>
              <div>
                <div className="text-xs font-mono text-blue-600 dark:text-amber-400 font-bold">
                  INVOICE #{inspectingPayment.id.toUpperCase()}
                </div>
                <h3 className={`text-base font-bold ${strongText}`}>
                  {isKm ? 'ព័ត៌មានលម្អិតនៃការបង់ប្រាក់អតិថិជន' : 'Customer Payment Voucher'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingPayment(null)}
                className={`p-1 rounded-lg cursor-pointer ${mutedText}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-4 rounded-xl space-y-2 text-xs ${subSurface}`}>
              <div className="flex justify-between">
                <span className={mutedText}>{isKm ? 'ឈ្មោះអតិថិជន៖' : 'Customer:'}</span>
                <span className={`font-bold ${strongText}`}>{inspectingPayment.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>{isKm ? 'លេខទូរស័ព្ទ / អ៊ីមែល៖' : 'Contact:'}</span>
                <span className="font-mono">
                  {inspectingPayment.userPhone || '—'} · {inspectingPayment.userEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>{isKm ? 'កញ្ចប់ VIP៖' : 'VIP Plan:'}</span>
                <span className={`font-semibold ${strongText}`}>{inspectingPayment.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>{isKm ? 'ចំនួនទឹកប្រាក់៖' : 'Amount Paid:'}</span>
                <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                  ${inspectingPayment.amount.toFixed(2)} USD (
                  {(inspectingPayment.amount * 4080).toLocaleString()} ៛)
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>{isKm ? 'តាមរយៈធនាគារ៖' : 'Payment Method:'}</span>
                <span className="font-semibold">{inspectingPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>{isKm ? 'លេខប្រតិបត្តិការ៖' : 'Transaction Ref:'}</span>
                <span className="font-mono tabular-nums font-bold">
                  {inspectingPayment.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>{isKm ? 'កាលបរិច្ឆេទ៖' : 'Submitted At:'}</span>
                <span className="font-mono tabular-nums">
                  {formatDateTime(inspectingPayment.submittedAt)}
                </span>
              </div>
            </div>

            {inspectingPayment.receiptImage && (
              <div className="space-y-1.5">
                <div className={`text-xs font-semibold ${mutedText}`}>
                  {isKm ? 'រូបថតវិក្កយបត្រ (Attached Payment Slip):' : 'Attached Payment Slip:'}
                </div>
                <div className={`p-2 rounded-xl flex justify-center ${subSurface}`}>
                  <img
                    src={inspectingPayment.receiptImage}
                    alt="Customer Payment Slip"
                    className="max-h-60 object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            {onUpdatePaymentNote && (
              <div className="space-y-1.5">
                <label className={`block text-xs font-semibold ${mutedText}`}>
                  {isKm
                    ? 'កំណត់សម្គាល់ផ្នែកហិរញ្ញវត្ថុ / Admin Note:'
                    : 'Financial / Admin Audit Note:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editableNote}
                    onChange={e => setEditableNote(e.target.value)}
                    placeholder={
                      isKm
                        ? 'ឧ. បានផ្ទៀងផ្ទាត់ជាមួយរបាយការណ៍ធនាគារ ABA ត្រឹមត្រូវ...'
                        : 'e.g. Reconciled with ABA Bank statement...'
                    }
                    className={`flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none ${inputSurface}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onUpdatePaymentNote(inspectingPayment.id, editableNote);
                      setInspectingPayment({ ...inspectingPayment, notes: editableNote });
                      setNoteSavedToast(true);
                      setTimeout(() => setNoteSavedToast(false), 2000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    {noteSavedToast ? (isKm ? 'រក្សាទុកហើយ ✓' : 'Saved ✓') : isKm ? 'រក្សាទុក' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            <div className={`flex flex-wrap items-center justify-between gap-2 pt-3 border-t ${dividerBorder}`}>
              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    `AlphaSignal Official Receipt\nInvoice: #${inspectingPayment.id.toUpperCase()}\nCustomer: ${inspectingPayment.userName}\nPlan: ${inspectingPayment.planName}\nAmount: $${inspectingPayment.amount}.00 USD\nMethod: ${inspectingPayment.paymentMethod}\nRef: ${inspectingPayment.transactionId}\nStatus: ${inspectingPayment.status}`,
                    `rcpt_${inspectingPayment.id}`
                  )
                }
                className={`px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                  isLight
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    : 'border-slate-700 hover:bg-slate-800 text-slate-200'
                }`}
              >
                {copiedId === `rcpt_${inspectingPayment.id}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{isKm ? 'ចម្លងបង្កាន់ដៃ' : 'Copy Receipt'}</span>
              </button>

              <div className="flex items-center gap-2">
                {inspectingPayment.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onApprovePayment(inspectingPayment.id);
                        setInspectingPayment(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isKm ? 'អនុម័ត VIP' : 'Approve VIP'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRejectPayment(inspectingPayment.id, editableNote || 'Declined');
                        setInspectingPayment(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{isKm ? 'បដិសេធ' : 'Reject'}</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setInspectingPayment(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {isKm ? 'បិទ' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL B: Add / Record Manual Customer Payment (Admin & Financial) */}
      {isAddModalOpen && onRecordManualPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className={`max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${cardSurface}`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${dividerBorder}`}>
              <div>
                <div className="text-xs font-semibold text-blue-600 dark:text-amber-400">
                  {isKm ? 'កត់ត្រាដោយ Admin / Financial' : 'Admin & Financial Entry'}
                </div>
                <h3 className={`text-base font-bold ${strongText}`}>
                  {isKm
                    ? 'បញ្ចូលអតិថិជនបង់ប្រាក់ថ្មីចូលតារាង'
                    : 'Record Customer Payment Entry'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className={`p-1 rounded-lg cursor-pointer ${mutedText}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecordSubmit} className="space-y-3.5 text-xs">
              {users.length > 0 && (
                <div>
                  <label className={`block font-semibold mb-1 ${mutedText}`}>
                    {isKm
                      ? 'ជ្រើសរើសអតិថិជនដែលមានស្រាប់ (ឬបញ្ចូលថ្មី):'
                      : 'Select Existing Member (or Enter New):'}
                  </label>
                  <select
                    value={selectedExistingUserId}
                    onChange={e => handleSelectExistingCustomer(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 font-medium focus:outline-none ${inputSurface}`}
                  >
                    <option value="CUSTOM">
                      {isKm ? '+ បញ្ចូលឈ្មោះអតិថិជនថ្មីដោយផ្ទាល់' : '+ Enter New Customer Manually'}
                    </option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.phone} · {u.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${mutedText}`}>
                    {isKm ? 'ឈ្មោះអតិថិជន *' : 'Customer Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={e => setNewCustomerName(e.target.value)}
                    placeholder="ឧ. Sokha Chan"
                    className={`w-full rounded-xl px-3 py-2 focus:outline-none ${inputSurface}`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${mutedText}`}>
                    {isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={e => setNewCustomerPhone(e.target.value)}
                    placeholder="012 888 999"
                    className={`w-full rounded-xl px-3 py-2 font-mono focus:outline-none ${inputSurface}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${mutedText}`}>
                  {isKm ? 'អ៊ីមែលអតិថិជន' : 'Customer Email'}
                </label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={e => setNewCustomerEmail(e.target.value)}
                  placeholder="customer@gmail.com"
                  className={`w-full rounded-xl px-3 py-2 font-mono focus:outline-none ${inputSurface}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${mutedText}`}>
                    {isKm ? 'កញ្ចប់សេវាកម្ម VIP' : 'VIP Plan'}
                  </label>
                  <select
                    value={newPlanId}
                    onChange={e => setNewPlanId(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 font-semibold focus:outline-none ${inputSurface}`}
                  >
                    {plans.map(pl => (
                      <option key={pl.id} value={pl.id}>
                        {isKm ? pl.nameKm : pl.name} (${pl.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${mutedText}`}>
                    {isKm ? 'តាមរយៈធនាគារ' : 'Payment Gateway'}
                  </label>
                  <select
                    value={newMethod}
                    onChange={e =>
                      setNewMethod(e.target.value as 'ABA KHQR' | 'Bakong' | 'USDT TRC20')
                    }
                    className={`w-full rounded-xl px-3 py-2 font-semibold focus:outline-none ${inputSurface}`}
                  >
                    <option value="ABA KHQR">ABA KHQR</option>
                    <option value="Bakong">Bakong QR</option>
                    <option value="USDT TRC20">USDT TRC-20</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${mutedText}`}>
                  {isKm ? 'លេខកូដប្រតិបត្តិការ (Transaction Ref)' : 'Transaction Reference'}
                </label>
                <input
                  type="text"
                  value={newTxnRef}
                  onChange={e => setNewTxnRef(e.target.value)}
                  placeholder={isKm ? 'ទុកទទេក៏បាន ប្រព័ន្ធបង្កើតស្វ័យប្រវត្តិ' : 'Auto-generated if blank'}
                  className={`w-full rounded-xl px-3 py-2 font-mono focus:outline-none ${inputSurface}`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${mutedText}`}>
                  {isKm ? 'កំណត់សម្គាល់ហិរញ្ញវត្ថុ' : 'Financial Note'}
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder={isKm ? 'ឧ. បង់ផ្ទាល់តាម Telegram / ABA...' : 'e.g. Verified via Telegram receipt'}
                  className={`w-full rounded-xl px-3 py-2 focus:outline-none ${inputSurface}`}
                />
              </div>

              <label className={`p-3 rounded-xl flex items-center gap-2.5 cursor-pointer ${subSurface}`}>
                <input
                  type="checkbox"
                  checked={approveNewImmediately}
                  onChange={e => setApproveNewImmediately(e.target.checked)}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span className={`font-semibold ${strongText}`}>
                  {isKm
                    ? 'អនុម័ត និងដំឡើងសិទ្ធិ VIP ជូនអតិថិជនភ្លាមៗ'
                    : 'Approve & Activate VIP Access Immediately'}
                </span>
              </label>

              <div className={`flex justify-end gap-2 pt-3 border-t ${dividerBorder}`}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${
                    isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {isKm ? 'រក្សាទុកចូលតារាងបញ្ជី' : 'Save to Payment Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
