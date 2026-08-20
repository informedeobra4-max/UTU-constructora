import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Note {
  id: number;
  text: string;
  time: string;
  date: string; // YYYY-MM-DD
  obraId?: string;
  hasRung?: boolean;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  const fetchNotes = async () => {
    const { data, error } = await supabase.from('notificaciones').select('*').order('id', { ascending: false });
    if (data && !error) {
      const parsedNotes = data.map((n: any) => {
        let dateStr = '';
        let timeStr = n.time;
        try {
          const parsed = JSON.parse(n.time);
          if (parsed.type === 'alarm') {
            dateStr = parsed.date;
            timeStr = parsed.time;
          }
        } catch(e) {
          // ignore
        }
        return {
          id: n.id,
          text: n.message,
          time: timeStr,
          date: dateStr,
          obraId: n.obraId,
          hasRung: !n.isNew
        };
      }).filter(n => n.date !== '');
      setNotes(parsedNotes);
    }
  };

  useEffect(() => {
    fetchNotes();

    const interval = setInterval(() => {
      fetchNotes();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const addNote = async (note: Note) => {
    const newNotif = {
      obraId: note.obraId || 'general',
      obraName: 'Alarma/Nota',
      message: note.text,
      time: JSON.stringify({ type: 'alarm', date: note.date, time: note.time }),
      isNew: true
    };
    
    await supabase.from('notificaciones').insert([newNotif]);
    fetchNotes(); 
  };

  const deleteNote = async (id: number) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (id > 0) {
      await supabase.from('notificaciones').delete().eq('id', id);
      fetchNotes();
    }
  };

  const markNoteAsRung = async (id: number) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, hasRung: true } : n));
    if (id > 0) {
      await supabase.from('notificaciones').update({ isNew: false }).eq('id', id);
    }
  };

  // Mantengo la firma saveNotes por si se usaba, aunque ya no guarde el array entero
  const saveNotes = () => {
    fetchNotes();
  };

  return { notes, saveNotes, addNote, deleteNote, markNoteAsRung };
}
