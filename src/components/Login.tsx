import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { Screen } from '../types';
import Logo from './Logo';

interface LoginProps {
  navigate: (screen: Screen) => void;
}

export default function Login({ navigate }: LoginProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('back')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-12 max-w-md mx-auto w-full flex flex-col justify-center space-y-8">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
          <div className="flex items-baseline font-bold tracking-tighter">
            <span className="text-secondary text-6xl">U</span>
            <span className="text-secondary text-6xl">T</span>
            <span className="text-primary text-6xl">U</span>
          </div>
          <span className="text-text-muted tracking-[0.3em] font-medium text-xs">CONSTRUCTORA</span>
          <h1 className="text-text-main font-semibold text-xl mt-6">Iniciar Sesión</h1>
          <p className="text-text-muted text-sm text-center">Ingrese sus credenciales para acceder a la gestión de obras.</p>
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('dashboard'); }}>
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="email"
                placeholder="usuario@utu.com.ar"
                required
                className="w-full bg-surface border border-surface-hover rounded-xl pl-11 pr-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-surface border border-surface-hover rounded-xl pl-11 pr-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button type="button" className="text-xs font-bold text-primary hover:text-primary-hover transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {/* Action */}
          <div className="pt-6">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,107,0,0.2)]"
            >
              INGRESAR A LA PLATAFORMA
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
