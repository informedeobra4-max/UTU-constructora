import { ArrowLeft, User, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import SuccessOverlay from './SuccessOverlay';
import { supabase } from '../lib/supabaseClient';

interface IngresosFormProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
  defaultCurrency?: 'ARS' | 'USD';
}

export default function IngresosForm({ navigate, activeObraId, defaultCurrency = 'ARS' }: IngresosFormProps) {
  const [moneda, setMoneda] = useState<'ARS'|'USD'>(defaultCurrency);
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [encargado, setEncargado] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [obras, setObras] = useState<any[]>([]);
  const [selectedObra, setSelectedObra] = useState<number | 'general'>(activeObraId);

  useEffect(() => {
    const fetchObras = async () => {
      const { data } = await supabase.from('obras').select('*').order('id', { ascending: true });
      if (data) setObras(data);
    };
    fetchObras();
  }, []);

  const handleSave = async () => {
    if (!monto || !encargado) {
      alert('Por favor complete al menos el monto y el responsable.');
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('ingresos').insert([
      {
        obra_id: selectedObra.toString(),
        monto: parseFloat(monto) || 0,
        concepto: concepto,
        encargado: encargado,
        moneda: moneda
      }
    ]);

    if (error) {
      console.error('Error Supabase:', error);
      alert('Error en el servidor: ' + error.message);
      setIsSubmitting(false);
      return;
    } 

    setShowSuccess(true);
    setIsSubmitting(false);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    navigate('ingresos_view');
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
          <h2 className="text-2xl font-bold text-text-main">Aumentar Valor Inicial</h2>
          <p className="text-text-muted mt-1 text-sm">Registrar un nuevo depósito o ingreso de dinero.</p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          {activeObraId === 'general' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Asignar a Obra</label>
              <select 
                value={selectedObra}
                onChange={(e) => setSelectedObra(e.target.value === 'general' ? 'general' : Number(e.target.value))}
                className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3.5 text-text-main focus:outline-none focus:border-green-500 appearance-none font-medium"
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

          <div className="space-y-1.5 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Monto a Depositar</label>
              
              <div className="flex bg-surface rounded-lg p-1 border border-surface-hover">
                <button
                  type="button"
                  onClick={() => setMoneda('ARS')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    moneda === 'ARS' ? 'bg-green-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  ARS ($)
                </button>
                <button
                  type="button"
                  onClick={() => setMoneda('USD')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    moneda === 'USD' ? 'bg-green-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  USD (U$S)
                </button>
              </div>
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">{moneda === 'ARS' ? '$' : 'U$S'}</span>
              <input 
                type="number" 
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-background-alt border border-surface-hover rounded-xl pl-12 pr-4 py-3.5 text-green-500 font-bold text-lg focus:outline-none focus:border-green-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Concepto (Opcional)</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input 
                type="text" 
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full bg-background-alt border border-surface-hover rounded-xl pl-11 pr-4 py-3.5 text-text-main focus:outline-none focus:border-green-500 transition-colors font-medium placeholder:text-text-muted/40"
                placeholder="Ej. Aporte inicial, refuerczo quincena..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Depositado Por</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <select 
                value={encargado}
                onChange={(e) => setEncargado(e.target.value)}
                className="w-full bg-background-alt border border-surface-hover rounded-xl pl-11 pr-4 py-3.5 text-text-main focus:outline-none focus:border-green-500 appearance-none font-medium"
              >
                <option value="" disabled>Seleccionar encargado...</option>
                <option value="Pablo Bellido">Pablo Bellido</option>
                <option value="Gaston Venier">Gaston Venier</option>
                <option value="Rodrigo Fernandez">Rodrigo Fernandez</option>
              </select>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-[27px] left-0 w-full p-4 bg-background border-t border-surface pb-6 z-50">
        <button 
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full max-w-md mx-auto block bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'GUARDANDO...' : 'REGISTRAR INGRESO'}
        </button>
      </div>

    </div>
  );
}
