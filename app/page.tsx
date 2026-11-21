'use client';

import React, { useState, useEffect } from 'react';
import {
  ScreenView,
  Language,
  UserRole,
  Client,
  Visit,
  Referral,
  GNDivision,
  Officer,
} from '@/lib/types';
import { DEFAULT_GN_DIVISIONS, DEFAULT_OFFICERS } from '@/lib/constants';

// Supabase Database Query Service
import {
  getGnDivisions,
  getOfficers,
  fetchTodayVisits,
  fetchReferrals,
  updateVisitStatusInDb,
  logDepartureInDb,
  createReferralInDb,
  updateReferralStatusInDb,
} from '@/lib/supabase-queries';

// UI Components
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';
import { TokenSlip } from '@/components/ui/TokenSlip';

// Screen Components
import { LoginScreen } from '@/components/screens/LoginScreen';
import { DashboardScreen } from '@/components/screens/DashboardScreen';
import { ClientRegistrationScreen } from '@/components/screens/ClientRegistrationScreen';
import { ClientSearchScreen } from '@/components/screens/ClientSearchScreen';
import { ClientDetailsScreen } from '@/components/screens/ClientDetailsScreen';
import { ReferralScreen } from '@/components/screens/ReferralScreen';
import { ReportsScreen } from '@/components/screens/ReportsScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { ExecutiveDashboard } from '@/components/screens/ExecutiveDashboard';
import { CitizenServicesScreen } from '@/components/screens/CitizenServicesScreen';
import { BroadcastModal } from '@/components/ui/BroadcastModal';

