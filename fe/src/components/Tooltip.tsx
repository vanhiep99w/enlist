import { type ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface Props {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function TooltipWrapper({ content, children, position = 'top' }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">{children}</div>
        </TooltipTrigger>
        <TooltipContent
          side={position}
          className="bg-card/95 border-primary/20 text-foreground shadow-2xl backdrop-blur-xl"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Keep original export name for backwards compatibility
export { TooltipWrapper as Tooltip };
