import { ArrowLeft, Bell, CalendarClock, CircleDollarSign, AlertTriangle, Play } from 'lucide-react';
import { useState } from 'react';
import { Screen } from '../types';
import Logo from './Logo';
import { OBRAS_COLORS } from './CalendarView';
import { playNotificationSound } from '../audio';

interface NotificationsProps {
  navigate: (screen: Screen) => void;
}

export default function Notifications({ navigate }: NotificationsProps) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'payment',
      title: 'Día de Pagos (Quincena)',
      description: 'Hoy es el día de pago para los contratistas de albañilería.',
      time: 'Hace 2 horas',
      isNew: true,
      icon: CircleDollarSign,
      obraId: '1' // A3 Portillo
    },
    {
      id: 2,
      type: 'due',
      title: 'Vencimiento de Expensas',
      description: 'Recordatorio: Vencimiento de expensas en Barrio Norte.',
      time: 'Hace 5 horas',
      isNew: true,
      icon: CalendarClock,
      obraId: '3' // Casa 42
    },
    {
      id: 3,
      type: 'alert',
      title: 'Alerta de Materiales',
      description: 'Stock bajo de Cemento Loma Negra en el depósito principal.',
      time: 'Ayer',
      isNew: false,
      icon: AlertTriangle,
      obraId: 'general'
    },
    {
      id: 4,
      type: 'system',
      title: 'Nuevo Certificado Registrado',
      description: 'El Arq. González ha registrado un nuevo avance de obra.',
      time: 'Ayer',
      isNew: false,
      icon: Bell,
      obraId: '2' // S1 Lar de Boedo
    }
  ]);

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isNew: false } : n
    ));
  };

  const simulateIncomingNotification = () => {
    playNotificationSound();
    const newNotif = {
      id: Date.now(),
      type: 'alert',
      title: 'Nueva Actualización',
      description: 'Llegaron los materiales a la obra. Revisar remito adjunto.',
      time: 'Justo ahora',
      isNew: true,
      icon: Bell,
      obraId: '3'
    };
    setNotifications(prev => [newNotif, ...prev]);
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
        <h1 className="flex-1 ml-3 text-right text-text-main font-semibold text-lg">Notificaciones</h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
        
        {/* Simulate button for testing */}
        <button 
          onClick={simulateIncomingNotification}
          className="w-full mb-2 bg-surface hover:bg-surface-hover border border-surface-hover rounded-xl p-3 flex items-center justify-center gap-2 text-text-muted transition-colors text-sm font-bold"
        >
          <Play className="w-4 h-4" />
          Simular Notificación Entrante
        </button>

        {notifications.map((notif) => {
          const Icon = notif.icon;
          const obraData = OBRAS_COLORS[notif.obraId] || OBRAS_COLORS['general'];
          
          return (
            <div 
              key={notif.id} 
              onClick={() => handleMarkAsRead(notif.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${notif.isNew ? 'border-primary/50 bg-surface' : 'border-surface bg-background-alt'} flex gap-4 relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${notif.isNew ? obraData.color.replace('/20', '') : 'bg-surface-hover'}`} />
              
              {notif.isNew && (
                <div className="absolute top-0 right-0 w-2 h-2 m-4 bg-primary rounded-full"></div>
              )}
              
              <div className={`w-12 h-12 rounded-full ${obraData.color} flex items-center justify-center flex-shrink-0 mt-1 ml-1 transition-opacity ${notif.isNew ? 'opacity-100' : 'opacity-60'}`}>
                <Icon className={`w-6 h-6 ${obraData.textColor}`} />
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-start justify-between">
                  <h3 className={`font-bold text-base truncate transition-colors ${notif.isNew ? 'text-text-main' : 'text-text-muted'}`}>
                    {notif.title}
                  </h3>
                </div>
                
                <span className={`inline-block mt-1 mb-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded transition-opacity ${obraData.color} ${obraData.textColor} ${notif.isNew ? 'opacity-100' : 'opacity-60'}`}>
                  {obraData.name}
                </span>

                <p className={`text-sm mt-1 line-clamp-2 transition-colors ${notif.isNew ? 'text-text-muted' : 'text-secondary'}`}>
                  {notif.description}
                </p>
                <div className="text-xs text-secondary mt-2 font-medium">
                  {notif.time}
                </div>
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <Bell className="w-12 h-12 mb-4 opacity-20" />
            <p>No tienes notificaciones nuevas</p>
          </div>
        )}
      </main>
    </div>
  );
}
