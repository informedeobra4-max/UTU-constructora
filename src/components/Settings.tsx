import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Info } from 'lucide-react';
import { Screen } from '../types';
import Logo from './Logo';

interface SettingsProps {
  navigate: (screen: Screen) => void;
}

export default function Settings({ navigate }: SettingsProps) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Force a small reload or trigger an event so App.tsx picks it up immediately
    // For a React app, dispatching a custom event is a clean way without context
    window.dispatchEvent(new Event('theme-change'));
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
        <h1 className="text-text-main font-semibold text-lg flex-1 text-center pr-12">Configuración</h1>
      </header>

      <main className="px-4 py-8 max-w-md mx-auto space-y-6">
        <div className="bg-surface rounded-3xl p-6 border border-surface-hover shadow-sm transition-colors duration-300">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-6">Apariencia</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted'}`}>
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-text-main font-bold">Modo Oscuro</p>
                <p className="text-text-muted text-xs">Apariencia clásica</p>
              </div>
            </div>
            
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-primary' : 'bg-surface-hover'}`}
            >
              <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-surface-hover">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl transition-colors ${theme === 'light' ? 'bg-blue-500/20 text-blue-500' : 'bg-surface-hover text-text-muted'}`}>
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <p className="text-text-main font-bold">Modo Claro</p>
                <p className="text-text-muted text-xs">Apariencia luminosa</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-6 border border-surface-hover shadow-sm transition-colors duration-300">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-6">Información</h2>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-500 transition-colors">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-main font-bold">Última Actualización</p>
              <p className="text-text-muted text-xs font-medium">
                {typeof __APP_UPDATE_TIME__ !== 'undefined' ? __APP_UPDATE_TIME__ : 'Desconocida'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
