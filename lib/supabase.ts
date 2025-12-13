import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent runtime errors
// We cast to 'any' to allow optional chaining on 'env' in case it is undefined in the runtime environment
const env = (import.meta as any).env;
const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase Environment Variables. Please check your .env file.');
}

// Create client with fallback values to prevent application crash on startup
// Note: Real Supabase functionality will fail if keys are invalid/missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);