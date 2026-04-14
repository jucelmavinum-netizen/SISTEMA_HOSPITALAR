import { createClient } from '@supabase/supabase-js';

// @ts-ignore - import.meta.env is provided by Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * SISA Supabase Integration Helper
 * 
 * This client provides access to:
 * - Auth: User management and RBAC
 * - Database: Real-time clinical data
 * - Storage: Patient documents and exams
 */
