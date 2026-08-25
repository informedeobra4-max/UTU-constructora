import { ArrowLeft, Plus, Building2, User, FileSpreadsheet, Trash2, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';

interface PresupuestosViewProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
  setEditingPresupuestoId: (id: number | null) => void;
}

export default function PresupuestosView({ navigate, activeObraId, setEditingPresupuestoId }: PresupuestosViewProps) {
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeObraName, setActiveObraName] = useState('Obra General');
  const [refreshCounter, setRefreshCounter] = useState(0);

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
        .from('presupuestos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Filtrar por obra
        const filtered = data.filter(p => 
          activeObraId === 'general' ? true : p.obra_id === activeObraId.toString()
        );
        setPresupuestos(filtered);
      }
      setIsLoading(false);
    };

    init();
  }, [activeObraId, refreshCounter]);

  useEffect(() => {
    const channel = supabase
      .channel('presupuestos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presupuestos' }, () => {
        setRefreshCounter(c => c + 1);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este presupuesto?')) {
      const { error } = await supabase.from('presupuestos').delete().eq('id', id);
      if (!error) {
        setPresupuestos(presupuestos.filter(p => p.id !== id));
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('back')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-lg truncate flex-1 mx-4 text-center">Presupuestos</h1>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto relative min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="text-center space-y-1 mb-6">
          <h2 className="text-xs text-text-muted font-bold tracking-widest uppercase">Listado para</h2>
          <h3 className="text-blue-500 font-bold text-xl">{activeObraName}</h3>
        </div>

        <div className="space-y-4">
          {presupuestos.map(p => (
            <div key={p.id} className="bg-surface rounded-2xl p-5 border border-surface-hover flex flex-col space-y-3 shadow-sm">
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-text-main font-bold text-lg leading-tight">{p.empresa}</h3>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${p.estado === 'Aprobado' ? 'bg-green-500/20 text-green-500' : 'bg-surface-hover text-text-muted'}`}>
                      {p.estado}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingPresupuestoId(p.id); navigate('presupuestos_form'); }} className="p-2 text-text-muted hover:text-blue-500 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-background-alt rounded-xl p-3 text-sm text-text-muted font-medium border border-surface-hover">
                {p.notas || 'Sin descripción adicional'}
              </div>

              <div className="flex justify-between items-end pt-2">
                <div className="flex items-center gap-1.5 text-text-muted text-xs">
                  <User className="w-3.5 h-3.5" />
                  <span>{p.encargado}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">Costo Total</span>
                  <span className="text-blue-500 font-black text-xl">{formatCurrency(p.costo)}</span>
                </div>
              </div>

              {p.has_image && (
                <div className="pt-3 mt-2 border-t border-surface-hover">
                  <button 
                    onClick={() => window.open(supabase.storage.from('comprobantes').getPublicUrl(`presupuestos/${p.id}`).data.publicUrl, '_blank')}
                    className="w-full flex items-center justify-center gap-2 bg-background-alt hover:bg-surface border border-surface-hover py-2.5 rounded-xl text-blue-500 font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Ver Presupuesto Adjunto
                  </button>
                </div>
              )}

            </div>
          ))}

          {presupuestos.length === 0 && !isLoading && (
            <div className="text-center py-20 text-text-muted flex flex-col items-center">
              <FileSpreadsheet className="w-12 h-12 mb-3 opacity-20" />
              <p>No hay presupuestos cargados para esta obra.</p>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent pb-8">
        <button 
          onClick={() => { setEditingPresupuestoId(null); navigate('presupuestos_form'); }}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          CARGAR PRESUPUESTO
        </button>
      </div>

    </div>
  );
}
