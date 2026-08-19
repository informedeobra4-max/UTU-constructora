import { ArrowLeft, Bell, Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { playAlarmSound } from '../audio';
import { Screen } from '../types';
import Logo from './Logo';

interface CalendarViewProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}

interface Note {
  id: number;
  text: string;
  time: string;
  obraId?: string;
}

export const OBRAS_COLORS: Record<string, { name: string, color: string, textColor: string }> = {
  '1': { name: 'A3 Portillo', color: 'bg-blue-500/20', textColor: 'text-blue-400' },
  '2': { name: 'S1 Lar de Boedo', color: 'bg-purple-500/20', textColor: 'text-purple-400' },
  '3': { name: 'Casa 42', color: 'bg-green-500/20', textColor: 'text-green-400' },
  'general': { name: 'General', color: 'bg-surface-hover', textColor: 'text-text-muted' }
};

export default function CalendarView({ navigate, activeObraId }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState(23);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTime, setNewNoteTime] = useState('08:00');
  const [newNoteObra, setNewNoteObra] = useState<string>(activeObraId.toString());
  
  // Notas de prueba con Obras asignadas
  const [notes, setNotes] = useState<Record<number, Note[]>>({
    23: [
      { id: 1, text: 'Reunión con el arquitecto para revisión de planos', time: '10:30', obraId: '3' },
      { id: 2, text: 'Llegan los materiales de Acindar', time: '14:00', obraId: '1' }
    ],
    25: [
      { id: 3, text: 'Pago quincena albañiles', time: '18:00', obraId: '2' }
    ]
  });

  const days = [
    { name: 'L', date: 21 },
    { name: 'M', date: 22 },
    { name: 'M', date: 23 },
    { name: 'J', date: 24 },
    { name: 'V', date: 25 },
    { name: 'S', date: 26 },
    { name: 'D', date: 27 },
  ];

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      text: newNoteText,
      time: newNoteTime,
      obraId: newNoteObra
    };

    setNotes(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newNote].sort((a, b) => a.time.localeCompare(b.time))
    }));

    setNewNoteText('');
    setNewNoteTime('08:00');
    setNewNoteObra('general');
    setShowNewNote(false);
    
    // Test the alarm sound
    playAlarmSound();
  };

  const handleDeleteNote = (id: number) => {
    setNotes(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter(n => n.id !== id)
    }));
  };

  const currentNotes = notes[selectedDay] || [];

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
        <div className="flex-1 ml-3 text-right">
          <h1 className="text-text-main font-semibold text-sm md:text-lg truncate">Agenda y Notas</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 space-y-6">
        
        {/* Date Selector */}
        <div className="bg-surface rounded-2xl p-4 border border-surface-hover">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-main font-bold capitalize">
              {new Date(2026, 7, selectedDay).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </h2>
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex justify-between items-center">
            {days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDay(day.date)}
                className={`flex flex-col items-center justify-center w-10 h-12 rounded-xl transition-colors ${
                  selectedDay === day.date
                    ? 'bg-primary text-background'
                    : 'text-text-muted hover:bg-surface-hover'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{day.name}</span>
                <span className={`text-sm font-black ${selectedDay === day.date ? '' : (notes[day.date] ? 'text-primary' : '')}`}>
                  {day.date}
                </span>
                {notes[day.date] && notes[day.date].length > 0 && selectedDay !== day.date && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-0.5"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-text-main font-bold">
              Eventos para el {selectedDay} de Agosto
            </h3>
            <span className="text-xs bg-surface-hover text-text-muted px-2 py-1 rounded-md font-bold">
              {currentNotes.length} Notas
            </span>
          </div>

          {currentNotes.length === 0 ? (
            <div className="bg-background-alt border-2 border-dashed border-surface-hover rounded-2xl p-8 text-center flex flex-col items-center justify-center text-text-muted">
              <Bell className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No hay recordatorios para este día.</p>
              <p className="text-xs mt-1 opacity-60">Presiona el botón de abajo para agregar una nota.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentNotes.map(note => {
                const obraData = note.obraId ? OBRAS_COLORS[note.obraId] : OBRAS_COLORS['general'];
                return (
                  <div key={note.id} className="bg-surface border border-surface-hover rounded-xl p-4 flex gap-4 group transition-colors hover:border-primary/50 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${obraData?.color.replace('/20', '') || 'bg-surface-hover'}`} />
                    <div className="flex flex-col items-center justify-start pt-1 pl-1">
                      <div className={`w-10 h-10 rounded-full ${obraData?.color || 'bg-primary/10'} flex items-center justify-center`}>
                        <Clock className={`w-5 h-5 ${obraData?.textColor || 'text-primary'}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className={`font-black text-lg ${obraData?.textColor || 'text-primary'}`}>{note.time}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${obraData?.color} ${obraData?.textColor}`}>
                            {obraData?.name}
                          </span>
                          <button 
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-text-muted hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-text-main mt-1 text-sm font-medium">{note.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Floating Action Button */}
      {!showNewNote && (
        <button 
          onClick={() => setShowNewNote(true)}
          className="fixed bottom-[50px] right-6 w-14 h-14 bg-primary text-background rounded-full shadow-[0_4px_20px_rgba(255,107,0,0.4)] flex items-center justify-center hover:bg-primary-hover hover:scale-105 transition-all z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add Note Modal */}
      {showNewNote && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-surface-hover w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-10">
            <h3 className="text-lg font-bold text-text-main mb-4">Nueva Notificación</h3>
            
            <div className="space-y-4 mb-6">
              {activeObraId === 'general' ? (
                <div>
                  <label className="text-xs font-bold tracking-wider text-text-muted uppercase mb-1.5 block">Obra Asociada</label>
                  <select 
                    value={newNoteObra}
                    onChange={(e) => setNewNoteObra(e.target.value)}
                    className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary appearance-none"
                  >
                    {Object.entries(OBRAS_COLORS).map(([id, obra]) => (
                      <option key={id} value={id}>{obra.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold tracking-wider text-text-muted uppercase mb-1.5 block">Obra Asignada</label>
                  <div className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main font-bold">
                    {OBRAS_COLORS[activeObraId.toString()]?.name || 'Obra Desconocida'}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-bold tracking-wider text-text-muted uppercase mb-1.5 block">Hora de Aviso</label>
                <input 
                  type="time" 
                  value={newNoteTime}
                  onChange={(e) => setNewNoteTime(e.target.value)}
                  className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider text-text-muted uppercase mb-1.5 block">Descripción</label>
                <textarea 
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Ej: Llamar al plomero..."
                  className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowNewNote(false)}
                className="flex-1 bg-background-alt text-text-main border border-surface-hover py-3 rounded-xl font-bold text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddNote}
                className="flex-1 bg-primary text-background py-3 rounded-xl font-bold text-sm"
              >
                Guardar Alarma
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
