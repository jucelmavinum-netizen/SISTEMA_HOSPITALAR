import { createClient } from '@supabase/supabase-js';

const sanitizeEnv = (value: any): string => {
  if (typeof value !== 'string') return '';
  // Remove wrapping straight/curly quotes, invisible characters, spaces, and any non-ASCII characters
  return value
    .trim()
    .replace(/[\u201C\u201D\u2018\u2019'"“`\u200B]/g, '')
    .replace(/[^\x21-\x7E]/g, '');
};

// @ts-ignore - import.meta.env is provided by Vite
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = sanitizeEnv(rawUrl);
const supabaseAnonKey = sanitizeEnv(rawAnonKey);

if (!rawUrl || !rawAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
} else if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables were found but became empty after sanitization.'
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
