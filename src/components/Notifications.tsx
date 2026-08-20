import { ArrowLeft, Bell, RefreshCw, Send, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';

interface NotificationsProps {
  navigate: (screen: Screen) => void;
}

interface Obra {
  id: number;
  name: string;
}

interface AppNotification {
  id: number;
  obraId: number | 'general';
  obraName: string;
  message: string;
  time: string;
  isNew: boolean;
}

export default function Notifications({ navigate }: NotificationsProps) {
  const [obras, setObras] = useState<Obra[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // New message form state
  const [selectedObra, setSelectedObra] = useState<number | 'general'>('general');
  const [newMessage, setNewMessage] = useState('');

  const loadData = async () => {
    const { data: obrasData } = await supabase.from('obras').select('*').order('id', { ascending: true });
    if (obrasData) setObras(obrasData);
    
    const { data: notifData } = await supabase.from('notificaciones').select('*').order('id', { ascending: false });
    if (notifData) {
      const parsed = notifData.map(n => {
        let displayTime = n.time;
        try {
          const parsedTime = JSON.parse(n.time);
          if (parsedTime.type === 'alarm') {
            displayTime = `Alarma para: ${parsedTime.date} a las ${parsedTime.time}`;
          }
        } catch(e) {}
        return { ...n, time: displayTime };
      });
      setNotifications(parsed);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    const { error } = await supabase.from('notificaciones').update({ isNew: false }).eq('id', id);
    if (!error) {
      const updated = notifications.map(n => 
        n.id === id ? { ...n, isNew: false } : n
      );
      setNotifications(updated);
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;

    let obraName = 'General';
    if (selectedObra !== 'general') {
      const obra = obras.find(o => o.id.toString() === selectedObra.toString());
      if (obra) obraName = obra.name;
    }

    const newNotif = {
      obraId: selectedObra.toString(),
      obraName: obraName,
      message: newMessage.trim(),
      time: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
      isNew: true
    };

    const { data, error } = await supabase.from('notificaciones').insert([newNotif]).select();
    
    if (!error && data && data.length > 0) {
      const updated = [data[0], ...notifications];
      setNotifications(updated);
      setNewMessage('');
    } else {
      alert('Error al enviar mensaje');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-surface">
        <div className="flex items-center gap-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('dashboard')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h1 className="flex-1 ml-3 text-right text-text-main font-semibold text-lg">Mensajes y Alertas</h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6">
        
        {/* Formulario para nuevo mensaje */}
        <div className="bg-surface rounded-2xl p-4 border border-surface-hover">
          <h2 className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider">Nuevo Mensaje</h2>
          
          <select 
            value={selectedObra}
            onChange={(e) => setSelectedObra(e.target.value === 'general' ? 'general' : Number(e.target.value))}
            className="w-full bg-background border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary mb-3 text-sm"
          >
            <option value="general">Mensaje General</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>{obra.name}</option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe una alerta o mensaje..."
              className="w-full bg-background border border-surface-hover rounded-xl pl-4 pr-12 py-3 text-text-main focus:outline-none focus:border-primary text-sm"
            />
            <button 
              onClick={handleAddMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary-hover bg-primary/10 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">Bandeja de Entrada</h2>
          <button 
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            ACTUALIZAR
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => handleMarkAsRead(notif.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${notif.isNew ? 'border-primary/50 bg-surface' : 'border-surface bg-background-alt'} flex gap-4 relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${notif.isNew ? 'bg-primary' : 'bg-surface-hover'}`} />
              
              {notif.isNew && (
                <div className="absolute top-0 right-0 w-2 h-2 m-4 bg-primary rounded-full"></div>
              )}
              
              <div className={`w-12 h-12 rounded-full ${notif.isNew ? 'bg-primary/20' : 'bg-surface-hover'} flex items-center justify-center flex-shrink-0 mt-1 ml-1 transition-opacity ${notif.isNew ? 'opacity-100' : 'opacity-60'}`}>
                <MessageSquare className={`w-5 h-5 ${notif.isNew ? 'text-primary' : 'text-text-muted'}`} />
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-start justify-between">
                  <span className={`inline-block mb-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded transition-opacity ${notif.isNew ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted'} ${notif.isNew ? 'opacity-100' : 'opacity-60'}`}>
                    {notif.obraName}
                  </span>
                </div>
                
                <p className={`text-sm mt-1 line-clamp-3 transition-colors ${notif.isNew ? 'text-text-main font-medium' : 'text-text-muted'}`}>
                  {notif.message}
                </p>
                <div className="text-[10px] text-secondary mt-2 font-bold uppercase tracking-wider">
                  {notif.time}
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p>No tienes mensajes</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
