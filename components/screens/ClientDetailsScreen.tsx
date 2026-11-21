'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { Client, Visit, Referral, Language, ScreenView } from '@/lib/types';
import { translations } from '@/lib/translations';
import { EmptyState } from '../ui/EmptyState';

interface ClientDetailsScreenProps {
  client: Client | null;
  visits: Visit[];
  referrals: Referral[];
  onNavigate: (screen: ScreenView) => void;
  onPrintDossier?: () => void;
  onNewVisitForClient: (client: Client) => void;
  onReferClient: (client: Client) => void;
  lang: Language;
}

export const ClientDetailsScreen: React.FC<ClientDetailsScreenProps> = ({
  client,
  visits,
  referrals,
  onNavigate,
  onPrintDossier,
  onNewVisitForClient,
  onReferClient,
  lang,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'referrals' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
          <h1 className="text-xl font-bold text-slate-900">{t.details.title}</h1>
          <p className="text-xs text-slate-600 mt-1">{t.details.subtitle}</p>
        </div>
        <EmptyState
          title={lang === 'si' ? 'සේවාලාභියෙකු තෝරාගෙන නොමැත' : 'No Client Selected'}
          description={t.details.noClientSelected}
          icon="Users"
          actionLabel={lang === 'si' ? 'සේවාලාභී නාමාවලිය වෙත' : 'Go to Client Search'}
          onAction={() => onNavigate('search')}
        />
      </div>
    );
  }

  // Filter visits and referrals specifically for this client
  const clientVisits = visits.filter((v) => v.clientId === client.id || v.nic === client.nic);
  const clientReferrals = referrals.filter((r) => r.clientId === client.id || r.nic === client.nic);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavedNotes([newNote.trim(), ...savedNotes]);
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('search')}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Icons.ChevronRight className="w-4 h-4 rotate-180" />
          <span>{t.details.backToSearch}</span>
        </button>

        <div className="flex items-center gap-2">
          {onPrintDossier && (
            <button
              onClick={onPrintDossier}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Icons.Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang === 'si' ? 'මුද්‍රණය' : 'Print Dossier'}</span>
            </button>
          )}

          <button
            onClick={() => onReferClient(client)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Icons.Share2 className="w-3.5 h-3.5 text-indigo-700" />
            <span>{t.actions.referClient}</span>
          </button>

          <button
            onClick={() => onNewVisitForClient(client)}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Icons.UserPlus className="w-3.5 h-3.5" />
            <span>{t.details.createVisitBtn}</span>
          </button>
        </div>
      </div>

      {/* Client Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-slate-900 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
              {client.fullName.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {client.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {client.gender}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {client.gnDivision}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                <span className="font-mono font-bold text-slate-800">
                  NIC: {client.nic}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Icons.MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {client.address || 'Ampitiya, Kandy'}
                </span>
                {client.whatsappNumber && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <Icons.MessageCircle className="w-3.5 h-3.5" />
                      {client.whatsappNumber}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">
                {t.details.totalVisits}
              </span>
              <span className="text-2xl font-extrabold text-blue-900">
                {clientVisits.length || client.visitCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t.details.overviewTab}
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{t.details.visitsTab}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {clientVisits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'referrals'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{t.details.referralsTab}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {clientReferrals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t.details.notesTab}
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              {t.details.bioDataTitle}
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">{t.register.fields.fullName}:</span>
                <span className="font-bold text-slate-900">{client.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">{t.register.fields.nic}:</span>
                <span className="font-mono font-bold text-slate-900">{client.nic}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">{t.register.fields.gender}:</span>
                <span className="font-semibold text-slate-800">{client.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">{t.register.fields.gnDivision}:</span>
                <span className="font-semibold text-slate-800">{client.gnDivision}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">{t.register.fields.whatsappNumber}:</span>
                <span className="font-semibold text-emerald-700">{client.whatsappNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">{t.register.fields.address}:</span>
                <span className="font-semibold text-slate-800 text-right max-w-xs">{client.address || 'Ampitiya, Kandy'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              {t.details.visitStatisticsTitle}
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">{t.details.totalVisits}:</span>
                <span className="font-bold text-blue-900">{clientVisits.length || client.visitCount} visits</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">{t.details.firstVisit}:</span>
                <span className="font-semibold text-slate-800">{client.firstVisitDate || '2026-11-19'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">{t.details.lastVisit}:</span>
                <span className="font-semibold text-slate-800">{client.lastVisitDate || '2026-11-19'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Case Routing Status:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active Community Member
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chronological Visit History Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            {t.details.timelineTitle}
          </h3>

          {clientVisits.length === 0 ? (
            <p className="text-xs text-slate-600 py-6 text-center">
              {t.details.noVisitsRecorded}
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {clientVisits.map((v) => (
                <div key={v.id} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-700 ring-4 ring-white"></div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-900 text-sm">
                        {v.tokenNumber}
                      </span>
                      <span className="text-slate-600 font-semibold">
                        {v.visitDate} • {v.arrivalTime}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm">
                      {v.visitReason}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-slate-600 pt-1 border-t border-slate-200/60">
                      <span>Officer: <strong className="text-slate-800">{v.referralOfficerName}</strong></span>
                      <span>•</span>
                      <span>Status: <strong className="text-emerald-700">{v.status}</strong></span>
                      {v.departureTime && (
                        <>
                          <span>•</span>
                          <span>{t.details.departureRecorded}: <strong className="text-slate-800">{v.departureTime}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Referrals */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Specialist Referrals for {client.fullName}
            </h3>
            <button
              onClick={() => onReferClient(client)}
              type="button"
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              + Create Referral
            </button>
          </div>

          {clientReferrals.length === 0 ? (
            <p className="text-xs text-slate-600 py-6 text-center">
              No active specialist referrals opened for this client yet.
            </p>
          ) : (
            <div className="space-y-3">
              {clientReferrals.map((ref) => (
                <div key={ref.id} className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 text-sm">{ref.targetDepartment}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {ref.urgency}
                    </span>
                  </div>
                  <p className="text-slate-700">{ref.caseSummary}</p>
                  <div className="text-slate-600 pt-1 text-[11px] flex justify-between">
                    <span>Assigned to: <strong>{ref.targetOfficerName}</strong></span>
                    <span>Status: <strong>{ref.status}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Confidential Case Notes */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            {t.details.addCaseNoteBtn}
          </h3>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter confidential observation, submitted documents or legal/social summary..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Confidential Note
            </button>
          </form>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Recorded Notes</h4>
            {savedNotes.length === 0 ? (
              <p className="text-xs text-slate-600">No notes recorded yet for this client dossier.</p>
            ) : (
              savedNotes.map((nt, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                  <p>{nt}</p>
                  <span className="text-[10px] text-slate-600 block mt-1">Logged by Front Desk Officer</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
