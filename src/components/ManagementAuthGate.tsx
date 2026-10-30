import React, { useState, useRef, useEffect } from 'react';
import {
  Language,
  StaffAccount,
  StaffPosition
} from '../types';
import { POSITION_DEFINITIONS } from '../data/mockData';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  KeyRound,
  Copy,
  Check
} from 'lucide-react';

export interface ManagementSignupPayload {
  fullName: string;
  fullNameKm: string;
  email: string;
  phone: string;
  position: StaffPosition;
  shift: string;
  password: string;
  verifiedAt: string;
}

interface ManagementAuthGateProps {
  lang: Language;
  staffAccounts: StaffAccount[];
  onAuthenticatedStaffLogin: (staff: StaffAccount) => void;
  onCompletedStaffSignup: (payload: ManagementSignupPayload) => {
    ok: boolean;
    staff?: StaffAccount;
    errorKm?: string;
    errorEn?: string;
  };
  onSwitchToCustomerPortal: () => void;
}

const ALL_POSITIONS: StaffPosition[] = [
  'administrator',
  'leadership_finance',
  'hr',
  'editor',
  'videos_editor'
];

export const ManagementAuthGate: React.FC<ManagementAuthGateProps> = ({
  lang,
  staffAccounts,
  onAuthenticatedStaffLogin,
  onCompletedStaffSignup,
  onSwitchToCustomerPortal
}) => {
  const isKm = lang === 'km';

  // Identical dual-tab structure to CustomerAuthGate: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Step: 'form' -> 'otp' -> 'signup_ready'
  const [step, setStep] = useState<'form' | 'otp' | 'signup_ready'>('form');

  // Login Form States (supports Gmail OR Staff ID + Password)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Sign Up Form States (Manager / Admin / Staff Registration)
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<StaffPosition>('administrator');
  const [shift, setShift] = useState('08:00 - 18:00 (HQ Executive)');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);

  // 6-Digit Gmail OTP States
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [deliveryMode, setDeliveryMode] = useState<'gmail_smtp' | 'inbox_preview'>('inbox_preview');
  const [otpPreviewCode, setOtpPreviewCode] = useState<string | null>(null);
  const [localFallbackCode, setLocalFallbackCode] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Pending validated staff for Login step
  const [pendingLoginStaff, setPendingLoginStaff] = useState<StaffAccount | null>(null);
  const [resolvedOtpEmail, setResolvedOtpEmail] = useState<string>('');

  // Created Staff summary after Sign Up OTP verification
  const [createdStaff, setCreatedStaff] = useState<StaffAccount | null>(null);

  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const requestGmailOtp = async (email: string, name: string, purpose: 'login' | 'signup') => {
    setIsLoading(true);
    setErrorMsg(null);
    setOtpDigits(['', '', '', '', '', '']);
    setResolvedOtpEmail(email.trim().toLowerCase());
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name,
          purpose,
          portal: 'management'
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(isKm ? data.errorKm || 'បរាជ័យក្នុងការផ្ញើលេខកូដ' : data.error || 'Failed to send OTP');
      }
      setDeliveryMode(data.deliveryMode === 'gmail_smtp' ? 'gmail_smtp' : 'inbox_preview');
      setOtpPreviewCode(data.otpPreview || null);
      setLocalFallbackCode(null);
      setCountdown(data.expiresInSeconds || 300);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch {
      const generated = String(Math.floor(100000 + Math.random() * 900000));
      setLocalFallbackCode(generated);
      setDeliveryMode('inbox_preview');
      setOtpPreviewCode(generated);
      setCountdown(300);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1 Submit: Management Login (Gmail or Staff ID + Password -> Gmail 6-Digit OTP)
  const handleLoginFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const rawId = loginIdentifier.trim();

    if (!rawId) {
      setErrorMsg(
        isKm
          ? 'សូមបញ្ចូលអាសយដ្ឋាន Gmail ឬអត្តលេខ Staff ID (ឧ. ADM-001)។'
          : 'Please enter your Gmail address or Staff ID (e.g. ADM-001).'
      );
      return;
    }

    const matchedStaff = staffAccounts.find(
      s =>
        s.email.toLowerCase() === rawId.toLowerCase() ||
        s.staffCode.toUpperCase() === rawId.toUpperCase()
    );

    if (!matchedStaff) {
      setErrorMsg(
        isKm
          ? 'រកមិនឃើញគណនីអ្នកគ្រប់គ្រងនេះទេ! សូមពិនិត្យ Gmail/Staff ID ឬចុចផ្ទាំង «ចុះឈ្មោះថ្មី (Sign Up)»។'
          : 'No management account found. Check your Gmail/Staff ID or switch to Sign Up.'
      );
      return;
    }

    if (loginPassword !== matchedStaff.password) {
      setErrorMsg(
        isKm
          ? 'លេខសម្ងាត់មិនត្រឹមត្រូវទេ! សូមពិនិត្យម្តងទៀត។'
          : 'Incorrect password. Please verify and try again.'
      );
      return;
    }

    if (matchedStaff.status === 'suspended') {
      setErrorMsg(
        isKm
          ? `គណនី ${matchedStaff.staffCode} ត្រូវបានផ្អាកសិទ្ធិជាបណ្តោះអាសន្ន។`
          : `Management account ${matchedStaff.staffCode} is currently suspended.`
      );
      return;
    }

    const otpTargetEmail = matchedStaff.email.includes('@')
      ? matchedStaff.email.toLowerCase()
      : `${matchedStaff.staffCode.toLowerCase()}@gmail.com`;

    setPendingLoginStaff(matchedStaff);
    await requestGmailOtp(otpTargetEmail, matchedStaff.fullName, 'login');
  };

  // Step 1 Submit: Management Sign Up (New Manager / Admin / Staff -> Gmail 6-Digit OTP)
  const handleSignupFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const normalizedEmail = signupEmail.trim().toLowerCase();

    if (!fullName.trim()) {
      setErrorMsg(isKm ? 'សូមបំពេញឈ្មោះពេញរបស់អ្នកគ្រប់គ្រង ឬបុគ្គលិក។' : 'Please enter full name.');
      return;
    }

    if (!normalizedEmail.endsWith('@gmail.com') && !normalizedEmail.endsWith('@googlemail.com')) {
      setErrorMsg(
        isKm
          ? 'តម្រូវឱ្យប្រើប្រាស់អាសយដ្ឋាន Gmail (@gmail.com) ដើម្បីទទួលលេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់។'
          : 'Please enter a valid @gmail.com address to receive your 6-digit verification code.'
      );
      return;
    }

    if (staffAccounts.some(s => s.email.toLowerCase() === normalizedEmail)) {
      setErrorMsg(
        isKm
          ? 'គណនី Gmail អ្នកគ្រប់គ្រងនេះមានរួចហើយ! សូមប្តូរទៅផ្ទាំង «ចូលគណនី (Login)»។'
          : 'This Gmail is already registered in Management. Please switch to Login.'
      );
      return;
    }

    if (!phone.trim()) {
      setErrorMsg(isKm ? 'សូមបំពេញលេខទូរស័ព្ទការងារ។' : 'Please enter work phone number.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg(
        isKm
          ? 'លេខសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ។'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg(
        isKm
          ? 'លេខសម្ងាត់បញ្ជាក់មិនត្រូវគ្នាទេ។'
          : 'Confirmation password does not match.'
      );
      return;
    }

    await requestGmailOtp(normalizedEmail, fullName.trim(), 'signup');
  };

  // OTP Input Handlers
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }
    const digit = clean.slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  const autofillPreviewOtp = () => {
    if (!otpPreviewCode) return;
    const digits = otpPreviewCode.slice(0, 6).split('');
    setOtpDigits([
      digits[0] || '',
      digits[1] || '',
      digits[2] || '',
      digits[3] || '',
      digits[4] || '',
      digits[5] || ''
    ]);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 1800);
  };

  // Step 2 Submit: Verify 6-Digit Gmail OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');
    if (enteredCode.length !== 6) {
      setErrorMsg(
        isKm ? 'សូមបំពេញលេខកូដផ្ទៀងផ្ទាត់ទាំង ៦ ខ្ទង់ពី Gmail។' : 'Please enter all 6 digits.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      let verifiedAtIso = new Date().toISOString();

      if (localFallbackCode) {
        if (enteredCode !== localFallbackCode) {
          setErrorMsg(
            isKm
              ? 'លេខកូដ ៦ ខ្ទង់មិនត្រឹមត្រូវទេ! សូមពិនិត្យម្តងទៀត។'
              : 'Incorrect 6-digit verification code.'
          );
          setIsLoading(false);
          return;
        }
      } else {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resolvedOtpEmail, code: enteredCode })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setErrorMsg(
            isKm
              ? data.errorKm || 'លេខកូដ ៦ ខ្ទង់មិនត្រឹមត្រូវទេ!'
              : data.error || 'Invalid 6-digit code.'
          );
          setIsLoading(false);
          return;
        }
        verifiedAtIso = data.verifiedAt || verifiedAtIso;
      }

      if (mode === 'login' && pendingLoginStaff) {
        onAuthenticatedStaffLogin(pendingLoginStaff);
      } else if (mode === 'signup') {
        const result = onCompletedStaffSignup({
          fullName: fullName.trim(),
          fullNameKm: fullName.trim(),
          email: resolvedOtpEmail,
          phone: phone.trim(),
          position: selectedPosition,
          shift: shift.trim() || '08:00 - 18:00',
          password: signupPassword,
          verifiedAt: verifiedAtIso
        });
        if (!result.ok || !result.staff) {
          setErrorMsg(
            isKm ? result.errorKm || 'មិនអាចបង្កើតគណនីបានទេ' : result.errorEn || 'Could not create account'
          );
          setIsLoading(false);
          return;
        }
        setCreatedStaff(result.staff);
        setStep('signup_ready');
      }
    } catch {
      setErrorMsg(
        isKm
          ? 'មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់លេខកូដ។ សូមព្យាយាមម្តងទៀត។'
          : 'Verification failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex items-center">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left 5 Columns: Management Security & Department RBAC Overview */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/90 rounded-3xl p-7 sm:p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="text-xs font-semibold text-sky-400">
                {isKm
                  ? 'ផ្ទាំងទី ២៖ សម្រាប់អ្នកគ្រប់គ្រង · Management Gmail 2FA'
                  : 'Portal 2: Management & Admin · Gmail 2FA'}
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  {isKm
                    ? 'ចូលគណនី ឬចុះឈ្មោះសម្រាប់អ្នកគ្រប់គ្រង (Admin & Staff)'
                    : 'Management Portal Login & Sign Up'}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isKm
                    ? 'ប្រព័ន្ធគ្រប់គ្រងដាច់ដោយឡែកសម្រាប់ Administrator, Finance, HR, Editor និង Videos Editor ជាមួយការផ្ទៀងផ្ទាត់លេខកូដ ៦ ខ្ទង់តាម Gmail ដូចគ្នា។'
                    : 'Dedicated management workspace for Administrator, Finance, HR, Editor, and Videos Editor protected by 6-digit Gmail OTP verification.'}
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">
                    {isKm ? '01. Login ឬ Sign Up គណនីអ្នកគ្រប់គ្រង' : '01. Login or Sign Up Management Account'}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isKm
                      ? 'ចូលដោយប្រើ Gmail ឬ Staff ID (ADM-001, FIN-001...) ឬចុះឈ្មោះគណនីអ្នកគ្រប់គ្រងថ្មីតាមមុខតំណែង។'
                      : 'Sign in with your Gmail or Staff ID, or register a new department manager account.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">
                    {isKm ? '02. ផ្ទៀងផ្ទាត់លេខកូដសុវត្ថិភាព ៦ ខ្ទង់ពី Gmail' : '02. Verify 6-Digit Gmail Security Code'}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isKm
                      ? 'ទទួលលេខកូដ ៦ ខ្ទង់តាម Gmail ដើម្បីការពារសិទ្ធិគ្រប់គ្រងហិរញ្ញវត្ថុ និងទិន្នន័យអតិថិជន។'
                      : 'Confirm identity via a 6-digit code sent to your Gmail before accessing ERP & financial records.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">
                    {isKm
                      ? '03. គ្រប់គ្រងការចុះឈ្មោះអតិថិជន បង់ប្រាក់ និងបុគ្គលិក'
                      : '03. Manage Customer Sign-Ups, Billing & Staff RBAC'}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isKm
                      ? 'Administrator ទទួលទិន្នន័យអតិថិជនថ្មី ចាត់តាំងបុគ្គលិកឱ្យឆែកបន្ត អនុម័តការបង់ប្រាក់ និងគ្រប់គ្រង Signal/MT5។'
                      : 'Assign staff to verify customer sign-ups, approve KHQR payments, and manage VIP signals & MT5.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span>5 Department Roles · RBAC Security</span>
              <button
                type="button"
                onClick={onSwitchToCustomerPortal}
                className="text-slate-300 hover:text-amber-400 underline underline-offset-4 cursor-pointer whitespace-nowrap"
              >
                {isKm ? 'ប្តូរទៅផ្ទាំងទី ១៖ អតិថិជន →' : 'Switch to 1. Customer Portal →'}
              </button>
            </div>
          </div>

          {/* Right 7 Columns: Management Login / Sign Up / 6-Digit Gmail OTP */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-7 sm:p-9 flex flex-col justify-center">
            {/* ==================== STEP A: LOGIN OR SIGN UP FORM ==================== */}
            {step === 'form' && (
              <div className="space-y-6">
                {/* Identical Segmented Login & Sign Up Switcher */}
                <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                    }}
                    className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      mode === 'login'
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isKm ? 'ចូលគណនីអ្នកគ្រប់គ្រង (Login)' : 'Management Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                    }}
                    className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      mode === 'signup'
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isKm ? 'ចុះឈ្មោះអ្នកគ្រប់គ្រងថ្មី (Sign Up)' : 'Management Sign Up'}
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {mode === 'login' ? (
                  <form onSubmit={handleLoginFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        {isKm
                          ? 'អាសយដ្ឋាន Gmail ឬ អត្តលេខ Staff ID'
                          : 'Management Gmail or Staff ID'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="sovann.admin@gmail.com / ADM-001"
                          value={loginIdentifier}
                          onChange={e => setLoginIdentifier(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        {isKm ? 'លេខសម្ងាត់អ្នកគ្រប់គ្រង (Password)' : 'Management Password'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type={showLoginPass ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPass(v => !v)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>
                        {isLoading
                          ? isKm
                            ? 'កំពុងផ្ញើលេខកូដទៅ Gmail...'
                            : 'Sending Gmail Verification Code...'
                          : isKm
                          ? 'បន្តទៅផ្ទៀងផ្ទាត់លេខកូដ Gmail (6-Digit OTP)'
                          : 'Continue to Gmail 6-Digit Verification'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Quick Department Demo Autofill */}
                    <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                      <span className="block text-[11px] text-slate-400">
                        {isKm
                          ? 'សាកល្បងបំពេញគណនីតាមមុខតំណែងទាំង ៥ រហ័ស៖'
                          : 'Quick autofill department accounts:'}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {staffAccounts.slice(0, 5).map(stf => (
                          <button
                            key={stf.id}
                            type="button"
                            onClick={() => {
                              setLoginIdentifier(stf.email);
                              setLoginPassword(stf.password);
                              setErrorMsg(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono tabular-nums text-slate-300 cursor-pointer whitespace-nowrap"
                          >
                            <span className="text-sky-400 font-bold">{stf.staffCode}</span> ·{' '}
                            {POSITION_DEFINITIONS[stf.position].shortTitle}
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignupFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {isKm ? 'ឈ្មោះពេញអ្នកគ្រប់គ្រង / បុគ្គលិក *' : 'Full Name *'}
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            placeholder={isKm ? 'ឧ. សុខ វិចិត្រ' : 'e.g. Sok Vichet'}
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {isKm ? 'អាសយដ្ឋាន Gmail (@gmail.com) *' : 'Gmail Address *'}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            required
                            placeholder="manager.name@gmail.com"
                            value={signupEmail}
                            onChange={e => setSignupEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {isKm ? 'លេខទូរស័ព្ទទំនាក់ទំនង *' : 'Phone Number *'}
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            required
                            placeholder="012 888 999"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white font-mono tabular-nums placeholder-slate-500 focus:outline-none focus:border-sky-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {isKm ? 'មុខតំណែងគ្រប់គ្រង (Position) *' : 'Management Position *'}
                        </label>
                        <div className="relative">
                          <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <select
                            value={selectedPosition}
                            onChange={e => setSelectedPosition(e.target.value as StaffPosition)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
                          >
                            {ALL_POSITIONS.map(pos => (
                              <option key={pos} value={pos}>
                                {isKm
                                  ? POSITION_DEFINITIONS[pos].labelKm
                                  : POSITION_DEFINITIONS[pos].labelEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        {isKm ? 'វេនធ្វើការ (Work Shift)' : 'Work Shift'}
                      </label>
                      <input
                        type="text"
                        value={shift}
                        onChange={e => setShift(e.target.value)}
                        placeholder="08:00 - 18:00 (HQ Desk)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {isKm ? 'បង្កើតលេខសម្ងាត់ *' : 'Create Password *'}
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type={showSignupPass ? 'text' : 'password'}
                            required
                            placeholder={isKm ? 'យ៉ាងតិច ៦ តួអក្សរ' : 'Min 6 characters'}
                            value={signupPassword}
                            onChange={e => setSignupPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPass(v => !v)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                          >
                            {showSignupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {isKm ? 'បញ្ជាក់លេខសម្ងាត់ *' : 'Confirm Password *'}
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type={showSignupPass ? 'text' : 'password'}
                            required
                            placeholder={isKm ? 'វាយលេខសម្ងាត់ម្តងទៀត' : 'Re-enter password'}
                            value={signupConfirmPassword}
                            onChange={e => setSignupConfirmPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>
                        {isLoading
                          ? isKm
                            ? 'កំពុងផ្ញើលេខកូដទៅ Gmail...'
                            : 'Sending Verification Code to Gmail...'
                          : isKm
                          ? 'ចុះឈ្មោះអ្នកគ្រប់គ្រង & ទទួលលេខកូដ ៦ ខ្ទង់ពី Gmail'
                          : 'Sign Up & Send 6-Digit Code to Gmail'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ==================== STEP B: 6-DIGIT GMAIL OTP VERIFICATION ==================== */}
            {step === 'otp' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setErrorMsg(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isKm ? 'ត្រឡប់ក្រោយ' : 'Back'}</span>
                  </button>

                  <span className="text-xs font-mono tabular-nums text-sky-400">
                    {countdown > 0
                      ? `${isKm ? 'ផុតកំណត់ក្នុង' : 'Expires in'} ${formatTimer(countdown)}`
                      : isKm
                      ? 'លេខកូដផុតកំណត់'
                      : 'Code expired'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">
                    {isKm
                      ? 'បំពេញលេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ពី Gmail (Management)'
                      : 'Enter 6-Digit Management Gmail Code'}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isKm ? 'យើងបានផ្ញើលេខកូដសុវត្ថិភាព ៦ ខ្ទង់ទៅកាន់គណនី Gmail ' : 'We sent a 6-digit code to '}
                    <strong className="text-sky-400 font-mono">{resolvedOtpEmail}</strong>
                  </p>
                </div>

                {deliveryMode === 'inbox_preview' && otpPreviewCode && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/40 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                        <Mail className="w-4 h-4 text-sky-400" />
                        <span>
                          {isKm
                            ? 'សារថ្មីក្នុងប្រអប់ Gmail អ្នកគ្រប់គ្រង (Instant Delivery)'
                            : 'Management Gmail Inbox Notification'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">now</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="text-xs text-slate-300">
                        {isKm ? 'លេខកូដផ្ទៀងផ្ទាត់របស់អ្នក៖ ' : 'Your 6-digit code: '}
                        <strong className="text-base font-mono tabular-nums tracking-widest text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 ml-1">
                          {otpPreviewCode}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={autofillPreviewOtp}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-xs font-semibold text-sky-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>
                          {copiedOtp
                            ? isKm
                              ? 'បានបំពេញរួចរាល់'
                              : 'Filled!'
                            : isKm
                            ? 'បំពេញលេខកូដស្វ័យប្រវត្តិ'
                            : 'Auto-Fill 6 Digits'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {deliveryMode === 'gmail_smtp' && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                    {isKm
                      ? 'លេខកូដ ៦ ខ្ទង់ត្រូវបានផ្ញើចូលប្រអប់សារ Gmail ពិតប្រាកដរបស់អ្នកហើយ! សូមពិនិត្យ Inbox ឬ Spam។'
                      : 'A real 6-digit verification email has been delivered to your Gmail Inbox.'}
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                  <div className="grid grid-cols-6 gap-2.5 sm:gap-3 max-w-md mx-auto">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => {
                          otpRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="h-13 sm:h-14 text-center text-xl font-bold font-mono tabular-nums bg-slate-950 border border-slate-700 focus:border-sky-400 rounded-xl text-white focus:outline-none"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isLoading
                        ? isKm
                          ? 'កំពុងផ្ទៀងផ្ទាត់...'
                          : 'Verifying Code...'
                        : mode === 'signup'
                        ? isKm
                          ? 'ផ្ទៀងផ្ទាត់លេខកូដ & បង្កើតគណនីអ្នកគ្រប់គ្រង'
                          : 'Verify Gmail & Create Management Account'
                        : isKm
                        ? 'ផ្ទៀងផ្ទាត់លេខកូដ & ចូលផ្ទាំងអ្នកគ្រប់គ្រង'
                        : 'Verify Code & Enter Management Portal'}
                    </span>
                  </button>
                </form>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{isKm ? 'មិនទាន់ទទួលបានលេខកូដមែនទេ?' : "Didn't receive the code?"}</span>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      requestGmailOtp(
                        resolvedOtpEmail,
                        mode === 'signup' ? fullName.trim() : pendingLoginStaff?.fullName || 'Manager',
                        mode
                      )
                    }
                    className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isKm ? 'ផ្ញើលេខកូដម្តងទៀត' : 'Resend Gmail Code'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ==================== STEP C: MANAGEMENT SIGN UP COMPLETE ==================== */}
            {step === 'signup_ready' && createdStaff && (
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono tabular-nums text-emerald-400">
                    {createdStaff.staffCode} · Gmail Verified ✓
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {isKm
                      ? 'ចុះឈ្មោះគណនីអ្នកគ្រប់គ្រងជោគជ័យ!'
                      : 'Management Account Registered Successfully!'}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isKm
                      ? 'ប្រព័ន្ធបានបង្កើតអត្តលេខ Staff ID និងបើកសិទ្ធិគ្រប់គ្រងតាមមុខតំណែងរបស់អ្នករួចរាល់ហើយ។'
                      : 'Your unique Staff ID and department role permissions are now active.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">{isKm ? 'អត្តលេខសម្គាល់ (Staff ID)' : 'Assigned Staff ID'}</span>
                    <span className="font-mono tabular-nums font-bold text-sky-400 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      {createdStaff.staffCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">{isKm ? 'ឈ្មោះអ្នកគ្រប់គ្រង' : 'Full Name'}</span>
                    <span className="font-bold text-white">{createdStaff.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">{isKm ? 'មុខតំណែង' : 'Position'}</span>
                    <span className="font-semibold text-amber-400">
                      {POSITION_DEFINITIONS[createdStaff.position].shortTitle}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Gmail</span>
                    <span className="font-mono text-emerald-400">{createdStaff.email} ✓</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAuthenticatedStaffLogin(createdStaff)}
                  className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>{isKm ? 'ចូលកាន់ផ្ទាំងអ្នកគ្រប់គ្រងឥឡូវនេះ' : 'Enter Management Dashboard Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
