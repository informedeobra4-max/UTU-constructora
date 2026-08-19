import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlsgtgcotsdanodgyenh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc2d0Z2NvdHNkYW5vZGd5ZW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDIxNTQsImV4cCI6MjEwMjcxODE1NH0.JR32RxOkqK7rZPiwCLljpZHqKE3JAkGlibr2i1tCdww';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: obrasInsert, error: obrasError } = await supabase.from('obras').insert([{ name: 'Test', status: 'Test' }]).select();
  console.log('Obras insert check:', { obrasInsert, obrasError });
  
  if (obrasInsert) {
    await supabase.from('obras').delete().eq('id', obrasInsert[0].id);
  }
}

check();
