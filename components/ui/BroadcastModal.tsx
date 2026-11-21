'use client';

import React, { useState } from 'react';
import { Icons } from './Icons';
import { GNDivision, Language, Client } from '@/lib/types';
import { DEFAULT_GN_DIVISIONS } from '@/lib/constants';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  gnDivisions?: GNDivision[];
  lang: Language;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  clients,
  gnDivisions = DEFAULT_GN_DIVISIONS,
  lang,
}) => {
  const [selectedGn, setSelectedGn] = useState<string>('ALL');
  const [template, setTemplate] = useState('legal');
  const [customMessage, setCustomMessage] = useState('');

  if (!isOpen) return null;

  // Filter recipient clients with WhatsApp numbers
  const recipientClients = clients.filter((c) => {
    const hasPhone = Boolean(c.whatsappNumber && c.whatsappNumber.trim().length >= 9);
    const matchesGn = selectedGn === 'ALL' || c.gnDivision === selectedGn;
    return hasPhone && matchesGn;
  });

  const getTemplateMessage = () => {
    if (customMessage) return customMessage;
    switch (template) {
      case 'legal':
        return lang === 'si'
          ? `[ගැමි පදනම - අම්පිටිය] නොමිලේ නීති උපදෙස් සහ ඉඩම් ආරවුල් සමථකරණ ජංගම සායනය ලබන සෙනසුරාදා පෙ.ව. 9.00ට අම්පිටිය ප්‍රජා ශාලාවේදී පැවැත්වේ. විස්තර: 081-2245890`
          : `[Gami Padanama - Ampitiya] Free Community Legal Aid & Land Dispute Mediation Clinic this Saturday 9:00 AM at Ampitiya Center. Inquiries: 081-2245890`;
      case 'agri':
        return lang === 'si'
          ? `[ගැමි පදනම - අම්පිටිය] කාබනික ගෙවතු වගා බීජ හා උපදෙස් නොමිලේ බෙදාදීම මේ සතියේ කාර්යාලයේදී සිදුකෙරේ. පැමිණෙන්න.`
          : `[Gami Padanama - Ampitiya] Free organic vegetable seeds and fertilizer guidance distribution this week at the community office.`;
      case 'aswesuma':
        return lang === 'si'
          ? `[ගැමි පදනම - අම්පිටිය] අස්වැසුම සුභසාධන අභියාචනා ලිපිගොනු පිරවීම සඳහා නොමිලේ ආධාර මධ්‍යස්ථානය විවෘතයි.`
          : `[Gami Padanama - Ampitiya] Free assistance desk open for Aswesuma welfare appeals and document preparation.`;
      default:
        return '';
    }
  };

  const handleSendWhatsAppBroadcast = () => {
    const text = encodeURIComponent(getTemplateMessage());
    if (recipientClients[0]?.whatsappNumber) {
      const cleanPhone = recipientClients[0].whatsappNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Icons.MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'si' ? 'ග්‍රාමීය ප්‍රජා පණිවිඩ විකාශය' : 'GN Village Community Broadcast'}</span>
            </h3>
            <p className="text-xs text-slate-600">
              {lang === 'si' ? 'වසම් මට්ටමින් සහනාධාර සහ සායන දැනුම්දීම් යවන්න' : 'Dispatch village welfare notifications via WhatsApp/SMS'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Target GN Division Filter */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              {lang === 'si' ? 'ඉලක්කගත ග්‍රාම නිලධාරී වසම' : 'Target GN Division'}
            </label>
            <select
              value={selectedGn}
              onChange={(e) => setSelectedGn(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">{lang === 'si' ? 'සියලු ලියාපදිංචි වසම් (සියලුම ප්‍රජාව)' : 'All Registered Divisions (Broad Reach)'}</option>
              {gnDivisions.map((gn) => (
                <option key={gn.id} value={gn.nameEn}>
                  {lang === 'si' ? gn.nameSi : gn.nameEn} ({gn.code})
                </option>
              ))}
            </select>
          </div>

          {/* Active Recipients Counter */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <span className="font-semibold text-emerald-900">
              {lang === 'si' ? 'සම්බන්ධ කරගත හැකි දුරකථන අංක' : 'Reachable Registered Contacts'}:
            </span>
            <span className="font-mono font-extrabold text-emerald-950 text-sm">
              {recipientClients.length} Villagers
            </span>
          </div>

          {/* Preset Templates */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              {lang === 'si' ? 'පණිවිඩ ආකෘතිය තෝරන්න' : 'Select Notice Template'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setTemplate('legal'); setCustomMessage(''); }}
                className={`p-2.5 rounded-xl border text-center font-bold text-[11px] cursor-pointer ${
                  template === 'legal' && !customMessage
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                ⚖️ Legal Aid Clinic
              </button>
              <button
                type="button"
                onClick={() => { setTemplate('agri'); setCustomMessage(''); }}
                className={`p-2.5 rounded-xl border text-center font-bold text-[11px] cursor-pointer ${
                  template === 'agri' && !customMessage
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                🌱 Agri Subsidies
              </button>
              <button
                type="button"
                onClick={() => { setTemplate('aswesuma'); setCustomMessage(''); }}
                className={`p-2.5 rounded-xl border text-center font-bold text-[11px] cursor-pointer ${
                  template === 'aswesuma' && !customMessage
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                📋 Aswesuma Aid
              </button>
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              {lang === 'si' ? 'පණිවිඩ සටහන (සංස්කරණය කළ හැක)' : 'Broadcast Message Body (Editable)'}
            </label>
            <textarea
              rows={3}
              value={customMessage || getTemplateMessage()}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendWhatsAppBroadcast}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Icons.MessageCircle className="w-4 h-4" />
              <span>{lang === 'si' ? 'විකාශය කරන්න (WhatsApp)' : 'Dispatch Broadcast'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
