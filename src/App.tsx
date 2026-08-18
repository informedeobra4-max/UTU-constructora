/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import CalendarView from './components/CalendarView';
import ComprasForm from './components/ComprasForm';
import Dashboard from './components/Dashboard';
import GastosView from './components/GastosView';
import Login from './components/Login';
import ManoObraForm from './components/ManoObraForm';
import Notifications from './components/Notifications';
import ObrasList from './components/ObrasList';
import SplashScreen from './components/SplashScreen';
import { Screen } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  return (
    <div className="font-sans antialiased text-text-main bg-background min-h-screen relative pb-6">
      {currentScreen === 'splash' && <SplashScreen navigate={navigate} />}
      {currentScreen === 'login' && <Login navigate={navigate} />}
      {currentScreen === 'obras_list' && <ObrasList navigate={navigate} />}
      {currentScreen === 'dashboard' && <Dashboard navigate={navigate} />}
      {currentScreen === 'calendar' && <CalendarView navigate={navigate} />}
      {currentScreen === 'notifications' && <Notifications navigate={navigate} />}
      {currentScreen === 'compras' && <ComprasForm navigate={navigate} />}
      {currentScreen === 'mano_obra' && <ManoObraForm navigate={navigate} />}
      {currentScreen === 'gastos' && <GastosView navigate={navigate} />}
      
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

