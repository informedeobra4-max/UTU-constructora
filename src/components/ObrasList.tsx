import { Bell, ArrowRight, Plus, Calendar, Trash2, Edit2, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';

interface ObrasListProps {
  navigate: (screen: Screen) => void;
}

export default function ObrasList({ navigate }: ObrasListProps) {
  const [obras, setObras] = useState(() => {
    const saved = localStorage.getItem('obras_list');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 1,
        name: 'A3 Portillo',
        status: 'En Ejecución',
        spent: '$4,250.00',
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 2,
        name: 'S1 Lar de Boedo',
        status: 'En Ejecución',
        spent: '$8,100.00',
        image: 'https://images.unsplash.com/photo-1541888081-308104ebce39?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 3,
        name: 'Casa 42',
        status: 'En Ejecución',
        spent: '$1,950.00',
        image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=2000'
      }
    ];
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    localStorage.setItem('obras_list', JSON.stringify(obras));
  }, [obras]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');

  const days = [
    { name: 'L', date: '21', active: false },
    { name: 'M', date: '22', active: false },
    { name: 'M', date: '23', active: true },
    { name: 'J', date: '24', active: false },
    { name: 'V', date: '25', active: false },
    { name: 'S', date: '26', active: false },
    { name: 'D', date: '27', active: false },
  ];

  const handleEditClick = (obra: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(obra.id);
    setEditName(obra.name);
    setEditImage(obra.image);
  };

  const handleSaveEdit = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setObras(obras.map(o => o.id === id ? { ...o, name: editName, image: editImage } : o));
    setEditingId(null);
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('¿Seguro que deseas eliminar esta obra?')) {
      setObras(obras.filter(o => o.id !== id));
    }
  };

  const handleAddObra = () => {
    const newObra = {
      id: Date.now(),
      name: 'Nueva Obra',
      status: 'Planificación',
      spent: '$ 0,00',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800',
    };
    setObras([...obras, newObra]);
    setEditingId(newObra.id);
    setEditName(newObra.name);
    setEditImage(newObra.image);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="bg-primary px-4 py-3 flex items-center justify-between sticky top-0 z-[60] shadow-md">
          <div className="text-background font-bold text-sm">¿Quieres instalar la App?</div>
          <button 
            onClick={handleInstallApp}
            className="bg-background text-primary px-4 py-1.5 rounded-full font-bold text-xs shadow-sm hover:scale-105 transition-transform"
          >
            INSTALAR
          </button>
        </div>
      )}

      <header className="flex items-center justify-between px-4 py-4 bg-background border-b border-surface sticky top-[showInstallBanner ? '52px' : '0'] z-50">
        <Logo onClick={() => navigate('splash')} />
        <div className="flex items-center space-x-4 text-text-muted">
          <button onClick={() => navigate('notifications')} className="relative hover:text-text-main transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
          </button>
        </div>
      </header>

      <main className="px-4 py-8 max-w-md mx-auto space-y-6">
        {/* Full Date Header */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-text-main capitalize">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <p className="text-sm text-text-muted">Gestión de Obras</p>
        </div>

        {/* Date & Period Filter Bar instead of title */}
        <div className="flex items-center space-x-4 bg-surface rounded-2xl p-2 border border-surface-hover">
          <button className="p-3 bg-surface-hover rounded-xl text-text-muted hover:text-primary transition-colors">
            <Calendar className="w-5 h-5" />
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

        <div className="space-y-4 mt-8">
          {obras.map((obra) => (
            <div 
              key={obra.id} 
              className="bg-surface rounded-2xl overflow-hidden border border-surface-hover cursor-pointer hover:border-primary transition-all group relative"
              onClick={() => {
                if (editingId !== obra.id) {
                  navigate('dashboard');
                }
              }}
            >
              <div className="h-32 w-full relative overflow-hidden bg-background-alt">
                <img src={obra.image} alt={obra.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute top-3 right-3 bg-primary/20 backdrop-blur-md border border-primary/30 px-2 py-1 rounded text-primary text-[10px] font-bold uppercase tracking-wider">
                  {obra.status}
                </div>
              </div>
              <div className="p-5">
                {editingId === obra.id ? (
                  <div className="space-y-3 mb-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-2 text-text-main focus:outline-none focus:border-primary"
                      placeholder="Nombre de la obra"
                    />
                    <div className="relative w-full">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditImage(reader.result as string);
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Subir foto desde ordenador o celular"
                      />
                      <div className="w-full bg-background-alt border border-surface-hover border-dashed hover:border-primary rounded-xl px-4 py-3 text-text-muted flex items-center justify-center gap-2 transition-colors">
                        <Camera className="w-5 h-5" />
                        <span className="text-sm">Cambiar foto de obra</span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={(e) => handleSaveEdit(obra.id, e)} className="px-4 py-2 bg-primary text-background font-bold rounded-lg text-sm">Guardar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-text-main">{obra.name}</h2>
                    <div className="flex gap-2">
                      <button onClick={(e) => handleEditClick(obra, e)} className="p-2 text-text-muted hover:text-primary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDelete(obra.id, e)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Gasto Total Acumulado</p>
                  <p className="text-3xl font-extrabold text-green-500 tracking-tight">{obra.spent}</p>
                </div>
                <button className="w-full mt-5 bg-background-alt group-hover:bg-primary group-hover:text-background text-text-main font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Ver Detalles <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button onClick={handleAddObra} className="w-full border-2 border-dashed border-surface-hover hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-text-muted hover:text-primary transition-colors bg-background-alt hover:bg-surface">
            <div className="p-3 bg-surface rounded-full">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold">Agregar Nueva Obra</span>
          </button>
        </div>
      </main>
    </div>
  );
}
