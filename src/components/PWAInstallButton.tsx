import { Download, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isAppInstalled);

    if (isAppInstalled) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowTooltip(true);
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
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-[40px] right-4 z-[110] flex flex-col items-end gap-2 pointer-events-auto"
      >
        {showTooltip && isIOS && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface/95 backdrop-blur-md border border-surface-hover p-4 rounded-2xl shadow-xl w-64 relative"
          >
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-text-muted hover:text-text-main"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-sm font-bold text-text-main mb-2">Instalar en iPhone</h4>
            <p className="text-xs text-text-muted">
              1. Toca el botón <strong>Compartir</strong> en la barra de Safari.<br/>
              2. Elige <strong>"Agregar a Inicio"</strong>.
            </p>
          </motion.div>
        )}

        <div className="relative group">
          <button 
            onClick={handleInstallClick}
            className="w-14 h-14 bg-primary text-background rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:scale-105 transition-transform"
          >
            <Download className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setIsDismissed(true)}
            className="absolute -top-1 -right-1 w-5 h-5 bg-background border border-surface text-text-muted hover:text-text-main rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
