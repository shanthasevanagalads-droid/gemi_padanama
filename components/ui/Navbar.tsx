'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { Language, UserRole } from '@/lib/types';
import { translations } from '@/lib/translations';
import { OFFICE_PROFILE } from '@/lib/constants';
import { isSupabaseConfigured } from '@/lib/supabase-client';

interface NavbarProps {
  currentRole: UserRole;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onToggleSidebar: () => void;
  onSignOut: () => void;
  onQuickPrint?: () => void;
  onOpenBroadcast?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  lang,
  onLanguageChange,
  onToggleSidebar,
  onSignOut,
  onQuickPrint,
  onOpenBroadcast,
}) => {
  const t = translations[lang];
  const [timeString, setTimeString] = useState<string>('');
  const [isDbLive] = useState(() => isSupabaseConfigured());
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateClock = () => {
        setTimeString(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      };
      updateClock();
      const timer = setInterval(updateClock, 30000);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        clearInterval(timer);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'front_desk':
        return lang === 'si' ? 'පෙරමුණු මේස නිලධාරී' : 'Front Desk Officer';
      case 'referral_officer':
        return lang === 'si' ? 'යොමුකිරීම් නිලධාරී' : 'Referral Specialist';
      case 'executive':
        return lang === 'si' ? 'විධායක අධ්‍යක්ෂ' : 'Executive Director';
      case 'admin':
        return lang === 'si' ? 'පද්ධති පරිපාලක' : 'System Admin';
      default:
        return 'Staff Member';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            type="button"
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus:outline-hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            <Icons.Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <Icons.Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight">
                  {lang === 'si' ? OFFICE_PROFILE.nameSi : OFFICE_PROFILE.nameEn}
                </span>

                {/* Database Connection Status Pill */}
                <span
                  title={isDbLive ? 'Connected to live Supabase PostgreSQL' : 'Operating in High-Performance Local Cache Engine'}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${isDbLive
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-blue-100 text-blue-900 border-blue-300'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isDbLive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'}`}></span>
                  {isDbLive ? 'Supabase Live' : 'Ampitiya Node'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium hidden sm:block">
                {lang === 'si' ? 'මාර්ගගත සේවාලාභී ලියාපදිංචි පද්ධතිය' : 'Online Client Registration System'} • {OFFICE_PROFILE.district}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Real-time Clock (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl border border-slate-200 text-xs text-slate-700">
          <Icons.Clock className="w-3.5 h-3.5 text-blue-700" />
          <span className="font-mono font-semibold">{timeString || '10:00 AM'}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-600 font-medium">Ampitiya Sub-Office</span>
        </div>

        {/* Right: Bilingual Toggle, Role Badge & Signout */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Bilingual Switcher Button */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onLanguageChange('en')}
              type="button"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${lang === 'en'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('si')}
              type="button"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${lang === 'si'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              සිංහල
            </button>
          </div>

          {/* Rural Offline / Sync Indicator */}
          {!isOnline && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Offline Mode</span>
            </span>
          )}

          {/* GN Broadcast Modal Trigger */}
          {onOpenBroadcast && (
            <button
              onClick={onOpenBroadcast}
              type="button"
              title={lang === 'si' ? 'ග්‍රාමීය ප්‍රජා පණිවිඩ විකාශය' : 'Dispatch Community WhatsApp Broadcast'}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Icons.MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'si' ? 'ප්‍රජා විකාශය' : 'Broadcast'}</span>
            </button>
          )}

          {/* Quick Print Token Action */}
          {onQuickPrint && (
            <button
              onClick={onQuickPrint}
              type="button"
              title={lang === 'si' ? 'ටෝකනයක් මුද්‍රණය කරන්න' : 'Print Token'}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Icons.Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'si' ? 'ටෝකන් මුද්‍රණය' : 'Print Slip'}</span>
            </button>
          )}

          {/* Officer Role Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200/80 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="font-semibold text-blue-900">{getRoleLabel()}</span>
          </div>

          {/* Sign Out Action */}
          <button
            onClick={onSignOut}
            type="button"
            className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            title={t.nav.logout}
          >
            <Icons.LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
