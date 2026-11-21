'use client';

import React from 'react';
import { Icons } from './Icons';
import { Language } from '@/lib/types';
import { translations } from '@/lib/translations';
import { OFFICE_PROFILE } from '@/lib/constants';
import { announceToken } from '@/lib/voice-announcer';

interface TokenSlipProps {
  tokenNumber: string;
  clientName: string;
  nic: string;
  gnDivision: string;
  visitReason: string;
  arrivalTime: string;
  visitDate: string;
  referralOfficer: string;
  counterRoom?: string;
  whatsappNumber?: string;
  lang: Language;
  onPrint?: () => void;
  onClose?: () => void;
  isPreview?: boolean;
}

export const TokenSlip: React.FC<TokenSlipProps> = ({
  tokenNumber,
  clientName,
  nic,
  gnDivision,
  visitReason,
  arrivalTime,
  visitDate,
  referralOfficer,
  counterRoom = 'Desk 01 - Front Office',
  whatsappNumber,
  lang,
  onPrint,
  onClose,
  isPreview = false,
}) => {
  const t = translations[lang];

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*Gami Padanama (ගැමි පදනම) - Ampitiya Sub-Office*\n` +
      `Official Client Visit Token Slip\n\n` +
      `🎫 Token No: *${tokenNumber}*\n` +
      `👤 Client: ${clientName}\n` +
      `🪪 NIC: ${nic}\n` +
      `📍 GN Division: ${gnDivision}\n` +
      `📋 Service: ${visitReason}\n` +
      `⏰ Arrival Time: ${arrivalTime} (${visitDate})\n` +
      `🏛️ Assigned Desk: ${counterRoom}\n` +
      `👨‍💼 Referral Officer: ${referralOfficer}\n\n` +
      `Please be seated in the Ampitiya Community Lounge. Thank you.`
    );
    const url = whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`flex flex-col ${isPreview ? 'w-full' : 'max-w-md mx-auto'} bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md`}>
      {/* Top Banner (Civic Deep Blue with Emerald accent line) */}
      <div className="bg-slate-900 text-white p-5 border-b-4 border-emerald-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Icons.Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide text-white">
                {lang === 'si' ? OFFICE_PROFILE.nameSi : OFFICE_PROFILE.nameEn}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {OFFICE_PROFILE.branch} • {OFFICE_PROFILE.district}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {lang === 'si' ? 'නිල ටෝකනය' : 'Official Token'}
          </span>
        </div>
      </div>

      {/* Main Token Body (Thermal Slip Inspired Layout) */}
      <div id="printable-token" className="p-6 bg-white text-slate-800 space-y-5">
        {/* Large Token Hero Badge */}
        <div className="text-center py-4 bg-blue-50/70 border border-blue-200/80 rounded-xl">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
            {t.token.tokenNumberLabel}
          </p>
          <div className="text-3xl md:text-4xl font-extrabold text-blue-900 font-mono tracking-tight">
            {tokenNumber || 'GP-AMP-2026-0001'}
          </div>
          <div className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <span>{counterRoom}</span>
            <span>•</span>
            <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              {lang === 'si' ? 'ක්‍රියාකාරී' : 'Active Intake'}
            </span>
          </div>
        </div>

        {/* Client & Visit Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs border-y border-dashed border-slate-300 py-4">
          <div>
            <span className="text-slate-600 font-medium block">{t.token.clientLabel}</span>
            <span className="font-bold text-slate-900 text-sm block truncate">
              {clientName || (lang === 'si' ? 'නම ඇතුළත් කර නොමැත' : 'Name not entered')}
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-medium block">{t.token.nicLabel}</span>
            <span className="font-bold font-mono text-slate-900 text-sm block">
              {nic || '------------'}
            </span>
          </div>

          <div>
            <span className="text-slate-600 font-medium block">{t.token.gnLabel}</span>
            <span className="font-semibold text-slate-800 block">
              {gnDivision || (lang === 'si' ? 'වසම තෝරන්න' : 'Select Division')}
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-medium block">{t.token.timeLabel}</span>
            <span className="font-semibold text-slate-800 block">
              {arrivalTime || '--:--'} ({visitDate || 'Today'})
            </span>
          </div>

          <div className="col-span-2 pt-1 border-t border-slate-100">
            <span className="text-slate-600 font-medium block">{t.token.serviceLabel}</span>
            <span className="font-semibold text-blue-900 block">
              {visitReason || (lang === 'si' ? 'සේවා අවශ්‍යතාව තෝරන්න' : 'Pending Selection')}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-slate-600 font-medium block">{t.token.officerLabel}</span>
            <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              {referralOfficer || (lang === 'si' ? 'පෙරමුණු මේසය' : 'Front Office')}
            </span>
          </div>
        </div>

        {/* Visual Barcode / QR Simulation for Front Office Scanner */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-1 h-9 mb-1">
            {/* Realistic stylized barcode bars */}
            <div className="w-1 bg-slate-800 h-full"></div>
            <div className="w-2 bg-slate-800 h-full"></div>
            <div className="w-1 bg-transparent h-full"></div>
            <div className="w-3 bg-slate-800 h-full"></div>
            <div className="w-1 bg-slate-800 h-full"></div>
            <div className="w-2 bg-transparent h-full"></div>
            <div className="w-2 bg-slate-800 h-full"></div>
            <div className="w-1 bg-slate-800 h-full"></div>
            <div className="w-4 bg-slate-800 h-full"></div>
            <div className="w-2 bg-transparent h-full"></div>
            <div className="w-2 bg-slate-800 h-full"></div>
            <div className="w-1 bg-slate-800 h-full"></div>
            <div className="w-3 bg-slate-800 h-full"></div>
            <div className="w-1 bg-transparent h-full"></div>
            <div className="w-2 bg-slate-800 h-full"></div>
            <div className="w-1 bg-slate-800 h-full"></div>
            <div className="w-3 bg-slate-800 h-full"></div>
            <div className="w-2 bg-slate-800 h-full"></div>
          </div>
          <span className="font-mono text-[10px] text-slate-500 tracking-widest">
            *{tokenNumber || 'GP-AMP-0001'}*
          </span>
        </div>

        {/* Bilingual Client Instructions */}
        <div className="text-center space-y-1 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-lg">
          <p className="text-[11px] text-amber-900 font-medium">
            {t.token.instructions}
          </p>
          <p className="text-[10px] text-amber-800">
            {t.token.instructionsSi}
          </p>
        </div>

        {/* Footer Info */}
        <div className="text-center pt-2 text-[10px] text-slate-600 font-medium">
          <p>{OFFICE_PROFILE.ngoRegistrationNumber} • {OFFICE_PROFILE.hotline}</p>
          <p className="mt-0.5">{OFFICE_PROFILE.addressEn}</p>
        </div>
      </div>

      {/* Action Footer (Print, WhatsApp & Voice Call Buttons) */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2">
        <button
          onClick={handlePrint}
          type="button"
          className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3.5 py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Icons.Printer className="w-4 h-4" />
          <span>{t.actions.printToken}</span>
        </button>

        <button
          onClick={() => announceToken({
            tokenNumber: tokenNumber || 'GP-AMP-0001',
            counterRoom,
            lang: lang === 'si' ? 'si' : 'en',
          })}
          type="button"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          title="Announce token over speakers"
        >
          <span>🔊</span>
          <span>{lang === 'si' ? 'හඬ විකාශය' : 'Voice'}</span>
        </button>

        <button
          onClick={handleWhatsAppShare}
          type="button"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          title="Send to Client WhatsApp"
        >
          <Icons.MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="px-3 py-3 border border-slate-300 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            {t.actions.close}
          </button>
        )}
      </div>
    </div>
  );
};
