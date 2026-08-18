import { ArrowLeft, Camera, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import SuccessOverlay from './SuccessOverlay';
import { supabase } from '../lib/supabaseClient';

interface ManoObraFormProps {
  navigate: (screen: Screen) => void;
}

interface Obra {
  id: number;
  name: string;
}

export default function ManoObraForm({ navigate }: ManoObraFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [period, setPeriod] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObra, setSelectedObra] = useState<number | 'general'>('general');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  useEffect(() => {
    const savedObras = localStorage.getItem('obras_list');
    if (savedObras) setObras(JSON.parse(savedObras));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!workerName || !amount) {
      alert('Por favor complete el contratista y el monto total.');
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    let obraName = 'General';
    if (selectedObra !== 'general') {
      const obra = obras.find(o => o.id.toString() === selectedObra.toString());
      if (obra) obraName = obra.name;
    }

    const { data, error } = await supabase.from('gastos').insert([
      {
        type: 'mano_obra',
        title: workerName,
        subtitle: `${obraName} • ${period || 'General'}`,
        amount: parseFloat(amount) || 0,
        status: 'Pendiente'
      }
    ]).select();

    setIsSubmitting(false);

    if (error) {
      console.error('Error Supabase:', error);
      alert('Error en el servidor: ' + error.message);
    } else {
      if (imageBase64 && data && data.length > 0) {
        localStorage.setItem(`gasto_image_${data[0].id}`, imageBase64);
      }
      setShowSuccess(true);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    navigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <SuccessOverlay 
        isVisible={showSuccess} 
        onComplete={handleSuccessComplete} 
      />
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-surface">
        <div className="flex items-center gap-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('dashboard')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 ml-3 text-right">
          <h1 className="text-text-main font-semibold text-sm md:text-lg truncate">Nuevo Certificado</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 space-y-6">
        
        {/* Obra */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Obra Destino</label>
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

        {/* Rubro */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Tipo de Rubro/Oficio</label>
          <div className="relative">
            <select className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer">
              <option value="" disabled selected>Seleccione un rubro...</option>
              <option>Albañilería</option>
              <option>Plomería</option>
              <option>Electricidad</option>
              <option>Pintura</option>
              <option>Herrería</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Tarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Tarea a Realizar</label>
          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Ej. Llenado de losa sobre PB"
            className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Contratista */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Responsable / Contratista</label>
          <input
            type="text"
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
            placeholder="Nombre del contratista o cuadrilla"
            className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        <hr className="border-surface-hover" />

        {/* Monto Total */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Monto Total Pactado</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-surface border border-surface-hover rounded-xl pl-8 pr-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Anticipo & Saldo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Anticipo / Pago Actual</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-surface border border-surface-hover rounded-xl pl-8 pr-4 py-3.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Saldo Restante</label>
            <div className="relative opacity-70">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
              <input
                type="number"
                value="0.00"
                readOnly
                className="w-full bg-background-alt border border-surface-hover rounded-xl pl-8 pr-4 py-3.5 text-text-muted cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Forma de Pago */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Forma de Pago</label>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer">
              <input type="radio" name="pago" className="peer sr-only" defaultChecked />
              <div className="px-5 py-2.5 rounded-xl border border-surface-hover text-text-muted text-sm peer-checked:bg-primary peer-checked:text-background peer-checked:border-primary peer-checked:font-bold transition-all">
                Efectivo
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="pago" className="peer sr-only" />
              <div className="px-5 py-2.5 rounded-xl border border-surface-hover text-text-muted text-sm peer-checked:bg-primary peer-checked:text-background peer-checked:border-primary peer-checked:font-bold transition-all">
                Transferencia
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="pago" className="peer sr-only" />
              <div className="px-5 py-2.5 rounded-xl border border-surface-hover text-text-muted text-sm peer-checked:bg-primary peer-checked:text-background peer-checked:border-primary peer-checked:font-bold transition-all">
                Cheque
              </div>
            </label>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Fecha Inicio</label>
            <input
              type="date"
              className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main focus:outline-none focus:border-primary transition-colors appearance-none"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Fecha Fin (Est.)</label>
            <input
              type="date"
              className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main focus:outline-none focus:border-primary transition-colors appearance-none"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Rubro / Especialidad */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Rubro / Especialidad</label>
          <div className="relative">
            <select className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3.5 text-text-main appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer">
              <option value="" disabled selected>Seleccionar rubro</option>
              <option>Albañilería</option>
              <option>Electricidad</option>
              <option>Plomería / Sanitarista</option>
              <option>Herrería</option>
              <option>Pintura</option>
              <option>Carpintería</option>
              <option>Construcción en Seco</option>
              <option>Otro</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Descripcion */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Descripción de Tareas</label>
          <textarea
            rows={3}
            placeholder="Ej: Colocación de cerámicos en baño principal, revoque fino, etc."
            className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
          />
        </div>

        {/* Comprobante */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Subir certificado</label>
          <label className="w-full border-2 border-dashed border-secondary/50 rounded-xl bg-background-alt hover:bg-surface hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center py-10 px-4 text-center group">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${imageBase64 ? 'bg-primary/20 text-primary' : 'bg-surface text-text-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
              <Camera className="w-7 h-7" />
            </div>
            <span className="text-text-main font-medium">{imageBase64 ? '¡Foto adjuntada!' : 'Tomar foto de planilla'}</span>
            <span className="text-text-muted text-sm mt-1">{imageBase64 ? 'Haz clic para cambiar' : 'Formatos: JPG, PNG'}</span>
          </label>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-[27px] left-0 w-full bg-background/95 backdrop-blur-md border-t border-surface p-4 pb-6 z-50">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary-hover text-background font-bold uppercase tracking-wider py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,107,0,0.2)]"
          >
            REGISTRAR CONTRATO / PAGO
          </button>
        </div>
      </div>
    </div>
  );
}
