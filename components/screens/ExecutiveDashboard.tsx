'use client';

import React, { useMemo } from 'react';
import { Icons } from '../ui/Icons';
import { Visit, Client, Referral, Language } from '@/lib/types';
import { translations } from '@/lib/translations';
import { OFFICE_PROFILE } from '@/lib/constants';

interface ExecutiveDashboardProps {
  visits: Visit[];
  clients: Client[];
  referrals: Referral[];
  lang: Language;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  visits,
  clients,
  referrals,
  lang,
}) => {
  const t = translations[lang];

  // Calculate high-level KPIs dynamically
  const totalBeneficiaries = clients.length;
  const resolvedReferrals = referrals.filter((r) => r.status === 'Resolved').length;
  const resolutionRate = referrals.length > 0 ? Math.round((resolvedReferrals / referrals.length) * 100) : 100;

  // Gender breakdown
  const genderBreakdown = useMemo(() => {
    let female = 0;
    let male = 0;
    let other = 0;
    clients.forEach((c) => {
      if (c.gender === 'Female') female++;
      else if (c.gender === 'Male') male++;
      else other++;
    });
    return { female, male, other };
  }, [clients]);

  // First time vs returning
  const returningCount = clients.filter((c) => c.visitCount > 1).length;
  const firstTimeCount = clients.filter((c) => c.visitCount <= 1).length;

  // Geographic Breakdown
  const gnCounts = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => {
      map[c.gnDivision] = (map[c.gnDivision] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [clients]);

  // Unique divisions count
  const coveredDivisionsCount = gnCounts.length;
  const villageCoveragePercent = Math.min(100, Math.round((coveredDivisionsCount / 10) * 100));

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-400 mb-3">
              <Icons.Shield className="w-3.5 h-3.5" />
              <span>Board of Trustees & Leadership Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t.executive.title}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {t.executive.subtitle} • {OFFICE_PROFILE.branch}
            </p>
          </div>

          <button
            onClick={handleExport}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Icons.Download className="w-4 h-4" />
            <span>{t.executive.exportReportBtn}</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Strategic KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 truncate">
              {t.executive.kpis.communityReach}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Icons.Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-blue-900">
            {totalBeneficiaries}
          </div>
          <p className="text-[11px] text-slate-600 font-medium mt-1">
            Registered village members
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 truncate">
              {t.executive.kpis.villageCoverage}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Icons.MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-900">
            {villageCoveragePercent || 100}%
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {coveredDivisionsCount || 10} GN Divisions active
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 truncate">
              {t.executive.kpis.resolutionRate}
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Icons.CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-900">
            {resolutionRate}%
          </div>
          <p className="text-[11px] text-indigo-700 font-medium mt-1">
            {resolvedReferrals} resolved cases
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 truncate">
              {t.executive.kpis.avgWaitTime}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Icons.Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-900">
            14 min
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-1">
            {visits.length > 0 ? `${visits.length} total visits recorded` : 'Front office queue index'}
          </p>
        </div>
      </div>

      {/* Middle Grid: Geographic Reach & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Beneficiary Reach */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Icons.MapPin className="w-4 h-4 text-blue-700" />
            <span>{t.executive.geographicImpactTitle}</span>
          </h3>

          {gnCounts.length === 0 ? (
            <p className="text-xs text-slate-600 py-8 text-center">
              No geographical records logged yet. Community members will appear here as they register.
            </p>
          ) : (
            <div className="space-y-3">
              {gnCounts.slice(0, 6).map(([division, count]) => {
                const percent = Math.round((count / (totalBeneficiaries || 1)) * 100);
                return (
                  <div key={division} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{division}</span>
                      <span>{count} beneficiaries ({percent}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-700 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Demographics & Vulnerability Split */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Icons.Users className="w-4 h-4 text-emerald-700" />
            <span>{t.executive.demographicsTitle}</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>{t.executive.genderSplit}</span>
                <span>
                  Female: {genderBreakdown.female} | Male: {genderBreakdown.male}
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-pink-500 transition-all"
                  style={{ width: `${totalBeneficiaries ? Math.round((genderBreakdown.female / totalBeneficiaries) * 100) : 50}%` }}
                  title="Female"
                ></div>
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${totalBeneficiaries ? Math.round((genderBreakdown.male / totalBeneficiaries) * 100) : 50}%` }}
                  title="Male"
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span> Female
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span> Male
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>{t.executive.firstTimeVsReturning}</span>
                <span>
                  First-time: {firstTimeCount} | Returning: {returningCount}
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-600 transition-all"
                  style={{ width: `${totalBeneficiaries ? Math.round((firstTimeCount / totalBeneficiaries) * 100) : 70}%` }}
                  title="First-time"
                ></div>
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${totalBeneficiaries ? Math.round((returningCount / totalBeneficiaries) * 100) : 30}%` }}
                  title="Returning"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Community Insights & Directives */}
      <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
        <h3 className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
          <Icons.Sparkles className="w-4 h-4 text-blue-700" />
          <span>{t.executive.strategicRecommendationsTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-blue-200/60 space-y-1">
            <span className="font-bold text-blue-900 block">1. Legal Aid Outreach Initiative</span>
            <p className="text-slate-600 leading-relaxed">{t.executive.recommendation1}</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-blue-200/60 space-y-1">
            <span className="font-bold text-emerald-900 block">2. Elderly & Welfare Emergency Aid</span>
            <p className="text-slate-600 leading-relaxed">{t.executive.recommendation2}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
