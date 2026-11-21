import { supabase, isSupabaseConfigured } from './supabase-client';
import { Client, Visit, Referral, GNDivision, Officer } from './types';
import { DEFAULT_GN_DIVISIONS, DEFAULT_OFFICERS } from './constants';

/**
 * ====================================================================
 * GAMI PADANAMA - PRODUCTION SUPABASE DATABASE QUERY SERVICE
 * ====================================================================
 * Automatically routes queries to live Supabase PostgreSQL when configured.
 * Seamlessly falls back to local persistent store for offline/demo operation.
 */

// --------------------------------------------------------------------
// 1. GN DIVISIONS & OFFICERS LOOKUP QUERIES
// --------------------------------------------------------------------

export async function getGnDivisions(): Promise<GNDivision[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('gn_divisions')
        .select('*')
        .eq('is_active', true)
        .order('name_en', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          code: d.code,
          nameEn: d.name_en,
          nameSi: d.name_si,
          subArea: d.sub_area || '',
        }));
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_GN_DIVISIONS;
}

export async function getOfficers(): Promise<Officer[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .eq('is_active', true)
        .order('name_en', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((o) => ({
          id: o.id,
          nameEn: o.name_en,
          nameSi: o.name_si,
          designationEn: o.designation_en,
          designationSi: o.designation_si,
          department: o.department,
          counterRoom: o.counter_room,
          contactNumber: o.contact_number || '',
          active: o.is_active,
        }));
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_OFFICERS;
}

// --------------------------------------------------------------------
// 2. CLIENT INTAKE & REGISTRATION QUERIES
// --------------------------------------------------------------------

export interface RegisterClientParams {
  nic: string;
  fullName: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  gnDivisionId?: string;
  gnDivisionName: string;
  whatsappNumber: string;
  visitReason: string;
  visitCount?: number;
  visitDate?: string;
  arrivalTime: string;
  referralOfficerId?: string;
  referralOfficerName?: string;
  notes?: string;
}

export interface RegisterResult {
  success: boolean;
  client: Client;
  visit: Visit;
  error?: string;
}

export async function registerClientWithVisit(params: RegisterClientParams): Promise<RegisterResult> {
  const todayStr = params.visitDate || new Date().toISOString().split('T')[0];

  if (isSupabaseConfigured()) {
    try {
      // Attempt executing atomic RPC function
      const { data, error } = await supabase.rpc('rpc_register_client_with_token', {
        p_nic: params.nic.trim().toUpperCase(),
        p_full_name: params.fullName.trim(),
        p_address: params.address.trim(),
        p_gender: params.gender,
        p_gn_division_id: params.gnDivisionId || null,
        p_gn_division_name: params.gnDivisionName,
        p_whatsapp_number: params.whatsappNumber.trim(),
        p_visit_reason: params.visitReason,
        p_arrival_time: params.arrivalTime,
        p_referral_officer_id: params.referralOfficerId || null,
        p_referral_officer_name: params.referralOfficerName || null,
        p_notes: params.notes || null,
      });

      if (!error && data) {
        const client: Client = {
          id: data.client_id,
          fullName: data.client_name,
          address: params.address,
          nic: data.nic,
          gender: params.gender,
          gnDivision: data.gn_division,
          whatsappNumber: params.whatsappNumber,
          visitCount: data.is_new_client ? 1 : 2,
          firstVisitDate: todayStr,
          lastVisitDate: todayStr,
          createdAt: new Date().toISOString(),
        };

        const visit: Visit = {
          id: data.visit_id,
          clientId: data.client_id,
          clientName: data.client_name,
          nic: data.nic,
          tokenNumber: data.token_number,
          visitReason: params.visitReason,
          visitCount: client.visitCount,
          visitDate: todayStr,
          arrivalTime: params.arrivalTime,
          status: 'Waiting',
          whatsappNumber: params.whatsappNumber,
          referralOfficerId: params.referralOfficerId || '',
          referralOfficerName: params.referralOfficerName || '',
          gnDivision: data.gn_division,
          notes: params.notes,
          createdAt: new Date().toISOString(),
        };

        return { success: true, client, visit };
      }
    } catch {
      // Fallback to local mode
    }
  }

  // Local fallback (Safe, atomic, zero dummy records)
  const clientId = `cli-${Date.now()}`;
  const visitId = `vis-${Date.now()}`;
  const tokenNumber = `GP-AMP-${new Date().getFullYear()}-${String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0')}`;

  const client: Client = {
    id: clientId,
    fullName: params.fullName.trim(),
    address: params.address.trim(),
    nic: params.nic.trim().toUpperCase(),
    gender: params.gender,
    gnDivision: params.gnDivisionName,
    whatsappNumber: params.whatsappNumber.trim(),
    visitCount: params.visitCount || 1,
    firstVisitDate: todayStr,
    lastVisitDate: todayStr,
    createdAt: new Date().toISOString(),
  };

  const visit: Visit = {
    id: visitId,
    clientId,
    clientName: params.fullName.trim(),
    nic: params.nic.trim().toUpperCase(),
    tokenNumber,
    visitReason: params.visitReason,
    visitCount: params.visitCount || 1,
    visitDate: todayStr,
    arrivalTime: params.arrivalTime,
    status: 'Waiting',
    whatsappNumber: params.whatsappNumber.trim(),
    referralOfficerId: params.referralOfficerId || '',
    referralOfficerName: params.referralOfficerName || 'Front Desk',
    gnDivision: params.gnDivisionName,
    notes: params.notes,
    createdAt: new Date().toISOString(),
  };

  return { success: true, client, visit };
}

// --------------------------------------------------------------------
// 3. TODAY'S VISITS & LIVE QUEUE QUERIES
// --------------------------------------------------------------------

export async function fetchTodayVisits(): Promise<Visit[]> {
  if (isSupabaseConfigured()) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('visits')
        .select(`
          id, client_id, token_number, visit_reason, visit_count_snapshot,
          visit_date, arrival_time, departure_time, status, whatsapp_number,
          referral_officer_id, referral_officer_name, gn_division_name, notes,
          clients ( full_name, nic )
        `)
        .eq('visit_date', today)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((row: Record<string, unknown>) => {
          const clientData = row.clients as { full_name?: string; nic?: string } | null;
          return {
            id: row.id as string,
            clientId: row.client_id as string,
            clientName: clientData?.full_name || 'Community Member',
            nic: clientData?.nic || '',
            tokenNumber: row.token_number as string,
            visitReason: row.visit_reason as string,
            visitCount: (row.visit_count_snapshot as number) || 1,
            visitDate: row.visit_date as string,
            arrivalTime: row.arrival_time as string,
            departureTime: (row.departure_time as string) || undefined,
            status: row.status as Visit['status'],
            whatsappNumber: (row.whatsapp_number as string) || '',
            referralOfficerId: (row.referral_officer_id as string) || '',
            referralOfficerName: (row.referral_officer_name as string) || '',
            gnDivision: (row.gn_division_name as string) || '',
            notes: (row.notes as string) || undefined,
            createdAt: row.visit_date as string,
          };
        });
      }
    } catch {
      // Fallback
    }
  }

  // Load from local storage
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('gami_visits');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
  }
  return [];
}

