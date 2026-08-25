import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctzaqsuzytydagbuhcmh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emFxc3V6eXR5ZGFnYnVoY21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzI1MDYsImV4cCI6MjEwMjY0ODUwNn0.qo66yfKQ-9E-IPoM9H9j_4rQym8FG5yTSH-SjRhAYJQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSchema() {
  console.log('Testing inserting a row with cotizacion_dolar to see if column exists...');
  
  // We can't easily alter schema via REST API. The user needs to add the column manually in Supabase,
  // or we can just try to insert and catch the error.
  const { error } = await supabase.from('gastos').insert([{ 
    type: 'varios', 
    title: 'test', 
    amount: 1, 
    cotizacion_dolar: 1515 
  }]);
  
  console.log('Error when inserting cotizacion_dolar into gastos:', error);
}

testSchema();
