let audioCtx: AudioContext | null = null;

export const initAudio = () => {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx?.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    console.error("Audio no soportado:", err);
    return null;
  }
};

const playTone = (ctx: AudioContext, freq: number, type: OscillatorType, startTime: number, duration: number, vol: number = 0.2) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.value = freq;
  
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
};

export const playStartupSound = () => {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 523.25, 'sine', now, 0.4);       // Do
  playTone(ctx, 659.25, 'sine', now + 0.08, 0.4); // Mi
  playTone(ctx, 783.99, 'sine', now + 0.16, 0.8); // Sol
};

export const playNotificationSound = () => {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Doble ping suave y agudo (notificación)
  playTone(ctx, 880, 'sine', now, 0.2, 0.15);
  playTone(ctx, 1108.73, 'sine', now + 0.15, 0.4, 0.15);
};

export const playAlarmSound = () => {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Sonido tipo reloj despertador (repetitivo y penetrante)
  for (let i = 0; i < 4; i++) {
    playTone(ctx, 1000, 'square', now + (i * 0.2), 0.1, 0.1);
  }
};

export const playBeep = () => {
  const ctx = initAudio();
  if (!ctx) return;
  playTone(ctx, 880, 'sine', ctx.currentTime, 0.5, 0.2);
};

export const playSuccessSound = () => {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Arpegio corto indicando éxito o guardado correcto
  playTone(ctx, 523.25, 'sine', now, 0.1, 0.1);       // Do
  playTone(ctx, 659.25, 'sine', now + 0.1, 0.1, 0.1); // Mi
  playTone(ctx, 783.99, 'sine', now + 0.2, 0.4, 0.15);// Sol prolongado
};

export const playTickSound = () => {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  // Ruido de ruleta / clic mecánico
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, now); 
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.02); 
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.03);
};
