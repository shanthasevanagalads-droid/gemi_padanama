'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { GNDivision, Officer, Language } from '@/lib/types';
import { translations } from '@/lib/translations';
import { OFFICE_PROFILE } from '@/lib/constants';
import { getDatabaseStatus, isSupabaseConfigured } from '@/lib/supabase-client';

interface SettingsScreenProps {
  gnDivisions: GNDivision[];
  onAddGnDivision: (gn: GNDivision) => void;
  officers: Officer[];
  onAddOfficer: (off: Officer) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  gnDivisions,
  onAddGnDivision,
  officers,
  onAddOfficer,
  lang,
  onLanguageChange,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'office' | 'bilingual' | 'gn' | 'officers' | 'database'>('database');
  const [copied, setCopied] = useState(false);

  // New GN Division Form
  const [newGnCode, setNewGnCode] = useState('');
  const [newGnEn, setNewGnEn] = useState('');
  const [newGnSi, setNewGnSi] = useState('');

  // New Officer Form
  const [newOffNameEn, setNewOffNameEn] = useState('');
  const [newOffNameSi, setNewOffNameSi] = useState('');
  const [newOffDesigEn, setNewOffDesigEn] = useState('');
  const newOffDept = 'Legal Aid & Mediation';
  const [newOffRoom, setNewOffRoom] = useState('Desk 06 - Consultation');
  const [isDbLive] = useState(() => isSupabaseConfigured());

  const dbStatus = getDatabaseStatus();

