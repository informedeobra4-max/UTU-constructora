import { ArrowLeft, Bell, Wallet, FileSpreadsheet, DollarSign, TrendingDown, Landmark, Paperclip, Settings, BookOpen } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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
  const [ingresosARS, setIngresosARS] = useState(0);
  const [ingresosUSD, setIngresosUSD] = useState(0);
  const [cotizacionDolar, setCotizacionDolar] = useState<number>(() => {
    const saved = localStorage.getItem('cotizacionDolar');
    return saved ? parseFloat(saved) : 1000;
  });
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

      const { data, error } = await supabase.from('gastos').select('*');
      if (error || !data) return;

      let totalGastosARS = 0;
      data.forEach(gasto => {
        const gastoObraName = gasto.subtitle?.split(' • ')[0]?.trim();
        const currentNameTrimmed = currentName.trim();
        if (gastoObraName === currentNameTrimmed || (activeObraId === 'general' && gastoObraName === 'General')) {
          if (gasto.moneda === 'USD') {
            totalGastosARS += (gasto.amount || 0) * (parseFloat(localStorage.getItem('cotizacionDolar') || '1000'));
          } else {
            totalGastosARS += gasto.amount || 0;
          }
        }
      });
      
      setGastosTotales(totalGastosARS);
      setIsLoading(false);
    };

    init();
  }, [activeObraId]);

  const handleCotizacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setCotizacionDolar(val);
    localStorage.setItem('cotizacionDolar', val.toString());
  };

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
          <button onClick={() => navigate('back')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-lg truncate flex-1 mx-4 text-center hidden md:block">{obraName}</h1>
        <div className="flex items-center space-x-4 text-text-muted">
          <button onClick={() => navigate('settings')} className="relative text-blue-500 hover:text-blue-400 transition-colors" title="Configuración">
            <Settings className="w-6 h-6" />
          </button>
          <button onClick={() => navigate('info_obra')} className="relative hover:text-text-main transition-colors text-blue-400">
            <Paperclip className="w-6 h-6" />
          </button>
          <button onClick={() => navigate('notifications')} className="relative hover:text-text-main transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto relative min-h-[500px]">

        {/* Full Date Header */}
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-main capitalize">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <button onClick={() => navigate('historia_utu')} className="text-yellow-500 hover:text-yellow-400 transition-colors bg-yellow-500/10 p-1.5 rounded-full" title="Historia de UTU">
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-text-muted">Obra Activa: {obraName}</p>
        </div>

        {/* Date & Period Filter Bar */}
        <div className="w-full" onClick={() => navigate('calendar')}>
          <HorizontalCalendar 
            activeObraId={activeObraId} 
            showTitle={false} 
          />
        </div>

        {/* Hero Card - Módulo Financiero (Solo Gastos) */}
        <div className="space-y-3">
          
          <div 
            className="bg-surface rounded-2xl p-6 border border-red-500/30 shadow-[0_5px_20px_rgba(239,68,68,0.15)] relative overflow-hidden flex flex-col items-center justify-center text-center"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
            <div className="p-3 bg-red-500/10 rounded-full text-red-500 mb-3">
              <TrendingDown className="w-8 h-8" />
            </div>
            <h2 className="text-xs text-text-muted font-black tracking-widest uppercase mb-2">Total Gastado en esta Obra (ARS)</h2>
            <p className="text-4xl font-light text-red-500 tracking-tight">{formatCurrency(gastosTotales)}</p>
            <p className="text-[10px] text-text-muted mt-2 font-medium">Incluye gastos en USD convertidos a la cotización actual</p>
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
