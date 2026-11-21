'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { Language, UserRole } from '@/lib/types';
import { translations } from '@/lib/translations';
import { OFFICE_PROFILE } from '@/lib/constants';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  lang,
  onLanguageChange,
}) => {
  const t = translations[lang];
  const [selectedRole, setSelectedRole] = useState<UserRole>('front_desk');
  const [staffId, setStaffId] = useState('OFF-AMP-01');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  const roles = [
    { id: 'front_desk' as UserRole, labelEn: 'Front Office Desk', labelSi: 'පෙරමුණු මේසය', icon: Icons.Users },
    { id: 'referral_officer' as UserRole, labelEn: 'Referral Specialist', labelSi: 'යොමු නිලධාරී', icon: Icons.Share2 },
    { id: 'executive' as UserRole, labelEn: 'Executive Director', labelSi: 'විධායක අධ්‍යක්ෂ', icon: Icons.Shield },
    { id: 'admin' as UserRole, labelEn: 'System Admin', labelSi: 'පරිපාලක', icon: Icons.Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between p-4 md:p-8">
      {/* Top Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Icons.Building className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base md:text-lg block tracking-tight">
              {lang === 'si' ? OFFICE_PROFILE.nameSi : OFFICE_PROFILE.nameEn}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              {OFFICE_PROFILE.branch} • {OFFICE_PROFILE.district}
            </span>
          </div>
        </div>

        {/* Bilingual Selector */}
        <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
          <button
            onClick={() => onLanguageChange('en')}
            type="button"
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('si')}
            type="button"
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              lang === 'si'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            සිංහල
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl w-full mx-auto my-8">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Card Top Banner */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 md:p-8 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/15 text-emerald-200 border border-white/20 rounded-full text-xs font-semibold mb-3">
                {lang === 'si' ? 'අම්පිටිය නිලධාරී පිවිසුම' : 'Ampitiya Staff Portal'}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {t.login.title}
              </h2>
              <p className="text-blue-100 text-sm mt-1 max-w-sm mx-auto">
                {t.login.subtitle}
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Operating Desk / Role Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.login.selectRole}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/80 text-blue-900 ring-2 ring-blue-700/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">
                        {lang === 'si' ? role.labelSi : role.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Officer ID Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.login.staffIdLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Icons.Users className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder={t.login.staffIdPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Passcode / PIN Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.login.passwordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Icons.Shield className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.login.passwordPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Duty Station Location Pill & Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>{lang === 'si' ? 'සේවා ස්ථානය සුරකින්න' : 'Keep duty station active'}</span>
              </label>

              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold border border-emerald-200">
                <Icons.MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ampitiya Desk</span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              className="w-full py-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-base font-bold rounded-2xl shadow-lg shadow-blue-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>{t.login.signInBtn}</span>
              <Icons.ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Help & District Notice */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-600">
            <p>{t.login.helpNotice}</p>
          </div>
        </div>
      </div>

      {/* Footer Credentials & Registry */}
      <div className="max-w-6xl w-full mx-auto text-center text-slate-400 text-xs py-2">
        <p className="font-semibold text-slate-300">
          {OFFICE_PROFILE.nameEn} • {OFFICE_PROFILE.branch}
        </p>
        <p className="mt-1 text-slate-400">
          {OFFICE_PROFILE.ngoRegistrationNumber} • {t.login.systemActive}
        </p>
      </div>
    </div>
  );
};
