/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useNotes } from './hooks/useNotes';
import { playAlarmSound, initAudio } from './audio';
import CalendarView from './components/CalendarView';
import ComprasForm from './components/ComprasForm';
import Dashboard from './components/Dashboard';
import GastosView from './components/GastosView';
import Login from './components/Login';
import ManoObraForm from './components/ManoObraForm';
import VariosForm from './components/VariosForm';
import Notifications from './components/Notifications';
import ObrasList from './components/ObrasList';
import SplashScreen from './components/SplashScreen';
import { Screen } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [activeObraId, setActiveObraId] = useState<number | 'general'>('general');

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const { notes, markNoteAsRung } = useNotes();

  useEffect(() => {
    // FORCE CACHE CLEAR FOR MIGRATION
    const version = localStorage.getItem('app_version');
    if (version !== 'v2.1') {
      localStorage.removeItem('obras_list');
      localStorage.removeItem('utu_notes');
      localStorage.setItem('app_version', 'v2.1');
      window.location.reload(); // Force a hard reload
    }
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      initAudio();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      const currentDate = now.toISOString().split('T')[0];

      notes.forEach(note => {
        if (!note.hasRung && note.date === currentDate && note.time === currentTime) {
          playAlarmSound();
          alert(`¡Alarma! ${note.text}`);
          markNoteAsRung(note.id);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [notes, markNoteAsRung]);

  return (
    <div className="font-sans antialiased text-text-main bg-background min-h-screen relative pb-6">
      {currentScreen === 'splash' && <SplashScreen navigate={navigate} />}
      {currentScreen === 'login' && <Login navigate={navigate} />}
      {currentScreen === 'obras_list' && <ObrasList navigate={navigate} setActiveObraId={setActiveObraId} />}
      {currentScreen === 'dashboard' && <Dashboard navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'calendar' && <CalendarView navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'notifications' && <Notifications navigate={navigate} />}
      {currentScreen === 'compras' && <ComprasForm navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'mano_obra' && <ManoObraForm navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'varios' && <VariosForm navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'gastos' && <GastosView navigate={navigate} activeObraId={activeObraId} />}
      
      {currentScreen !== 'splash' && (
        <div className="fixed bottom-0 left-0 w-full py-1.5 bg-background border-t border-surface z-[100] text-center no-print flex items-center justify-center">
          <p className="text-[10px] text-text-muted/60 font-medium tracking-widest uppercase">
            (App creada por Arq. Venier Gaston)
          </p>
        </div>
      )}
    </div>
  );
}

