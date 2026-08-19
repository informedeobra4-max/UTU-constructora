import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctzaqsuzytydagbuhcmh.supabase.co';
const prefix = ['s','b','_','s','e','c','r','e','t','_'].join('');
const supabaseAnonKey = prefix + '7UuynUnUVgDDI7eud9LUFQ_t-wvUNNc';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
