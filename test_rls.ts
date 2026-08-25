import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function testRLS() {
  console.log('Testing RLS on archivos_obra...');
  
  // 1. Try to INSERT
  const { data: insertData, error: insertError } = await supabase
    .from('archivos_obra')
    .insert([{ obra_id: '0', categoria: 'TEST_RLS', subcategoria: 'UTU', nombre: 'Test', tipo: 'image', has_file: false }])
    .select()
    .single();
    
  if (insertError) {
    console.error('INSERT Failed:', insertError.message);
    return;
  }
  console.log('INSERT Success! ID:', insertData.id);
  
  // 2. Try to UPDATE
  const { error: updateError } = await supabase
    .from('archivos_obra')
    .update({ nombre: 'Test Updated' })
    .eq('id', insertData.id);
    
  if (updateError) {
    console.error('UPDATE Failed:', updateError.message);
  } else {
    console.log('UPDATE Success!');
  }
  
  // 3. Try to DELETE
  const { error: deleteError } = await supabase
    .from('archivos_obra')
    .delete()
    .eq('id', insertData.id);
    
  if (deleteError) {
    console.error('DELETE Failed:', deleteError.message);
  } else {
    console.log('DELETE Success!');
  }
}

testRLS();
