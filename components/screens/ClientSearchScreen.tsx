'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '../ui/Icons';
import { Visit, GNDivision, Officer, Language, ScreenView } from '@/lib/types';
import { translations } from '@/lib/translations';
import { DEFAULT_GN_DIVISIONS } from '@/lib/constants';
import { EmptyState } from '../ui/EmptyState';

interface ClientSearchScreenProps {
  visits: Visit[];
  onSelectVisit: (visit: Visit) => void;
  onPrintToken: (visit: Visit) => void;
  onQuickDepart: (visitId: string) => void;
  onNavigate: (screen: ScreenView) => void;
  gnDivisions?: GNDivision[];
  officers?: Officer[];
  lang: Language;
}

export const ClientSearchScreen: React.FC<ClientSearchScreenProps> = ({
  visits,
  onSelectVisit,
  onPrintToken,
  onQuickDepart,
  onNavigate,
  gnDivisions = DEFAULT_GN_DIVISIONS,
  lang,
}) => {
  const t = translations[lang];

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGn, setSelectedGn] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Filter logic
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      // 1. Search term match (NIC, Name, Token, Phone)
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        v.clientName.toLowerCase().includes(term) ||
        v.nic.toLowerCase().includes(term) ||
        v.tokenNumber.toLowerCase().includes(term) ||
        (v.whatsappNumber && v.whatsappNumber.includes(term));

      // 2. GN Division match
      const matchesGn = selectedGn === 'ALL' || v.gnDivision === selectedGn;

      // 3. Status match
      const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;

      return matchesSearch && matchesGn && matchesStatus;
    });
  }, [visits, searchTerm, selectedGn, selectedStatus]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGn('ALL');
    setSelectedStatus('ALL');
  };

  const getStatusBadge = (st: Visit['status']) => {
    switch (st) {
      case 'Waiting':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Referred':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 mb-2">
            <Icons.Search className="w-3.5 h-3.5" />
            <span>Ampitiya Client Registry</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.search.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {t.search.subtitle}
          </p>
        </div>

        <button
          onClick={() => onNavigate('register')}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Icons.UserPlus className="w-4 h-4" />
          <span>{t.actions.newClient}</span>
        </button>
      </div>

      {/* Multi-Criteria Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Primary Search Input (5 cols) */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icons.Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search.searchPlaceholder}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          {/* GN Division Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedGn}
              onChange={(e) => setSelectedGn(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">{lang === 'si' ? 'සියලු ග්‍රාම නිලධාරී වසම්' : 'All GN Divisions'}</option>
              {gnDivisions.map((gn) => (
                <option key={gn.id} value={gn.nameEn}>
                  {lang === 'si' ? gn.nameSi : gn.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">{t.status.all}</option>
              <option value="Waiting">{t.status.waiting}</option>
              <option value="In Progress">{t.status.inProgress}</option>
              <option value="Referred">{t.status.referred}</option>
              <option value="Completed">{t.status.completed}</option>
            </select>
          </div>

          {/* Reset Filters (2 cols) */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              onClick={handleClearFilters}
              type="button"
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Icons.RefreshCw className="w-3.5 h-3.5" />
              <span>{t.actions.clearFilters}</span>
            </button>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span>
            {t.search.resultsFound}: <strong className="text-slate-900 font-bold">{filteredVisits.length}</strong>
          </span>
          {(searchTerm || selectedGn !== 'ALL' || selectedStatus !== 'ALL') && (
            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {lang === 'si' ? 'පෙරහන් යොදා ඇත' : 'Filters Active'}
            </span>
          )}
        </div>
      </div>

      {/* Results Table / Empty States */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        {visits.length === 0 ? (
          <EmptyState
            title={t.search.emptyDbTitle}
            description={t.search.emptyDbDesc}
            icon="Users"
            actionLabel={t.actions.newClient}
            onAction={() => onNavigate('register')}
          />
        ) : filteredVisits.length === 0 ? (
          <EmptyState
            title={t.search.noResultsTitle}
            description={t.search.noResultsDesc}
            icon="Search"
            secondaryActionLabel={t.actions.clearFilters}
            onSecondaryAction={handleClearFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">{t.search.table.token}</th>
                  <th className="py-3 px-3">{t.search.table.clientName}</th>
                  <th className="py-3 px-3">{t.search.table.gnDivision}</th>
                  <th className="py-3 px-3">{t.search.table.visitReason}</th>
                  <th className="py-3 px-3">{t.search.table.time}</th>
                  <th className="py-3 px-3">{t.search.table.officer}</th>
                  <th className="py-3 px-3">{t.search.table.status}</th>
                  <th className="py-3 px-3 text-right">{t.search.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Token Number */}
                    <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {v.tokenNumber}
                    </td>

                    {/* Client Name & NIC */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-sm">{v.clientName}</div>
                      <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                        <span>{v.nic}</span>
                        {v.whatsappNumber && (
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            • <Icons.MessageCircle className="w-3 h-3 inline" /> {v.whatsappNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* GN Division */}
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-medium">
                      {v.gnDivision}
                    </td>

                    {/* Visit Reason */}
                    <td className="py-3 px-3 text-slate-800 max-w-xs truncate">
                      {v.visitReason}
                    </td>

                    {/* Arrival & Departure Time */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      <div>Arr: <strong className="text-slate-800">{v.arrivalTime}</strong></div>
                      {v.departureTime ? (
                        <div className="text-[11px] text-emerald-800">Dep: {v.departureTime}</div>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold">In Premise</span>
                      )}
                    </td>

                    {/* Referral Officer */}
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {v.referralOfficerName}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => onSelectVisit(v)}
                        type="button"
                        className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        title={t.actions.viewDetails}
                      >
                        <Icons.Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onPrintToken(v)}
                        type="button"
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title={t.actions.printToken}
                      >
                        <Icons.Printer className="w-4 h-4" />
                      </button>

                      {!v.departureTime && (
                        <button
                          onClick={() => onQuickDepart(v.id)}
                          type="button"
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          title="Record Client Departure Time"
                        >
                          {lang === 'si' ? 'පිටවීම' : 'Depart'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
