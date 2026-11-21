'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { CITIZEN_SERVICES, CitizenServiceGuide } from '@/lib/citizen-services';
import { Language } from '@/lib/types';

interface CitizenServicesScreenProps {
  lang: Language;
}

export const CitizenServicesScreen: React.FC<CitizenServicesScreenProps> = ({ lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<CitizenServiceGuide>(CITIZEN_SERVICES[0]);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  const filteredServices = CITIZEN_SERVICES.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      s.titleEn.toLowerCase().includes(term) ||
      s.titleSi.includes(term) ||
      s.descriptionEn.toLowerCase().includes(term);

    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handlePrintChecklist = () => {
    setIsChecklistModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-emerald-300 mb-3">
            <Icons.Building className="w-3.5 h-3.5" />
            <span>Sri Lankan Rural Citizen Aid Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {lang === 'si' ? 'ප්‍රජා සේවා සහ රාජ්‍ය ආධාර මඟපෙන්වීම' : 'Rural Citizen Services & Welfare Navigator'}
          </h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            {lang === 'si'
              ? 'අස්වැසුම, ග්‍රාම නිලධාරී සහතික, නොමිලේ නීති ආධාර, සහ කෘෂිකාර්මික පොහොර සහනාධාර ලබාගැනීමේ නිල මඟපෙන්වීම සහ ලේඛන ලැයිස්තුව.'
              : 'Direct guidance for villagers on Aswesuma welfare appeals, Grama Niladhari certificates, free Kandy legal aid, and agrarian subsidies.'}
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icons.Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'si' ? 'සේවාව, සහනාධාරය හෝ අවශ්‍යතාව සොයන්න (උදා: අස්වැසුම, ඔප්පු, සහතික)...' : 'Search government service or aid (e.g. Aswesuma, deeds, certificate)...'}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">{lang === 'si' ? 'සියලු අංශ' : 'All Categories'}</option>
              <option value="Welfare">{lang === 'si' ? 'සුභසාධන සහ අස්වැසුම' : 'Welfare & Aswesuma'}</option>
              <option value="Legal">{lang === 'si' ? 'නීති ආධාර හා ආරවුල්' : 'Legal Aid & Disputes'}</option>
              <option value="Civil">{lang === 'si' ? 'ග්‍රාම නිලධාරී සහතික' : 'Grama Niladhari Certificates'}</option>
              <option value="Agriculture">{lang === 'si' ? 'කෘෂිකර්ම හා පොහොර' : 'Agrarian & Fertilizer'}</option>
              <option value="Health">{lang === 'si' ? 'වැඩිහිටි හා ආබාධිත' : 'Elderly & Disability'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Directory List & Service Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Services List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
            {lang === 'si' ? 'ලබාගත හැකි රාජ්‍ය සේවා' : 'Available Community Services'} ({filteredServices.length})
          </span>

          {filteredServices.map((srv) => {
            const isSelected = selectedService.id === srv.id;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setSelectedService(srv)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                    {srv.category}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-800">
                    ⏱ {srv.processingTime}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                  {lang === 'si' ? srv.titleSi : srv.titleEn}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {lang === 'si' ? srv.descriptionSi : srv.descriptionEn}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Service In-depth Dossier (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 mb-2 inline-block">
                {selectedService.category} Service
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'si' ? selectedService.titleSi : selectedService.titleEn}
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                🏛️ {lang === 'si' ? selectedService.authoritySi : selectedService.authorityEn}
              </p>
            </div>

            <button
              onClick={handlePrintChecklist}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Icons.Printer className="w-4 h-4" />
              <span>{lang === 'si' ? 'ලේඛන ලැයිස්තුව මුද්‍රණය' : 'Print Checklist for Villager'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {lang === 'si' ? selectedService.descriptionSi : selectedService.descriptionEn}
          </p>

          {/* Required Documents Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Icons.FileText className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'si' ? 'අවශ්‍ය මූලික ලේඛන සහ සාක්ෂි' : 'Mandatory Documents Required'}</span>
            </h3>

            <div className="space-y-2">
              {(lang === 'si' ? selectedService.requiredDocsSi : selectedService.requiredDocsEn).map((doc, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="w-4 h-4 rounded-md border-2 border-slate-400 shrink-0 mt-0.5"></span>
                  <span className="text-slate-800 font-medium leading-relaxed">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {lang === 'si' ? 'සුදුසුකම් සපුරාලීමේ නිර්ණායක' : 'Eligibility Criteria'}
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
              {(lang === 'si' ? selectedService.eligibilitySi : selectedService.eligibilityEn).map((el, idx) => (
                <li key={idx}>{el}</li>
              ))}
            </ul>
          </div>

          {/* Contact Helpline in Kandy District */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-950 font-medium">
            <span>Direct Government Helpline / Desk:</span>
            <strong className="font-bold text-blue-800">{selectedService.kandyContact}</strong>
          </div>
        </div>
      </div>

      {/* Printable Checklist Modal / Direct Print Container */}
      {isChecklistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div id="printable-token" className="space-y-4 p-4 text-slate-900">
              <div className="text-center pb-3 border-b border-slate-200">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                  GAMI PADANAMA (ගැමි පදනම)
                </h3>
                <p className="text-[11px] text-slate-600">Ampitiya Community Services Center • Kandy</p>
                <h4 className="text-xs font-bold text-emerald-800 mt-2">
                  {lang === 'si' ? selectedService.titleSi : selectedService.titleEn}
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 block text-[11px] uppercase">
                  {lang === 'si' ? 'අවශ්‍ය ලේඛන පිරික්සුම් ලැයිස්තුව (Checklist)' : 'Official Required Documents Checklist:'}
                </span>
                {(lang === 'si' ? selectedService.requiredDocsSi : selectedService.requiredDocsEn).map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs border-b border-slate-100 pb-1">
                    <span className="font-mono font-bold">[ &nbsp; ]</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[10px] text-slate-600 text-center border-t border-slate-200">
                <p>Issued by Front Desk • Gami Padanama Ampitiya • Tel: 081-2245890</p>
              </div>
            </div>

            <button
              onClick={() => setIsChecklistModalOpen(false)}
              type="button"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
