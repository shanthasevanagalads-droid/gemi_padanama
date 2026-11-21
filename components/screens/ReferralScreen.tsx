'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { Referral, Client, Officer, Language } from '@/lib/types';
import { translations } from '@/lib/translations';
import { DEFAULT_OFFICERS } from '@/lib/constants';
import { EmptyState } from '../ui/EmptyState';

interface ReferralScreenProps {
  referrals: Referral[];
  clients: Client[];
  officers?: Officer[];
  onAddReferral: (referral: Referral) => void;
  onUpdateReferralStatus: (id: string, status: Referral['status']) => void;
  lang: Language;
  preSelectedClient?: Client | null;
}

export const ReferralScreen: React.FC<ReferralScreenProps> = ({
  referrals,
  clients,
  officers = DEFAULT_OFFICERS,
  onAddReferral,
  onUpdateReferralStatus,
  lang,
  preSelectedClient,
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'ALL' | 'Pending' | 'In Consultation' | 'Action Plan Agreed' | 'Resolved'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(Boolean(preSelectedClient));

  // Modal Form State
  const [selectedClientId, setSelectedClientId] = useState(preSelectedClient?.id || (clients[0]?.id || ''));
  const [targetOfficerId, setTargetOfficerId] = useState(officers[0]?.id || 'off-01');
  const [urgency, setUrgency] = useState<Referral['urgency']>('Normal');
  const [caseSummary, setCaseSummary] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');

  const selectedClient = clients.find((c) => c.id === selectedClientId) || preSelectedClient;
  const selectedOfficer = officers.find((o) => o.id === targetOfficerId) || officers[0];

  const filteredReferrals = referrals.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      alert(lang === 'si' ? 'කරුණාකර සේවාලාභියෙකු තෝරන්න' : 'Please select a client');
      return;
    }
    if (!caseSummary.trim()) {
      alert(lang === 'si' ? 'කරුණාකර නඩු විස්තරය සටහන් කරන්න' : 'Please provide a case summary');
      return;
    }

    const newRef: Referral = {
      id: `REF-AMP-${Date.now().toString().slice(-4)}`,
      visitId: `vis-${Date.now()}`,
      clientId: selectedClient.id,
      clientName: selectedClient.fullName,
      nic: selectedClient.nic,
      gnDivision: selectedClient.gnDivision,
      referringOfficer: 'Front Desk Officer 01',
      targetOfficerId: selectedOfficer.id,
      targetOfficerName: selectedOfficer.nameEn,
      targetDepartment: selectedOfficer.department,
      urgency,
      status: 'Pending',
      caseSummary: caseSummary.trim(),
      appointmentDate: appointmentDate || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddReferral(newRef);
    setIsModalOpen(false);
    setCaseSummary('');
    setAppointmentDate('');
  };

  const getUrgencyBadge = (urg: Referral['urgency']) => {
    switch (urg) {
      case 'Normal':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Urgent':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Critical':
        return 'bg-red-100 text-red-900 border-red-300 animate-pulse';
    }
  };

  const getStatusBadge = (st: Referral['status']) => {
    switch (st) {
      case 'Pending':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'In Consultation':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Action Plan Agreed':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900 mb-2">
            <Icons.Share2 className="w-3.5 h-3.5 text-indigo-700" />
            <span>Specialist Case Routing</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.referrals.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {t.referrals.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Icons.UserPlus className="w-4 h-4" />
          <span>{t.referrals.assignNewBtn}</span>
        </button>
      </div>

      {/* Pipeline Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t.referrals.tabs.all} ({referrals.length})
        </button>

        <button
          onClick={() => setActiveTab('Pending')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'Pending'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t.referrals.tabs.pending} ({referrals.filter((r) => r.status === 'Pending').length})
        </button>

        <button
          onClick={() => setActiveTab('In Consultation')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'In Consultation'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t.referrals.tabs.inProgress} ({referrals.filter((r) => r.status === 'In Consultation').length})
        </button>

        <button
          onClick={() => setActiveTab('Action Plan Agreed')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'Action Plan Agreed'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t.referrals.tabs.actionAgreed} ({referrals.filter((r) => r.status === 'Action Plan Agreed').length})
        </button>

        <button
          onClick={() => setActiveTab('Resolved')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'Resolved'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t.referrals.tabs.resolved} ({referrals.filter((r) => r.status === 'Resolved').length})
        </button>
      </div>

      {/* Referrals List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        {filteredReferrals.length === 0 ? (
          <EmptyState
            title={t.referrals.emptyTitle}
            description={t.referrals.emptyDesc}
            icon="Share2"
            actionLabel={t.referrals.assignNewBtn}
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">{t.referrals.table.caseId}</th>
                  <th className="py-3 px-3">{t.referrals.table.client}</th>
                  <th className="py-3 px-3">{t.referrals.table.village}</th>
                  <th className="py-3 px-3">{t.referrals.table.targetOfficer}</th>
                  <th className="py-3 px-3">{t.referrals.table.urgency}</th>
                  <th className="py-3 px-3">{t.referrals.table.status}</th>
                  <th className="py-3 px-3">{t.referrals.table.appointment}</th>
                  <th className="py-3 px-3 text-right">{t.referrals.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredReferrals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-900">
                      {r.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-sm">{r.clientName}</div>
                      <div className="text-[11px] font-mono text-slate-600">{r.nic}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{r.caseSummary}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {r.gnDivision}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{r.targetOfficerName}</div>
                      <div className="text-[11px] text-slate-600">{r.targetDepartment}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getUrgencyBadge(r.urgency)}`}>
                        {r.urgency}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {r.appointmentDate || 'Walk-in Today'}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                      {r.status === 'Pending' && (
                        <button
                          onClick={() => onUpdateReferralStatus(r.id, 'In Consultation')}
                          type="button"
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Start Consultation
                        </button>
                      )}
                      {r.status === 'In Consultation' && (
                        <button
                          onClick={() => onUpdateReferralStatus(r.id, 'Resolved')}
                          type="button"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {r.status === 'Resolved' && (
                        <span className="text-emerald-700 font-bold text-xs">✓ Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Route New Referral Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {t.referrals.modalTitle}
                </h3>
                <p className="text-xs text-slate-600">
                  {t.referrals.modalSubtitle}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs">
              {/* Select Client */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t.referrals.clientSelectLabel} <span className="text-red-500">*</span>
                </label>
                {clients.length === 0 ? (
                  <p className="text-red-600 p-2 bg-red-50 rounded-lg">
                    No clients registered yet. Please register a client first.
                  </p>
                ) : (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} - {c.nic} ({c.gnDivision})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Specialist Officer & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.referrals.targetOfficerLabel}
                  </label>
                  <select
                    value={targetOfficerId}
                    onChange={(e) => setTargetOfficerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    {officers.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.referrals.urgencyLabel}
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as Referral['urgency'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    <option value="Normal">{t.urgency.normal}</option>
                    <option value="Urgent">{t.urgency.urgent}</option>
                    <option value="Critical">{t.urgency.critical}</option>
                  </select>
                </div>
              </div>

              {/* Appointment Date */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t.referrals.appointmentDateLabel}
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              {/* Case Summary */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t.referrals.caseSummaryLabel} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={caseSummary}
                  onChange={(e) => setCaseSummary(e.target.value)}
                  placeholder="Detail the dispute, livelihood grant request, or psychosocial assistance needed..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {t.referrals.submitReferral}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
