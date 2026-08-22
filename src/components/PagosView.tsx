import { ArrowLeft, Briefcase, FileText, Hammer, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';

interface PagosViewProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}

export default function PagosView({ navigate, activeObraId }: PagosViewProps) {
  const [obraName, setObraName] = useState('Obra General');
  const [gastosTotales, setGastosTotales] = useState(0);
  const [gastosMateriales, setGastosMateriales] = useState(0);
  const [gastosManoObra, setGastosManoObra] = useState(0);
  const [gastosVarios, setGastosVarios] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      let currentName = 'General';
      if (activeObraId !== 'general') {
        const { data } = await supabase.from('obras').select('*').order('id', { ascending: true });
        if (data) {
          const obra = data.find((o: any) => o.id === activeObraId);
          if (obra) currentName = obra.name;
        }
      }
      setObraName(currentName);

      const { data, error } = await supabase.from('gastos').select('amount, subtitle, type');
      if (error || !data) return;

      let total = 0, mat = 0, mano = 0, varios = 0;
      data.forEach(gasto => {
        const gastoObraName = gasto.subtitle?.split(' • ')[0];
        if (gastoObraName === currentName || (activeObraId === 'general' && gastoObraName === 'General')) {
          total += gasto.amount || 0;
          if (gasto.type === 'materiales') mat += gasto.amount || 0;
          if (gasto.type === 'mano_obra') mano += gasto.amount || 0;
          if (gasto.type === 'varios') varios += gasto.amount || 0;
        }
      });
      setGastosTotales(total);
      setGastosMateriales(mat);
      setGastosManoObra(mano);
      setGastosVarios(varios);
      setIsLoading(false);
    };

    init();
  }, [activeObraId]);

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
        <h1 className="text-text-main font-semibold text-lg truncate flex-1 mx-4 text-center">Menú de Pagos</h1>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto relative min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-surface rounded-2xl p-6 border border-green-500/30 relative overflow-hidden shadow-[0_10px_30px_rgba(34,197,94,0.1)]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500" />
          <div className="text-center space-y-2">
            <h2 className="text-xs text-text-muted font-bold tracking-widest uppercase">Gastos de {obraName}</h2>
            <h3 className="text-green-500 font-bold text-lg">Total Acumulado</h3>
            <p className="text-4xl font-extrabold text-green-500 tracking-tight">{formatCurrency(gastosTotales)}</p>
          </div>
        </div>

        {/* Primary Section Cards */}
        <div className="space-y-4">
          {/* Materiales */}
          <div className="bg-surface rounded-2xl p-5 border border-surface-hover flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-background-alt rounded-xl text-primary">
                <Hammer className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-text-main font-semibold text-lg">Materiales / Compras</h3>
                <p className="text-text-muted text-sm mt-1">Subtotal: <span className="text-text-main font-bold">{formatCurrency(gastosMateriales)}</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('compras')}
              className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-colors"
            >
              REGISTRAR COMPRA
            </button>
          </div>

          {/* Mano de Obra */}
          <div className="bg-surface rounded-2xl p-5 border border-surface-hover flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-background-alt rounded-xl text-primary">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-text-main font-semibold text-lg">Mano de Obra</h3>
                <p className="text-text-muted text-sm mt-1">Subtotal: <span className="text-text-main font-bold">{formatCurrency(gastosManoObra)}</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('mano_obra')}
              className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-colors"
            >
              NUEVO CERTIFICADO
            </button>
          </div>

          {/* Gastos Varios */}
          <div className="bg-surface rounded-2xl p-5 border border-surface-hover flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-background-alt rounded-xl text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-text-main font-semibold text-lg">Gastos Varios</h3>
                <p className="text-text-muted text-sm mt-1">Subtotal: <span className="text-text-main font-bold">{formatCurrency(gastosVarios)}</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('varios')}
              className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-colors"
            >
              REGISTRAR GASTO
            </button>
          </div>

          {/* Control de Gastos */}
          <div className="bg-surface rounded-2xl p-5 border border-surface-hover flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-background-alt rounded-xl text-primary">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-text-main font-semibold text-lg">Control de Gastos</h3>
                <p className="text-text-muted text-sm mt-1">Suma Total: <span className="text-text-main font-bold">{formatCurrency(gastosTotales)}</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('gastos')}
              className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-colors"
            >
              DESGLOSE GENERAL
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
