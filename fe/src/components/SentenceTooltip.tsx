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
      className={`absolute bottom-full mb-2 px-3 py-2 text-sm rounded-lg z-50 border w-80 whitespace-normal shadow-xl ${
        position === 'right' ? 'right-0' : 'left-0'
      }`}
      style={{ 
        backgroundColor: 'var(--color-surface)', 
        color: 'var(--color-text-secondary)', 
        borderColor: 'var(--color-border)' 
      }}
    >
      {children}
    </span>
  );
}
