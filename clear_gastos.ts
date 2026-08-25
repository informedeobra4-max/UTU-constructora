import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctzaqsuzytydagbuhcmh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emFxc3V6eXR5ZGFnYnVoY21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzI1MDYsImV4cCI6MjEwMjY0ODUwNn0.qo66yfKQ-9E-IPoM9H9j_4rQym8FG5yTSH-SjRhAYJQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearGastos() {
  const { error } = await supabase.from('gastos').delete().not('id', 'is', null);
  if (error) {
    console.error('Error clearing gastos:', error);
  } else {
    console.log('Todos los gastos han sido eliminados correctamente.');
  }
}

clearGastos();
