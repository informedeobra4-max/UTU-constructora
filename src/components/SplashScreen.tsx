import { motion } from 'motion/react';
import { useState } from 'react';
import { playStartupSound } from '../audio';
import { Screen } from '../types';
import Logo from './Logo';

interface SplashScreenProps {
  navigate: (screen: Screen) => void;
}

export default function SplashScreen({ navigate }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    if (isExiting) return;
    
    playStartupSound();

    setIsExiting(true);
    // Wait for the animation to finish before navigating
    setTimeout(() => {
      navigate('obras_list');
    }, 1100); // Wait for the huge scale animation
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-black relative overflow-hidden cursor-pointer"
      onClick={handleStart}
    >
      {/* Logo Container */}
      <motion.div
        className="z-10 flex flex-col items-center justify-center space-y-2 pointer-events-none"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={
          isExiting 
            ? { scale: 100, opacity: 0 } // Break boundaries and disappear
            : { scale: 1, opacity: 1 }
        }
        transition={{ 
          duration: isExiting ? 1.2 : 0.6, 
          ease: isExiting ? [0.6, 0.05, 0.01, 0.99] : "easeOut" 
        }}
      >
        <Logo className="w-72 md:w-96 h-auto" />
      </motion.div>
    </div>
  );
}
