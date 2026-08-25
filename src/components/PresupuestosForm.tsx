import React from 'react';
import { ArrowLeft, Camera, Building2, User, FileText, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import SuccessOverlay from './SuccessOverlay';
import { supabase } from '../lib/supabaseClient';

interface PresupuestosFormProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
  editingPresupuestoId?: number | null;
  setEditingPresupuestoId?: (id: number | null) => void;
}

export default function PresupuestosForm({ navigate, activeObraId, editingPresupuestoId, setEditingPresupuestoId }: PresupuestosFormProps) {
  const [empresa, setEmpresa] = useState('');
  const [costo, setCosto] = useState('');
  const [notas, setNotas] = useState('');
  const [encargado, setEncargado] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [obras, setObras] = useState<any[]>([]);
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

  useEffect(() => {
    if (editingPresupuestoId) {
      const fetchPresupuesto = async () => {
        const { data, error } = await supabase.from('presupuestos').select('*').eq('id', editingPresupuestoId).single();
        if (data && !error) {
          setEmpresa(data.empresa);
          setCosto(data.costo.toString());
          setNotas(data.notas || '');
          setEncargado(data.encargado);
          setSelectedObra(Number(data.obra_id) || 'general');
          if (data.has_image) {
            const url = supabase.storage.from('presupuestos').getPublicUrl(data.id.toString()).data.publicUrl;
            setImagePreview(url + '?t=' + new Date().getTime());
          }
        }
      };
      fetchPresupuesto();
    }
  }, [editingPresupuestoId]);

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
    if (!empresa || !costo || !encargado) {
      alert('Por favor complete la empresa, el costo y el encargado.');
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    let presId = editingPresupuestoId;

    if (editingPresupuestoId) {
      // UPDATE
      const { error } = await supabase.from('presupuestos').update({
        obra_id: selectedObra.toString(),
        empresa: empresa,
        costo: parseFloat(costo) || 0,
        notas: notas,
        encargado: encargado,
        has_image: !!imageFile || !!imagePreview
      }).eq('id', editingPresupuestoId);

      if (error) {
        console.error('Error Supabase:', error);
        alert('Error en el servidor: ' + error.message);
        setIsSubmitting(false);
        return;
      }
    } else {
      // INSERT
      const { data, error } = await supabase.from('presupuestos').insert([
        {
          obra_id: selectedObra.toString(),
          empresa: empresa,
          costo: parseFloat(costo) || 0,
          notas: notas,
          encargado: encargado,
          estado: 'Pendiente',
          has_image: !!imageFile
        }
      ]).select();

      if (error) {
        console.error('Error Supabase:', error);
        alert('Error en el servidor: ' + error.message);
        setIsSubmitting(false);
        return;
      } 
      if (data && data.length > 0) {
        presId = data[0].id;
      }
    }

    if (presId) {
      if (imageFile) {
        const { error: uploadError } = await supabase.storage
          .from('presupuestos')
          .upload(`${presId}`, imageFile, { contentType: imageFile.type, upsert: true });
          
        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          alert('El presupuesto se guardó, pero hubo un error al subir el archivo adjunto.');
        }
      } else if (!imageFile && !imagePreview && editingPresupuestoId) {
        // user removed the existing image during edit
        await supabase.storage.from('presupuestos').remove([`${presId}`]);
      }
      setShowSuccess(true);
    }
    setIsSubmitting(false);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    if (setEditingPresupuestoId) setEditingPresupuestoId(null);
    navigate('presupuestos_view');
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative flex flex-col">
      <SuccessOverlay 
        isVisible={showSuccess} 
        onComplete={handleSuccessComplete} 
      />
      {/* Top App Bar */}
      <header className="flex items-center px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <button onClick={() => navigate('back')} className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-surface transition-colors mr-3">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Logo onClick={() => navigate('splash')} />
      </header>

      <main className="px-4 py-8 max-w-md mx-auto space-y-6 flex-1 w-full pb-32">
        <div>
          <h2 className="text-2xl font-bold text-text-main">{editingPresupuestoId ? 'Editar Presupuesto' : 'Cargar Presupuesto'}</h2>
          <p className="text-text-muted mt-1 text-sm">{editingPresupuestoId ? 'Modifica los datos del presupuesto' : 'Adjunta cotizaciones para tu obra'}</p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          {activeObraId === 'general' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Asignar a Obra</label>
              <select 
                value={selectedObra}
                onChange={(e) => setSelectedObra(e.target.value === 'general' ? 'general' : Number(e.target.value))}
                className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3.5 text-text-main focus:outline-none focus:border-blue-500 appearance-none font-medium"
              >
                <option value="general">Seleccione una obra</option>
                {obras.map(obra => (
                  <option key={obra.id} value={obra.id}>{obra.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Obra Asignada</label>
              <div className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main font-bold">
                {obras.find(o => o.id === activeObraId)?.name || 'Cargando...'}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Empresa / Contratista</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input 
                type="text" 
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full bg-background-alt border border-surface-hover rounded-xl pl-11 pr-4 py-3.5 text-text-main focus:outline-none focus:border-blue-500 transition-colors font-medium placeholder:text-text-muted/40"
                placeholder="Ej. Aberturas San Juan"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Costo Total (Monto del presupuesto)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
              <input 
                type="number" 
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                className="w-full bg-background-alt border border-surface-hover rounded-xl pl-8 pr-4 py-3.5 text-blue-500 font-bold text-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Encargado (Solicita/Genera)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <select 
                value={encargado}
                onChange={(e) => setEncargado(e.target.value)}
                className="w-full bg-background-alt border border-surface-hover rounded-xl pl-11 pr-4 py-3.5 text-text-main focus:outline-none focus:border-blue-500 appearance-none font-medium"
              >
                <option value="" disabled>Seleccionar encargado...</option>
                <option value="Pablo Bellido">Pablo Bellido</option>
                <option value="Gaston Venier">Gaston Venier</option>
                <option value="Rodrigo Fernandez">Rodrigo Fernandez</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Notas y Detalle</label>
            <textarea 
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-blue-500 transition-colors resize-none h-24 font-medium placeholder:text-text-muted/40"
              placeholder="¿Qué incluye este presupuesto? Materiales, mano de obra, plazos..."
            ></textarea>
          </div>
        </div>

        {/* Comprobante */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Documento / Foto (Opcional)</label>
          
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

      {/* Floating Action Button */}
      <div className="fixed bottom-[27px] left-0 w-full p-4 bg-background border-t border-surface pb-6 z-50">
        <button 
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full max-w-md mx-auto block bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'GUARDANDO...' : 'GUARDAR PRESUPUESTO'}
        </button>
      </div>

    </div>
  );
}
