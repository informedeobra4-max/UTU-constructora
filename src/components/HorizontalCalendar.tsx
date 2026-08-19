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
  const todayStr = new Date().toISOString().split('T')[0];

  const actualSelectedDate = selectedDate || todayStr;

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newDays = [];
    // Generate 15 days in the past and 30 days in the future
    for (let i = -15; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
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
    <div className="bg-surface rounded-2xl p-3 border border-surface-hover">
      {showTitle && (
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-text-main font-bold capitalize">
            {new Date(actualSelectedDate + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </h2>
          <Calendar className="w-5 h-5 text-primary" />
        </div>
      )}
      
      <div className="flex items-center relative">
        <div className="relative flex-1 flex items-center overflow-hidden">
          {/* Lupa (Magnifying Glass Overlay) */}
          <div className="absolute top-1 bottom-1 left-1/2 -translate-x-1/2 w-14 rounded-[14px] border border-primary/50 bg-primary/10 backdrop-blur-[1px] pointer-events-none z-20 shadow-[0_0_15px_rgba(255,107,0,0.15)] flex flex-col justify-between items-center py-1.5">
            <div className="w-4 h-0.5 bg-primary/40 rounded-full"></div>
            <div className="w-4 h-0.5 bg-primary/40 rounded-full"></div>
          </div>

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            onTouchStart={() => initAudio()}
            className="flex flex-1 items-center overflow-x-auto hide-scrollbar snap-x snap-mandatory px-[calc(50%-28px)] gap-2 py-2"
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
                className={`snap-center flex-shrink-0 flex flex-col items-center justify-center w-14 h-[60px] rounded-xl transition-all duration-200 relative ${
                  day.isToday && !day.isSelected ? 'border border-primary bg-primary/10' : ''
                } ${
                  day.isSelected 
                    ? 'bg-primary text-background shadow-md' 
                    : 'text-text-muted hover:bg-surface-hover hover:text-text-main'
                } ${isCenter ? 'scale-110 z-10 font-black' : 'scale-90 opacity-70'}`}
              >
                <span className="text-[10px] font-bold uppercase mb-0.5">{dayName}</span>
                <span className={`font-black ${isCenter ? 'text-xl' : 'text-sm'}`}>
                  {dayNum}
                </span>
                
                {/* Dot for notes */}
                {day.hasNote && !day.isSelected && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_5px_rgba(255,107,0,0.5)]"></div>
                )}
                {day.hasNote && day.isSelected && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 bg-background rounded-full"></div>
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
