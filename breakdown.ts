import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctzaqsuzytydagbuhcmh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emFxc3V6eXR5ZGFnYnVoY21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzI1MDYsImV4cCI6MjEwMjY0ODUwNn0.qo66yfKQ-9E-IPoM9H9j_4rQym8FG5yTSH-SjRhAYJQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: ingresos } = await supabase.from('ingresos').select('monto, moneda');
  const { data: gastos } = await supabase.from('gastos').select('*');
  
  let ingARS = 0;
  ingresos?.forEach(i => {
    if (i.moneda !== 'USD') ingARS += (i.monto || 0);
  });
  
  let gastosARS = 0;
  let gastosPorObra: any = {};
  
  gastos?.forEach(g => {
    if (g.moneda !== 'USD') {
      gastosARS += (g.amount || 0);
      let obra = g.subtitle?.split(' • ')[0]?.trim() || 'Desconocida';
      gastosPorObra[obra] = (gastosPorObra[obra] || 0) + (g.amount || 0);
    }
  });

  console.log(`Total Ingresos ARS: ${ingARS}`);
  console.log(`Total Gastos ARS: ${gastosARS}`);
  console.log(`Diferencia (Gastos - Ingresos): ${gastosARS - ingARS}`);
  console.log('Gastos por Obra:', gastosPorObra);
}

check();
