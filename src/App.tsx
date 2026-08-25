/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { playNotificationSound } from './audio';
import CalendarView from './components/CalendarView';
import ComprasForm from './components/ComprasForm';
import Dashboard from './components/Dashboard';
import GastosView from './components/GastosView';
import Login from './components/Login';
import ManoObraForm from './components/ManoObraForm';
import VariosForm from './components/VariosForm';
import Notifications from './components/Notifications';
import ObrasList from './components/ObrasList';
import PagosView from './components/PagosView';
import PresupuestosView from './components/PresupuestosView';
import PresupuestosForm from './components/PresupuestosForm';
import IngresosView from './components/IngresosView';
import IngresosForm from './components/IngresosForm';
import InfoObraView from './components/InfoObraView';
import ArchivosCategoriaView from './components/ArchivosCategoriaView';
import ArchivoForm from './components/ArchivoForm';
import SplashScreen from './components/SplashScreen';
import PWAInstallButton from './components/PWAInstallButton';
import GastoEditForm from './components/GastoEditForm';
import Settings from './components/Settings';
import HistoriaUtuView from './components/HistoriaUtuView';
import { Screen } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [history, setHistory] = useState<Screen[]>(['splash']);
  const [activeObraId, setActiveObraId] = useState<number | 'general'>('general');
  const [editingGastoId, setEditingGastoId] = useState<string | null>(null);
  const [editingPresupuestoId, setEditingPresupuestoId] = useState<number | null>(null);
  const [categoriaArchivos, setCategoriaArchivos] = useState<string>('PLANOS');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  useEffect(() => {
    const isAlwaysDarkScreen = currentScreen === 'splash' || currentScreen === 'login';
    if (theme === 'light' && !isAlwaysDarkScreen) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme, currentScreen]);

  useEffect(() => {
    const runOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "9b92265d-0524-450b-98c4-679b5d57d0f6",
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: 'sw.js',
          serviceWorkerParam: { scope: '/' }
        });
        
        // Listen for foreground push notifications and play sound
        if (OneSignal.Notifications && OneSignal.Notifications.addEventListener) {
          OneSignal.Notifications.addEventListener('foregroundWillDisplay', () => {
            playNotificationSound();
          });
        }

        OneSignal.Slidedown.promptPush();
      } catch (e) {
        console.error("OneSignal init error:", e);
      }
    };
    runOneSignal();
  }, []);

  const navigate = (screen: Screen) => {
    if (screen === 'back') {
      if (history.length > 1) {
        const newHistory = [...history];
        newHistory.pop(); // remove current screen
        const prevScreen = newHistory[newHistory.length - 1];
        setHistory(newHistory);
        setCurrentScreen(prevScreen);
        window.scrollTo(0, 0);
      } else {
        // Fallback if no history
        setCurrentScreen('obras_list');
        setHistory(['obras_list']);
        window.scrollTo(0, 0);
      }
      return;
    }
    
    // Prevent adding the same screen twice in a row
    if (history[history.length - 1] !== screen) {
      setHistory(prev => [...prev, screen]);
    }
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

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
      {currentScreen === 'gastos' && <GastosView navigate={navigate} activeObraId={activeObraId} setEditingGastoId={setEditingGastoId} />}
      {currentScreen === 'pagos_view' && <PagosView navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'gasto_edit' && <GastoEditForm navigate={navigate} activeObraId={activeObraId} editingGastoId={editingGastoId} />}
      {currentScreen === 'presupuestos_view' && <PresupuestosView navigate={navigate} activeObraId={activeObraId} setEditingPresupuestoId={setEditingPresupuestoId} />}
      {currentScreen === 'presupuestos_form' && <PresupuestosForm navigate={navigate} activeObraId={activeObraId} editingPresupuestoId={editingPresupuestoId} setEditingPresupuestoId={setEditingPresupuestoId} />}
      {currentScreen === 'ingresos_view' && <IngresosView navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'ingresos_form' && <IngresosForm navigate={navigate} activeObraId={activeObraId} defaultCurrency="ARS" />}
      {currentScreen === 'ingresos_form_usd' && <IngresosForm navigate={navigate} activeObraId={activeObraId} defaultCurrency="USD" />}
      {currentScreen === 'info_obra' && <InfoObraView navigate={navigate} activeObraId={activeObraId} setCategoriaArchivos={setCategoriaArchivos} />}
      {currentScreen === 'archivos_categoria' && <ArchivosCategoriaView navigate={navigate} activeObraId={activeObraId} categoria={categoriaArchivos} />}
      {currentScreen === 'archivo_form' && <ArchivoForm navigate={navigate} activeObraId={activeObraId} categoria={categoriaArchivos} />}
      {currentScreen === 'settings' && <Settings navigate={navigate} />}
      {currentScreen === 'historia_utu' && <HistoriaUtuView navigate={navigate} />}
      
      
      {currentScreen !== 'splash' && (
        <div className="fixed bottom-0 left-0 w-full py-1.5 bg-background border-t border-surface z-[100] text-center no-print flex items-center justify-center">
          <p className="text-[10px] text-text-muted/60 font-medium tracking-widest uppercase">
            (App creada por Arq. Venier Gaston)
          </p>
        </div>
      )}

      {/* Globito Flotante PWA - Siempre disponible hasta instalar o cerrar */}
      <PWAInstallButton />
    </div>
  );
}

