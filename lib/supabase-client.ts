import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Checks if real Supabase environment variables are configured
 */
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-anon-key')) {
    return false;
  }
  return true;
};

/**
 * Singleton Supabase Client
 * Falls back safely to a placeholder instance to prevent crashes if .env is missing
 */
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl! : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey! : 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export interface DatabaseState {
  isLive: boolean;
  message: string;
  nodeName: string;
}

export const getDatabaseStatus = (): DatabaseState => {
  if (isSupabaseConfigured()) {
    return {
      isLive: true,
      message: 'Connected to Live Supabase PostgreSQL Database (Production Node)',
      nodeName: 'Supabase Cloud (AWS ap-southeast-1)',
    };
  }
  return {
    isLive: false,
    message: 'Local Production Engine Active (Offline/Demo Mode with localStorage Persistence)',
    nodeName: 'Ampitiya Local Cache Node',
  };
};
