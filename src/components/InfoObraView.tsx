import React from 'react';
import { ArrowLeft, Map, Home, Megaphone, Paperclip } from 'lucide-react';
import { Screen } from '../types';
import Logo from './Logo';

interface InfoObraViewProps {
  navigate: (screen: Screen) => void;
  setCategoriaArchivos?: (cat: string) => void;
  activeObraId: number | 'general';
}

export default function InfoObraView({ navigate, setCategoriaArchivos, activeObraId }: InfoObraViewProps) {
  
  const handleCategoryClick = (categoria: string) => {
    if (setCategoriaArchivos) {
      setCategoriaArchivos(categoria);
    }
    navigate('archivos_categoria');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('dashboard')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-lg truncate flex-1 mx-4 text-center">Info del Proyecto</h1>
      </header>

      <main className="px-4 py-8 space-y-6 max-w-md mx-auto">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
            <Paperclip className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-text-main">Archivos y Documentos</h2>
          <p className="text-sm text-text-muted mt-2">Gestiona toda la información gráfica y técnica de la obra</p>
        </div>

        <div className="space-y-4">
          
          <div 
            onClick={() => handleCategoryClick('PLANOS')}
            className="bg-surface rounded-2xl p-5 border border-surface-hover shadow-sm hover:border-blue-500/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Map className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main tracking-wide uppercase">Planos</h3>
              <p className="text-sm text-text-muted font-medium mt-0.5">Arquitectura, estructuras, sanitario, etc.</p>
            </div>
          </div>

          <div 
            onClick={() => handleCategoryClick('RENDERS')}
            className="bg-surface rounded-2xl p-5 border border-surface-hover shadow-sm hover:border-purple-500/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Home className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main tracking-wide uppercase">Renders</h3>
              <p className="text-sm text-text-muted font-medium mt-0.5">Volumetría, fachadas, videos, etc.</p>
            </div>
          </div>

          <div 
            onClick={() => handleCategoryClick('PUBLICIDAD')}
            className="bg-surface rounded-2xl p-5 border border-surface-hover shadow-sm hover:border-amber-500/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main tracking-wide uppercase">Publicidad</h3>
              <p className="text-sm text-text-muted font-medium mt-0.5">Flayers, imágenes promocionales, etc.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
