import React from 'react';
import { ArrowLeft, Calendar, Camera, ChevronDown, Store, User, X, FileText, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import SuccessOverlay from './SuccessOverlay';
import { supabase } from '../lib/supabaseClient';

interface ComprasFormProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}

interface Obra {
  id: number;
  name: string;
}

export default function ComprasForm({ navigate, activeObraId }: ComprasFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('');
  const [encargado, setEncargado] = useState('');
  const [moneda, setMoneda] = useState<'ARS'|'USD'>('ARS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObra, setSelectedObra] = useState<number | 'general'>(activeObraId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchObras = async () => {
      const { data } = await supabase.from('obras').select('*').order('id', { ascending: true });
      if (data) setObras(data);
    };
    fetchObras();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!description || !amount) {
      alert('Por favor complete al menos la descripción y el monto.');
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    let obraName = 'General';
    if (selectedObra !== 'general') {
      const obra = obras.find(o => o.id.toString() === selectedObra.toString());
      if (obra) obraName = obra.name;
    }

    const currentDolar = parseFloat(localStorage.getItem('cotizacionDolar') || '1000');

    const { data, error } = await supabase.from('gastos').insert([
      {
        type: 'materiales',
        title: description,
        subtitle: `${obraName} • ${provider || 'S/N'}`,
        amount: parseFloat(amount) || 0,
        status: 'Pendiente',
        encargado: encargado,
        moneda: moneda,
        cotizacion_dolar: currentDolar
      }
    ]).select();

    if (error) {
      console.error('Error Supabase:', error);
      alert('Error en el servidor: ' + error.message);
      setIsSubmitting(false);
      return;
    } 

    if (data && data.length > 0) {
      const gastoId = data[0].id;
      if (imageFile) {
        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(`${gastoId}`, imageFile, { contentType: imageFile.type, upsert: true });
          
        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          alert('El gasto se guardó, pero hubo un error al subir la foto.');
        }
      }
      setShowSuccess(true);
    }
    setIsSubmitting(false);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    navigate('pagos_view');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <SuccessOverlay 
        isVisible={showSuccess} 
        onComplete={handleSuccessComplete} 
      />
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-surface">
        <div className="flex items-center gap-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('back')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-sm md:text-lg">Registrar Compra</h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 space-y-6">
        
        {/* Obra */}
        {activeObraId === 'general' ? (
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Obra Destino</label>
            <div className="relative">
              <select 
                value={selectedObra}
                onChange={(e) => setSelectedObra(e.target.value === 'general' ? 'general' : Number(e.target.value))}
                className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
              >
                <option value="general">Gasto General / Depósito</option>
                {obras.map(obra => (
                  <option key={obra.id} value={obra.id}>{obra.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Obra Asignada</label>
            <div className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main font-bold">
              {obras.find(o => o.id === activeObraId)?.name || 'Cargando...'}
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Descripción del Material</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Hierro del 8, 50 bolsas de cemento..."
            className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Cantidad & Unidad */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Cantidad</label>
            <input
              type="number"
              placeholder="0"
              className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Unidad</label>
            <div className="relative">
              <select className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer">
                <option>Unidades</option>
                <option>Bolsas</option>
                <option>Kg</option>
                <option>m³</option>
                <option>Litros</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Valor */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Valor / Precio Total</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">{moneda === 'ARS' ? '$' : 'U$S'}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface border border-surface-hover rounded-xl pl-11 pr-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-xl border border-surface-hover">
            <button
              onClick={() => setMoneda('ARS')}
              className={`py-2 rounded-lg text-sm font-bold transition-all ${
                moneda === 'ARS' ? 'bg-green-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              Pesos (ARS)
            </button>
            <button
              onClick={() => setMoneda('USD')}
              className={`py-2 rounded-lg text-sm font-bold transition-all ${
                moneda === 'USD' ? 'bg-green-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              USD (U$S)
            </button>
          </div>
        </div>

        {/* Fecha */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Fecha de Compra</label>
          <div className="relative">
            <input
              type="date"
              className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Proveedor */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Proveedor / Lugar de Compra</label>
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Corralón San Martín"
              className="w-full bg-surface border border-surface-hover rounded-xl pl-11 pr-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Responsable */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Responsable de la Compra</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <select 
              value={encargado}
              onChange={(e) => setEncargado(e.target.value)}
              className="w-full bg-surface border border-surface-hover rounded-xl pl-11 pr-10 py-3.5 text-text-main appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
            >
              <option value="" disabled>Seleccionar responsable</option>
              <option value="Pablo Bellido">Pablo Bellido</option>
              <option value="Gaston Venier">Gaston Venier</option>
              <option value="Rodrigo Fernandez">Rodrigo Fernandez</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* N Factura / Remito */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Nº Factura / Remito</label>
          <input
            type="text"
            placeholder="Ej: 0001-000456"
            className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Descripcion */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Descripción de la Compra</label>
          <textarea
            rows={3}
            placeholder="Detalle de los materiales comprados, observaciones, etc."
            className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
          />
        </div>

        {/* Comprobante */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Comprobante (Opcional)</label>
          
          {imagePreview ? (
            <div className="relative w-full border-2 border-primary rounded-xl bg-background-alt py-8 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-primary/20 text-primary">
                <FileText className="w-7 h-7" />
              </div>
              <span className="text-text-main font-medium">¡Archivo adjuntado exitosamente!</span>
              <button 
                onClick={(e) => { e.preventDefault(); setImageFile(null); setImagePreview(null); }} 
                className="mt-4 px-6 py-2 bg-surface text-text-muted rounded-xl text-xs font-black uppercase tracking-widest hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Eliminar Archivo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Opción Cámara */}
              <label className="border-2 border-dashed border-secondary/50 rounded-xl bg-background-alt hover:bg-surface hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center py-6 px-2 text-center group">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-surface text-text-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-text-main font-bold text-sm">Cámara</span>
                <span className="text-text-muted text-[10px] mt-1 uppercase tracking-wider">Tomar Foto</span>
              </label>

              {/* Opción Archivo */}
              <label className="border-2 border-dashed border-secondary/50 rounded-xl bg-background-alt hover:bg-surface hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center py-6 px-2 text-center group">
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleImageUpload} />
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-surface text-text-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-text-main font-bold text-sm">Archivo</span>
                <span className="text-text-muted text-[10px] mt-1 uppercase tracking-wider">Galería / PDF</span>
              </label>
            </div>
          )}
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-[27px] left-0 w-full bg-background border-t border-surface p-4 pb-6 z-50">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,107,0,0.2)]"
          >
            GUARDAR COMPRA
          </button>
        </div>
      </div>
    </div>
  );
}
