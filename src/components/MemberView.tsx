import React, { useState } from 'react';
import { Language, MembershipPlan, PaymentRecord, UserAccount, CustomerRegistrationRecord } from '../types';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Upload,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Lock,
  Unlock,
  ArrowRight,
  Film,
  Zap,
  ChevronDown,
  ChevronUp,
  Crown
} from 'lucide-react';

interface MemberViewProps {
  lang: Language;
  currentUser: UserAccount;
  plans: MembershipPlan[];
  selectedPlan: MembershipPlan;
  onSelectPlan: (plan: MembershipPlan) => void;
  userPayments: PaymentRecord[];
  onSubmitPayment: (payment: Omit<PaymentRecord, 'id' | 'submittedAt' | 'status'>) => void;
  autoApproveEnabled: boolean;
  onToggleAutoApprove: () => void;
  onApprovePendingPayment?: (paymentId: string) => void;
  onOpenVipSignals: () => void;
  onSwitchToAdmin: () => void;
  onOpenAcademy?: () => void;
  customerRegistration?: CustomerRegistrationRecord | null;
  onOpenAdminSignups?: () => void;
}

export const MemberView: React.FC<MemberViewProps> = ({
  lang,
  currentUser,
  plans,
  selectedPlan,
  onSelectPlan,
  userPayments,
  onSubmitPayment,
  autoApproveEnabled,
  onToggleAutoApprove,
  onApprovePendingPayment,
  onOpenVipSignals,
  onSwitchToAdmin,
  onOpenAcademy,
  customerRegistration,
  onOpenAdminSignups
}) => {
  const isKm = lang === 'km';

  // Payment method & optional proof states
  const [paymentMethod, setPaymentMethod] = useState<'ABA KHQR' | 'Bakong' | 'USDT TRC20'>('ABA KHQR');
  const [txnId, setTxnId] = useState('');
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const [showOptionalProof, setShowOptionalProof] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Auto-Approve verification step state: 'idle' | 'checking_bank' | 'activating_vip' | 'completed'
  const [verifyStage, setVerifyStage] = useState<'idle' | 'checking_bank' | 'activating_vip' | 'completed'>('idle');
  const [lastCompletedSummary, setLastCompletedSummary] = useState<{
    planName: string;
    amount: number;
    method: string;
    refId: string;
    wasAutoApproved: boolean;
  } | null>(null);

  const isUserVip = currentUser.role === 'vip';
  const pendingPayment = userPayments.find(p => p.userId === currentUser.id && p.status === 'PENDING');
  const myRecentPayments = userPayments.filter(
    p => p.userId === currentUser.id || p.userEmail === currentUser.email
  );

  // Dynamic KHQR reference code tied to selected plan
  const planShortTag =
    selectedPlan.id === 'plan_lifetime'
      ? 'LIFE'
      : selectedPlan.id === 'plan_vip_pro'
      ? 'PRO'
      : 'STD';
  const dynamicPaymentMemo = `VIP-${planShortTag}-${selectedPlan.price}USD`;

  const getPlanDurationLabel = (planId: string) => {
    if (planId === 'plan_lifetime') {
      return isKm ? 'ប្រើប្រាស់ពេញមួយជីវិត (Lifetime)' : 'Lifetime Access';
    }
    if (planId === 'plan_vip_pro') {
      return isKm ? 'សុពលភាព ៩០ ថ្ងៃ + MT5 Auto-Trade' : '90 Days + MT5 Auto-Trade';
    }
    return isKm ? 'សុពលភាព ៣០ ថ្ងៃ' : '30 Days Access';
  };

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Triggered when user finishes transferring via KHQR/USDT ("បាញ់រួចរាល់") or submits form
  const handleConfirmTransfer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // In Manual mode (Auto-Approve OFF), require a reference ID or generate one if requested
    if (!autoApproveEnabled && !txnId.trim()) {
      return;
    }

    const generatedRef =
      txnId.trim() ||
      `${paymentMethod === 'ABA KHQR' ? 'ABA' : paymentMethod === 'Bakong' ? 'BKG' : 'TRC20'}-${Math.floor(
        10000000 + Math.random() * 90000000
      )}`;

    const planDisplayName = isKm ? selectedPlan.nameKm : selectedPlan.name;

    if (autoApproveEnabled) {
      // Realistic 2-step gateway check -> instant VIP Auto-Approve
      setVerifyStage('checking_bank');
      setTimeout(() => {
        setVerifyStage('activating_vip');
        setTimeout(() => {
          onSubmitPayment({
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            userPhone: currentUser.phone,
            planId: selectedPlan.id,
            planName: planDisplayName,
            amount: selectedPlan.price,
            paymentMethod,
            transactionId: generatedRef,
            receiptImage: uploadedReceipt || undefined,
            notes: `Auto-Approved (${paymentMethod} · ${dynamicPaymentMemo})`
          });
          setLastCompletedSummary({
            planName: planDisplayName,
            amount: selectedPlan.price,
            method: paymentMethod,
            refId: generatedRef,
            wasAutoApproved: true
          });
          setTxnId('');
          setVerifyStage('completed');
        }, 650);
      }, 650);
    } else {
      // Manual Admin verification queue
      setVerifyStage('checking_bank');
      setTimeout(() => {
        onSubmitPayment({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userPhone: currentUser.phone,
          planId: selectedPlan.id,
          planName: planDisplayName,
          amount: selectedPlan.price,
          paymentMethod,
          transactionId: generatedRef,
          receiptImage: uploadedReceipt || undefined,
          notes: `Submitted for manual Admin verification (${paymentMethod})`
        });
        setLastCompletedSummary({
          planName: planDisplayName,
          amount: selectedPlan.price,
          method: paymentMethod,
          refId: generatedRef,
          wasAutoApproved: false
        });
        setTxnId('');
        setVerifyStage('completed');
      }, 500);
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* 0. Customer Sign-Up Intake & Administrator / Staff Verification Tracker */}
      {customerRegistration && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
              <span className="text-amber-400 font-bold">{customerRegistration.id}</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">Gmail OTP Verified ({customerRegistration.email}) ✓</span>
            </div>
            <div className="text-sm font-bold text-white">
              {customerRegistration.workflowStage === 'NEW_FOR_ADMIN'
                ? isKm
                  ? 'ទិន្នន័យចុះឈ្មោះត្រូវបានបញ្ជូនទៅ Administrator (ADM-001) រួចរាល់ · រង់ចាំចាត់តាំងបុគ្គលិកឆែកបន្ត'
                  : 'Sign-Up Data Sent to Administrator (ADM-001) · Awaiting Staff Assignment'
                : customerRegistration.workflowStage === 'ASSIGNED_TO_STAFF'
                ? isKm
                  ? `Administrator បានចាត់តាំងឱ្យបុគ្គលិក ${customerRegistration.assignedToStaffCode} (${customerRegistration.assignedToStaffName}) កំពុងត្រួតពិនិត្យបន្ត`
                  : `Assigned by Administrator to ${customerRegistration.assignedToStaffCode} (${customerRegistration.assignedToStaffName}) for verification`
                : customerRegistration.workflowStage === 'VERIFIED_COMPLETED'
                ? isKm
                  ? `គណនីចុះឈ្មោះរបស់អ្នកត្រូវបានបុគ្គលិក ${customerRegistration.checkedByStaffCode || 'Admin'} ឆែកផ្ទៀងផ្ទាត់រួចរាល់ ✓`
                  : `Your registration was checked & verified by ${customerRegistration.checkedByStaffCode || 'Admin'} ✓`
                : isKm
                ? 'សូមពិនិត្យព័ត៌មានចុះឈ្មោះជាមួយក្រុមការងារឡើងវិញ'
                : 'Registration requires review'}
            </div>
            {customerRegistration.staffCheckNote && (
              <p className="text-xs text-emerald-300">
                {isKm ? 'កំណត់ត្រាពីបុគ្គលិក៖ ' : 'Staff Verification Note: '}
                {customerRegistration.staffCheckNote}
              </p>
            )}
          </div>

          {onOpenAdminSignups && (
            <button
              type="button"
              onClick={onOpenAdminSignups}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>
                {isKm
                  ? 'មើលការចាត់តាំងបុគ្គលិកក្នុងផ្ទាំង Administrator'
                  : 'Open Administrator Staff Assignment'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 1. Member Account & Auto-Approve Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 border ${
              isUserVip
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span
                className={`text-xs font-semibold ${
                  isUserVip ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isUserVip
                  ? isKm
                    ? 'សមាជិក VIP (បានដោះសោរួចរាល់)'
                    : 'VIP Member (Unlocked)'
                  : isKm
                  ? 'សមាជិកធម្មតា (Standard Member)'
                  : 'Standard Member'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2.5">
              <span>{currentUser.email}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{currentUser.phone}</span>
              {isUserVip && currentUser.vipExpiresAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-mono tabular-nums">
                    {isKm ? 'ផុតកំណត់ VIP:' : 'VIP Expires:'}{' '}
                    {new Date(currentUser.vipExpiresAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Auto-Approve Mode Switch + Academy + VIP Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Approve Auto Toggle Switch */}
          <button
            type="button"
            onClick={onToggleAutoApprove}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              autoApproveEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={
              isKm
                ? 'បើក ឬបិទមុខងារអនុម័ត VIP ស្វ័យប្រវត្តិពេលបាញ់ប្រាក់រួចរាល់'
                : 'Toggle automatic VIP approval after KHQR/USDT transfer'
            }
          >
            <Zap className={`w-4 h-4 ${autoApproveEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>
              {isKm ? 'មុខងារ Approve Auto:' : 'Auto-Approve:'}{' '}
              <strong className={autoApproveEnabled ? 'text-emerald-300' : 'text-slate-300'}>
                {autoApproveEnabled ? (isKm ? 'បើក (ON)' : 'ON') : isKm ? 'បិទ (Manual)' : 'OFF'}
              </strong>
            </span>
            <span
              className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                autoApproveEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </span>
          </button>

          {onOpenAcademy && (
            <button
              type="button"
              onClick={onOpenAcademy}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Film className="w-4 h-4 text-purple-400" />
              <span>{isKm ? 'មេរៀន Video' : 'Video Academy'}</span>
            </button>
          )}

          {isUserVip ? (
            <button
              type="button"
              onClick={onOpenVipSignals}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-500/15"
            >
              <Unlock className="w-4 h-4" />
              <span>{isKm ? 'ចូលមើល VIP Signals' : 'Open VIP Signals'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs leading-tight">
                <div className="text-white font-semibold">
                  {isKm ? 'VIP Signals: ចាក់សោ' : 'VIP Signals: Locked'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {autoApproveEnabled
                    ? isKm
                      ? 'បាញ់ប្រាក់រួច ដោះសោភ្លាមៗ'
                      : 'Instant unlock on transfer'
                    : isKm
                    ? 'រង់ចាំ Admin អនុម័ត'
                    : 'Requires Admin approval'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Existing Pending Payment Banner (with 1-Click Auto-Approve if any pending exists) */}
      {pendingPayment && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-amber-200">
                {isKm
                  ? 'មានវិក្កយបត្រកំពុងរង់ចាំការអនុម័ត'
                  : 'Pending Payment Waiting for Verification'}
              </div>
              <div className="text-xs text-amber-300/80 mt-1 font-mono tabular-nums">
                {pendingPayment.planName} · ${pendingPayment.amount} USD ({pendingPayment.paymentMethod}) · Ref:{' '}
                {pendingPayment.transactionId}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onApprovePendingPayment && (
              <button
                type="button"
                onClick={() => onApprovePendingPayment(pendingPayment.id)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isKm ? 'អនុម័ត Approve Auto ឥឡូវនេះ' : 'Auto-Approve Now'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              {isKm ? 'មើលក្នុង Admin' : 'Open Admin'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Main 2-Column Checkout: Left = Select VIP Package, Right = KHQR Transfer & Instant Auto-Approve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (5 Cols): Step 1 — ជ្រើសរើសកញ្ចប់ VIP របស់អ្នក */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                1
              </span>
              <span>{isKm ? 'ជ្រើសរើសកញ្ចប់ VIP របស់អ្នក' : 'Select Your VIP Plan'}</span>
            </h2>
            <span className="text-xs text-emerald-400 font-medium">
              {autoApproveEnabled
                ? isKm
                  ? 'គាំទ្រ Approve Auto ភ្លាមៗ'
                  : 'Instant Auto-Approve Ready'
                : isKm
                ? 'ផ្ទៀងផ្ទាត់ដោយ Admin'
                : 'Manual Verification'}
            </span>
          </div>

          <div className="space-y-3">
            {plans.map(p => {
              const isSelected = selectedPlan.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectPlan(p);
                    if (verifyStage === 'completed') {
                      setVerifyStage('idle');
                    }
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{getPlanDurationLabel(p.id)}</span>
                        {p.popular && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-400 font-semibold">
                              {isKm ? 'ពេញនិយមបំផុត' : 'Best Value'}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {isKm ? p.nameKm : p.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {isKm ? p.targetAudienceKm : p.targetAudience}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
                        ${p.price}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {(p.price * 4080).toLocaleString()} ៛
                      </div>
                    </div>
                  </div>

                  {/* Selected Plan Features Preview */}
                  {isSelected && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-800/90 space-y-1.5">
                      {(isKm ? p.featuresKm : p.features).slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {isKm ? `រយៈពេល: ${p.billingPeriodKm}` : `Billing: ${p.billingPeriod}`}
                    </span>
                    <span className={`font-semibold ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                      {isSelected
                        ? isKm
                          ? '✓ កញ្ចប់កំពុងជ្រើសរើស'
                          : '✓ Selected Plan'
                        : isKm
                        ? 'ចុចជ្រើសរើសកញ្ចប់នេះ'
                        : 'Select this plan'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Order Summary Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
            <div className="font-semibold text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>{isKm ? 'សង្ខេបកញ្ចប់ VIP ដែលបានជ្រើសរើស' : 'Selected VIP Package Summary'}</span>
              <span className="font-mono text-amber-400">{dynamicPaymentMemo}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>{isKm ? 'ឈ្មោះកញ្ចប់:' : 'Plan:'}</span>
              <span className="font-bold text-white">
                {isKm ? selectedPlan.nameKm : selectedPlan.name}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>{isKm ? 'ទឹកប្រាក់ត្រូវបាញ់ (USD):' : 'Total Amount (USD):'}</span>
              <span className="text-base font-extrabold font-mono tabular-nums text-amber-400">
                ${selectedPlan.price}.00 USD
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>{isKm ? 'គិតជាប្រាក់រៀល (~4,080 ៛):' : 'KHR Equivalent:'}</span>
              <span className="font-mono tabular-nums text-slate-200">
                {(selectedPlan.price * 4080).toLocaleString()} ៛
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">{isKm ? 'ការបើកសិទ្ធិ VIP:' : 'Activation Mode:'}</span>
              <span className={autoApproveEnabled ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {autoApproveEnabled
                  ? isKm
                    ? 'បាញ់រួច អនុម័តស្វ័យប្រវត្តិភ្លាមៗ (Approve Auto)'
                    : 'Instant Auto-Approve on Transfer'
                  : isKm
                  ? 'ត្រួតពិនិត្យដោយ Admin'
                  : 'Manual Admin Review'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Cols): Step 2 — Scan KHQR, Confirm Paid ("បាញ់រួចរាល់") & Auto-Approve */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                2
              </span>
              <span>
                {isKm
                  ? 'ស្កេនបាញ់ប្រាក់ និងបើកសិទ្ធិស្វ័យប្រវត្តិ (Approve Auto)'
                  : 'Scan KHQR & Instant Auto-Approve'}
              </span>
            </h2>

            <span className="text-xs font-mono tabular-nums text-slate-400">
              {isKm ? 'ចំនួនទឹកប្រាក់:' : 'Amount:'}{' '}
              <strong className="text-amber-400">${selectedPlan.price}.00</strong>
            </span>
          </div>

          {/* COMPLETED STATE: Instant VIP Auto-Approved Receipt */}
          {verifyStage === 'completed' && lastCompletedSummary ? (
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-emerald-400">
                    {lastCompletedSummary.wasAutoApproved
                      ? isKm
                        ? 'ប្រព័ន្ធ Approve Auto បានផ្ទៀងផ្ទាត់ការបាញ់ប្រាក់ជោគជ័យ!'
                        : 'Auto-Approve Verified Your Transfer Instantly!'
                      : isKm
                      ? 'បានបញ្ជូនព័ត៌មានបង់ប្រាក់ទៅកាន់ Admin រួចរាល់!'
                      : 'Payment Submitted for Admin Review'}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {lastCompletedSummary.wasAutoApproved
                      ? isKm
                        ? 'គណនីរបស់អ្នកត្រូវបានដំឡើងទៅជា VIP ដោយស្វ័យប្រវត្តិ!'
                        : 'Your VIP Membership is Now Active!'
                      : isKm
                      ? 'កំពុងរង់ចាំការអនុម័តពី Admin'
                      : 'Awaiting Manual Admin Verification'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lastCompletedSummary.wasAutoApproved
                      ? isKm
                        ? 'ឥឡូវនេះអ្នកអាចចូលមើលគ្រប់ Trading Signals ទាំងអស់ មេរៀន Video VIP និងប្រើមុខងារ MT5 Auto-Trade បានភ្លាមៗ។'
                        : 'Full access to live TradingView Signals, VIP Video Academy, and MT5 Auto-Trading has been unlocked.'
                      : isKm
                      ? 'អ្នកអាចបើកមុខងារ Approve Auto ដើម្បីអោយប្រព័ន្ធអនុម័តភ្លាមៗដោយស្វ័យប្រវត្តិ។'
                      : 'Enable Auto-Approve above if you want instant automatic VIP activation.'}
                  </p>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isKm ? 'កញ្ចប់ VIP:' : 'VIP Package:'}</span>
                  <span className="font-bold text-white">{lastCompletedSummary.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isKm ? 'ចំនួនទឹកប្រាក់បានបាញ់:' : 'Amount Paid:'}</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-400">
                    ${lastCompletedSummary.amount}.00 USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isKm ? 'តាមរយៈ:' : 'Method:'}</span>
                  <span className="text-slate-200 font-medium">{lastCompletedSummary.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isKm ? 'លេខប្រតិបត្តិការ:' : 'Reference ID:'}</span>
                  <span className="font-mono tabular-nums text-amber-300">{lastCompletedSummary.refId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isKm ? 'ស្ថានភាព:' : 'Status:'}</span>
                  <span className="font-bold text-emerald-400">
                    {lastCompletedSummary.wasAutoApproved
                      ? isKm
                        ? 'APPROVED AUTO (អនុម័តស្វ័យប្រវត្តិ)'
                        : 'APPROVED (AUTO)'
                      : 'PENDING REVIEW'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {lastCompletedSummary.wasAutoApproved ? (
                  <button
                    type="button"
                    onClick={onOpenVipSignals}
                    className="flex-1 py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{isKm ? 'ចូលមើល VIP Signals ឥឡូវនេះ' : 'Enter VIP Signals Terminal Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSwitchToAdmin}
                    className="flex-1 py-3 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{isKm ? 'ប្តូរទៅ Admin ដើម្បីអនុម័ត' : 'Switch to Admin to Approve'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setVerifyStage('idle')}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isKm ? 'ជ្រើសរើសកញ្ចប់ផ្សេងទៀត' : 'Select Another Plan'}
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE PAYMENT & AUTO-APPROVE CHECKOUT */
            <form onSubmit={handleConfirmTransfer} className="space-y-5">
              {/* Payment Gateway Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  {isKm ? 'ជ្រើសរើសធនាគារ ឬកាបូបទូទាត់:' : 'Select Payment Gateway:'}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ABA KHQR')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'ABA KHQR'
                        ? 'bg-sky-500/15 border-sky-400 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-sky-400" />
                    <span>ABA KHQR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Bakong')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'Bakong'
                        ? 'bg-rose-500/15 border-rose-400 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-rose-400" />
                    <span>Bakong QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('USDT TRC20')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'USDT TRC20'
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>USDT TRC-20</span>
                  </button>
                </div>
              </div>

              {/* Dynamic KHQR / QR Box with Exact Package Amount */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-40 h-44 bg-white p-2.5 rounded-xl flex flex-col items-center justify-between shadow-md shrink-0 text-slate-950">
                  <div
                    className={`w-full text-white text-[10px] font-bold text-center py-1 rounded ${
                      paymentMethod === 'ABA KHQR'
                        ? 'bg-sky-900'
                        : paymentMethod === 'Bakong'
                        ? 'bg-rose-700'
                        : 'bg-emerald-700'
                    }`}
                  >
                    {paymentMethod === 'ABA KHQR'
                      ? 'ABA PAY · KHQR'
                      : paymentMethod === 'Bakong'
                      ? 'BAKONG · KHQR'
                      : 'USDT · TRC-20'}
                  </div>

                  {/* Clean crisp geometric QR representation */}
                  <div className="grid grid-cols-7 gap-1 w-24 h-24 p-1">
                    <div className="bg-slate-950 col-span-2 row-span-2 rounded-xs" />
                    <div className="bg-slate-950" />
                    <div className="bg-slate-300" />
                    <div className="bg-slate-950" />
                    <div className="bg-slate-950 col-span-2 row-span-2 rounded-xs" />
                    <div className="bg-slate-950" />
                    <div className="bg-slate-950 col-span-2" />
                    <div className="bg-slate-950 col-span-2" />
                    <div className="bg-slate-300" />
                    <div className="bg-slate-950 col-span-3" />
                    <div className="bg-slate-950 col-span-2" />
                    <div className="bg-slate-950" />
                    <div className="bg-slate-950 col-span-2 row-span-2 rounded-xs" />
                    <div className="bg-slate-950" />
                    <div className="bg-slate-950 col-span-2" />
                    <div className="bg-slate-300" />
                    <div className="bg-slate-950" />
                    <div className="bg-slate-950" />
                    <div className="bg-slate-950 col-span-2" />
                  </div>

                  <div className="w-full text-center border-t border-slate-200 pt-1">
                    <div className="text-xs font-extrabold font-mono tabular-nums text-slate-950">
                      ${selectedPlan.price}.00 {paymentMethod === 'USDT TRC20' ? 'USDT' : 'USD'}
                    </div>
                  </div>
                </div>

                {/* Merchant & Auto-Detection Info */}
                <div className="flex-1 w-full space-y-2.5 text-xs">
                  <div>
                    <div className="text-slate-400">
                      {paymentMethod === 'ABA KHQR'
                        ? isKm
                          ? 'ឈ្មោះគណនី ABA Bank:'
                          : 'ABA Merchant Account:'
                        : paymentMethod === 'Bakong'
                        ? isKm
                          ? 'គណនីបាគង (Bakong KHQR):'
                          : 'Bakong Merchant ID:'
                        : 'USDT TRC-20 Wallet:'}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">ALPHASIGNAL VIP LTD</div>
                    {paymentMethod === 'ABA KHQR' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono tabular-nums text-sky-400 font-semibold">
                          001 888 999 (USD)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('001888999', 'aba')}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                        >
                          {copiedText === 'aba' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                    {paymentMethod === 'Bakong' && (
                      <div className="font-mono text-rose-400 font-semibold mt-1">
                        alphasignal@acleda
                      </div>
                    )}
                    {paymentMethod === 'USDT TRC20' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] text-emerald-400 break-all bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          TQn9Y2khEsLJW1ChVGBkH4bLqUxZ88888
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('TQn9Y2khEsLJW1ChVGBkH4bLqUxZ88888', 'usdt')}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 shrink-0 cursor-pointer"
                        >
                          {copiedText === 'usdt' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">
                      {isKm ? 'កូដសម្គាល់កញ្ចប់ (Remark):' : 'Payment Memo:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-amber-300 font-semibold">
                        {dynamicPaymentMemo}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(dynamicPaymentMemo, 'memo')}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                      >
                        {copiedText === 'memo' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    {autoApproveEnabled
                      ? isKm
                        ? `បន្ទាប់ពីស្កេនបាញ់ប្រាក់ $${selectedPlan.price}.00 រួចរាល់ សូមចុចប៊ូតុង «បាញ់ប្រាក់រួចរាល់» ខាងក្រោម ដើម្បីអោយប្រព័ន្ធ Approve Auto បើកសិទ្ធិ VIP ជូនភ្លាមៗ។`
                        : `Scan & transfer $${selectedPlan.price}.00, then click confirm below for instant Auto-Approve activation.`
                      : isKm
                      ? 'បច្ចុប្បន្នមុខងារ Approve Auto កំពុងបិទ។ សូមបញ្ចូលលេខប្រតិបត្តិការដើម្បីផ្ញើជូន Admin ពិនិត្យ។'
                      : 'Auto-Approve is currently off. Enter your transaction reference below for Admin verification.'}
                  </div>
                </div>
              </div>

              {/* Live Auto-Approve Verification Progress Bar when verifying */}
              {(verifyStage === 'checking_bank' || verifyStage === 'activating_vip') && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-300">
                    <Clock className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                    <span>
                      {verifyStage === 'checking_bank'
                        ? isKm
                          ? `កំពុងពិនិត្យការបាញ់ប្រាក់ $${selectedPlan.price}.00 តាមរយៈ ${paymentMethod}...`
                          : `Verifying $${selectedPlan.price}.00 payment on ${paymentMethod}...`
                        : isKm
                        ? `រកឃើញការបាញ់ប្រាក់ត្រឹមត្រូវ! កំពុងដំណើរការ Approve Auto បើកសិទ្ធិ VIP...`
                        : 'Payment matched! Running Auto-Approve & unlocking VIP access...'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-emerald-400 transition-all duration-500 ${
                        verifyStage === 'checking_bank' ? 'w-1/2' : 'w-full'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Proof / Reference Input: Optional when Auto-Approve is ON, Required when Manual */}
              {autoApproveEnabled ? (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                  <button
                    type="button"
                    onClick={() => setShowOptionalProof(v => !v)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <span>
                      {isKm
                        ? 'ភ្ជាប់លេខកូដប្រតិបត្តិការ ឬរូបវិក្កយបត្របន្ថែម (មិនบังคับសម្រាប់ Approve Auto)'
                        : 'Attach Bank Reference or Slip Screenshot (Optional with Auto-Approve)'}
                    </span>
                    {showOptionalProof ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showOptionalProof && (
                    <div className="p-4 pt-2 border-t border-slate-800/80 space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {isKm ? 'លេខកូដប្រតិបត្តិការ (Transaction ID):' : 'Transaction Reference:'}
                        </label>
                        <input
                          type="text"
                          value={txnId}
                          onChange={e => setTxnId(e.target.value)}
                          placeholder="ឧ. ABA-98234120 (ទុកទទេក៏បាន ប្រព័ន្ធចាប់ស្វ័យប្រវត្តិ)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <label className="border border-dashed border-slate-700 hover:border-slate-600 bg-slate-900 rounded-xl p-2.5 flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-300">
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {uploadedReceipt
                            ? isKm
                              ? 'បានភ្ជាប់រូបវិក្កយបត្ររួចរាល់'
                              : 'Slip attached'
                            : isKm
                            ? 'ជ្រើសរើសរូបថត Slip'
                            : 'Upload slip image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Mode Required Fields */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      {isKm
                        ? 'លេខកូដប្រតិបត្តិការ (Transaction ID / Ref Number) *'
                        : 'Transaction Reference / Hash *'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="ឧ. TXN-ABA-9823412"
                        value={txnId}
                        onChange={e => setTxnId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setTxnId(
                            `TXN-${paymentMethod.replace(/\s+/g, '')}-${Math.floor(
                              100000 + Math.random() * 900000
                            )}`
                          )
                        }
                        className="absolute right-2.5 top-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 rounded-lg cursor-pointer"
                      >
                        {isKm ? 'ដាក់លេខស្វ័យប្រវត្តិ' : 'Auto-fill'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      {isKm ? 'រូបថតវិក្កយបត្រ (Payment Slip)' : 'Payment Slip Screenshot'}
                    </label>
                    <label className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-300">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span>
                        {uploadedReceipt
                          ? isKm
                            ? 'បានជ្រើសរូបវិក្កយបត្ររួចរាល់'
                            : 'Receipt uploaded'
                          : isKm
                          ? 'ជ្រើសរើសរូបថត Slip'
                          : 'Upload payment slip'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Primary Action CTA Button */}
              {autoApproveEnabled ? (
                <button
                  type="submit"
                  disabled={verifyStage !== 'idle'}
                  className={`w-full py-3.5 px-5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                    verifyStage !== 'idle'
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isKm
                      ? `បាញ់ប្រាក់រួចរាល់ ($${selectedPlan.price}) — បើកសិទ្ធិ VIP ភ្លាមៗ (Approve Auto)`
                      : `I Have Paid ($${selectedPlan.price}) — Instant Auto-Approve VIP`}
                  </span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={verifyStage !== 'idle' || !txnId.trim()}
                  className={`w-full py-3.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    verifyStage !== 'idle' || !txnId.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isKm
                      ? 'បញ្ជូនព័ត៌មានបង់ប្រាក់ជូន Admin ផ្ទៀងផ្ទាត់'
                      : 'Submit Payment for Admin Review'}
                  </span>
                </button>
              )}
            </form>
          )}

          {/* Member Payment History */}
          {myRecentPayments.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <div className="text-xs font-semibold text-slate-400">
                {isKm ? 'ប្រវត្តិការបង់ប្រាក់របស់អ្នក:' : 'Your Recent Payment History:'}
              </div>
              <div className="divide-y divide-slate-800/80">
                {myRecentPayments.slice(0, 3).map(pay => (
                  <div
                    key={pay.id}
                    className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{pay.planName}</span>
                      <span className="text-slate-500 mx-1.5">·</span>
                      <span className="font-mono tabular-nums text-amber-400 font-bold">
                        ${pay.amount}
                      </span>
                      <span className="text-slate-500 mx-1.5">·</span>
                      <span className="font-mono text-slate-400">{pay.transactionId}</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        pay.status === 'APPROVED'
                          ? 'text-emerald-400'
                          : pay.status === 'PENDING'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {pay.status === 'APPROVED'
                        ? pay.approvalMode === 'AUTO'
                          ? isKm
                            ? 'APPROVED AUTO'
                            : 'AUTO-APPROVED'
                          : 'APPROVED'
                        : pay.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