export default function Home() {
  // Navigation & Session State
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('front_desk');
  const [lang, setLang] = useState<Language>('si'); // Defaulting to Sinhala / English bilingual
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  // Core Data Stores (Zero hardcoded mock/dummy data seeded)
  const [clients, setClients] = useState<Client[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [gnDivisions, setGnDivisions] = useState<GNDivision[]>(DEFAULT_GN_DIVISIONS);
  const [officers, setOfficers] = useState<Officer[]>(DEFAULT_OFFICERS);

  // Active Selections
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [tokenModalVisit, setTokenModalVisit] = useState<Visit | null>(null);
  const [referralClientTarget, setReferralClientTarget] = useState<Client | null>(null);

  // Initial Data Fetching from Supabase / Local Persistent Store
  useEffect(() => {
    async function initializeData() {
      try {
        // 1. Fetch GN divisions & officers master lists
        const [loadedGns, loadedOfficers] = await Promise.all([
          getGnDivisions(),
          getOfficers(),
        ]);
        if (loadedGns && loadedGns.length > 0) setGnDivisions(loadedGns);
        if (loadedOfficers && loadedOfficers.length > 0) setOfficers(loadedOfficers);

        // 2. Fetch visits & referrals
        const [loadedVisits, loadedReferrals] = await Promise.all([
          fetchTodayVisits(),
          fetchReferrals(),
        ]);
        if (loadedVisits && loadedVisits.length > 0) setVisits(loadedVisits);
        if (loadedReferrals && loadedReferrals.length > 0) setReferrals(loadedReferrals);

        // 3. Load clients from local cache if stored
        const storedClients = localStorage.getItem('gami_clients');
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        }

        const storedLang = localStorage.getItem('gami_lang') as Language;
        if (storedLang) setLang(storedLang);
      } catch {
        // Graceful handling
      }
    }
    initializeData();
  }, []);

  // Save changes to localStorage & trigger state updates
  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    try {
      localStorage.setItem('gami_clients', JSON.stringify(newClients));
    } catch {
      // Ignore storage errors
    }
  };

  const saveVisits = (newVisits: Visit[]) => {
    setVisits(newVisits);
    try {
      localStorage.setItem('gami_visits', JSON.stringify(newVisits));
    } catch {
      // Ignore storage errors
    }
  };

  const saveReferrals = (newReferrals: Referral[]) => {
    setReferrals(newReferrals);
    try {
      localStorage.setItem('gami_referrals', JSON.stringify(newReferrals));
    } catch {
      // Ignore storage errors
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('gami_lang', newLang);
    } catch {
      // Ignore storage errors
    }
  };

  // Handlers
  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'executive') {
      setCurrentScreen('executive');
    } else if (role === 'referral_officer') {
      setCurrentScreen('referrals');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleSignOut = () => {
    setCurrentScreen('login');
  };

  const handleRegisterSuccess = (newClient: Client, newVisit: Visit) => {
    // Check if client already exists by NIC
    const existingIndex = clients.findIndex((c) => c.nic === newClient.nic);
    let updatedClients: Client[];

    if (existingIndex >= 0) {
      updatedClients = [...clients];
      updatedClients[existingIndex] = {
        ...updatedClients[existingIndex],
        visitCount: (updatedClients[existingIndex].visitCount || 1) + 1,
        lastVisitDate: newVisit.visitDate,
        whatsappNumber: newClient.whatsappNumber || updatedClients[existingIndex].whatsappNumber,
      };
    } else {
      updatedClients = [newClient, ...clients];
    }

    saveClients(updatedClients);
    saveVisits([newVisit, ...visits]);
    setSelectedClient(newClient);
  };

  const handleSelectVisitForDetails = (visit: Visit) => {
    const foundClient = clients.find((c) => c.id === visit.clientId || c.nic === visit.nic);
    if (foundClient) {
      setSelectedClient(foundClient);
    } else {
      setSelectedClient({
        id: visit.clientId,
        fullName: visit.clientName,
        address: 'Ampitiya, Kandy',
        nic: visit.nic,
        gender: 'Other',
        gnDivision: visit.gnDivision,
        whatsappNumber: visit.whatsappNumber || '',
        visitCount: visit.visitCount,
        firstVisitDate: visit.visitDate,
        lastVisitDate: visit.visitDate,
        createdAt: visit.createdAt,
      });
    }
    setCurrentScreen('details');
  };

  const handleQuickDepart = async (visitId: string) => {
    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const updated = visits.map((v) => {
      if (v.id === visitId) {
        return {
          ...v,
          departureTime: nowTime,
          status: 'Completed' as const,
        };
      }
      return v;
    });
    saveVisits(updated);
    // Sync with Supabase
    await logDepartureInDb(visitId, nowTime);
  };

  const handleUpdateVisitStatus = async (visitId: string, status: Visit['status']) => {
    const updated = visits.map((v) => (v.id === visitId ? { ...v, status } : v));
    saveVisits(updated);
    // Sync with Supabase
    await updateVisitStatusInDb(visitId, status);
  };

  const handleAddReferral = async (newRef: Referral) => {
    saveReferrals([newRef, ...referrals]);
    // Also update associated visit status to Referred
    const updatedVisits = visits.map((v) => {
      if (v.clientId === newRef.clientId || v.nic === newRef.nic) {
        return { ...v, status: 'Referred' as const };
      }
      return v;
    });
    saveVisits(updatedVisits);
    // Sync with Supabase
    await createReferralInDb(newRef);
  };

  const handleUpdateReferralStatus = async (id: string, status: Referral['status']) => {
    const updated = referrals.map((r) => (r.id === id ? { ...r, status } : r));
    saveReferrals(updated);
    // Sync with Supabase
    await updateReferralStatusInDb(id, status);
  };

  const handleNewVisitForClient = (client: Client) => {
    setSelectedClient(client);
    setCurrentScreen('register');
  };

  const handleReferClient = (client: Client) => {
    setReferralClientTarget(client);
    setCurrentScreen('referrals');
  };

  // If user navigates to Login Screen
  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Main Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSignOut={handleSignOut}
        onOpenBroadcast={() => setIsBroadcastOpen(true)}
        onQuickPrint={() => {
          if (visits[0]) setTokenModalVisit(visits[0]);
          else setCurrentScreen('register');
        }}
      />

      {/* Main Layout Area: Sidebar + Screen Canvas */}
      <div className="flex-1 flex w-full">
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          lang={lang}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              visits={visits}
              onNavigate={(s) => setCurrentScreen(s)}
              onSelectVisit={handleSelectVisitForDetails}
              onPrintToken={(v) => setTokenModalVisit(v)}
              onUpdateStatus={handleUpdateVisitStatus}
              onOpenBroadcast={() => setIsBroadcastOpen(true)}
              lang={lang}
            />
          )}

          {currentScreen === 'register' && (
            <ClientRegistrationScreen
              onRegisterSuccess={handleRegisterSuccess}
              gnDivisions={gnDivisions}
              officers={officers}
              lang={lang}
              existingVisitsCount={visits.length}
            />
          )}

          {currentScreen === 'search' && (
            <ClientSearchScreen
              visits={visits}
              onSelectVisit={handleSelectVisitForDetails}
              onPrintToken={(v) => setTokenModalVisit(v)}
              onQuickDepart={handleQuickDepart}
              onNavigate={(s) => setCurrentScreen(s)}
              gnDivisions={gnDivisions}
              officers={officers}
              lang={lang}
            />
          )}

          {currentScreen === 'details' && (
            <ClientDetailsScreen
              client={selectedClient}
              visits={visits}
              referrals={referrals}
              onNavigate={(s) => setCurrentScreen(s)}
              onNewVisitForClient={handleNewVisitForClient}
              onReferClient={handleReferClient}
              lang={lang}
            />
          )}

          {currentScreen === 'referrals' && (
            <ReferralScreen
              referrals={referrals}
              clients={clients}
              officers={officers}
              onAddReferral={handleAddReferral}
              onUpdateReferralStatus={handleUpdateReferralStatus}
              lang={lang}
              preSelectedClient={referralClientTarget}
            />
          )}

          {currentScreen === 'reports' && (
            <ReportsScreen
              visits={visits}
              gnDivisions={gnDivisions}
              lang={lang}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              gnDivisions={gnDivisions}
              onAddGnDivision={(gn) => setGnDivisions([...gnDivisions, gn])}
              officers={officers}
              onAddOfficer={(off) => setOfficers([...officers, off])}
              lang={lang}
              onLanguageChange={handleLanguageChange}
            />
          )}

          {currentScreen === 'executive' && (
            <ExecutiveDashboard
              visits={visits}
              clients={clients}
              referrals={referrals}
              lang={lang}
            />
          )}

          {currentScreen === 'services' && (
            <CitizenServicesScreen lang={lang} />
          )}
        </main>
      </div>

      {/* GN Division Community Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        clients={clients}
        gnDivisions={gnDivisions}
        lang={lang}
      />

      {/* Quick Print Token Modal (Available across entire app) */}
      {tokenModalVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-extrabold text-slate-900 text-sm">
                {lang === 'si' ? 'ටෝකන් පත්‍රිකා මුද්‍රණය' : 'Print Client Token Slip'}
              </span>
              <button
                onClick={() => setTokenModalVisit(null)}
                type="button"
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <TokenSlip
              tokenNumber={tokenModalVisit.tokenNumber}
              clientName={tokenModalVisit.clientName}
              nic={tokenModalVisit.nic}
              gnDivision={tokenModalVisit.gnDivision}
              visitReason={tokenModalVisit.visitReason}
              arrivalTime={tokenModalVisit.arrivalTime}
              visitDate={tokenModalVisit.visitDate}
              referralOfficer={tokenModalVisit.referralOfficerName}
              whatsappNumber={tokenModalVisit.whatsappNumber}
              lang={lang}
              onClose={() => setTokenModalVisit(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
