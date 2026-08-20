import React from 'react';
import { ArrowLeft, Bell, Calendar as CalendarIcon, Clock, Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { playAlarmSound } from '../audio';
import { Screen } from '../types';
import Logo from './Logo';
import { useNotes, Note } from '../hooks/useNotes';
import { supabase } from '../lib/supabaseClient';

interface CalendarViewProps {
  navigate: (screen: Screen) => void;
  activeObraId: number | 'general';
}

const COLOR_PALETTE = [
  { bg: 'bg-blue-500/20', text: 'text-blue-400', hex: 'bg-blue-500' },
  { bg: 'bg-purple-500/20', text: 'text-purple-400', hex: 'bg-purple-500' },
  { bg: 'bg-green-500/20', text: 'text-green-400', hex: 'bg-green-500' },
  { bg: 'bg-pink-500/20', text: 'text-pink-400', hex: 'bg-pink-500' },
  { bg: 'bg-yellow-500/20', text: 'text-yellow-400', hex: 'bg-yellow-500' },
  { bg: 'bg-cyan-500/20', text: 'text-cyan-400', hex: 'bg-cyan-500' },
];

export default function CalendarView({ navigate, activeObraId }: CalendarViewProps) {
  const { notes, addNote, deleteNote } = useNotes();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [obras, setObras] = useState<any[]>([]);
  const [obrasMap, setObrasMap] = useState<Record<string, any>>({
    'general': { name: 'General', color: 'bg-surface-hover', textColor: 'text-text-muted', hex: 'bg-gray-500' }
  });
  
  useEffect(() => {
    const fetchObras = async () => {
      const { data } = await supabase.from('obras').select('*').order('id', { ascending: true });
      if (data) {
        setObras(data);
        const map: Record<string, any> = {
          'general': { name: 'General', color: 'bg-surface-hover', textColor: 'text-text-muted', hex: 'bg-gray-500' }
        };
        data.forEach((o, idx) => {
          const palette = COLOR_PALETTE[idx % COLOR_PALETTE.length];
          map[o.id.toString()] = {
            name: o.name,
            color: palette.bg,
            textColor: palette.text,
            hex: palette.hex
          };
        });
        setObrasMap(map);
      }
    };
    fetchObras();
  }, []);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteTime, setNoteTime] = useState('08:00');
  const [noteDate, setNoteDate] = useState(selectedDate);
  const [noteObra, setNoteObra] = useState<string>(activeObraId.toString());

  const openNewNote = () => {
    setEditingNoteId(null);
    setNoteText('');
    setNoteTime('08:00');
    setNoteDate(selectedDate);
    setNoteObra(activeObraId.toString());
    setShowModal(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteText(note.text);
    setNoteTime(note.time);
    setNoteDate(note.date);
    setNoteObra(note.obraId || 'general');
    setShowModal(true);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;

    if (editingNoteId) {
       deleteNote(editingNoteId);
    }
    
    addNote({
      id: Date.now(),
      text: noteText,
      time: noteTime,
      date: noteDate,
      obraId: noteObra
    });

    setShowModal(false);
    setSelectedDate(noteDate);
    playAlarmSound();
  };

  const currentNotes = useMemo(() => {
    return notes
      .filter(n => n.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [notes, selectedDate]);

  // Calendar logic
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const monthGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startingDay = firstDay.getDay() - 1; // 0=Mon, 6=Sun
    if (startingDay === -1) startingDay = 6;
    
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) {
       const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
       days.push(dateStr);
    }
    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-surface">
        <div className="flex items-center gap-3">
          <Logo onClick={() => navigate('splash')} />
          <button onClick={() => navigate('obras_list')} className="p-1 text-text-muted hover:text-text-main rounded-full bg-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 ml-3 text-right">
          <h1 className="text-text-main font-semibold text-sm md:text-lg truncate">Agenda Mensual</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6">
        
        {/* Full Month Calendar */}
        <div className="bg-surface rounded-3xl p-4 border border-surface-hover shadow-lg">
          <div className="flex items-center justify-between mb-6 px-2">
            <button onClick={prevMonth} className="p-2 bg-background-alt rounded-full text-text-muted hover:text-primary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-text-main capitalize tracking-wide">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 bg-background-alt rounded-full text-text-muted hover:text-primary transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-[10px] font-black tracking-widest text-text-muted mb-2 uppercase">{d}</div>
            ))}
            
            {monthGrid.map((dateStr, idx) => {
              if (!dateStr) return <div key={idx} className="h-10"></div>;
              const isSelected = dateStr === selectedDate;
              const dayNum = parseInt(dateStr.split('-')[2]);
              const dayNotes = notes.filter(n => n.date === dateStr);
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative h-10 w-10 mx-auto rounded-full flex flex-col items-center justify-center transition-all ${
                    isSelected ? 'bg-primary text-background font-black scale-110 shadow-lg shadow-primary/40' : 'text-text-main font-bold hover:bg-surface-hover'
                  }`}
                >
                  <span className="z-10">{dayNum}</span>
                  
                  {/* Dots Container */}
                  <div className="absolute bottom-1.5 flex gap-0.5 z-20">
                    {dayNotes.slice(0, 3).map((n, i) => {
                      const color = obrasMap[n.obraId || 'general']?.hex || 'bg-green-500';
                      return (
                        <div key={i} className={`w-1 h-1 rounded-full ${color} ${isSelected ? 'border border-background' : ''}`}></div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes List for Selected Date */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-text-main font-bold text-lg">
              Eventos del <span className="text-primary">{selectedDate.split('-').reverse().join('/')}</span>
            </h3>
            <span className="text-xs bg-surface-hover text-text-muted px-2 py-1 rounded-md font-bold">
              {currentNotes.length} Notas
            </span>
          </div>

          {currentNotes.length === 0 ? (
            <div className="bg-background-alt border-2 border-dashed border-surface-hover rounded-3xl p-8 text-center flex flex-col items-center justify-center text-text-muted">
              <Bell className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No hay recordatorios para este día.</p>
              <p className="text-xs mt-1 opacity-60">Presiona el botón de abajo para agregar una nota.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentNotes.map(note => {
                const obraData = obrasMap[note.obraId || 'general'] || obrasMap['general'];
                return (
                  <div key={note.id} className="bg-surface border border-surface-hover rounded-2xl p-4 flex gap-4 group transition-colors hover:border-primary/50 relative overflow-hidden shadow-sm">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${obraData.hex}`} />
                    <div className="flex flex-col items-center justify-start pt-1 pl-1">
                      <div className={`w-10 h-10 rounded-full ${obraData.color} flex items-center justify-center`}>
                        <Clock className={`w-5 h-5 ${obraData.textColor}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className={`font-black text-lg ${obraData.textColor}`}>{note.time}</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${obraData.color} ${obraData.textColor} mr-1`}>
                            {obraData.name}
                          </span>
                          <button 
                            onClick={() => openEditNote(note)}
                            className="text-text-muted hover:text-primary transition-colors p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteNote(note.id)}
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
      {!showModal && (
        <button 
          onClick={openNewNote}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-background rounded-full shadow-[0_4px_20px_rgba(255,107,0,0.4)] flex items-center justify-center hover:bg-primary-hover hover:scale-105 transition-all z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add/Edit Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-surface-hover w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-10">
            <h3 className="text-lg font-bold text-text-main mb-4">
              {editingNoteId ? 'Editar Alarma' : 'Nueva Alarma'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold tracking-wider text-text-muted uppercase mb-1.5 block">Obra Asociada</label>
                <select 
                  value={noteObra}
                  onChange={(e) => setNoteObra(e.target.value)}
                  className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary appearance-none font-bold"
                >
                  {Object.entries(obrasMap).map(([id, obra]) => (
                    <option key={id} value={id}>{(obra as any).name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold tracking-wider text-text-muted uppercase mb-1.5 block">Día y Mes</label>
                  <input 
                    type="date" 
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary font-bold"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold tracking-wider text-text-muted uppercase mb-1.5 block">Hora</label>
                  <input 
                    type="time" 
                    value={noteTime}
                    onChange={(e) => setNoteTime(e.target.value)}
                    className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider text-text-muted uppercase mb-1.5 block">Descripción</label>
                <textarea 
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Ej: Llamar al plomero..."
                  className="w-full bg-background-alt border border-surface-hover rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-background-alt text-text-main border border-surface-hover py-3 rounded-xl font-bold text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveNote}
                className="flex-1 bg-primary text-background py-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(255,107,0,0.3)]"
              >
                {editingNoteId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
