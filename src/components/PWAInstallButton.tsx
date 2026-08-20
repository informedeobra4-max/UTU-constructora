import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isAppInstalled);

    if (isAppInstalled) return;

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Android/PC installation prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (isStandalone || isDismissed || (!deferredPrompt && !isIOS)) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
      >
        <div className="bg-surface/90 backdrop-blur-xl border border-primary/30 p-4 rounded-2xl shadow-[0_10px_40px_rgba(255,107,0,0.3)] flex flex-col gap-3">
          
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="text-text-main font-bold text-sm">Instalar UTU App</h4>
              <p className="text-text-muted text-xs mt-0.5">Accede más rápido y sin conexión desde tu inicio.</p>
            </div>
            <button 
              onClick={() => setIsDismissed(true)}
              className="text-text-muted hover:text-text-main p-1 bg-background rounded-full"
            >
              ✕
            </button>
          </div>

          <button 
            onClick={handleInstallClick}
            className="w-full bg-primary text-background font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md"
          >
            <Download className="w-5 h-5" />
            Descargar App
          </button>

          {showIOSPrompt && isIOS && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="text-xs text-text-muted bg-background/50 p-3 rounded-lg border border-surface-hover mt-1"
            >
              Para instalar en iPhone/iPad: 
              <br/>1. Toca el ícono de <strong>Compartir</strong> en Safari (el cuadrado con la flecha arriba).
              <br/>2. Desliza hacia abajo y selecciona <strong>"Agregar a Inicio"</strong>.
            </motion.div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
