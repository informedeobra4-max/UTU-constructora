import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Download, Trash2, FileText, ImageIcon, Video, File, X } from 'lucide-react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';

interface ArchivosCategoriaViewProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
  categoria: string;
}

export default function ArchivosCategoriaView({ navigate, activeObraId, categoria }: ArchivosCategoriaViewProps) {
  const [archivos, setArchivos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeObraName, setActiveObraName] = useState('Obra General');
  const [selectedSubcat, setSelectedSubcat] = useState<string>('Todas');
  const [previewFile, setPreviewFile] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      let currentName = 'General';
      if (activeObraId !== 'general') {
        const { data: obras } = await supabase.from('obras').select('*');
        const obra = obras?.find(o => o.id === activeObraId);
        if (obra) currentName = obra.name;
      }
      setActiveObraName(currentName);

      const { data, error } = await supabase
        .from('archivos_obra')
        .select('*')
        .eq('categoria', categoria)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const filtered = data.filter(a => 
          activeObraId === 'general' ? true : a.obra_id === activeObraId.toString()
        );
        setArchivos(filtered);
      }
      setIsLoading(false);
    };

    init();
  }, [activeObraId, categoria]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este archivo de forma permanente?')) {
      const { error } = await supabase.from('archivos_obra').delete().eq('id', id);
      if (!error) {
        setArchivos(archivos.filter(a => a.id !== id));
      } else {
        alert('Error al eliminar');
      }
    }
  };

  const getSubcategories = () => {
    switch (categoria) {
      case 'PLANOS': return ['Todas', 'Arquitectura', 'Estructuras', 'Sanitario', 'Eléctrico', 'Agrimensura'];
      case 'RENDERS': return ['Todas', 'Volumetría', 'Fachadas', 'Video', 'Interiores'];
      case 'PUBLICIDAD': return ['Todas', 'Flyers', 'Logos', 'Promociones'];
      case 'REGLAMENTOS': return ['Todas', 'Agua', 'Gas', 'Reglamento', 'Estudio de Suelo'];
      default: return ['Todas'];
    }
  };

  const filteredArchivos = selectedSubcat === 'Todas' 
    ? archivos 
    : archivos.filter(a => a.subcategoria === selectedSubcat);

  const getIcon = (sub: string) => {
    if (sub.toLowerCase() === 'video') return <Video className="w-5 h-5" />;
    if (categoria === 'RENDERS' || categoria === 'PUBLICIDAD') return <ImageIcon className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getFileUrl = (id: string) => {
    return supabase.storage.from('archivos_obra').getPublicUrl(id).data.publicUrl;
  };

  const getColorClass = () => {
    if (categoria === 'PLANOS') return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    if (categoria === 'RENDERS') return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
    if (categoria === 'PUBLICIDAD') return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    if (categoria === 'REGLAMENTOS') return 'text-teal-500 bg-teal-500/10 border-teal-500/30';
    return 'text-primary bg-primary/10 border-primary/30';
  };

  const colorConfig = getColorClass().split(' ');
  const textColor = colorConfig[0];
  const bgColor = colorConfig[1];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('back')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-lg truncate flex-1 mx-4 text-center">{categoria}</h1>
      </header>

      <div className="overflow-x-auto hide-scrollbar bg-background border-b border-surface sticky top-[65px] z-40">
        <div className="flex space-x-2 px-4 py-3 min-w-max">
          {getSubcategories().map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubcat(sub)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedSubcat === sub 
                  ? `${bgColor} ${textColor} border border-transparent` 
                  : 'bg-surface text-text-muted border border-surface-hover hover:text-text-main'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 space-y-4 max-w-md mx-auto relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className={`w-10 h-10 border-4 ${textColor}/20 border-t-current rounded-full animate-spin ${textColor}`}></div>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className={`font-bold text-xl ${textColor}`}>{activeObraName}</h3>
        </div>

        {filteredArchivos.map(archivo => (
          <div key={archivo.id} className="bg-surface rounded-2xl p-4 border border-surface-hover flex gap-4 shadow-sm group">
            
            <div 
              className={`w-14 h-14 rounded-xl ${bgColor} ${textColor} flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => setPreviewFile(archivo)}
            >
              {getIcon(archivo.subcategoria)}
            </div>

            <div className="flex-1 flex flex-col justify-center min-w-0" onClick={() => setPreviewFile(archivo)}>
              <h3 
                className="text-text-main font-bold text-sm truncate hover:underline cursor-pointer"
              >
                {archivo.nombre}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-background-alt px-2 py-0.5 rounded">
                  {archivo.subcategoria}
                </span>
                <span className="text-[10px] text-text-muted/60">
                  {new Date(archivo.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-center shrink-0 border-l border-surface-hover pl-3">
              <button 
                onClick={() => window.open(getFileUrl(archivo.id.toString()) + '?t=' + Date.now(), '_blank')}
                className={`p-2 rounded-lg hover:bg-background-alt transition-colors ${textColor}`}
                title="Descargar / Ver"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDelete(archivo.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredArchivos.length === 0 && !isLoading && (
          <div className="text-center py-20 text-text-muted flex flex-col items-center">
            <File className="w-12 h-12 mb-3 opacity-20" />
            <p>No hay archivos en esta categoría.</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent pb-8 z-50">
        <button 
          onClick={() => navigate('archivo_form')}
          className={`w-full max-w-md mx-auto flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,0,0,0.2)] ${
            categoria === 'PLANOS' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30' :
            categoria === 'RENDERS' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/30' :
            'bg-amber-600 hover:bg-amber-500 shadow-amber-500/30'
          }`}
        >
          <Plus className="w-5 h-5" />
          SUBIR ARCHIVO
        </button>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col backdrop-blur-sm transition-all duration-300">
          <div className="flex justify-between items-center p-4 text-white border-b border-white/10">
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="font-bold truncate pr-4 text-lg">{previewFile.nombre}</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest">{previewFile.subcategoria}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => window.open(getFileUrl(previewFile.id.toString()), '_blank')} 
                className="p-3 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2"
                title="Descargar"
              >
                <Download className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setPreviewFile(null)} 
                className="p-3 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto flex items-center justify-center p-2 relative">
            {previewFile.tipo === 'image' && (
              <img 
                src={getFileUrl(previewFile.id.toString())} 
                alt={previewFile.nombre} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              />
            )}
            {previewFile.tipo === 'pdf' && (
              <iframe 
                src={getFileUrl(previewFile.id.toString())} 
                className="w-full h-full bg-white rounded-lg shadow-2xl" 
                title={previewFile.nombre}
              />
            )}
            {previewFile.tipo === 'video' && (
              <video 
                src={getFileUrl(previewFile.id.toString())} 
                controls 
                autoPlay
                className="max-w-full max-h-full rounded-lg shadow-2xl" 
              />
            )}
            {!['image', 'pdf', 'video'].includes(previewFile.tipo) && (
              <div className="text-center text-white p-8">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold">Vista previa no disponible</p>
                <p className="text-sm text-gray-400 mt-2">Por favor, descarga el archivo para verlo.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
