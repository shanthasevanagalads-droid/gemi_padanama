'use client';

import React from 'react';
import { Icons } from './Icons';
import { ScreenView, Language } from '@/lib/types';
import { OFFICE_PROFILE } from '@/lib/constants';

interface SidebarProps {
  currentScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  lang,
  isOpen,
  onClose,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ScreenView,
      labelEn: 'Front Desk Dashboard',
      labelSi: 'පෙරමුණු මේස පුවරුව',
      icon: Icons.Home,
      badge: 'Live',
    },
    {
      id: 'register' as ScreenView,
      labelEn: 'Client Registration',
      labelSi: 'සේවාලාභී ලියාපදිංචිය',
      icon: Icons.UserPlus,
      highlight: true,
    },
    {
      id: 'search' as ScreenView,
      labelEn: 'Search & Directory',
      labelSi: 'සේවාලාභී සෙවුම',
      icon: Icons.Search,
    },
    {
      id: 'details' as ScreenView,
      labelEn: 'Client Dossier',
      labelSi: 'සේවාලාභී ලිපිගොනුව',
      icon: Icons.FileText,
    },
    {
      id: 'referrals' as ScreenView,
      labelEn: 'Referral Management',
      labelSi: 'යොමුකිරීම් කළමනාකරණය',
      icon: Icons.Share2,
    },
    {
      id: 'reports' as ScreenView,
      labelEn: 'Community Reports',
      labelSi: 'ප්‍රජා වාර්තා',
      icon: Icons.BarChart3,
    },
    {
      id: 'executive' as ScreenView,
      labelEn: 'Executive Analytics',
      labelSi: 'විධායක විශ්ලේෂණ',
      icon: Icons.Shield,
    },
    {
      id: 'services' as ScreenView,
      labelEn: 'Citizen Aid Navigator',
      labelSi: 'රාජ්‍ය ආධාර මඟපෙන්වීම',
      icon: Icons.Building,
      highlight: true,
    },
    {
      id: 'settings' as ScreenView,
      labelEn: 'Office Settings',
      labelSi: 'කාර්යාලීය සැකසුම්',
      icon: Icons.Settings,
    },
  ];

  const handleSelect = (screen: ScreenView) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200/80 z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white shadow-sm">
              <Icons.Building className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
                {lang === 'si' ? 'ගැමි පදනම' : 'GAMI PADANAMA'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 block">
                {OFFICE_PROFILE.branch}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'si' ? 'ප්‍රධාන මෙනුව' : 'Main Menu'}
          </div>

          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                type="button"
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-sm font-medium transition-all group cursor-pointer ${isActive
                    ? 'bg-blue-50 text-blue-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="block truncate leading-snug">
                      {lang === 'si' ? item.labelSi : item.labelEn}
                    </span>
                    <span className="block text-[11px] text-slate-600 truncate font-normal">
                      {lang === 'si' ? item.labelEn : item.labelSi}
                    </span>
                  </div>
                </div>

                {item.highlight && !isActive && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    +New
                  </span>
                )}
                {item.badge && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Community Center Info Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 m-3 rounded-2xl border">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-800">
              Ampitiya Sub-Office
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {OFFICE_PROFILE.addressEn}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Hotline:</span>
            <a href="tel:0812245890" className="font-bold text-blue-700 hover:underline">
              {OFFICE_PROFILE.hotline}
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
