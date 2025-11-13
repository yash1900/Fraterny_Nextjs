import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Small debug logs for local development: only log presence (not values) to avoid printing secrets
if (process.env.NODE_ENV !== 'production') {
  try {
    // We intentionally log only boolean presence to avoid leaking secret values in logs.
    // These logs will appear in the terminal where Next.js is run.
    // Remove these after debugging.
    // eslint-disable-next-line no-console
    console.log('[debug] NEXT_PUBLIC_SUPABASE_URL present:', Boolean(supabaseUrl));
    // eslint-disable-next-line no-console
    console.log('[debug] NEXT_PUBLIC_SUPABASE_ANON_KEY present:', Boolean(supabaseAnonKey));
  } catch (e) {
    // ignore logging errors
  }
}

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Client-side Supabase client
// first check if there is already a connection to avoid multiple instances in development
let supabaseClient;

export const supabase = (() => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
})();
