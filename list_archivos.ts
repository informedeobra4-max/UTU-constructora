import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const { data, error } = await supabase.storage.from('archivos_obra').list();
  console.log("Error:", error);
  console.log("Files:", data?.length);
  if (data) {
    for (let i = 0; i < Math.min(5, data.length); i++) {
      console.log(data[i].name);
    }
  }
}
main();
