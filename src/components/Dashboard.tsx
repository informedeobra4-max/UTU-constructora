import { ArrowLeft, Bell, Wallet, FileSpreadsheet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';
import HorizontalCalendar from './HorizontalCalendar';

interface DashboardProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}

export default function Dashboard({ navigate, activeObraId }: DashboardProps) {
  const [obraName, setObraName] = useState('Obra General');
  const [gastosTotales, setGastosTotales] = useState(0);
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

      let total = 0;
      data.forEach(gasto => {
        const gastoObraName = gasto.subtitle?.split(' • ')[0];
        if (gastoObraName === currentName || (activeObraId === 'general' && gastoObraName === 'General')) {
          total += gasto.amount || 0;
        }
      });
      setGastosTotales(total);
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

  const days = [
    { name: 'L', date: '21', active: false },
    { name: 'M', date: '22', active: false },
    { name: 'M', date: '23', active: true },
    { name: 'J', date: '24', active: false },
    { name: 'V', date: '25', active: false },
    { name: 'S', date: '26', active: false },
    { name: 'D', date: '27', active: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('obras_list')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-lg truncate flex-1 mx-4 text-center hidden md:block">{obraName}</h1>
        <div className="flex items-center space-x-4 text-text-muted">
          <button onClick={() => navigate('notifications')} className="relative hover:text-text-main transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto relative min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {/* Full Date Header */}
        <div>
          <h2 className="text-xl font-bold text-text-main capitalize">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <p className="text-sm text-text-muted">Obra Activa: {obraName}</p>
        </div>

        {/* Date & Period Filter Bar */}
        <div className="w-full" onClick={() => navigate('calendar')}>
          <HorizontalCalendar 
            activeObraId={activeObraId} 
            showTitle={false} 
          />
        </div>

        {/* Hero Card */}
        <div className="bg-surface rounded-2xl p-6 border border-green-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          <div className="text-center space-y-2">
            <h2 className="text-xs text-text-muted font-bold tracking-widest uppercase">Resumen General</h2>
            <h3 className="text-green-500 font-bold text-lg">Gasto Total Acumulado</h3>
            <p className="text-4xl font-extrabold text-green-500 tracking-tight">{formatCurrency(gastosTotales)}</p>
          </div>
        </div>

        {/* Primary Section Cards */}
        <div className="space-y-4 pt-4">
          
          {/* Botón PRESUPUESTOS */}
          <div className="bg-surface rounded-3xl p-5 border border-blue-500/30 shadow-[0_10px_30px_rgba(59,130,246,0.1)] flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-text-main font-black text-xl tracking-wide uppercase">Presupuestos</h3>
                <p className="text-text-muted text-sm mt-1 font-medium">Gestión de cotizaciones y archivos</p>
              </div>
            </div>
            <button
              onClick={() => navigate('presupuestos_view')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02]"
            >
              ENTRAR A PRESUPUESTOS
            </button>
          </div>

          {/* Botón PAGOS */}
          <div className="bg-surface rounded-3xl p-5 border border-green-500/30 shadow-[0_10px_30px_rgba(34,197,94,0.1)] flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-4 bg-green-500/10 rounded-2xl text-green-500">
                <Wallet className="w-8 h-8" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-text-main font-black text-xl tracking-wide uppercase">Pagos</h3>
                <p className="text-text-muted text-sm mt-1 font-medium">Compras, Mano de obra y Gastos</p>
              </div>
            </div>
            <button
              onClick={() => navigate('pagos_view')}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all hover:scale-[1.02]"
            >
              ENTRAR A PAGOS
            </button>
          </div>
          
        </div>
      </main>
    </div>
  );
}
