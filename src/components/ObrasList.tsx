import { Bell, ArrowRight, Plus, Calendar, Trash2, Edit2, Camera, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';
import HorizontalCalendar from './HorizontalCalendar';

interface ObrasListProps {
  navigate: (screen: Screen) => void;
  setActiveObraId: (id: number | 'general') => void;
}

export default function ObrasList({ navigate, setActiveObraId }: ObrasListProps) {
  const [obras, setObras] = useState<any[]>([]);

  const fetchObras = async () => {
    const { data, error } = await supabase.from('obras').select('*').order('created_at', { ascending: true });
    if (data && !error) {
      if (data.length === 0) {
        // Migration: Si Supabase está vacío, intenta subir las obras locales
        const saved = localStorage.getItem('obras_list');
        if (saved) {
          try {
            const localObras = JSON.parse(saved);
            if (localObras.length > 0) {
              const obrasToInsert = localObras.map((o: any) => ({
                 name: o.name,
                 status: o.status,
                 image: o.image
              }));
              const { data: insertedData, error: insertError } = await supabase.from('obras').insert(obrasToInsert).select();
              if (insertedData && !insertError) {
                 setObras(insertedData);
                 localStorage.setItem('obras_list', JSON.stringify(insertedData));
                 return;
              }
            }
          } catch(e) {
            console.error('Error migrating obras:', e);
          }
        }
      }
      
      setObras(data);
      localStorage.setItem('obras_list', JSON.stringify(data));
    }
  };

  useEffect(() => {
    fetchObras();
    
    const interval = setInterval(() => {
      fetchObras();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const [gastosTotales, setGastosTotales] = useState<Record<number, number>>({});
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);



  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const fetchGastos = async () => {
      const { data, error } = await supabase.from('gastos').select('amount, subtitle');
      if (error) {
        console.error('Error fetching gastos:', error);
        return;
      }
      
      const totals: Record<number, number> = {};
      obras.forEach(obra => totals[obra.id] = 0);

      data?.forEach(gasto => {
        const obraName = gasto.subtitle?.split(' • ')[0];
        const obraMatch = obras.find(o => o.name === obraName);
        if (obraMatch) {
          totals[obraMatch.id] = (totals[obraMatch.id] || 0) + (gasto.amount || 0);
        }
      });
      setGastosTotales(totals);
    };
    fetchGastos();
  }, [obras]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);



  const handleEditClick = (obra: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(obra.id);
    setEditName(obra.name);
    setEditImage(obra.image);
    setEditImageFile(null);
  };

  const handleSaveEdit = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    
    // Optimizacion visual rapida
    setObras(obras.map(o => o.id === id ? { ...o, name: editName, image: editImage } : o));
    
    if (id > 0) {
      let finalImageUrl = editImage;
      
      // Upload image if a new one was selected
      if (editImageFile) {
        const fileName = `obra_${id}_${Date.now()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(fileName, editImageFile, { contentType: editImageFile.type, upsert: true });
          
        if (uploadData && !uploadError) {
          finalImageUrl = supabase.storage.from('comprobantes').getPublicUrl(fileName).data.publicUrl;
        }
      }

      const { error } = await supabase.from('obras').update({ name: editName, image: finalImageUrl }).eq('id', id);
      if (error) {
        alert('Error guardando la obra: ' + error.message);
      }
      await fetchObras();
    }
    
    setEditingId(null);
    setEditImageFile(null);
    setIsSaving(false);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('¿Seguro que deseas eliminar esta obra?')) {
      setObras(obras.filter(o => o.id !== id));
      if (id > 0) {
        await supabase.from('obras').delete().eq('id', id);
        fetchObras();
      }
    }
  };

  const handleAddObra = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const newObra = {
      name: 'Nueva Obra',
      status: 'Planificación',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800',
    };
    
    // Optimistic insert
    const tempId = -Date.now();
    setObras([...obras, { ...newObra, id: tempId }]);
    
    const { data } = await supabase.from('obras').insert([newObra]).select();
    if (data && data[0]) {
      await fetchObras(); // Refresh to get real IDs
      setEditingId(data[0].id);
      setEditName(data[0].name);
      setEditImage(data[0].image);
      setEditImageFile(null);
    }
    setIsSaving(false);
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
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="bg-primary px-4 py-3 flex items-center justify-between sticky top-0 z-[60] shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center font-black text-primary text-xl">U</div>
            <div className="text-background font-bold text-sm">¿Instalar UTU App?</div>
          </div>
          <button 
            onClick={handleInstallApp}
            className="bg-background text-primary px-4 py-1.5 rounded-full font-bold text-xs shadow-sm hover:scale-105 transition-transform"
          >
            INSTALAR
          </button>
        </div>
      )}

      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-[showInstallBanner ? '52px' : '0'] z-50">
        <Logo onClick={() => navigate('splash')} />
        <div className="flex items-center space-x-4 text-text-muted">
          <button 
            onClick={() => {
              if (deferredPrompt) {
                handleInstallApp();
              } else {
                alert("Para instalar la App: Toca los 3 puntitos (menú) arriba a la derecha y elige 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
              }
            }} 
            className="p-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-full transition-colors"
            title="Descargar App"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setActiveObraId('general'); navigate('calendar'); }} 
            className="relative hover:text-text-main transition-colors"
          >
            <Calendar className="w-6 h-6" />
          </button>
          <button onClick={() => navigate('notifications')} className="relative hover:text-text-main transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
          </button>
        </div>
      </header>

      <main className="px-4 py-8 max-w-md mx-auto space-y-6">
        {/* Full Date Header */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-text-main capitalize">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <p className="text-sm text-text-muted">Gestión de Obras</p>
        </div>

        {/* Date & Period Filter Bar */}
        <div className="relative mt-2">
          <HorizontalCalendar 
            activeObraId="general" 
            onDateSelect={() => { setActiveObraId('general'); navigate('calendar'); }} 
          />
          {/* Overlay to trigger calendar navigation */}
          <div 
            className="absolute top-2 left-2 w-12 h-12 rounded-xl cursor-pointer z-10" 
            onClick={() => { setActiveObraId('general'); navigate('calendar'); }}
            title="Ir al calendario completo"
          ></div>
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
                            const file = e.target.files[0];
                            setEditImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
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
                      <button 
                        onClick={(e) => handleSaveEdit(obra.id, e)} 
                        disabled={isSaving}
                        className="px-4 py-2 bg-primary text-background font-bold rounded-lg text-sm disabled:opacity-50"
                      >
                        {isSaving ? 'Guardando...' : 'Guardar'}
                      </button>
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
                  <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Gasto Total Acumulado</p>
                  <p className="text-3xl font-extrabold text-green-500 tracking-tight">{formatCurrency(gastosTotales[obra.id] || 0)}</p>
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
