import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials.\n' +
    'Copy .env.example to .env.local and fill in your keys.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
