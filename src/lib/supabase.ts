import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gdrsakejkfcfaomkjkaz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Um0GKnc4Qj2xFJqhJZCZmQ_hbd8juXC';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean = true;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Returns the active Supabase client.
 */
export function getSupabase(): SupabaseClient {
  return supabase;
}
