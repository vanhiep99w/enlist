import { type ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface Props {
  children: ReactNode;
  trigger: ReactNode;
}

export function SentenceTooltip({ children, trigger }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        sideOffset={8}
        className="border-primary/20 bg-card/95 w-80 px-4 py-3 shadow-xl backdrop-blur-xl"
        style={{ maxWidth: 'calc(100vw - 32px)' }}
      >
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
