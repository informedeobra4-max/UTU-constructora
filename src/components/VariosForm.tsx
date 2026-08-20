import { ArrowLeft, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import SuccessOverlay from './SuccessOverlay';
import { supabase } from '../lib/supabaseClient';

interface VariosFormProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}

interface Obra {
  id: number;
  name: string;
}

export default function VariosForm({ navigate, activeObraId }: VariosFormProps) {
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [obras, setObras] = useState<Obra[]>([]);
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
    if (!description || !amount) {
      alert('Por favor complete al menos la descripción y el monto.');
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
        type: 'varios',
        title: description,
        subtitle: `${obraName} • ${provider || 'S/N'}`,
        amount: parseFloat(amount) || 0,
        status: 'Pendiente'
      }
    ]).select();

    if (error) {
      console.error('Error Supabase:', error);
      alert('Error en el servidor: ' + error.message);
      setIsSubmitting(false);
      return;
    } 

    if (data && data.length > 0) {
      const gastoId = data[0].id;
      if (imageFile) {
        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(`${gastoId}`, imageFile, { contentType: imageFile.type, upsert: true });
          
        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          alert('El gasto se guardó, pero hubo un error al subir la foto.');
        }
      }
      setShowSuccess(true);
    }
    setIsSubmitting(false);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    navigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <SuccessOverlay 
        isVisible={showSuccess} 
        onComplete={handleSuccessComplete} 
      />
      {/* Top App Bar */}
      <header className="flex items-center px-4 py-4 bg-background border-b border-surface sticky top-0 z-50">
        <button onClick={() => navigate('obras_list')} className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-surface transition-colors mr-3">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Logo onClick={() => navigate('splash')} />
      </header>

      <main className="px-4 py-8 max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Registrar Gastos Varios</h2>
          <p className="text-text-muted mt-1 text-sm">Carga el detalle del gasto</p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          {activeObraId === 'general' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Asignar a Obra</label>
              <select 
                value={selectedObra}
                onChange={(e) => setSelectedObra(e.target.value === 'general' ? 'general' : Number(e.target.value))}
                className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary appearance-none font-medium"
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
              <div className="w-full bg-surface border border-surface-hover rounded-xl px-4 py-3 text-text-main font-bold">
                {obras.find(o => o.id === activeObraId)?.name || 'Cargando...'}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Proveedor (Opcional)</label>
            <input 
              type="text" 
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors font-medium placeholder:text-text-muted/40"
              placeholder="Ej. Corralón El Amigo"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Detalle del Gasto</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors resize-none h-24 font-medium placeholder:text-text-muted/40"
              placeholder="Descripción de los gastos (Ej: Combustible, viáticos)"
            ></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Monto Total</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-background-alt border border-surface-hover rounded-xl pl-8 pr-4 py-3 text-text-main font-bold text-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Comprobante */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold tracking-wider text-text-muted uppercase">Comprobante</label>
          <label className="w-full border-2 border-dashed border-secondary/50 rounded-xl bg-background-alt hover:bg-surface hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center py-10 px-4 text-center group">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${imagePreview ? 'bg-primary/20 text-primary' : 'bg-surface text-text-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
              <Camera className="w-7 h-7" />
            </div>
            <span className="text-text-main font-medium">{imagePreview ? '¡Foto adjuntada!' : 'Tomar foto o subir comprobante'}</span>
            <span className="text-text-muted text-sm mt-1">{imagePreview ? 'Haz clic para cambiar' : 'Formatos: JPG, PNG'}</span>
          </label>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent pb-8">
        <button 
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full max-w-md mx-auto block bg-primary hover:bg-primary-hover text-background font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'GUARDANDO...' : 'GUARDAR GASTO'}
        </button>
      </div>


    </div>
  );
}
