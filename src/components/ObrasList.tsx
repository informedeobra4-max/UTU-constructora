import React from 'react';
import { Bell, ArrowRight, Plus, Calendar, Trash2, Edit2, Camera, X, DollarSign, Eye, EyeOff, Settings, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';
import HorizontalCalendar from './HorizontalCalendar';
import { motion, AnimatePresence } from 'motion/react';

interface ObrasListProps {
  navigate: (screen: Screen) => void;
  setActiveObraId: (id: number | 'general') => void;
}

export default function ObrasList({ navigate, setActiveObraId }: ObrasListProps) {
  const [obras, setObras] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [gastosTotales, setGastosTotales] = useState<Record<number, number>>({});
  const [unreadAlerts, setUnreadAlerts] = useState<any[]>([]);
  const [showToasts, setShowToasts] = useState(true);

  // Global Wallet States
  const [globalIngresosARS, setGlobalIngresosARS] = useState(0);
  const [globalIngresosUSD, setGlobalIngresosUSD] = useState(0);
  const [globalGastosARS, setGlobalGastosARS] = useState(0);
  const [globalGastosUSD, setGlobalGastosUSD] = useState(0);
  const [calculatedTotalWalletARS, setCalculatedTotalWalletARS] = useState(0);
  
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('isBalanceVisible');
    return saved !== null ? saved === 'true' : true;
  });

  const [cotizacionDolar, setCotizacionDolar] = useState<number>(() => {
    const saved = localStorage.getItem('cotizacionDolar');
    return saved ? parseFloat(saved) : 1000;
  });
  const [globalRefreshCounter, setGlobalRefreshCounter] = useState(0);

  useEffect(() => {
    const fetchObras = async () => {
      const { data, error } = await supabase.from('obras').select('*').order('id', { ascending: true });
      if (!error && data) {
        setObras(data);
      }
      setIsLoading(false);
    };
    fetchObras();

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('isNew', true)
        .order('id', { ascending: false });
      
      if (data) {
        setUnreadAlerts(data);
        if (data.length > 0) {
          if ('setAppBadge' in navigator) (navigator as any).setAppBadge(data.length).catch(console.error);
          
          setTimeout(() => {
            setShowToasts(false);
          }, 4500);
          
        } else if (data.length === 0 && 'clearAppBadge' in navigator) {
          (navigator as any).clearAppBadge().catch(console.error);
        }
      }
    };
    fetchNotifications();

    const fetchGlobalDolar = async () => {
      const { data, error } = await supabase
        .from('archivos_obra')
        .select('*')
        .eq('categoria', 'GLOBAL_CONFIG')
        .eq('subcategoria', 'DOLAR')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error && data.nombre) {
        const globalVal = parseFloat(data.nombre);
        if (!isNaN(globalVal)) {
          setCotizacionDolar(globalVal);
          localStorage.setItem('cotizacionDolar', globalVal.toString());
        }
      }
    };
    fetchGlobalDolar();
  }, [globalRefreshCounter]);

  useEffect(() => {
    // Subscribe to realtime updates for global config
    const channelConfig = supabase
      .channel('global_config_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'archivos_obra',
        filter: "categoria=eq.GLOBAL_CONFIG"
      }, (payload) => {
        if (payload.new && payload.new.subcategoria === 'DOLAR') {
          const globalVal = parseFloat(payload.new.nombre);
          if (!isNaN(globalVal)) {
            setCotizacionDolar(globalVal);
            localStorage.setItem('cotizacionDolar', globalVal.toString());
          }
        }
      })
      .subscribe();

    const channelData = supabase
      .channel('obraslist_data_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gastos' }, () => setGlobalRefreshCounter(c => c + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ingresos' }, () => setGlobalRefreshCounter(c => c + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'obras' }, () => setGlobalRefreshCounter(c => c + 1))
      .subscribe();

    return () => {
      supabase.removeChannel(channelConfig);
      supabase.removeChannel(channelData);
    };
  }, []);

  useEffect(() => {
    const fetchFinances = async () => {
      const { data: gastos, error: errGastos } = await supabase.from('gastos').select('*');
      if (errGastos) console.error('Error fetching gastos:', errGastos);
      
      const totalsPorObra: Record<number, number> = {};
      let totalGastosARS = 0;
      let totalGastosUSD = 0;
      let totalGastosUSDConvertedToARS = 0;
      obras.forEach(obra => totalsPorObra[obra.id] = 0);

      const currentDolar = cotizacionDolar;

      gastos?.forEach(gasto => {
        const amt = gasto.amount || 0;
        const rate = gasto.cotizacion_dolar || currentDolar;
        
        if (gasto.moneda === 'USD') {
          totalGastosUSD += amt;
          totalGastosUSDConvertedToARS += amt * rate;
        } else {
          totalGastosARS += amt;
        }

        const obraName = gasto.subtitle?.split(' • ')[0]?.trim();
        const obraMatch = obras.find(o => o.name?.trim() === obraName);
        if (obraMatch) {
          const amtInARS = gasto.moneda === 'USD' ? amt * rate : amt;
          totalsPorObra[obraMatch.id] = (totalsPorObra[obraMatch.id] || 0) + amtInARS;
        }
      });
      setGastosTotales(totalsPorObra);
      setGlobalGastosARS(totalGastosARS);
      setGlobalGastosUSD(totalGastosUSD);

      // 2. Fetch Ingresos
      const { data: ingresos, error: errIngresos } = await supabase.from('ingresos').select('monto, moneda, cotizacion_dolar');
      if (errIngresos) console.error('Error fetching ingresos:', errIngresos);

      let totalInARS = 0;
      let totalInUSD = 0;
      let totalInUSDConvertedToARS = 0;

      ingresos?.forEach(ing => {
        if (ing.moneda === 'USD') {
          totalInUSD += (ing.monto || 0);
          const rate = ing.cotizacion_dolar || currentDolar;
          totalInUSDConvertedToARS += (ing.monto || 0) * rate;
        } else {
          totalInARS += (ing.monto || 0);
        }
      });

      setGlobalIngresosARS(totalInARS);
      setGlobalIngresosUSD(totalInUSD);
      // We could store the converted total in state, but let's just use it below
      
      const ingresosTotalesConvertidos = totalInARS + totalInUSDConvertedToARS;
      const gastosTotalesConvertidos = totalGastosARS + totalGastosUSDConvertedToARS;
      
      // I need to set a state for totalGlobalWalletARS
      setCalculatedTotalWalletARS(ingresosTotalesConvertidos - gastosTotalesConvertidos);
    };

    if (obras.length > 0) {
      fetchFinances();
    }
  }, [obras, cotizacionDolar, globalRefreshCounter]);

  const handleCotizacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setCotizacionDolar(val);
    localStorage.setItem('cotizacionDolar', val.toString());
  };

  const handleCotizacionBlur = async () => {
    const { data } = await supabase
        .from('archivos_obra')
        .select('id')
        .eq('categoria', 'GLOBAL_CONFIG')
        .eq('subcategoria', 'DOLAR');

    if (data) {
      for (const row of data) {
        await supabase.from('archivos_obra').delete().eq('id', row.id);
      }
    }

    await supabase.from('archivos_obra').insert([{
      obra_id: '0',
      categoria: 'GLOBAL_CONFIG',
      subcategoria: 'DOLAR',
      nombre: cotizacionDolar.toString(),
      tipo: 'config',
      has_file: false
    }]);
  };

  const toggleBalanceVisibility = () => {
    const newValue = !isBalanceVisible;
    setIsBalanceVisible(newValue);
    localStorage.setItem('isBalanceVisible', String(newValue));
  };

  const dismissAlert = async (id: number) => {
    const newAlerts = unreadAlerts.filter(a => a.id !== id);
    setUnreadAlerts(newAlerts);
    if ('setAppBadge' in navigator) {
      if (newAlerts.length > 0) {
        (navigator as any).setAppBadge(newAlerts.length).catch(console.error);
      } else if ('clearAppBadge' in navigator) {
        (navigator as any).clearAppBadge().catch(console.error);
      }
    }
    await supabase.from('notificaciones').update({ isNew: false }).eq('id', id);
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');

  const handleEditClick = (obra: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(obra.id);
    setEditName(obra.name);
    setEditImage(obra.image);
  };

  const handleSaveEdit = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from('obras').update({ name: editName, image: editImage }).eq('id', id);
    if (!error) {
      setObras(obras.map(o => o.id === id ? { ...o, name: editName, image: editImage } : o));
      setEditingId(null);
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const pin = prompt('Se requiere autorización para eliminar una obra. Ingrese el PIN de 4 dígitos:');
    
    if (pin === null) return; // User cancelled
    
    if (pin !== '2600') {
      alert('PIN incorrecto. Operación cancelada.');
      return;
    }

    if (confirm('¿Estás COMPLETAMENTE seguro que deseas eliminar esta obra y TODOS sus datos?')) {
      const { error } = await supabase.from('obras').delete().eq('id', id);
      if (!error) {
        setObras(obras.filter(o => o.id !== id));
      } else {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const handleAddObra = async () => {
    const newObraData = {
      name: 'Nueva Obra',
      status: 'Planificación',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800',
    };
    const { data, error } = await supabase.from('obras').insert([newObraData]).select();
    if (!error && data && data.length > 0) {
      const newObra = data[0];
      setObras([...obras, newObra]);
      setEditingId(newObra.id);
      setEditName(newObra.name);
      setEditImage(newObra.image);
    } else {
      alert('Error al crear obra');
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
      
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <Logo onClick={() => navigate('splash')} />
        <div className="flex items-center space-x-4 text-text-muted">
          <button onClick={() => navigate('settings')} className="relative text-blue-500 hover:text-blue-400 transition-colors" title="Configuración">
            <Settings className="w-6 h-6" />
          </button>
          <button 
            onClick={() => { setActiveObraId('general'); navigate('calendar'); }} 
            className="relative hover:text-text-main transition-colors"
          >
            <Calendar className="w-6 h-6" />
          </button>
          <button onClick={() => navigate('notifications')} className="relative hover:text-text-main transition-colors">
            <Bell className="w-6 h-6" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background animate-pulse"></span>
            )}
          </button>
        </div>
      </header>

      {/* In-App Notifications Banner */}
      <div className="fixed top-16 left-0 w-full z-40 px-4 pointer-events-none flex flex-col gap-2">
        <AnimatePresence>
          {showToasts && unreadAlerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: idx * 0.1 }}
              drag="y"
              dragConstraints={{ top: -100, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y < -50 || info.velocity.y < -500) {
                  dismissAlert(alert.id);
                }
              }}
              className="pointer-events-auto w-full max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-black/10 overflow-hidden cursor-grab active:cursor-grabbing"
              onClick={() => {
                if ('clearAppBadge' in navigator) {
                  (navigator as any).clearAppBadge().catch(console.error);
                }
                navigate('notifications');
              }}
            >
              <div className="flex items-start p-4 gap-3 relative">
                <div className="w-1 h-full absolute left-0 top-0 bg-green-500" />
                <div className="p-2 bg-green-500/10 rounded-full text-green-500 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-0.5">Nuevo Mensaje • {alert.obraName}</h3>
                  <p className="text-sm font-medium text-black/80 truncate">
                    {alert.message}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissAlert(alert.id);
                  }}
                  className="absolute right-3 top-3 p-1 text-black/40 hover:text-black transition-colors rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="px-4 py-8 max-w-md mx-auto space-y-6 relative min-h-[500px]">
        {/* Full Date Header */}
        <div className="mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-main capitalize">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <button onClick={() => navigate('historia_utu')} className="text-yellow-500 hover:text-yellow-400 transition-colors bg-yellow-500/10 p-1.5 rounded-full" title="Historia de UTU">
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-text-muted">Gestión de Obras</p>
        </div>

        {/* Horizontal Calendar */}
        <div className="w-full">
          <HorizontalCalendar 
            activeObraId="general" 
            showTitle={false} 
            onDateSelect={() => { setActiveObraId('general'); navigate('calendar'); }}
          />
        </div>

        {/* Global Wallet UI */}
        <div className="bg-surface rounded-3xl p-6 shadow-sm border border-surface-hover mt-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-text-muted font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                Balance Total Global
                <button onClick={toggleBalanceVisibility} className="text-text-muted hover:text-text-main transition-colors">
                  {isBalanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </p>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-light text-green-500 tracking-tight">
                  {isBalanceVisible ? formatCurrency(calculatedTotalWalletARS) : '••••••••'}
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <button onClick={() => navigate('ingresos_view')} className="bg-background-alt border border-surface-hover rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors">
              <div className="p-2 bg-green-500/10 text-green-500 rounded-xl"><Plus className="w-5 h-5"/></div>
              <span className="text-xs font-bold text-text-main">Ingresar</span>
            </button>
            <button onClick={() => navigate('ingresos_view')} className="bg-background-alt border border-surface-hover rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><DollarSign className="w-5 h-5"/></div>
              <span className="text-[10px] font-bold text-text-main text-center leading-tight tracking-wider">U$S<br/>{isBalanceVisible ? globalIngresosUSD.toLocaleString('es-AR') : '••••'}</span>
            </button>
            <div className="bg-background-alt border border-surface-hover rounded-2xl p-2 flex flex-col items-center justify-center gap-1.5">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider text-center">Valor<br/>Dólar</span>
              <div className="flex items-center gap-1 bg-background px-1.5 py-1.5 rounded-lg w-full border border-surface-hover focus-within:border-primary transition-colors">
                <span className="text-text-muted text-[10px] font-bold">$</span>
                <input 
                  type="number" 
                  value={cotizacionDolar || ''}
                  onChange={handleCotizacionChange}
                  onBlur={handleCotizacionBlur}
                  className="w-full bg-transparent text-text-main text-xs font-bold focus:outline-none text-center p-0 m-0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          {obras.map((obra) => (
            <div 
              key={obra.id} 
              className="bg-surface rounded-2xl overflow-hidden border border-surface-hover cursor-pointer hover:border-primary transition-all group relative"
              onClick={() => {
                if (editingId !== obra.id) {
                  setActiveObraId(obra.id);
                  navigate('dashboard');
                }
              }}
            >
              <div className="h-32 w-full relative overflow-hidden bg-background-alt">
                <img src={obra.image} alt={obra.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute top-3 right-3 bg-primary/20 backdrop-blur-md border border-primary/30 px-2 py-1 rounded text-primary text-[10px] font-bold uppercase tracking-wider">
                  {obra.status}
                </div>
              </div>
              <div className="p-5">
                {editingId === obra.id ? (
                  <div className="space-y-3 mb-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-2 text-text-main focus:outline-none focus:border-primary"
                      placeholder="Nombre de la obra"
                    />
                    <div className="relative w-full">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditImage(reader.result as string);
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Subir foto desde ordenador o celular"
                      />
                      <div className="w-full bg-background-alt border border-surface-hover border-dashed hover:border-primary rounded-xl px-4 py-3 text-text-muted flex items-center justify-center gap-2 transition-colors">
                        <Camera className="w-5 h-5" />
                        <span className="text-sm">Cambiar foto de obra</span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={(e) => handleSaveEdit(obra.id, e)} className="px-4 py-2 bg-primary text-background font-bold rounded-lg text-sm">Guardar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-text-main">{obra.name}</h2>
                    <div className="flex gap-2">
                      <button onClick={(e) => handleEditClick(obra, e)} className="p-2 text-text-muted hover:text-primary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDelete(obra.id, e)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-red-500/70 uppercase">Gasto Total Acumulado</p>
                  <p className="text-3xl font-light text-red-500 tracking-tight">{isBalanceVisible ? formatCurrency(gastosTotales[obra.id] || 0) : '••••••••'}</p>
                </div>
                <button className="w-full mt-5 bg-background-alt group-hover:bg-primary group-hover:text-background text-text-main font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Ver Detalles <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button onClick={handleAddObra} className="w-full border-2 border-dashed border-surface-hover hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-text-muted hover:text-primary transition-colors bg-background-alt hover:bg-surface">
            <div className="p-3 bg-surface rounded-full">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold">Agregar Nueva Obra</span>
          </button>
        </div>
      </main>
    </div>
  );
}
