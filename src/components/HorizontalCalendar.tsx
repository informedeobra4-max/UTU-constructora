import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { initAudio, playTickSound } from '../audio';

interface HorizontalCalendarProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
  activeObraId?: number | 'general';
  showTitle?: boolean;
}

export default function HorizontalCalendar({ 
  onDateSelect, 
  selectedDate, 
  activeObraId = 'general',
  showTitle = false 
}: HorizontalCalendarProps) {
  const { notes } = useNotes();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIndexRef = useRef<number>(-1);
  const [centerIndex, setCenterIndex] = useState(-1);
  
  const [days, setDays] = useState<{ date: Date; isToday: boolean; isSelected: boolean; dateStr: string; hasNote: boolean }[]>([]);
  const getLocalDateStr = (d?: Date) => {
    const date = d || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateStr();

  const actualSelectedDate = selectedDate || todayStr;

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newDays = [];
    // Generate 15 days in the past and 30 days in the future
    for (let i = -15; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = getLocalDateStr(d);
      
      const hasNote = notes.some(n => 
        n.date === dateStr && 
        (activeObraId === 'general' || n.obraId === activeObraId.toString())
      );

      newDays.push({
        date: d,
        isToday: dateStr === todayStr,
        isSelected: dateStr === actualSelectedDate,
        dateStr,
        hasNote
      });
    }
    setDays(newDays);
  }, [notes, activeObraId, actualSelectedDate]);

  // Center the selected date on load
  useEffect(() => {
    if (scrollRef.current && days.length > 0) {
      const selectedIndex = days.findIndex(d => d.dateStr === actualSelectedDate);
      if (selectedIndex !== -1) {
        setCenterIndex(selectedIndex);
        const timer = setTimeout(() => {
          const container = scrollRef.current;
          if (!container) return;
          const targetElement = container.children[selectedIndex] as HTMLElement;
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
          lastIndexRef.current = selectedIndex;
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [actualSelectedDate, days.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const viewportCenter = container.scrollLeft + container.clientWidth / 2;
    
    let minDistance = Infinity;
    let closestIndex = -1;

    Array.from(container.children).forEach((child, idx) => {
      const htmlChild = child as HTMLElement;
      const childCenter = htmlChild.offsetLeft + htmlChild.offsetWidth / 2;
      const distance = Math.abs(childCenter - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== -1 && lastIndexRef.current !== closestIndex) {
      if (lastIndexRef.current !== -1) {
        playTickSound();
      }
      lastIndexRef.current = closestIndex;
      setCenterIndex(closestIndex);
    }
  };

  return (
    <div className="w-full relative py-2">
      {showTitle && (
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-text-main font-bold capitalize">
            {new Date(actualSelectedDate + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
      )}
      
      {/* Fondo fino (más bajo que la lupa) */}
      <div className="absolute top-1/2 left-0 w-full h-[50px] -translate-y-1/2 bg-surface border border-surface-hover rounded-2xl pointer-events-none z-0"></div>

      <div className="flex items-center relative z-10 w-full min-w-0">
        <div className="relative flex-1 flex items-center w-full min-w-0">
          {/* Lupa Redonda Nítida */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68px] h-[68px] rounded-full border-[3px] border-white/20 bg-background pointer-events-none z-20 shadow-[0_4px_25px_rgba(255,107,0,0.15),inset_0_4px_10px_rgba(255,255,255,0.2)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white/5"></div>
          </div>

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            onTouchStart={() => initAudio()}
            className="flex flex-1 items-center overflow-x-auto overflow-y-visible hide-scrollbar snap-x snap-mandatory px-[calc(50%-34px)] gap-2 py-4 relative z-30 w-full min-w-0"
            style={{ scrollBehavior: 'smooth' }}
          >
          {days.map((day, idx) => {
            const dayName = day.date.toLocaleDateString('es-AR', { weekday: 'short' }).charAt(0);
            const dayNum = day.date.getDate();
            const isCenter = centerIndex === idx;
            
            return (
              <button
                key={day.dateStr}
                onClick={() => onDateSelect?.(day.dateStr)}
                className={`snap-center flex-shrink-0 flex flex-col items-center justify-center w-[68px] h-[68px] rounded-full transition-all duration-300 relative ${
                  day.isToday ? 'text-primary' : 'text-text-muted hover:text-text-main'
                } ${isCenter ? 'scale-[1.3] z-10 text-primary drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]' : 'scale-90 opacity-60'}`}
              >
                <span className={`text-[10px] font-bold uppercase mb-0.5 ${isCenter ? 'text-primary' : ''}`}>{dayName}</span>
                <span className={`font-black ${isCenter ? 'text-2xl' : 'text-sm'}`}>
                  {dayNum}
                </span>
                
                {/* Dot for notes */}
                {day.hasNote && (
                  <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
