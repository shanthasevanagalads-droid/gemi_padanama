'use client';

import React from 'react';
import { Icons } from '../ui/Icons';
import { Visit, Language, ScreenView } from '@/lib/types';
import { translations } from '@/lib/translations';
import { EmptyState } from '../ui/EmptyState';
import { announceToken } from '@/lib/voice-announcer';

interface DashboardScreenProps {
  visits: Visit[];
  onNavigate: (screen: ScreenView) => void;
  onSelectVisit: (visit: Visit) => void;
  onPrintToken: (visit: Visit) => void;
  onUpdateStatus: (visitId: string, status: Visit['status']) => void;
  onOpenBroadcast?: () => void;
  lang: Language;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  visits,
  onNavigate,
  onSelectVisit,
  onPrintToken,
  onUpdateStatus,
  onOpenBroadcast,
  lang,
}) => {
  const t = translations[lang];

  // Calculate live dynamic metrics from actual visits (No dummy numbers!)
  const totalCount = visits.length;
  const waitingCount = visits.filter((v) => v.status === 'Waiting').length;
  const inProgressCount = visits.filter((v) => v.status === 'In Progress').length;
  const referredCount = visits.filter((v) => v.status === 'Referred').length;
  const completedCount = visits.filter((v) => v.status === 'Completed').length;

  // Active serving token
  const nowServing = visits.find((v) => v.status === 'In Progress') || visits.find((v) => v.status === 'Waiting');
  const nextInLine = visits.filter((v) => v.status === 'Waiting')[1];

  const statCards = [
    {
      title: t.dashboard.stats.totalToday,
      count: totalCount,
      icon: Icons.Users,
      bg: 'bg-blue-50/80',
      border: 'border-blue-200',
      text: 'text-blue-900',
      iconColor: 'text-blue-700',
      sub: lang === 'si' ? 'අද දින පැමිණි' : 'Walk-in registrations',
    },
    {
      title: t.dashboard.stats.waiting,
      count: waitingCount,
      icon: Icons.Clock,
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
      text: 'text-amber-900',
      iconColor: 'text-amber-700',
      sub: lang === 'si' ? 'ආලින්දයේ රැඳී සිටින' : 'Currently in lounge',
    },
    {
      title: t.dashboard.stats.inConsultation,
      count: inProgressCount,
      icon: Icons.FileText,
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      iconColor: 'text-emerald-700',
      sub: lang === 'si' ? 'මේස සාකච්ඡා' : 'Active desks',
    },
    {
      title: t.dashboard.stats.referred,
      count: referredCount,
      icon: Icons.Share2,
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      iconColor: 'text-indigo-700',
      sub: lang === 'si' ? 'විශේෂඥ යොමු' : 'Specialist cases',
    },
    {
      title: t.dashboard.stats.completed,
      count: completedCount,
      icon: Icons.CheckCircle,
      bg: 'bg-slate-50/80',
      border: 'border-slate-200',
      text: 'text-slate-900',
      iconColor: 'text-slate-600',
      sub: lang === 'si' ? 'සේවා අවසන් කළ' : 'Successfully served',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Welcome & Shift Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold text-emerald-300 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t.dashboard.shift}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t.dashboard.title}
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              {t.dashboard.subtitle}
            </p>
          </div>

          {/* Quick Registration Primary Call-to-Action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('register')}
              type="button"
              className="inline-flex items-center gap-2.5 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Icons.UserPlus className="w-5 h-5 text-slate-950" />
              <span>{t.actions.newClient}</span>
            </button>

            <button
              onClick={() => onNavigate('search')}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm rounded-2xl backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Icons.Search className="w-4 h-4" />
              <span>{t.actions.search}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Dynamic Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`p-4 md:p-5 rounded-2xl border ${card.bg} ${card.border} transition-all hover:shadow-xs`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 truncate max-w-[80%]">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-white shadow-2xs ${card.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl md:text-3xl font-extrabold ${card.text}`}>
                {card.count}
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Middle Section: Queue Monitor & Quick Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Queue Monitor Widget */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-900">
                {t.dashboard.queueMonitorTitle}
              </h3>
            </div>
            <span className="text-[11px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
              Ampitiya Desk 01
            </span>
          </div>

          {nowServing ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  {t.dashboard.nowServing}
                </span>
                <div className="text-3xl font-mono font-extrabold text-blue-900">
                  {nowServing.tokenNumber}
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  {nowServing.clientName}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {nowServing.visitReason}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => onUpdateStatus(nowServing.id, 'Completed')}
                    type="button"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    {lang === 'si' ? 'අවසන් කරන්න' : 'Mark Completed'}
                  </button>
                  <button
                    onClick={() => announceToken({
                      tokenNumber: nowServing.tokenNumber,
                      counterRoom: 'Desk 01 - Front Office',
                      lang: lang === 'si' ? 'si' : 'en',
                    })}
                    type="button"
                    className="px-3 py-1.5 bg-blue-50 border border-blue-300 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                    title="Audio Broadcast Token to Waiting Lounge"
                  >
                    <span>🔊</span>
                    <span>{lang === 'si' ? 'හඬින් කැඳවන්න' : 'Voice Call'}</span>
                  </button>
                  <button
                    onClick={() => onPrintToken(nowServing)}
                    type="button"
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {t.actions.printToken}
                  </button>
                </div>
              </div>

              {nextInLine && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">
                      {t.dashboard.nextInLine}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {nextInLine.tokenNumber} - {nextInLine.clientName}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">
                    {t.status.waiting}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
              <Icons.Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                {lang === 'si' ? 'පෝලිම හිස්ව පවතී' : 'Queue Currently Clear'}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 max-w-xs mx-auto">
                {t.dashboard.emptyQueueNotice}
              </p>
            </div>
          )}
        </div>

        {/* Front Office Quick Launchpad Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              {t.dashboard.quickActionsTitle}
            </h3>
            <span className="text-xs text-slate-600">
              Front Desk Shortcuts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('register')}
              type="button"
              className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-all text-left flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-blue-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Icons.UserPlus className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-blue-950 block">
                  {lang === 'si' ? 'නව සේවාලාභී ලියාපදිංචිය' : 'Register New Walk-in'}
                </span>
                <span className="text-xs text-slate-600 mt-0.5 block">
                  {lang === 'si' ? 'තොරතුරු ලබාගෙන ටෝකනයක් නිකුත් කරන්න' : 'Intake form, NIC check & instant token slip'}
                </span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('search')}
              type="button"
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-all text-left flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Icons.Search className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-emerald-950 block">
                  {lang === 'si' ? 'හැඳුනුම්පත් සෙවුම' : 'Quick NIC / Directory Search'}
                </span>
                <span className="text-xs text-slate-600 mt-0.5 block">
                  {lang === 'si' ? 'පෙර පැමිණි තොරතුරු සහ වාර්තා බලන්න' : 'Lookup past records, visits and referrals'}
                </span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('referrals')}
              type="button"
              className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 transition-all text-left flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-indigo-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Icons.Share2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-indigo-950 block">
                  {lang === 'si' ? 'විශේෂඥ නිලධාරී යොමුකිරීම්' : 'Specialist Referrals'}
                </span>
                <span className="text-xs text-slate-600 mt-0.5 block">
                  {lang === 'si' ? 'නීති හා සුභසාධන නිලධාරීන්ට පැවරීම' : 'Assign complex cases to counselors'}
                </span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              type="button"
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-left flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-slate-800 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Icons.BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">
                  {lang === 'si' ? 'දෛනික වාර්තා සහ සාරාංශ' : 'Daily Operations Report'}
                </span>
                <span className="text-xs text-slate-600 mt-0.5 block">
                  {lang === 'si' ? 'අද දින පැමිණීම් ලැයිස්තුව මුද්‍රණය කරන්න' : 'Print attendance log & GN breakdown'}
                </span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('services')}
              type="button"
              className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/60 transition-all text-left flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-teal-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Icons.Building className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-teal-950 block">
                  {lang === 'si' ? 'රාජ්‍ය ආධාර මඟපෙන්වීම' : 'Citizen Aid Navigator'}
                </span>
                <span className="text-xs text-slate-600 mt-0.5 block">
                  {lang === 'si' ? 'අස්වැසුම, සහතික හා නීති ආධාර ලේඛන' : 'Aswesuma, GN certificates & legal checklists'}
                </span>
              </div>
            </button>

            {onOpenBroadcast && (
              <button
                onClick={onOpenBroadcast}
                type="button"
                className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all text-left flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Icons.MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-emerald-950 block">
                    {lang === 'si' ? 'ප්‍රජා පණිවිඩ විකාශය' : 'GN Village Broadcast'}
                  </span>
                  <span className="text-xs text-slate-600 mt-0.5 block">
                    {lang === 'si' ? 'සායන හා සහනාධාර දැනුම්දීම් යැවීම' : 'Dispatch clinic and relief SMS/WhatsApp alerts'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Walk-in Registrations (Today) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.dashboard.recentRegistrationsTitle}
            </h3>
            <p className="text-xs text-slate-600">
              {lang === 'si' ? 'අද දින පෙරමුණු මේසයෙන් ලියාපදිංචි කළ සේවාලාභීන්' : 'Live intake log for Ampitiya Sub-Office'}
            </p>
          </div>

          {visits.length > 0 && (
            <button
              onClick={() => onNavigate('search')}
              type="button"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'si' ? 'සියලු වාර්තා බලන්න' : 'View Full Directory'}</span>
              <Icons.ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {visits.length === 0 ? (
          <EmptyState
            title={t.dashboard.noRegistrationsToday}
            description={t.dashboard.emptyQueueNotice}
            icon="UserPlus"
            actionLabel={t.dashboard.registerFirstClient}
            onAction={() => onNavigate('register')}
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
                {visits.slice(0, 10).map((v) => {
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
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {v.tokenNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm">{v.clientName}</div>
                        <div className="text-[11px] font-mono text-slate-600">{v.nic}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {v.gnDivision}
                      </td>
                      <td className="py-3 px-3 text-slate-800 max-w-xs truncate">
                        {v.visitReason}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        <span>{v.arrivalTime}</span>
                        {v.departureTime && (
                          <span className="block text-[11px] text-slate-600">
                            Dep: {v.departureTime}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {v.referralOfficerName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            v.status
                          )}`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => onPrintToken(v)}
                          type="button"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title={t.actions.printToken}
                        >
                          <Icons.Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectVisit(v)}
                          type="button"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title={t.actions.viewDetails}
                        >
                          <Icons.Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
