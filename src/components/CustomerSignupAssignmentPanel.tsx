import React, { useState } from 'react';
import {
  Language,
  CustomerRegistrationRecord,
  CustomerSignupStage,
  StaffAccount
} from '../types';
import { POSITION_DEFINITIONS } from '../data/mockData';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Send,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  X,
  ArrowRight,
  Users
} from 'lucide-react';

interface CustomerSignupAssignmentPanelProps {
  lang: Language;
  theme?: 'light' | 'dark';
  registrations: CustomerRegistrationRecord[];
  staffAccounts: StaffAccount[];
  loggedInStaff: StaffAccount | null;
  onAssignToStaff: (
    registrationId: string,
    targetStaff: StaffAccount,
    adminInstruction: string
  ) => void;
  onCompleteStaffCheck: (
    registrationId: string,
    decision: 'VERIFIED_COMPLETED' | 'REJECTED',
    staffCheckNote: string,
    upgradeToVip: boolean
  ) => void;
  onSwitchStaffSession?: (staff: StaffAccount) => void;
}

export const CustomerSignupAssignmentPanel: React.FC<CustomerSignupAssignmentPanelProps> = ({
  lang,
  theme = 'light',
  registrations,
  staffAccounts,
  loggedInStaff,
  onAssignToStaff,
  onCompleteStaffCheck,
  onSwitchStaffSession
}) => {
  const isKm = lang === 'km';
  const isLight = theme === 'light';

  const isAdmin = !loggedInStaff || loggedInStaff.position === 'administrator';

  const [stageFilter, setStageFilter] = useState<'ALL' | CustomerSignupStage | 'MY_QUEUE'>(
    isAdmin ? 'ALL' : 'MY_QUEUE'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Administrator Assigning a Staff Member
  const [assigningReg, setAssigningReg] = useState<CustomerRegistrationRecord | null>(null);
  const activeCheckers = staffAccounts.filter(s => s.status === 'active');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    activeCheckers.find(s => s.position !== 'administrator')?.id || activeCheckers[0]?.id || ''
  );
  const [adminInstruction, setAdminInstruction] = useState<string>('');

  // Modal State for Assigned Staff Member Checking & Verifying Customer Data
  const [checkingReg, setCheckingReg] = useState<CustomerRegistrationRecord | null>(null);
  const [staffCheckNote, setStaffCheckNote] = useState<string>('');
  const [upgradeOnVerify, setUpgradeOnVerify] = useState<boolean>(false);

  // Counts
  const newForAdminCount = registrations.filter(r => r.workflowStage === 'NEW_FOR_ADMIN').length;
  const assignedCount = registrations.filter(r => r.workflowStage === 'ASSIGNED_TO_STAFF').length;
  const verifiedCount = registrations.filter(r => r.workflowStage === 'VERIFIED_COMPLETED').length;
  const myAssignedCount = loggedInStaff
    ? registrations.filter(
        r =>
          r.assignedToStaffId === loggedInStaff.id ||
          r.assignedToStaffCode === loggedInStaff.staffCode
      ).length
    : 0;

  const filteredRegistrations = registrations.filter(reg => {
    // Non-admin staff see tasks assigned to them when MY_QUEUE is active
    if (stageFilter === 'MY_QUEUE' && loggedInStaff) {
      const isMine =
        reg.assignedToStaffId === loggedInStaff.id ||
        reg.assignedToStaffCode === loggedInStaff.staffCode;
      if (!isMine) return false;
    } else if (stageFilter !== 'ALL' && stageFilter !== 'MY_QUEUE') {
      if (reg.workflowStage !== stageFilter) return false;
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      reg.id.toLowerCase().includes(q) ||
      reg.fullName.toLowerCase().includes(q) ||
      reg.email.toLowerCase().includes(q) ||
      reg.phone.toLowerCase().includes(q) ||
      (reg.assignedToStaffCode || '').toLowerCase().includes(q) ||
      (reg.assignedToStaffName || '').toLowerCase().includes(q)
    );
  });

  const openAssignModal = (reg: CustomerRegistrationRecord) => {
    setAssigningReg(reg);
    const defaultStaff =
      activeCheckers.find(s => s.id === reg.assignedToStaffId) ||
      activeCheckers.find(s => s.position !== 'administrator') ||
      activeCheckers[0];
    if (defaultStaff) {
      setSelectedStaffId(defaultStaff.id);
    }
    setAdminInstruction(
      reg.adminInstruction ||
        (isKm
          ? 'សូមឆែកផ្ទៀងផ្ទាត់គណនី Gmail លេខទូរស័ព្ទ/Telegram និងណែនាំអតិថិជនអំពីកញ្ចប់ VIP។'
          : 'Please verify customer Gmail, phone/Telegram, and guide them on their selected VIP package.')
    );
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningReg) return;
    const chosenStaff = activeCheckers.find(s => s.id === selectedStaffId);
    if (!chosenStaff) return;
    onAssignToStaff(assigningReg.id, chosenStaff, adminInstruction.trim());
    setAssigningReg(null);
  };

  const openCheckModal = (reg: CustomerRegistrationRecord) => {
    setCheckingReg(reg);
    setStaffCheckNote(
      reg.staffCheckNote ||
        (isKm
          ? 'បានឆែកគណនី Gmail និងទាក់ទងអតិថិជនរួចរាល់ ទិន្នន័យត្រឹមត្រូវ ១០០%។'
          : 'Verified customer Gmail and contact details accurately.')
    );
    setUpgradeOnVerify(false);
  };

  const handleConfirmCheck = (decision: 'VERIFIED_COMPLETED' | 'REJECTED') => {
    if (!checkingReg) return;
    onCompleteStaffCheck(checkingReg.id, decision, staffCheckNote.trim(), upgradeOnVerify);
    setCheckingReg(null);
  };

  const getStageLabel = (stage: CustomerSignupStage) => {
    switch (stage) {
      case 'NEW_FOR_ADMIN':
        return {
          text: isKm ? 'ថ្មី! រង់ចាំ Admin ចាត់ចែង' : 'New · Awaiting Admin',
          color: isLight ? 'text-amber-700 font-bold' : 'text-amber-400 font-bold'
        };
      case 'ASSIGNED_TO_STAFF':
        return {
          text: isKm ? 'កំពុងឱ្យបុគ្គលិកឆែកបន្ត' : 'Assigned · Staff Checking',
          color: isLight ? 'text-blue-700 font-bold' : 'text-sky-400 font-bold'
        };
      case 'VERIFIED_COMPLETED':
        return {
          text: isKm ? 'បុគ្គលិកឆែករួចរាល់ ✓' : 'Checked & Verified ✓',
          color: isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
        };
      case 'REJECTED':
        return {
          text: isKm ? 'ទិន្នន័យមិនត្រឹមត្រូវ' : 'Rejected / Invalid',
          color: isLight ? 'text-rose-700 font-bold' : 'text-rose-400 font-bold'
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Workflow Header & Quick Desk Switcher (Test Administrator -> Assigned Staff seamlessly) */}
      <div
        className={`rounded-2xl border p-5 space-y-4 ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isKm
                ? 'ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យអតិថិជន Sign Up ថ្មី & ចាត់តាំងបុគ្គលិកឆែកបន្ត'
                : 'Customer Sign-Up Intake & Staff Check Assignment'}
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {isKm
                ? 'លំហូរការងារ៖ អតិថិជន Sign Up (Gmail OTP) ➔ បញ្ជូនចូល Administrator មុនគេ ➔ Administrator ចាត់តាំងបុគ្គលិកឱ្យឆែកបន្ត ➔ បុគ្គលិកបញ្ជាក់លទ្ធផលឆែក'
                : 'Flow: Customer Gmail OTP Sign-Up ➔ Delivered to Administrator ➔ Assigned to Staff Member ➔ Staff Completes Verification'}
            </p>
          </div>

          {/* KPI Summary Strip */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
            <div>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                {isKm ? 'ថ្មីសម្រាប់ Admin:' : 'New for Admin:'}{' '}
              </span>
              <strong className={isLight ? 'text-amber-600' : 'text-amber-400'}>
                {newForAdminCount}
              </strong>
            </div>
            <span className={isLight ? 'text-slate-300' : 'text-slate-700'}>·</span>
            <div>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                {isKm ? 'កំពុងឆែកដោយបុគ្គលិក:' : 'Staff Checking:'}{' '}
              </span>
              <strong className={isLight ? 'text-blue-600' : 'text-sky-400'}>
                {assignedCount}
              </strong>
            </div>
            <span className={isLight ? 'text-slate-300' : 'text-slate-700'}>·</span>
            <div>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                {isKm ? 'ឆែករួចរាល់:' : 'Verified:'}{' '}
              </span>
              <strong className={isLight ? 'text-emerald-600' : 'text-emerald-400'}>
                {verifiedCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Quick Desk Switcher to test Administrator vs Assigned Staff Checker */}
        {onSwitchStaffSession && (
          <div
            className={`pt-3.5 border-t flex flex-wrap items-center justify-between gap-2.5 ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}
          >
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              {isKm
                ? 'ប្តូរមើលតាមតួនាទី (Administrator ចាត់ចែង ➔ បុគ្គលិកឆែកបន្ត)៖'
                : 'Switch Active Desk (Administrator vs Assigned Staff Checker):'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {activeCheckers.map(staff => {
                const isCurrent = loggedInStaff?.id === staff.id;
                const pendingForThisStaff =
                  staff.position === 'administrator'
                    ? newForAdminCount
                    : registrations.filter(
                        r =>
                          r.workflowStage === 'ASSIGNED_TO_STAFF' &&
                          (r.assignedToStaffId === staff.id ||
                            r.assignedToStaffCode === staff.staffCode)
                      ).length;

                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => {
                      onSwitchStaffSession(staff);
                      setStageFilter(staff.position === 'administrator' ? 'ALL' : 'MY_QUEUE');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isCurrent
                        ? isLight
                          ? 'bg-[#091738] text-white border-[#091738]'
                          : 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span className="font-mono">{staff.staffCode}</span>
                    <span>·</span>
                    <span>{POSITION_DEFINITIONS[staff.position].shortTitle}</span>
                    {pendingForThisStaff > 0 && (
                      <span className="font-mono tabular-nums text-[11px] font-bold text-rose-500">
                        ({pendingForThisStaff})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Filter Bar & Search */}
      <div
        className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'ALL', labelKm: `ទាំងអស់ (${registrations.length})`, labelEn: `All (${registrations.length})` },
              {
                id: 'NEW_FOR_ADMIN',
                labelKm: `ថ្មីសម្រាប់ Admin (${newForAdminCount})`,
                labelEn: `New for Admin (${newForAdminCount})`
              },
              {
                id: 'ASSIGNED_TO_STAFF',
                labelKm: `បញ្ជូនឱ្យបុគ្គលិកឆែក (${assignedCount})`,
                labelEn: `Assigned to Staff (${assignedCount})`
              },
              {
                id: 'VERIFIED_COMPLETED',
                labelKm: `ឆែករួចរាល់ (${verifiedCount})`,
                labelEn: `Verified (${verifiedCount})`
              },
              ...(loggedInStaff
                ? [
                    {
                      id: 'MY_QUEUE' as const,
                      labelKm: `ការងារឆែករបស់ខ្ញុំ (${myAssignedCount})`,
                      labelEn: `Assigned to Me (${myAssignedCount})`
                    }
                  ]
                : [])
            ] as const
          ).map(tab => {
            const active = stageFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStageFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? isLight
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-400 text-slate-950 font-bold'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {isKm ? tab.labelKm : tab.labelEn}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[230px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isKm ? 'ស្វែងរកឈ្មោះ, Gmail, លេខទូរស័ព្ទ, Staff ID...' : 'Search customer, Gmail, phone...'}
            className={`w-full rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none ${
              isLight
                ? 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-blue-500'
                : 'bg-slate-950 border border-slate-800 text-white focus:border-amber-400'
            }`}
          />
        </div>
      </div>

      {/* 3. Customer Sign-Up Intake & Staff Assignment Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead
              className={`border-b ${
                isLight
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">{isKm ? 'លេខសម្គាល់ & ពេលវេលា' : 'Reg ID & Time'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isKm ? 'ព័ត៌មានអតិថិជន & Gmail' : 'Customer & Verified Gmail'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isKm ? 'កញ្ចប់ & កំណត់សម្គាល់' : 'Interested Plan & Note'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isKm ? 'ស្ថានភាពគ្រប់គ្រង' : 'Workflow Stage'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isKm ? 'បុគ្គលិកទទួលបន្ទុកឆែកបន្ត' : 'Assigned Staff Checker'}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{isKm ? 'សកម្មភាពចាត់ចែង' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                    <div className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {isKm
                        ? 'មិនមានទិន្នន័យចុះឈ្មោះក្នុងប្រភេទនេះទេ'
                        : 'No customer registrations found in this queue'}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {isKm
                        ? 'នៅពេលអតិថិជនចុះឈ្មោះថ្មីតាមរយៈ Gmail OTP ទិន្នន័យនឹងបង្ហាញនៅទីនេះភ្លាមៗ។'
                        : 'New customer Gmail OTP sign-ups appear here automatically.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map(reg => {
                  const stageMeta = getStageLabel(reg.workflowStage);
                  const canCurrentStaffCheck =
                    isAdmin ||
                    (loggedInStaff &&
                      (reg.assignedToStaffId === loggedInStaff.id ||
                        reg.assignedToStaffCode === loggedInStaff.staffCode));

                  return (
                    <tr
                      key={reg.id}
                      className={isLight ? 'hover:bg-slate-50/90' : 'hover:bg-slate-800/40'}
                    >
                      {/* Col 1: Reg ID & Submitted Time */}
                      <td className="py-3.5 px-4 align-top font-mono tabular-nums whitespace-nowrap">
                        <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {reg.id}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(reg.submittedAt).toLocaleString([], {
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Col 2: Customer Name, Verified Gmail, Phone/Telegram */}
                      <td className="py-3.5 px-4 align-top">
                        <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {reg.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{reg.email}</span>
                          <span>· OTP ✓</span>
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>
                            {reg.phone}
                            {reg.telegram ? ` · ${reg.telegram}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Col 3: Interested Plan & Customer Note */}
                      <td className="py-3.5 px-4 align-top max-w-[240px]">
                        <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-amber-300'}`}>
                          {reg.interestedPlanName}
                        </div>
                        {reg.customerNote ? (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            “{reg.customerNote}”
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>

                      {/* Col 4: Workflow Stage */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className={stageMeta.color}>{stageMeta.text}</div>
                        {reg.checkedAt && reg.checkedByStaffCode && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            By {reg.checkedByStaffCode}
                          </div>
                        )}
                      </td>

                      {/* Col 5: Assigned Staff Member & Notes */}
                      <td className="py-3.5 px-4 align-top max-w-[260px]">
                        {reg.assignedToStaffCode ? (
                          <div className="space-y-0.5">
                            <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                              <span className="font-mono text-blue-600 dark:text-sky-400">
                                {reg.assignedToStaffCode}
                              </span>{' '}
                              · {reg.assignedToStaffName}
                            </div>
                            {reg.adminInstruction && (
                              <div className="text-[11px] text-slate-500 line-clamp-2">
                                {isKm ? 'Admin ផ្តាំ៖ ' : 'Admin: '}
                                {reg.adminInstruction}
                              </div>
                            )}
                            {reg.staffCheckNote && (
                              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 line-clamp-2">
                                {isKm ? 'លទ្ធផលឆែក៖ ' : 'Report: '}
                                {reg.staffCheckNote}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            {isKm ? 'មិនទាន់ចាត់តាំងបុគ្គលិកនៅឡើយ' : 'Not yet assigned by Admin'}
                          </span>
                        )}
                      </td>

                      {/* Col 6: Role-Specific Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Administrator Action: Assign or Reassign Staff Member */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => openAssignModal(reg)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                                reg.workflowStage === 'NEW_FOR_ADMIN'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                  : isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                              }`}
                            >
                              <Send className="w-3 h-3" />
                              <span>
                                {reg.assignedToStaffCode
                                  ? isKm
                                    ? 'ប្តូរបុគ្គលិកឆែក'
                                    : 'Reassign'
                                  : isKm
                                  ? 'ចាត់តាំងបុគ្គលិកឆែក'
                                  : 'Assign Staff'}
                              </span>
                            </button>
                          )}

                          {/* Assigned Staff (or Admin) Action: Check & Verify Customer */}
                          {canCurrentStaffCheck && reg.workflowStage !== 'VERIFIED_COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => openCheckModal(reg)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{isKm ? 'ឆែកផ្ទៀងផ្ទាត់' : 'Check & Verify'}</span>
                            </button>
                          )}

                          {reg.workflowStage === 'VERIFIED_COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => openCheckModal(reg)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                                isLight
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                              }`}
                            >
                              {isKm ? 'មើលលទ្ធផលឆែក' : 'View Report'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== MODAL 1: ADMINISTRATOR ASSIGNS STAFF TO CHECK ==================== */}
      {assigningReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-mono font-bold text-blue-600">{assigningReg.id}</div>
                <h3 className="text-base font-bold text-slate-900">
                  {isKm
                    ? `ចាត់តាំងបុគ្គលិកឱ្យឆែកអតិថិជន៖ ${assigningReg.fullName}`
                    : `Assign Staff Member to Check: ${assigningReg.fullName}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningReg(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-900">
                {assigningReg.fullName} · <span className="font-mono text-emerald-600">{assigningReg.email}</span>
              </div>
              <div className="text-slate-600 font-mono">
                {assigningReg.phone}
                {assigningReg.telegram ? ` · ${assigningReg.telegram}` : ''} · {assigningReg.interestedPlanName}
              </div>
              {assigningReg.customerNote && (
                <div className="text-slate-500 pt-1">Note: “{assigningReg.customerNote}”</div>
              )}
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isKm
                    ? 'ជ្រើសរើសបុគ្គលិកសម្រាប់ទទួលបន្ទុកឆែកបន្ត *'
                    : 'Select Staff Member to Check Next *'}
                </label>
                <select
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {activeCheckers.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.staffCode} — {isKm ? staff.fullNameKm : staff.fullName} ({POSITION_DEFINITIONS[staff.position].shortTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isKm
                    ? 'ការណែនាំពី Administrator ទៅកាន់បុគ្គលិក'
                    : 'Administrator Instruction for Assigned Staff'}
                </label>
                <textarea
                  rows={3}
                  value={adminInstruction}
                  onChange={e => setAdminInstruction(e.target.value)}
                  placeholder={
                    isKm
                      ? 'ឧ. សូមទាក់ទងឆែកលេខទូរស័ព្ទ និងពិនិត្យការបង់ប្រាក់កញ្ចប់ VIP...'
                      : 'e.g. Verify Telegram handle and assist with VIP activation...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningReg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isKm ? 'បញ្ជូនឱ្យបុគ្គលិកឆែកបន្ត' : 'Assign to Staff Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: ASSIGNED STAFF CHECK & VERIFY MODAL ==================== */}
      {checkingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-mono font-bold text-emerald-600">
                  {checkingReg.id} · Staff Verification
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isKm
                    ? `ត្រួតពិនិត្យទិន្នន័យអតិថិជន៖ ${checkingReg.fullName}`
                    : `Verify Customer Registration: ${checkingReg.fullName}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckingReg(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">{isKm ? 'ឈ្មោះពេញ៖' : 'Full Name:'}</span>
                <strong className="text-slate-900">{checkingReg.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gmail (2FA):</span>
                <strong className="font-mono text-emerald-600">{checkingReg.email} ✓</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isKm ? 'ទូរស័ព្ទ / Telegram៖' : 'Phone / Telegram:'}</span>
                <strong className="font-mono text-slate-800">
                  {checkingReg.phone}
                  {checkingReg.telegram ? ` · ${checkingReg.telegram}` : ''}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isKm ? 'កញ្ចប់ចាប់អារម្មណ៍៖' : 'Interested Plan:'}</span>
                <strong className="text-blue-700">{checkingReg.interestedPlanName}</strong>
              </div>
              {checkingReg.adminInstruction && (
                <div className="pt-2 border-t border-slate-200 text-slate-700">
                  <strong>{isKm ? 'ការណែនាំពី Administrator៖ ' : 'Administrator Note: '}</strong>
                  {checkingReg.adminInstruction}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isKm
                  ? 'របាយការណ៍ត្រួតពិនិត្យរបស់បុគ្គលិក (Staff Check Report)'
                  : 'Staff Verification Notes'}
              </label>
              <textarea
                rows={3}
                value={staffCheckNote}
                onChange={e => setStaffCheckNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={upgradeOnVerify}
                onChange={e => setUpgradeOnVerify(e.target.checked)}
                className="accent-emerald-600"
              />
              <span className="font-medium">
                {isKm
                  ? 'បើកសិទ្ធិ VIP Member ជូនអតិថិជននេះភ្លាមៗផងដែរ (Optional)'
                  : 'Also upgrade customer directly to active VIP Member'}
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleConfirmCheck('REJECTED')}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isKm ? 'បដិសេធទិន្នន័យ' : 'Flag / Reject'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCheckingReg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {isKm ? 'បិទ' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmCheck('VERIFIED_COMPLETED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isKm ? 'បញ្ជាក់ថាបានឆែករួចរាល់' : 'Mark Checked & Verified'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
