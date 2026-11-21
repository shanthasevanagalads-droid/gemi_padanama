/**
 * Offline-First Resilient Sync Engine for Rural Sri Lankan Field Offices
 * Ensures uninterrupted walk-in client registration during power cuts
 * or rural internet dropouts in Ampitiya.
 */

import { Visit, Client } from './types';
import { registerClientWithVisit } from './supabase-queries';

export interface QueuedIntake {
  id: string;
  client: Client;
  visit: Visit;
  queuedAt: string;
}

const STORAGE_KEY = 'gami_offline_sync_queue';

export function getOfflineQueue(): QueuedIntake[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineIntake(client: Client, visit: Visit): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getOfflineQueue();
    const item: QueuedIntake = {
      id: `queue-${Date.now()}`,
      client,
      visit,
      queuedAt: new Date().toISOString(),
    };
    current.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage quota or restriction
  }
}

export async function flushOfflineQueue(
  onSynced?: (item: QueuedIntake) => void
): Promise<{ syncedCount: number; errors: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { syncedCount: 0, errors: 0 };

  let syncedCount = 0;
  let errors = 0;
  const remaining: QueuedIntake[] = [];

  for (const item of queue) {
    try {
      const res = await registerClientWithVisit({
        nic: item.client.nic,
        fullName: item.client.fullName,
        address: item.client.address,
        gender: item.client.gender,
        gnDivisionName: item.client.gnDivision,
        whatsappNumber: item.client.whatsappNumber,
        visitReason: item.visit.visitReason,
        visitCount: item.visit.visitCount,
        visitDate: item.visit.visitDate,
        arrivalTime: item.visit.arrivalTime,
        referralOfficerId: item.visit.referralOfficerId,
        referralOfficerName: item.visit.referralOfficerName,
        notes: item.visit.notes,
      });

      if (res.success) {
        syncedCount++;
        if (onSynced) onSynced(item);
      } else {
        remaining.push(item);
        errors++;
      }
    } catch {
      remaining.push(item);
      errors++;
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  } catch {
    // Ignore
  }

  return { syncedCount, errors };
}
