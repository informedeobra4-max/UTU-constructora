import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, ChevronDown, Store, User, FileText, Upload, Save } from 'lucide-react';
import { Screen } from '../types';
import Logo from './Logo';
import SuccessOverlay from './SuccessOverlay';
import { supabase } from '../lib/supabaseClient';

interface GastoEditFormProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
  editingGastoId: string | null;
}

interface Obra {
  id: number;
  name: string;
}

export default function GastoEditForm({ navigate, activeObraId, editingGastoId }: GastoEditFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [type, setType] = useState('materiales');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('');
  const [encargado, setEncargado] = useState('');
  const [moneda, setMoneda] = useState<'ARS'|'USD'>('ARS');
  const [status, setStatus] = useState('Pendiente');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObra, setSelectedObra] = useState<number | 'general'>('general');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!editingGastoId) {
      navigate('back');
      return;
    }

    const init = async () => {
      // Fetch Obras
      const { data: obrasData } = await supabase.from('obras').select('*').order('id', { ascending: true });
      if (obrasData) setObras(obrasData);

      // Fetch Expense
      const { data: gastoData } = await supabase.from('gastos').select('*').eq('id', editingGastoId).single();
      if (gastoData) {
        setType(gastoData.type);
        setDescription(gastoData.title || '');
        setAmount(gastoData.amount?.toString() || '');
        setMoneda(gastoData.moneda || 'ARS');
        setEncargado(gastoData.encargado || '');
        setStatus(gastoData.status || 'Pendiente');
        
        // Parse Subtitle: "ObraName • Provider"
        const [obraNameStr, providerStr] = (gastoData.subtitle || '').split(' • ');
        setProvider(providerStr || '');

        if (obraNameStr === 'General' || !obraNameStr) {
          setSelectedObra('general');
        } else if (obrasData) {
          const matchedObra = obrasData.find(o => o.name.trim() === obraNameStr.trim());
          if (matchedObra) setSelectedObra(matchedObra.id);
        }

        // Check if image exists
        const { data: urlData } = supabase.storage.from('comprobantes').getPublicUrl(editingGastoId);
        if (urlData && urlData.publicUrl) {
          setImagePreview(urlData.publicUrl);
        }
      }
      setIsLoading(false);
    };
    init();
  }, [editingGastoId, navigate]);

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

    const { error } = await supabase.from('gastos').update({
      type: type,
      title: description,
      subtitle: `${obraName} • ${provider || 'S/N'}`,
      amount: parseFloat(amount) || 0,
      status: status,
      encargado: encargado,
      moneda: moneda
    }).eq('id', editingGastoId);

    if (error) {
      console.error('Error Supabase:', error);
      alert('Error en el servidor: ' + error.message);
      setIsSubmitting(false);
      return;
    } 

    if (imageFile && editingGastoId) {
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(`${editingGastoId}`, imageFile, { contentType: imageFile.type, upsert: true });
        
      if (uploadError) {
        console.error('Error subiendo imagen:', uploadError);
        alert('El gasto se guardó, pero hubo un error al subir la foto nueva.');
      }
    }
    
    setShowSuccess(true);
    setIsSubmitting(false);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    navigate('back');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <SuccessOverlay 
        isVisible={showSuccess} 
        onComplete={handleSuccessComplete} 
        message="¡Gasto Actualizado Exitosamente!"
      />
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-surface">
        <div className="flex items-center gap-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('back')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-sm md:text-lg">Editar Gasto</h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 space-y-6">
        
        {/* Tipo de Gasto */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Categoría</label>
          <div className="relative">
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer font-bold"
            >
              <option value="materiales">Materiales / Compras</option>
              <option value="mano_obra">Mano de Obra</option>
              <option value="varios">Gastos Varios</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Obra */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Obra Asignada</label>
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

        {/* Descripción */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Descripción del Gasto</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Hierro del 8, Quincena, etc..."
            className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
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
                moneda === 'USD' ? 'bg-blue-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              USD (U$S)
            </button>
          </div>
        </div>

        {/* Proveedor */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Proveedor / Entidad</label>
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="Corralón, Contratista..."
              className="w-full bg-surface border border-surface-hover rounded-xl pl-11 pr-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Responsable */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Responsable / Encargado</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <select 
              value={encargado}
              onChange={(e) => setEncargado(e.target.value)}
              className="w-full bg-surface border border-surface-hover rounded-xl pl-11 pr-10 py-3.5 text-text-main appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
            >
              <option value="">Seleccionar responsable</option>
              <option value="Pablo Bellido">Pablo Bellido</option>
              <option value="Gaston Venier">Gaston Venier</option>
              <option value="Rodrigo Fernandez">Rodrigo Fernandez</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
          </div>
        </div>
        
        {/* Estado */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Estado del Pago</label>
          <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-xl border border-surface-hover">
            <button
              onClick={() => setStatus('Pendiente')}
              className={`py-2 rounded-lg text-sm font-bold transition-all ${
                status === 'Pendiente' ? 'bg-orange-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              Pendiente
            </button>
            <button
              onClick={() => setStatus('Pagado')}
              className={`py-2 rounded-lg text-sm font-bold transition-all ${
                status === 'Pagado' ? 'bg-green-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              Pagado
            </button>
          </div>
        </div>

        {/* Comprobante */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Comprobante</label>
          
          {imagePreview ? (
            <div className="relative w-full border-2 border-primary rounded-xl bg-background-alt overflow-hidden flex flex-col items-center justify-center">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover opacity-80" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center flex-col opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.preventDefault(); setImageFile(null); setImagePreview(null); }} 
                  className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
                >
                  Eliminar Archivo
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="border-2 border-dashed border-secondary/50 rounded-xl bg-background-alt hover:bg-surface hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center py-6 px-2 text-center group">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-surface text-text-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-text-main font-bold text-sm">Cámara</span>
                <span className="text-text-muted text-[10px] mt-1 uppercase tracking-wider">Tomar Foto</span>
              </label>

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
            className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,107,0,0.2)] flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            ACTUALIZAR GASTO
          </button>
        </div>
      </div>
    </div>
  );
}
