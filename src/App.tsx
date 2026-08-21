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
import { Screen } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [activeObraId, setActiveObraId] = useState<number | 'general'>('general');
  const [categoriaArchivos, setCategoriaArchivos] = useState<string>('PLANOS');

  const navigate = (screen: Screen) => {
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
      {currentScreen === 'gastos' && <GastosView navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'pagos_view' && <PagosView navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'presupuestos_view' && <PresupuestosView navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'presupuestos_form' && <PresupuestosForm navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'ingresos_view' && <IngresosView navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'ingresos_form' && <IngresosForm navigate={navigate} activeObraId={activeObraId} />}
      {currentScreen === 'info_obra' && <InfoObraView navigate={navigate} activeObraId={activeObraId} setCategoriaArchivos={setCategoriaArchivos} />}
      {currentScreen === 'archivos_categoria' && <ArchivosCategoriaView navigate={navigate} activeObraId={activeObraId} categoria={categoriaArchivos} />}
      {currentScreen === 'archivo_form' && <ArchivoForm navigate={navigate} activeObraId={activeObraId} categoria={categoriaArchivos} />}
      
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

