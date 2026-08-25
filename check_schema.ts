import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ctzaqsuzytydagbuhcmh.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emFxc3V6eXR5ZGFnYnVoY21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzI1MDYsImV4cCI6MjEwMjY0ODUwNn0.qo66yfKQ-9E-IPoM9H9j_4rQym8FG5yTSH-SjRhAYJQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('gastos').select('*').limit(1);
  if (error) {
    console.error('Error fetching gastos:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in gastos:');
    const cols = Object.keys(data[0]);
    cols.forEach(col => {
      console.log(`- '${col}' (length: ${col.length})`);
    });
  } else {
    console.log('No data in gastos.');
  }
}
check();