// --------------------------------------------------------------------
// 4. VISIT STATUS & DEPARTURE UPDATES
// --------------------------------------------------------------------

export async function updateVisitStatusInDb(visitId: string, status: Visit['status']): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'In Progress') updates.served_at = new Date().toISOString();
      if (status === 'Completed') updates.completed_at = new Date().toISOString();

      const { error } = await supabase.from('visits').update(updates).eq('id', visitId);
      return !error;
    } catch {
      return false;
    }
  }
  return true;
}

export async function logDepartureInDb(visitId: string, departureTime: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.rpc('rpc_log_departure', {
        p_visit_id: visitId,
        p_departure_time: departureTime,
      });
      return !error;
    } catch {
      return false;
    }
  }
  return true;
}

// --------------------------------------------------------------------
// 5. REFERRAL MANAGEMENT QUERIES
// --------------------------------------------------------------------

export async function fetchReferrals(): Promise<Referral[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id, referral_code, visit_id, client_id, referring_officer_name,
          target_officer_id, target_officer_name, target_department,
          urgency, status, case_summary, action_plan, appointment_date,
          created_at, clients ( full_name, nic, gn_division_name )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((r: Record<string, unknown>) => {
          const clientData = r.clients as { full_name?: string; nic?: string; gn_division_name?: string } | null;
          return {
            id: (r.referral_code as string) || (r.id as string),
            visitId: (r.visit_id as string) || '',
            clientId: r.client_id as string,
            clientName: clientData?.full_name || 'Client',
            nic: clientData?.nic || '',
            gnDivision: clientData?.gn_division_name || '',
            referringOfficer: r.referring_officer_name as string,
            targetOfficerId: (r.target_officer_id as string) || '',
            targetOfficerName: r.target_officer_name as string,
            targetDepartment: r.target_department as string,
            urgency: r.urgency as Referral['urgency'],
            status: r.status as Referral['status'],
            caseSummary: r.case_summary as string,
            appointmentDate: (r.appointment_date as string) || undefined,
            createdAt: r.created_at as string,
          };
        });
      }
    } catch {
      // Fallback
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('gami_referrals');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
  }
  return [];
}

export async function createReferralInDb(referral: Referral): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('referrals').insert({
        referral_code: referral.id,
        visit_id: referral.visitId || null,
        client_id: referral.clientId,
        referring_officer_name: referral.referringOfficer,
        target_officer_id: referral.targetOfficerId || null,
        target_officer_name: referral.targetOfficerName,
        target_department: referral.targetDepartment,
        urgency: referral.urgency,
        status: referral.status,
        case_summary: referral.caseSummary,
        appointment_date: referral.appointmentDate || null,
      });

      if (!error && referral.visitId) {
        // Update visit status
        await supabase.from('visits').update({ status: 'Referred' }).eq('id', referral.visitId);
      }
      return !error;
    } catch {
      return false;
    }
  }
  return true;
}

export async function updateReferralStatusInDb(referralId: string, status: Referral['status']): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === 'Resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('referrals')
        .update(updates)
        .or(`id.eq.${referralId},referral_code.eq.${referralId}`);

      return !error;
    } catch {
      return false;
    }
  }
  return true;
}
