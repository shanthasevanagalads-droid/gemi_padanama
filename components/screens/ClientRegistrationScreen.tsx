'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '../ui/Icons';
import { TokenSlip } from '../ui/TokenSlip';
import { Client, Visit, GNDivision, Officer, Language } from '@/lib/types';
import { translations } from '@/lib/translations';
import { DEFAULT_GN_DIVISIONS, DEFAULT_OFFICERS, VISIT_REASONS } from '@/lib/constants';
import { parseSriLankaNIC, NicAnalysis } from '@/lib/nic-helper';
import { evaluateCommunityTriage, VulnerabilityProfile } from '@/lib/vulnerability-triage';
import { announceToken } from '@/lib/voice-announcer';

interface ClientRegistrationScreenProps {
  onRegisterSuccess: (client: Client, visit: Visit) => void;
  gnDivisions?: GNDivision[];
  officers?: Officer[];
  lang: Language;
  existingVisitsCount: number;
}

export const ClientRegistrationScreen: React.FC<ClientRegistrationScreenProps> = ({
  onRegisterSuccess,
  gnDivisions = DEFAULT_GN_DIVISIONS,
  officers = DEFAULT_OFFICERS,
  lang,
  existingVisitsCount,
}) => {
  const t = translations[lang];

  // Helper to format current time string (e.g. 09:30 AM)
  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTodayDateString = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Form Fields as explicitly requested
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [nic, setNic] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [gnDivision, setGnDivision] = useState(gnDivisions[0]?.nameEn || 'Ampitiya North');
  const [visitReason, setVisitReason] = useState(VISIT_REASONS[0]?.labelEn || 'Community Welfare & Emergency Relief');
  const [customReason, setCustomReason] = useState('');
  const [visitCount, setVisitCount] = useState<number>(1);
  const [visitDate, setVisitDate] = useState(getTodayDateString());
  const [arrivalTime, setArrivalTime] = useState(getCurrentTimeString());
  const [departureTime, setDepartureTime] = useState('');
  const [status, setStatus] = useState<Visit['status']>('Waiting');
  const [priority, setPriority] = useState<'Normal' | 'Priority' | 'Emergency'>('Normal');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [referralOfficer, setReferralOfficer] = useState(officers[0]?.nameEn || 'Mr. K.M. Bandara');
  const [notes, setNotes] = useState('');

  // Rural Vulnerability Triage State
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityProfile>({
    isSeniorCitizen: false,
    hasDisability: false,
    isAswesumaBeneficiary: false,
    isFemaleHeadedHousehold: false,
    isDisasterAffected: false,
    hasMedicalEmergency: false,
  });

  // Live NIC Validation Computed via useMemo
  const nicAnalysis = useMemo<NicAnalysis>(() => {
    if (!nic) return { isValid: false, format: 'Invalid' };
    return parseSriLankaNIC(nic);
  }, [nic]);

  // Compute live triage evaluation
  const triageResult = evaluateCommunityTriage(vulnerabilities);

  const handleVulnerabilityToggle = (key: keyof VulnerabilityProfile, checked: boolean) => {
    const next = { ...vulnerabilities, [key]: checked };
    setVulnerabilities(next);
    const tri = evaluateCommunityTriage(next);
    if (tri.priority !== 'Normal') {
      setPriority(tri.priority);
    }
  };

  const handleNicChange = (val: string) => {
    setNic(val);
    if (val) {
      const res = parseSriLankaNIC(val);
      if (res.isValid && res.gender) {
        setGender(res.gender);
      }
      if (res.isValid && res.birthYear && (new Date().getFullYear() - res.birthYear >= 65)) {
        handleVulnerabilityToggle('isSeniorCitizen', true);
      }
    }
  };

  // Post registration modal / confirmation state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastCreatedVisit, setLastCreatedVisit] = useState<Visit | null>(null);

  // Generate live preview token string
  const currentTokenNumber = `GP-AMP-${new Date().getFullYear()}-${String(existingVisitsCount + 1).padStart(4, '0')}`;

  // Selected officer object for room counter
  const selectedOfficerObj = officers.find((o) => o.nameEn === referralOfficer || o.nameSi === referralOfficer);
  const counterRoom = selectedOfficerObj ? selectedOfficerObj.counterRoom : 'Counter 01 - Front Desk';

  const handleVoiceAnnounce = (tokNum: string) => {
    announceToken({
      tokenNumber: tokNum,
      counterRoom,
      lang: lang === 'si' ? 'si' : 'en',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert(lang === 'si' ? 'කරුණාකර සේවාලාභියාගේ නම ඇතුළත් කරන්න' : 'Please enter the client full name');
      return;
    }

    if (!nic.trim()) {
      alert(lang === 'si' ? 'කරුණාකර ජාතික හැඳුනුම්පත් අංකය ඇතුළත් කරන්න' : 'Please enter National Identity Card number');
      return;
    }

    const clientId = `cli-${Date.now()}`;
    const visitId = `vis-${Date.now()}`;
    const effectiveReason = customReason.trim() ? customReason.trim() : visitReason;

    // Append vulnerability tags to notes if any
    const triageSummary = triageResult.tagsEn.length > 0 ? ` [Triage Flags: ${triageResult.tagsEn.join(', ')}]` : '';
    const fullNotes = (notes.trim() + triageSummary).trim();

    const newClient: Client = {
      id: clientId,
      fullName: fullName.trim(),
      address: address.trim(),
      nic: nic.trim().toUpperCase(),
      gender,
      gnDivision,
      whatsappNumber: whatsappNumber.trim(),
      visitCount,
      firstVisitDate: visitDate,
      lastVisitDate: visitDate,
      createdAt: new Date().toISOString(),
    };

    const newVisit: Visit = {
      id: visitId,
      clientId,
      clientName: fullName.trim(),
      nic: nic.trim().toUpperCase(),
      tokenNumber: currentTokenNumber,
      visitReason: effectiveReason,
      visitCount,
      visitDate,
      arrivalTime,
      departureTime: departureTime.trim() || undefined,
      status,
      priority,
      whatsappNumber: whatsappNumber.trim(),
      referralOfficerId: selectedOfficerObj?.id || 'off-01',
      referralOfficerName: referralOfficer,
      gnDivision,
      notes: fullNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    setLastCreatedVisit(newVisit);
    setIsSubmitted(true);
    onRegisterSuccess(newClient, newVisit);

    // Optional audio chime announcement
    handleVoiceAnnounce(currentTokenNumber);
  };

  const handleReset = () => {
    setFullName('');
    setAddress('');
    setNic('');
    setGender('Male');
    setGnDivision(gnDivisions[0]?.nameEn || 'Ampitiya North');
    setVisitReason(VISIT_REASONS[0]?.labelEn || 'Community Welfare & Emergency Relief');
    setCustomReason('');
    setVisitCount(1);
    setVisitDate(getTodayDateString());
    setArrivalTime(getCurrentTimeString());
    setDepartureTime('');
    setStatus('Waiting');
    setPriority('Normal');
    setWhatsappNumber('');
    setReferralOfficer(officers[0]?.nameEn || 'Mr. K.M. Bandara');
    setNotes('');
    setVulnerabilities({
      isSeniorCitizen: false,
      hasDisability: false,
      isAswesumaBeneficiary: false,
      isFemaleHeadedHousehold: false,
      isDisasterAffected: false,
      hasMedicalEmergency: false,
    });
    setIsSubmitted(false);
    setLastCreatedVisit(null);
  };

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 mb-2">
            <Icons.UserPlus className="w-3.5 h-3.5" />
            <span>Ampitiya Sub-Office Intake</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.register.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {t.register.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleVoiceAnnounce(currentTokenNumber)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
            title="Audio Broadcast Token in Sinhala & English"
          >
            <span>🔊</span>
            <span>{lang === 'si' ? 'හඬ විකාශය (TTS)' : 'Voice Call Token'}</span>
          </button>

          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Next: <strong className="font-mono text-blue-950">{currentTokenNumber}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Form & Token Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Registration Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 md:p-7 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Client Identity & Domicile */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  {t.register.sections.personal}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.register.fields.fullNamePlaceholder}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                  />
                </div>

                {/* NIC with Live Validation Feedback */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t.register.fields.nic} <span className="text-red-500">*</span>
                    </label>
                    {nic && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          nicAnalysis.isValid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-700 border border-red-300'
                        }`}
                      >
                        {nicAnalysis.isValid ? nicAnalysis.format : 'Invalid Format'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={nic}
                    onChange={(e) => handleNicChange(e.target.value)}
                    placeholder={t.register.fields.nicPlaceholder}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all uppercase"
                  />
                  {nic && nicAnalysis.message && (
                    <p className={`text-[11px] mt-1 font-medium ${nicAnalysis.isValid ? 'text-emerald-700' : 'text-red-600'}`}>
                      {nicAnalysis.message}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.gender}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all cursor-pointer"
                  >
                    <option value="Male">{t.gender.male}</option>
                    <option value="Female">{t.gender.female}</option>
                    <option value="Other">{t.gender.other}</option>
                  </select>
                </div>

                {/* GN Division */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.gnDivision} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gnDivision}
                    onChange={(e) => setGnDivision(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all cursor-pointer"
                  >
                    {gnDivisions.map((gn) => (
                      <option key={gn.id} value={gn.nameEn}>
                        {lang === 'si' ? gn.nameSi : gn.nameEn} ({gn.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.whatsappNumber}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                      <Icons.MessageCircle className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder={t.register.fields.whatsappPlaceholder}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* Permanent Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.address}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.register.fields.addressPlaceholder}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Rural Vulnerability & Welfare Triage (Community Innovation) */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-amber-800 text-sm font-extrabold">⚖️</span>
                  <h3 className="font-bold text-amber-950 text-xs uppercase tracking-wider">
                    {lang === 'si' ? 'ග්‍රාමීය අවදානම් හා සුභසාධන තක්සේරුව (Triage)' : 'Rural Vulnerability & Welfare Triage'}
                  </h3>
                </div>
                {triageResult.tagsEn.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    triageResult.priority === 'Emergency' ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {triageResult.priority} Triage
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-800">
                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-200/80 cursor-pointer hover:bg-amber-50/50">
                  <input
                    type="checkbox"
                    checked={vulnerabilities.isSeniorCitizen}
                    onChange={(e) => handleVulnerabilityToggle('isSeniorCitizen', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-medium text-[11px]">👴 {lang === 'si' ? 'ජ්‍යෙෂ්ඨ පුරවැසි (65+)' : 'Senior (65+)'}</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-200/80 cursor-pointer hover:bg-amber-50/50">
                  <input
                    type="checkbox"
                    checked={vulnerabilities.hasDisability}
                    onChange={(e) => handleVulnerabilityToggle('hasDisability', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-medium text-[11px]">♿ {lang === 'si' ? 'විශේෂ අවශ්‍යතා' : 'Disability'}</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-200/80 cursor-pointer hover:bg-amber-50/50">
                  <input
                    type="checkbox"
                    checked={vulnerabilities.isAswesumaBeneficiary}
                    onChange={(e) => handleVulnerabilityToggle('isAswesumaBeneficiary', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-medium text-[11px]">📋 {lang === 'si' ? 'අස්වැසුම ප්‍රතිලාභී' : 'Aswesuma'}</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-200/80 cursor-pointer hover:bg-amber-50/50">
                  <input
                    type="checkbox"
                    checked={vulnerabilities.isFemaleHeadedHousehold}
                    onChange={(e) => handleVulnerabilityToggle('isFemaleHeadedHousehold', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-medium text-[11px]">👩‍👧 {lang === 'si' ? 'කාන්තා මූලික පවුලක්' : 'Female Headed'}</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-200/80 cursor-pointer hover:bg-amber-50/50">
                  <input
                    type="checkbox"
                    checked={vulnerabilities.isDisasterAffected}
                    onChange={(e) => handleVulnerabilityToggle('isDisasterAffected', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-medium text-[11px]">🌧️ {lang === 'si' ? 'ආපදා / නායයෑම්' : 'Disaster Relief'}</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-200/80 cursor-pointer hover:bg-amber-50/50">
                  <input
                    type="checkbox"
                    checked={vulnerabilities.hasMedicalEmergency}
                    onChange={(e) => handleVulnerabilityToggle('hasMedicalEmergency', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-medium text-[11px]">🏥 {lang === 'si' ? 'හදිසි වෛද්‍ය සහන' : 'Medical Aid'}</span>
                </label>
              </div>

              {triageResult.tagsEn.length > 0 && (
                <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-[11px] text-amber-950">
                  <strong>Recommendation:</strong> {lang === 'si' ? triageResult.intakeRecommendationSi : triageResult.intakeRecommendationEn}
                </div>
              )}
            </div>

            {/* Section 3: Visit Details & Reason */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  {t.register.sections.visit}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visit Reason Pre-configured List */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.visitReason} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all cursor-pointer"
                  >
                    {VISIT_REASONS.map((vr) => (
                      <option key={vr.id} value={vr.labelEn}>
                        {lang === 'si' ? vr.labelSi : vr.labelEn}
                      </option>
                    ))}
                    <option value="Custom">{lang === 'si' ? 'වෙනත් විශේෂ කරුණක්...' : 'Other Custom Reason...'}</option>
                  </select>

                  {visitReason === 'Custom' && (
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder={lang === 'si' ? 'විශේෂ කරුණ මෙහි ලියන්න' : 'Describe specific assistance requested...'}
                      className="mt-2 w-full px-4 py-2.5 bg-white border border-blue-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  )}
                </div>

                {/* Visit Count */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.visitCount}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVisitCount(Math.max(1, visitCount - 1))}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={visitCount}
                      onChange={(e) => setVisitCount(parseInt(e.target.value, 10) || 1)}
                      className="w-20 text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setVisitCount(visitCount + 1)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
                    >
                      +
                    </button>
                    <span className="text-xs text-slate-600">
                      {visitCount === 1 ? (lang === 'si' ? 'පළමු වර' : 'First Visit') : (lang === 'si' ? 'නැවත පැමිණි' : 'Returning')}
                    </span>
                  </div>
                </div>

                {/* Visit Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.visitDate}
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.arrivalTime}
                  </label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="e.g. 09:30 AM"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* Departure Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.departureTime}
                  </label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="Optional (e.g. 10:15 AM)"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Status & Referral Routing */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  {t.register.sections.routing}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.status}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Visit['status'])}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Waiting">{t.status.waiting}</option>
                    <option value="In Progress">{t.status.inProgress}</option>
                    <option value="Referred">{t.status.referred}</option>
                    <option value="Completed">{t.status.completed}</option>
                  </select>
                </div>

                {/* Referral Officer */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.referralOfficer} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={referralOfficer}
                    onChange={(e) => setReferralOfficer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    {officers.map((off) => (
                      <option key={off.id} value={off.nameEn}>
                        {lang === 'si' ? off.nameSi : off.nameEn} ({off.counterRoom})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Confidential Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.register.fields.notes}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.register.fields.notesPlaceholder}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Form Action Buttons (Large, high-contrast, tactile) */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="w-full sm:flex-1 py-4 px-6 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Icons.UserPlus className="w-5 h-5" />
                <span>{t.actions.save}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-colors cursor-pointer"
              >
                {t.actions.reset}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Interactive Token Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <Icons.Printer className="w-4 h-4" />
                <span>{t.register.tokenCardPreviewTitle}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.register.tokenCardPreviewHint}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleVoiceAnnounce(currentTokenNumber)}
              className="p-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Test Voice Announcement"
            >
              <span>🔊</span>
              <span>Speak</span>
            </button>
          </div>

          <TokenSlip
            tokenNumber={currentTokenNumber}
            clientName={fullName}
            nic={nic}
            gnDivision={gnDivision}
            visitReason={visitReason === 'Custom' && customReason ? customReason : visitReason}
            arrivalTime={arrivalTime}
            visitDate={visitDate}
            referralOfficer={referralOfficer}
            counterRoom={counterRoom}
            whatsappNumber={whatsappNumber}
            lang={lang}
            isPreview={true}
          />
        </div>
      </div>

      {/* Post Registration Modal Dialog */}
      {isSubmitted && lastCreatedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Icons.Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t.register.registrationSuccess}
              </h2>
              <p className="text-xs text-slate-600">
                {t.register.tokenGenerated} <strong className="font-mono text-blue-900 text-sm">{lastCreatedVisit.tokenNumber}</strong>
              </p>

              {/* Voice Announce Button in Modal */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleVoiceAnnounce(lastCreatedVisit.tokenNumber)}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔊</span>
                  <span>{lang === 'si' ? 'ශබ්ද විකාශනය මගින් කැඳවන්න' : 'Broadcast Audio Announcement'}</span>
                </button>
              </div>
            </div>

            {/* Slip embedded inside modal ready to print */}
            <TokenSlip
              tokenNumber={lastCreatedVisit.tokenNumber}
              clientName={lastCreatedVisit.clientName}
              nic={lastCreatedVisit.nic}
              gnDivision={lastCreatedVisit.gnDivision}
              visitReason={lastCreatedVisit.visitReason}
              arrivalTime={lastCreatedVisit.arrivalTime}
              visitDate={lastCreatedVisit.visitDate}
              referralOfficer={lastCreatedVisit.referralOfficerName}
              counterRoom={counterRoom}
              whatsappNumber={lastCreatedVisit.whatsappNumber}
              lang={lang}
              onClose={() => setIsSubmitted(false)}
            />

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                {lang === 'si' ? 'මීළඟ සේවාලාභියා ලියාපදිංචි කරන්න' : 'Register Next Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
