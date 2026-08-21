import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctzaqsuzytydagbuhcmh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emFxc3V6eXR5ZGFnYnVoY21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzI1MDYsImV4cCI6MjEwMjY0ODUwNn0.qo66yfKQ-9E-IPoM9H9j_4rQym8FG5yTSH-SjRhAYJQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: ingresos } = await supabase.from('ingresos').select('*').limit(1);
  console.log('Ingresos schema:', ingresos?.[0]);

  const { data: gastos } = await supabase.from('gastos').select('*').limit(1);
  console.log('Gastos schema:', gastos?.[0]);
}
check();
