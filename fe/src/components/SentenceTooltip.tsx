import { useRef, useEffect, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function SentenceTooltip({ children }: Props) {
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<'left' | 'right'>('left');

  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      if (rect.right > viewportWidth - 16) {
        setPosition('right');
      } else if (rect.left < 16) {
        setPosition('left');
      }
    }
  }, []);

  return (
    <span
      ref={tooltipRef}
      className={`absolute bottom-full z-50 mb-2 w-80 rounded-lg border px-4 py-3 text-sm whitespace-normal shadow-xl backdrop-blur-xl ${
        position === 'right' ? 'right-0' : 'left-0'
      } bg-card/95 text-foreground border-primary/20 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200`}
    >
      {children}
    </span>
  );
}
