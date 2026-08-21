import { ArrowLeft, Plus, DollarSign, User, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';

interface IngresosViewProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}

export default function IngresosView({ navigate, activeObraId }: IngresosViewProps) {
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeObraName, setActiveObraName] = useState('Obra General');

  useEffect(() => {
    const init = async () => {
      let currentName = 'General';
      if (activeObraId !== 'general') {
        const { data: obras } = await supabase.from('obras').select('*');
        const obra = obras?.find(o => o.id === activeObraId);
        if (obra) currentName = obra.name;
      }
      setActiveObraName(currentName);

      const { data, error } = await supabase
        .from('ingresos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const filtered = data.filter(i => 
          activeObraId === 'general' ? true : i.obra_id === activeObraId.toString()
        );
        setIngresos(filtered);
      }
      setIsLoading(false);
    };

    init();
  }, [activeObraId]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este depósito? Esto afectará el Valor Inicial.')) {
      const { error } = await supabase.from('ingresos').delete().eq('id', id);
      if (!error) {
        setIngresos(ingresos.filter(i => i.id !== id));
      }
    }
  };

  const formatCurrency = (amount: number, moneda: string = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda === 'USD' ? 'USD' : 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + (moneda === 'USD' ? ' USD' : '');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('dashboard')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-lg truncate flex-1 mx-4 text-center">Valor Inicial</h1>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto relative min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="text-center space-y-1 mb-6">
          <h2 className="text-xs text-text-muted font-bold tracking-widest uppercase">Depósitos de la obra</h2>
          <h3 className="text-green-500 font-bold text-xl">{activeObraName}</h3>
        </div>

        <div className="space-y-4">
          {ingresos.map(ingreso => (
            <div key={ingreso.id} className="bg-surface rounded-2xl p-5 border border-surface-hover flex flex-col space-y-3 shadow-sm border-l-4 border-l-green-500">
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${ingreso.moneda === 'USD' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-text-main font-bold text-lg leading-tight">{formatCurrency(ingreso.monto, ingreso.moneda)}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                      {new Date(ingreso.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(ingreso.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-background-alt rounded-xl p-3 text-sm text-text-main font-medium border border-surface-hover">
                {ingreso.concepto || 'Ingreso de caja / Depósito'}
              </div>

              <div className="flex justify-between items-end pt-2">
                <div className="flex items-center gap-1.5 text-text-muted text-xs font-bold uppercase tracking-widest">
                  <User className="w-3.5 h-3.5" />
                  <span>Depositado por: <span className="text-text-main">{ingreso.encargado}</span></span>
                </div>
              </div>

            </div>
          ))}

          {ingresos.length === 0 && !isLoading && (
            <div className="text-center py-20 text-text-muted flex flex-col items-center">
              <DollarSign className="w-12 h-12 mb-3 opacity-20" />
              <p>No hay ingresos cargados.<br/>Añade un depósito para formar el Valor Inicial.</p>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent pb-8">
        <button 
          onClick={() => navigate('ingresos_form')}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          NUEVO INGRESO / DEPÓSITO
        </button>
      </div>
    </div>
  );
}
