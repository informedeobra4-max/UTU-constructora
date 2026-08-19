import { createClient } from '@supabase/supabase-js';

// HARDCODED to bypass stale GitHub Secrets on the repository
const supabaseUrl = 'https://qlsgtgcotsdanodgyenh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc2d0Z2NvdHNkYW5vZGd5ZW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDIxNTQsImV4cCI6MjEwMjcxODE1NH0.JR32RxOkqK7rZPiwCLljpZHqKE3JAkGlibr2i1tCdww';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
