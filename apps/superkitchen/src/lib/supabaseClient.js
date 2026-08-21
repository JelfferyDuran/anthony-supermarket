// Supabase client for staff auth (sign-in only — all order data goes through
// the edge functions with the staff Bearer token; no direct DB access).
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cbpdiiyzzmbavsymjysb.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
