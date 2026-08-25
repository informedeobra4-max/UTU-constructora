import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const { data, error } = await supabase.storage.from('archivos_obra').upload('test.txt', 'hello', { upsert: true });
  console.log("Upload error:", error);
}
main();
