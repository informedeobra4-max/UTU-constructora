import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const { data: ingresos, error } = await supabase.from('ingresos').select('monto, moneda, cotizacion_dolar');
  console.log("Error:", error);
  console.log("Data:", ingresos);
}
main();
