import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctzaqsuzytydagbuhcmh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emFxc3V6eXR5ZGFnYnVoY21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzI1MDYsImV4cCI6MjEwMjY0ODUwNn0.qo66yfKQ-9E-IPoM9H9j_4rQym8FG5yTSH-SjRhAYJQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDB() {
  console.log("Testing 'obras' table...");
  const { data: obras, error: obrasError } = await supabase.from('obras').select('*').limit(1);
  console.log('Obras fetch error:', obrasError?.message || 'None');

  const { data: insertObra, error: insertError } = await supabase.from('obras').insert([{ name: 'Test', status: 'Test' }]).select();
  console.log('Obras insert error:', insertError?.message || 'None');

  console.log("\nTesting 'notificaciones' table...");
  const { data: notif, error: notifError } = await supabase.from('notificaciones').select('*').limit(1);
  console.log('Notificaciones fetch error:', notifError?.message || 'None');

  const { data: insertNotif, error: notifInsertError } = await supabase.from('notificaciones').insert([{ obraId: 'general', obraName: 'General', message: 'Test', time: 'Test' }]).select();
  console.log('Notificaciones insert error:', notifInsertError?.message || 'None');
}

testDB();
