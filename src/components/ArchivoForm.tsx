import React, { useState } from 'react';
import { ArrowLeft, Camera, FileText, Upload, Save, X } from 'lucide-react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';
import SuccessOverlay from './SuccessOverlay';

interface ArchivoFormProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
  categoria: string;
}

export default function ArchivoForm({ navigate, activeObraId, categoria }: ArchivoFormProps) {
  const [nombre, setNombre] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getSubcategories = () => {
    switch (categoria) {
      case 'PLANOS': return ['Arquitectura', 'Estructuras', 'Sanitario', 'Eléctrico', 'Agrimensura', 'Otros'];
      case 'RENDERS': return ['Volumetría', 'Fachadas', 'Video', 'Interiores', 'Otros'];
      case 'PUBLICIDAD': return ['Flyers', 'Logos', 'Promociones', 'Otros'];
      case 'REGLAMENTOS': return ['Agua', 'Gas', 'Reglamento', 'Estudio de Suelo', 'Otros'];
      default: return ['Otros'];
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeObraId === 'general') {
      alert('Debe seleccionar una obra específica');
      return;
    }
    if (!subcategoria) {
      alert('Debe seleccionar una subcategoría');
      return;
    }
    if (!file) {
      alert('Debe adjuntar un archivo o foto');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create DB record
      const { data, error } = await supabase
        .from('archivos_obra')
        .insert([{
          obra_id: activeObraId.toString(),
          categoria,
          subcategoria,
          nombre,
          tipo: file.type.includes('image') ? 'image' : (file.type.includes('video') ? 'video' : 'pdf'),
          has_file: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Upload file to storage using the DB record ID as name
      const fileExt = file.name.split('.').pop();
      const fileName = `${data.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('archivos_obra')
        .upload(data.id.toString(), file, { upsert: true });

      if (uploadError) throw uploadError;

      setShowSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert('Error al guardar: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const getColorClass = () => {
    if (categoria === 'PLANOS') return 'text-blue-500 bg-blue-500 hover:bg-blue-600 focus:border-blue-500';
    if (categoria === 'RENDERS') return 'text-purple-500 bg-purple-500 hover:bg-purple-600 focus:border-purple-500';
    if (categoria === 'PUBLICIDAD') return 'text-amber-500 bg-amber-500 hover:bg-amber-600 focus:border-amber-500';
    if (categoria === 'REGLAMENTOS') return 'text-teal-500 bg-teal-500 hover:bg-teal-600 focus:border-teal-500';
    return 'text-primary bg-primary hover:bg-primary-hover focus:border-primary';
  };

  const colorClasses = getColorClass().split(' ');
  const textColor = colorClasses[0];
  const bgButton = colorClasses[1];
  const focusBorder = colorClasses[3];

  return (
    <div className="min-h-screen bg-background pb-24">
      <SuccessOverlay 
        isVisible={showSuccess} 
        onComplete={() => {
          setShowSuccess(false);
          navigate('archivos_categoria');
        }} 
      />
      
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('archivos_categoria')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-lg truncate flex-1 mx-4 text-center">Nuevo {categoria === 'PLANOS' ? 'Plano' : categoria === 'RENDERS' ? 'Render' : categoria === 'REGLAMENTOS' ? 'Reglamento' : 'Archivo'}</h1>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Nombre / Descripción</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3.5 text-text-main focus:outline-none focus:border-2 ${focusBorder} transition-colors placeholder:text-text-muted/50 font-medium`}
              placeholder="Ej: Planta Alta, Vista Frontal..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Categoría</label>
            <div className="grid grid-cols-2 gap-2">
              {getSubcategories().map(sub => (
                <button
                  type="button"
                  key={sub}
                  onClick={() => setSubcategoria(sub)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    subcategoria === sub 
                      ? `${textColor} bg-surface border-current shadow-sm` 
                      : 'text-text-muted bg-background-alt border-surface-hover hover:border-text-muted/30'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Comprobante */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Archivo o Foto Obligatorio</label>
            
            {imagePreview ? (
              <div className={`relative w-full border-2 ${textColor.replace('text', 'border')} rounded-xl bg-background-alt py-8 px-4 text-center flex flex-col items-center justify-center`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-surface ${textColor}`}>
                  <FileText className="w-7 h-7" />
                </div>
                <span className="text-text-main font-medium">¡Archivo adjuntado exitosamente!</span>
                <p className="text-xs text-text-muted mt-1">{file?.name}</p>
                <button 
                  type="button"
                  onClick={() => { setFile(null); setImagePreview(null); }} 
                  className="mt-4 p-2 bg-surface text-text-muted rounded-full hover:text-red-500 hover:bg-red-500/10 transition-colors absolute top-2 right-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="border-2 border-dashed border-secondary/50 rounded-xl bg-background-alt hover:bg-surface hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center py-6 px-2 text-center group">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-surface text-text-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-text-main font-bold text-sm">Cámara</span>
                  <span className="text-text-muted text-[10px] mt-1 uppercase tracking-wider">Tomar Foto</span>
                </label>

                <label className="border-2 border-dashed border-secondary/50 rounded-xl bg-background-alt hover:bg-surface hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center py-6 px-2 text-center group">
                  <input type="file" accept="image/*,application/pdf,video/*" className="hidden" onChange={handleFileUpload} />
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-surface text-text-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-text-main font-bold text-sm">Archivo</span>
                  <span className="text-text-muted text-[10px] mt-1 uppercase tracking-wider">Galería / PDF / Video</span>
                </label>
              </div>
            )}
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent pb-8 z-50">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full max-w-md mx-auto flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] ${
            isSubmitting ? 'bg-surface-hover text-text-muted cursor-not-allowed shadow-none' : `${bgButton} hover:scale-[1.02]`
          }`}
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Archivo
            </>
          )}
        </button>
      </div>
    </div>
  );
}
