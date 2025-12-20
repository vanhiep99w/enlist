import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  minRows?: number;
  maxRows?: number;
  id?: string;
  showCharCount?: boolean;
  optimalRange?: { min: number; max: number };
}

export interface AutoResizeTextareaRef {
  focus: () => void;
}

export const AutoResizeTextarea = forwardRef<AutoResizeTextareaRef, AutoResizeTextareaProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      placeholder,
      disabled = false,
      minRows = 3,
      maxRows = 8,
      id,
      showCharCount = true,
      optimalRange = { min: 40, max: 200 },
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
    }));

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = 'auto';

      const lineHeight = 24;
      const paddingY = 24;
      const minHeight = lineHeight * minRows + paddingY;
      const maxHeight = lineHeight * maxRows + paddingY;

      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;
    }, [minRows, maxRows]);

    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const resizeObserver = new ResizeObserver(() => {
        adjustHeight();
      });

      resizeObserver.observe(textarea);
      return () => resizeObserver.disconnect();
    }, [adjustHeight]);

    const charCount = value.length;
    const isInOptimalRange = charCount >= optimalRange.min && charCount <= optimalRange.max;
    const isNearOptimal = charCount >= optimalRange.min * 0.6 && charCount < optimalRange.min;
    const isOverOptimal = charCount > optimalRange.max;

    const getProgressColorClass = () => {
      if (charCount === 0) return 'bg-muted';
      if (isOverOptimal) return 'bg-amber-500';
      if (isInOptimalRange) return 'bg-emerald-500';
      if (isNearOptimal) return 'bg-primary';
      return 'bg-muted';
    };

    const getProgressWidth = () => {
      if (charCount === 0) return 0;
      return Math.min((charCount / optimalRange.max) * 100, 100);
    };

    const getCounterColorClass = () => {
      if (charCount === 0) return 'text-muted-foreground';
      if (isOverOptimal) return 'text-amber-400';
      if (isInOptimalRange) return 'text-emerald-400';
      if (isNearOptimal) return 'text-primary';
      return 'text-muted-foreground';
    };

    const getHintText = () => {
      if (charCount === 0) return null;
      if (isOverOptimal) return 'Getting long';
      if (isInOptimalRange) return 'Good length';
      if (isNearOptimal) return 'Almost there';
      return null;
    };

    return (
      <div className="group relative">
        <Textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'resize-none overflow-hidden rounded-b-none backdrop-blur-sm transition-all duration-200',
            showCharCount ? 'border-b-0' : ''
          )}
          style={{
            minHeight: `${24 * minRows + 24}px`,
          }}
        />

        {showCharCount && (
          <div
            className={cn(
              'bg-card/50 border-border flex items-center justify-between rounded-b-lg border border-t-0 px-4 py-2 backdrop-blur-sm transition-all duration-300',
              disabled && 'opacity-50'
            )}
          >
            <div className="flex flex-1 items-center gap-3">
              <div className="bg-muted h-1 max-w-32 flex-1 overflow-hidden rounded-full">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500 ease-out',
                    getProgressColorClass()
                  )}
                  style={{ width: `${getProgressWidth()}%` }}
                />
              </div>

              {getHintText() && (
                <span
                  className={cn(
                    'animate-in fade-in slide-in-from-left-2 text-xs font-medium tracking-wide uppercase transition-all duration-300',
                    getCounterColorClass()
                  )}
                >
                  {getHintText()}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'font-mono text-sm font-medium tabular-nums transition-colors duration-300',
                  getCounterColorClass()
                )}
              >
                {charCount}
              </span>
              <span className="text-muted-foreground text-xs font-medium">/</span>
              <span className="text-muted-foreground font-mono text-xs tabular-nums">
                {optimalRange.max}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
