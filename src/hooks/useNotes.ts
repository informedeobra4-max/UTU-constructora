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
    const { data, error } = await supabase.from('notas').select('*').order('created_at', { ascending: true });
    if (data && !error) {
      setNotes(data as Note[]);
    }
  };

  useEffect(() => {
    fetchNotes();

    // Sincronización automática cada 15 segundos
    const interval = setInterval(() => {
      fetchNotes();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const addNote = async (note: Note) => {
    // Optimistic update (usamos un ID temporal negativo)
    const tempNote = { ...note, id: -Date.now() };
    setNotes(prev => [...prev, tempNote]);

    // Omitimos el id para que Supabase genere uno nuevo auto-incremental
    const { id, ...noteData } = note;
    await supabase.from('notas').insert([noteData]);
    fetchNotes(); // Recuperamos el ID real de Supabase
  };

  const deleteNote = async (id: number) => {
    // Optimistic delete
    setNotes(prev => prev.filter(n => n.id !== id));
    if (id > 0) { // Solo borramos en DB si el ID no es temporal
      await supabase.from('notas').delete().eq('id', id);
      fetchNotes();
    }
  };

  const markNoteAsRung = async (id: number) => {
    // Optimistic update
    setNotes(prev => prev.map(n => n.id === id ? { ...n, hasRung: true } : n));
    if (id > 0) {
      await supabase.from('notas').update({ hasRung: true }).eq('id', id);
    }
  };

  // Mantengo la firma saveNotes por si se usaba, aunque ya no guarde el array entero
  const saveNotes = () => {
    fetchNotes();
  };

  return { notes, saveNotes, addNote, deleteNote, markNoteAsRung };
}
