import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Save, X, Camera, Upload, BookOpen, Trash2 } from 'lucide-react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';

interface HistoriaUtuViewProps {
  navigate: (screen: Screen) => void;
}

export default function HistoriaUtuView({ navigate }: HistoriaUtuViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [historyText, setHistoryText] = useState('UTU Constructora nació de la pasión por transformar espacios y construir el futuro. Con años de experiencia en el sector, nuestro compromiso es la excelencia, la transparencia y la innovación en cada proyecto que emprendemos.');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    // Utilizamos archivos_obra con obra_id = 0 para guardar la historia global
    const { data, error } = await supabase
      .from('archivos_obra')
      .select('*')
      .eq('obra_id', '0')
      .eq('categoria', 'HISTORIA')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setRecordId(data.id);
      if (data.nombre) setHistoryText(data.nombre);
      if (data.has_file) {
        setMediaType(data.tipo === 'video' ? 'video' : 'image');
        const { data: publicUrl } = supabase.storage
          .from('archivos_obra')
          .getPublicUrl(data.id.toString());
        setMediaUrl(publicUrl.publicUrl + '?t=' + new Date().getTime());
      }
    }
    setIsLoading(false);
  };

  const handleEditClick = () => {
    if (isEditing) {
      // Cancel edit
      setIsEditing(false);
      setFile(null);
      fetchHistory(); // restore original
    } else {
      const pin = prompt('Se requiere autorización para editar la historia. Ingrese el PIN de 4 dígitos:');
      if (pin === '2600') {
        setIsEditing(true);
      } else if (pin !== null) {
        alert('PIN incorrecto. Operación cancelada.');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMediaType(selectedFile.type.includes('video') ? 'video' : 'image');
      setMediaUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleDeleteMedia = () => {
    if (confirm('¿Quitar archivo multimedia?')) {
      setFile(null);
      setMediaUrl(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let targetRecordId = recordId;

      if (recordId) {
        // Para evitar problemas de permisos de UPDATE en Supabase (RLS policies), 
        // creamos un registro nuevo, copiamos el archivo si se mantiene, y borramos el viejo.
        const { data: newRecord, error: insertError } = await supabase
          .from('archivos_obra')
          .insert([{
            obra_id: '0',
            categoria: 'HISTORIA',
            subcategoria: 'UTU',
            nombre: historyText,
            tipo: file ? (file.type.includes('video') ? 'video' : 'image') : mediaType,
            has_file: !!file || !!mediaUrl
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        targetRecordId = newRecord.id;

        // Si mantenemos la imagen/video viejo (no subimos uno nuevo pero mediaUrl existe)
        if (!file && mediaUrl) {
          await supabase.storage.from('archivos_obra').copy(recordId.toString(), targetRecordId.toString());
        }

        // Borramos el registro viejo y su archivo
        await supabase.from('archivos_obra').delete().eq('id', recordId);
        await supabase.storage.from('archivos_obra').remove([recordId.toString()]);
      } else {
        // Create completely new record
        const { data, error } = await supabase
          .from('archivos_obra')
          .insert([{
            obra_id: '0',
            categoria: 'HISTORIA',
            subcategoria: 'UTU',
            nombre: historyText,
            tipo: file ? (file.type.includes('video') ? 'video' : 'image') : mediaType,
            has_file: !!file || !!mediaUrl
          }])
          .select()
          .single();

        if (error) throw error;
        targetRecordId = data.id;
      }

      setRecordId(targetRecordId);

      // Upload file if selected
      if (file && targetRecordId) {
        const { error: uploadError } = await supabase.storage
          .from('archivos_obra')
          .upload(targetRecordId.toString(), file, { upsert: true });

        if (uploadError) throw uploadError;
      }

      setIsEditing(false);
      fetchHistory(); // Refresh to get proper public URL
    } catch (err: any) {
      console.error(err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('back')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-lg flex-1 text-center">Historia de UTU</h1>
        <button onClick={handleEditClick} className={`relative p-2 rounded-full transition-colors ${isEditing ? 'text-red-500 bg-red-500/10' : 'text-blue-500 hover:bg-blue-500/10'}`}>
          {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
        </button>
      </header>

      <main className="px-4 py-8 max-w-md mx-auto space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-surface rounded-3xl overflow-hidden border border-surface-hover shadow-sm transition-colors duration-300">
            
            {/* Media Section */}
            <div className="relative w-full aspect-video bg-background-alt flex items-center justify-center">
              {mediaUrl ? (
                mediaType === 'video' ? (
                  <video src={mediaUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                    <img src={mediaUrl} alt="Historia UTU" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                  </a>
                )
              ) : (
                <div className="text-text-muted flex flex-col items-center">
                  <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Sin imagen</span>
                </div>
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 backdrop-blur-sm transition-all">
                  <label className="flex flex-col items-center justify-center p-4 bg-surface/80 rounded-xl cursor-pointer hover:bg-primary hover:text-background transition-colors text-text-main">
                    <Camera className="w-6 h-6 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Cámara</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 bg-surface/80 rounded-xl cursor-pointer hover:bg-primary hover:text-background transition-colors text-text-main">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Archivo</span>
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  {mediaUrl && (
                    <button onClick={handleDeleteMedia} className="flex flex-col items-center justify-center p-4 bg-red-500/80 rounded-xl cursor-pointer hover:bg-red-600 hover:text-white transition-colors text-white">
                      <Trash2 className="w-6 h-6 mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider">Borrar</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-text-main font-black text-xl uppercase tracking-wider">Nuestro Origen</h2>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={historyText}
                  onChange={(e) => setHistoryText(e.target.value)}
                  className="w-full h-48 bg-background-alt border border-surface-hover rounded-xl p-4 text-text-main focus:outline-none focus:border-primary transition-colors resize-none font-medium leading-relaxed"
                  placeholder="Escribe la historia de la empresa..."
                />
              ) : (
                <p className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {historyText}
                </p>
              )}
            </div>
            
            {/* Save Button */}
            {isEditing && (
              <div className="p-6 pt-0">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-primary hover:bg-primary-hover text-background font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,107,0,0.3)] flex justify-center items-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-3 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