  const handleCreateGn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGnEn.trim()) return;

    const newDivision: GNDivision = {
      id: `gn-${Date.now()}`,
      code: newGnCode.trim() || `KD-${Math.floor(100 + Math.random() * 900)}`,
      nameEn: newGnEn.trim(),
      nameSi: newGnSi.trim() || newGnEn.trim(),
      subArea: 'Ampitiya Perimeter',
    };

    onAddGnDivision(newDivision);
    setNewGnCode('');
    setNewGnEn('');
    setNewGnSi('');
  };

  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffNameEn.trim()) return;

    const newOff: Officer = {
      id: `off-${Date.now()}`,
      nameEn: newOffNameEn.trim(),
      nameSi: newOffNameSi.trim() || newOffNameEn.trim(),
      designationEn: newOffDesigEn.trim() || 'Community Officer',
      designationSi: 'ප්‍රජා නිලධාරී',
      department: newOffDept,
      counterRoom: newOffRoom,
      contactNumber: '+94 81 224 5890',
      active: true,
    };

    onAddOfficer(newOff);
    setNewOffNameEn('');
    setNewOffNameSi('');
    setNewOffDesigEn('');
  };

  const handleCopySql = () => {
    const sqlText = `-- ====================================================================
-- GAMI PADANAMA (ගැමි පදනම) - PRODUCTION SUPABASE DDL
-- Sub-Office: Ampitiya, Kandy District, Sri Lanka
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE public.visit_status AS ENUM ('Waiting', 'In Progress', 'Referred', 'Completed', 'Cancelled');
CREATE TYPE public.referral_urgency AS ENUM ('Normal', 'Urgent', 'Critical');
CREATE TYPE public.referral_status AS ENUM ('Pending', 'In Consultation', 'Action Plan Agreed', 'Resolved', 'Closed');

-- 1. GN Divisions Table
CREATE TABLE public.gn_divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_si VARCHAR(100) NOT NULL,
    sub_area VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Officers Table
CREATE TABLE public.officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(150) NOT NULL,
    name_si VARCHAR(150) NOT NULL,
    designation_en VARCHAR(150) NOT NULL,
    designation_si VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    counter_room VARCHAR(100) NOT NULL,
    contact_number VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clients Table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nic VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    gn_division_id UUID REFERENCES public.gn_divisions(id),
    gn_division_name VARCHAR(100) NOT NULL,
    whatsapp_number VARCHAR(30) NOT NULL,
    visit_count INT DEFAULT 1 NOT NULL,
    first_visit_date DATE DEFAULT CURRENT_DATE,
    last_visit_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Visits Table
CREATE TABLE public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    token_number VARCHAR(30) UNIQUE NOT NULL,
    token_sequence INT NOT NULL,
    visit_date DATE DEFAULT CURRENT_DATE NOT NULL,
    arrival_time TIME NOT NULL,
    departure_time TIME,
    visit_reason VARCHAR(255) NOT NULL,
    visit_count_snapshot INT DEFAULT 1,
    status public.visit_status DEFAULT 'Waiting',
    whatsapp_number VARCHAR(30),
    referral_officer_id UUID REFERENCES public.officers(id),
    referral_officer_name VARCHAR(150),
    gn_division_name VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'Normal',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Referrals Table
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code VARCHAR(30) UNIQUE NOT NULL,
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    referring_officer_name VARCHAR(150) NOT NULL,
    target_officer_id UUID REFERENCES public.officers(id),
    target_officer_name VARCHAR(150) NOT NULL,
    target_department VARCHAR(100) NOT NULL,
    urgency public.referral_urgency DEFAULT 'Normal',
    status public.referral_status DEFAULT 'Pending',
    case_summary TEXT NOT NULL,
    appointment_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audit Logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 mb-2">
          <Icons.Settings className="w-3.5 h-3.5" />
          <span>Ampitiya Office Administration</span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          {t.settings.title}
        </h1>
        <p className="text-xs md:text-sm text-slate-600 mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('database')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'database'
            ? 'bg-emerald-700 text-white shadow-xs'
            : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100'
            }`}
        >
          <span className={`w-2 h-2 rounded-full ${isDbLive ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-600'}`}></span>
          <span>{t.settings.tabs.database}</span>
        </button>

        <button
          onClick={() => setActiveTab('office')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'office'
            ? 'bg-blue-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          {t.settings.tabs.office}
        </button>

        <button
          onClick={() => setActiveTab('bilingual')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'bilingual'
            ? 'bg-blue-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          {t.settings.tabs.bilingual}
        </button>

        <button
          onClick={() => setActiveTab('gn')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'gn'
            ? 'bg-blue-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          {t.settings.tabs.gnDivisions} ({gnDivisions.length})
        </button>

        <button
          onClick={() => setActiveTab('officers')}
          type="button"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'officers'
            ? 'bg-blue-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          {t.settings.tabs.officers} ({officers.length})
        </button>
      </div>

      {/* Tab Content: Supabase Database Architecture Hub */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isDbLive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'}`}></span>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {t.settings.databaseTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {t.settings.databaseDesc}
              </p>
            </div>

            <button
              onClick={handleCopySql}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Icons.Copy className="w-4 h-4" />
              <span>{copied ? t.actions.copied : t.actions.copySql}</span>
            </button>
          </div>

          {/* Engine Status Banner */}
          <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs border ${isDbLive ? 'bg-emerald-50/80 border-emerald-300' : 'bg-blue-50/80 border-blue-200'
            }`}>
            <Icons.CheckCircle className={`w-5 h-5 shrink-0 ${isDbLive ? 'text-emerald-700' : 'text-blue-700'}`} />
            <div>
              <strong className="text-slate-900 font-bold block">{dbStatus.message}</strong>
              <p className="text-slate-600 mt-0.5">
                Target Node: <strong className="font-mono text-slate-800">{dbStatus.nodeName}</strong>
              </p>
              {!isDbLive && (
                <p className="text-[11px] text-blue-900 mt-1 font-medium">
                  Tip: Copy <code>.env.example</code> to <code>.env.local</code> and provide your Supabase URL and Anon Key to activate live cloud synchronization.
                </p>
              )}
            </div>
          </div>

          {/* 3 Step Setup Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-[10px] flex items-center justify-center">1</span>
              <strong className="font-bold text-slate-900 block pt-1">Create Supabase Project</strong>
              <p className="text-slate-600 text-[11px]">Create a new project on supabase.com in the Singapore/Mumbai region for Sri Lanka.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center">2</span>
              <strong className="font-bold text-slate-900 block pt-1">Execute SQL Schema</strong>
              <p className="text-slate-600 text-[11px]">Copy the DDL schema above and run it in the Supabase SQL Editor to generate tables, triggers & RLS.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">3</span>
              <strong className="font-bold text-slate-900 block pt-1">Set Credentials</strong>
              <p className="text-slate-600 text-[11px]">Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs font-mono overflow-x-auto space-y-2">
            <div className="text-emerald-400 font-bold">{"// Supabase DDL SQL Schema Preview (lib/supabase-schema.sql)"}</div>
            <pre className="text-[11px] leading-relaxed text-slate-300">
              {`-- Execute in Supabase SQL Editor:
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  nic VARCHAR(20) UNIQUE NOT NULL,
  gender VARCHAR(20),
  gn_division_name VARCHAR(100) NOT NULL,
  whatsapp_number VARCHAR(30),
  visit_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  token_number VARCHAR(30) NOT NULL,
  visit_reason VARCHAR(255) NOT NULL,
  visit_date DATE DEFAULT CURRENT_DATE,
  arrival_time TIME NOT NULL,
  departure_time TIME,
  status VARCHAR(30) DEFAULT 'Waiting',
  referral_officer_name VARCHAR(150),
  gn_division_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab Content: Office Profile */}
      {activeTab === 'office' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center">
              <Icons.Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {OFFICE_PROFILE.nameEn}
              </h3>
              <p className="text-xs text-slate-600">{OFFICE_PROFILE.nameSi}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 block font-bold uppercase">{t.settings.ngoRegNumber}</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{OFFICE_PROFILE.ngoRegistrationNumber}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 block font-bold uppercase">Branch Station</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{OFFICE_PROFILE.branch} • {OFFICE_PROFILE.district}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 block font-bold uppercase">Official Address</span>
              <span className="font-medium text-slate-900 mt-0.5 block">{OFFICE_PROFILE.addressEn}</span>
              <span className="text-[11px] text-slate-600 block mt-0.5">{OFFICE_PROFILE.addressSi}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 block font-bold uppercase">Hotlines & Working Hours</span>
              <span className="font-bold text-blue-800 block mt-0.5">{OFFICE_PROFILE.hotline}</span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">WhatsApp: {OFFICE_PROFILE.whatsappSupport}</span>
              <span className="text-[11px] text-slate-600 block mt-0.5">{OFFICE_PROFILE.workingHours}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Bilingual Settings */}
      {activeTab === 'bilingual' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{t.settings.bilingualTitle}</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">{t.settings.bilingualDesc}</p>
          </div>

          <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-900 block">{t.settings.defaultLanguage}</span>
              <span className="text-xs text-slate-600 mt-0.5 block">
                {lang === 'si' ? 'වත්මන් භාෂාව: සිංහල (Sinhala)' : 'Current Language: English'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onLanguageChange('en')}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${lang === 'en'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300'
                  }`}
              >
                English (Default)
              </button>
              <button
                onClick={() => onLanguageChange('si')}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${lang === 'si'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300'
                  }`}
              >
                සිංහල (Sinhala)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: GN Division Master */}
      {activeTab === 'gn' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t.settings.gnMasterTitle}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{t.settings.gnMasterDesc}</p>
            </div>
          </div>

          {/* Quick Add GN Division */}
          <form onSubmit={handleCreateGn} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t.settings.addGnBtn}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                value={newGnCode}
                onChange={(e) => setNewGnCode(e.target.value)}
                placeholder="Code (e.g. KD-521)"
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                required
                value={newGnEn}
                onChange={(e) => setNewGnEn(e.target.value)}
                placeholder="Division Name (English)"
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl sm:col-span-2"
              />
              <input
                type="text"
                value={newGnSi}
                onChange={(e) => setNewGnSi(e.target.value)}
                placeholder="වසමේ නම (සිංහල)"
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                + Add Division
              </button>
            </div>
          </form>

          {/* Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Division Code</th>
                  <th className="py-2.5 px-3">Name (English)</th>
                  <th className="py-2.5 px-3">නම (සිංහල)</th>
                  <th className="py-2.5 px-3">Sector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {gnDivisions.map((gn) => (
                  <tr key={gn.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{gn.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{gn.nameEn}</td>
                    <td className="py-2.5 px-3 text-slate-700">{gn.nameSi}</td>
                    <td className="py-2.5 px-3 text-slate-600">{gn.subArea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Officer Directory */}
      {activeTab === 'officers' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t.settings.officerMasterTitle}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{t.settings.officerMasterDesc}</p>
            </div>
          </div>

          {/* Quick Add Officer */}
          <form onSubmit={handleCreateOfficer} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t.settings.addOfficerBtn}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                value={newOffNameEn}
                onChange={(e) => setNewOffNameEn(e.target.value)}
                placeholder="Officer Name (e.g. Mr. S. Wickramasinghe)"
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={newOffDesigEn}
                onChange={(e) => setNewOffDesigEn(e.target.value)}
                placeholder="Designation (e.g. Community Legal Officer)"
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={newOffRoom}
                onChange={(e) => setNewOffRoom(e.target.value)}
                placeholder="Counter / Desk (e.g. Desk 06)"
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                + Register Officer
              </button>
            </div>
          </form>

          {/* Officers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Officer Name</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Assigned Desk</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {officers.map((off) => (
                  <tr key={off.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {off.nameEn}
                      <span className="block text-[11px] text-slate-600 font-normal">{off.nameSi}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">{off.designationEn}</td>
                    <td className="py-2.5 px-3 text-slate-600">{off.department}</td>
                    <td className="py-2.5 px-3 text-blue-900 font-medium">{off.counterRoom}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
