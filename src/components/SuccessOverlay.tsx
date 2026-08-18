import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { useEffect } from 'react';
import { playSuccessSound } from '../audio';

interface SuccessOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function SuccessOverlay({ isVisible, onComplete }: SuccessOverlayProps) {
  useEffect(() => {
    if (isVisible) {
      // 1. Reproducir sonido de éxito
      playSuccessSound();
      
      // 2. Hacer vibrar el dispositivo (si está soportado).
      // Nota: No requiere de un permiso explícito previo tipo "requestPermission", 
      // la API lo habilita automáticamente tras la interacción del usuario.
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // Vibración: 100ms vibra, 50ms pausa, 100ms vibra
      }
      
      // 3. Temporizador para ocultar y ejecutar acción final
      const timer = setTimeout(() => {
        onComplete();
      }, 1800);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Círculo verde translúcido que se expande hacia fuera de los límites */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 25, opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-24 h-24 bg-green-400 rounded-full"
          />
          
          {/* Tilde Negra que entra con animación tipo resorte (rebote) */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 10,
              delay: 0.1
            }}
            className="relative z-10 p-6"
          >
            <Check className="w-24 h-24 text-black" strokeWidth={3} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
