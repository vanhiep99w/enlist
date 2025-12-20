import { useState, type ReactNode } from 'react';

interface Props {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ content, children, position = 'top' }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`
            absolute z-50 px-3.5 py-2.5 text-sm 
            backdrop-blur-xl 
            border border-[var(--color-border)]/50 
            text-white rounded-xl 
            shadow-xl shadow-black/30
            ring-1 ring-white/5
            whitespace-nowrap 
            animate-in fade-in zoom-in-95 duration-150
            ${
              position === 'top'
                ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                : 'top-full left-1/2 -translate-x-1/2 mt-2'
            }
          `}
          style={{ backgroundColor: 'rgba(var(--color-surface-dark-rgb, 17, 24, 39), 0.9)' }}
        >
          {content}
          <div
            className={`
              absolute left-1/2 -translate-x-1/2 
              border-[6px] border-transparent 
              ${
                position === 'top'
                  ? 'top-full border-t-[var(--color-surface-dark)]'
                  : 'bottom-full border-b-[var(--color-surface-dark)]'
              }
            `}
          />
        </div>
      )}
    </div>
  );
}
