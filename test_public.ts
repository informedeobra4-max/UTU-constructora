import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const url = supabase.storage.from('comprobantes').getPublicUrl('test.txt').data.publicUrl;
  console.log("Public URL:", url);
  
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
main();
