import { ArrowLeft, Bell, Briefcase, Calendar, ChevronDown, Hammer, Receipt, Wallet } from 'lucide-react';
import { Screen } from '../types';
import Logo from './Logo';

interface DashboardProps {
  navigate: (screen: Screen) => void;
}

export default function Dashboard({ navigate }: DashboardProps) {
  const days = [
    { name: 'L', date: '21', active: false },
    { name: 'M', date: '22', active: false },
    { name: 'M', date: '23', active: true },
    { name: 'J', date: '24', active: false },
    { name: 'V', date: '25', active: false },
    { name: 'S', date: '26', active: false },
    { name: 'D', date: '27', active: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('obras_list')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-text-main font-semibold text-lg truncate flex-1 mx-4 text-center hidden md:block">Obra Activa: Casa 42</h1>
        <div className="flex items-center space-x-4 text-text-muted">
          <button onClick={() => navigate('notifications')} className="relative hover:text-text-main transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
          </button>
        </div>
      </header>


      <main className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Full Date Header */}
        <div>
          <h2 className="text-xl font-bold text-text-main capitalize">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <p className="text-sm text-text-muted">Obra Activa: Casa 42</p>
        </div>

        {/* Date & Period Filter Bar */}
        <div className="flex items-center space-x-4 bg-surface rounded-2xl p-2 border border-surface-hover">
          <button 
            onClick={() => navigate('calendar')}
            className="p-3 bg-surface-hover rounded-xl text-text-muted hover:text-primary transition-colors relative"
          >
            <Calendar className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
          </button>
          <div className="flex flex-1 justify-between items-center overflow-x-auto hide-scrollbar px-2">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center min-w-[36px] ${
                  day.active ? 'text-primary' : 'text-text-muted opacity-60'
                }`}
              >
                <span className="text-xs font-medium">{day.name}</span>
                <span className={`text-sm ${day.active ? 'font-bold border-b-2 border-primary pb-1' : ''}`}>
                  {day.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-surface rounded-2xl p-6 border border-green-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          <div className="text-center space-y-2">
            <h2 className="text-xs text-text-muted font-bold tracking-widest uppercase">Resumen General</h2>
            <h3 className="text-green-500 font-bold text-lg">Gasto Total Acumulado</h3>
            <p className="text-4xl font-extrabold text-green-500 tracking-tight">$1.250.000</p>
            <div className="inline-flex items-center space-x-1 bg-background-alt px-3 py-1 rounded-full border border-surface-hover mt-2">
              <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-xs font-semibold text-text-main">+12% vs. mes anterior</span>
            </div>
          </div>
        </div>

        {/* Primary Section Cards */}
        <div className="space-y-4">
          {/* Materiales */}
          <div className="bg-surface rounded-2xl p-5 border border-surface-hover flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-background-alt rounded-xl text-primary">
                <Hammer className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-text-main font-semibold text-lg">Materiales / Compras</h3>
                <p className="text-text-muted text-sm mt-1">Subtotal: <span className="text-text-main font-bold">$450.000</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('compras')}
              className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-colors"
            >
              REGISTRAR COMPRA
            </button>
          </div>

          {/* Mano de Obra */}
          <div className="bg-surface rounded-2xl p-5 border border-surface-hover flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-background-alt rounded-xl text-primary">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-text-main font-semibold text-lg">Mano de Obra</h3>
                <p className="text-text-muted text-sm mt-1">Subtotal: <span className="text-text-main font-bold">$600.000</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('mano_obra')}
              className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-colors"
            >
              NUEVO CERTIFICADO
            </button>
          </div>

          {/* Control de Gastos */}
          <div className="bg-surface rounded-2xl p-5 border border-surface-hover flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-background-alt rounded-xl text-primary">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-text-main font-semibold text-lg">Control de Gastos</h3>
                <p className="text-text-muted text-sm mt-1">Subtotal: <span className="text-text-main font-bold">$200.000</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('gastos')}
              className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-colors"
            >
              DESGLOSE GENERAL
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
