import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Explicit demo mode flag: strictly true only when VITE_DEMO_MODE is 'true'
export const isDemoMode: boolean = import.meta.env.VITE_DEMO_MODE === 'true';

// Dynamically check if valid Supabase environment credentials are provided
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

// If credentials are missing or invalid, do not initialize or connect to Supabase
export const supabase: SupabaseClient | null = isSupabaseConfigured && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Returns the active Supabase client or null if unconfigured.
 */
export function getSupabase(): SupabaseClient | null {
  return supabase;
}

