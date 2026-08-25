import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

const urlNumber = supabase.storage.from('comprobantes').getPublicUrl(123 as any).data.publicUrl;
console.log("URL Number:", urlNumber);
