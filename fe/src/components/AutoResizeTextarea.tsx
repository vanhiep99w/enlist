import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

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

    const getProgressColor = () => {
      if (charCount === 0) return 'var(--color-surface-elevated)';
      if (isOverOptimal) return undefined; // uses bg-amber-500
      if (isInOptimalRange) return undefined; // uses bg-emerald-500
      if (isNearOptimal) return undefined; // uses bg-blue-500
      return 'var(--color-text-muted)';
    };

    const getProgressColorClass = () => {
      if (charCount === 0) return '';
      if (isOverOptimal) return 'bg-amber-500';
      if (isInOptimalRange) return 'bg-emerald-500';
      if (isNearOptimal) return 'bg-blue-500';
      return '';
    };

    const getProgressWidth = () => {
      if (charCount === 0) return 0;
      const targetWidth = Math.min((charCount / optimalRange.max) * 100, 100);
      return targetWidth;
    };

    const getCounterColor = () => {
      if (charCount === 0) return 'var(--color-text-muted)';
      if (isOverOptimal) return undefined; // uses text-amber-400
      if (isInOptimalRange) return undefined; // uses text-emerald-400
      if (isNearOptimal) return undefined; // uses text-blue-400
      return 'var(--color-text-muted)';
    };

    const getCounterColorClass = () => {
      if (charCount === 0) return '';
      if (isOverOptimal) return 'text-amber-400';
      if (isInOptimalRange) return 'text-emerald-400';
      if (isNearOptimal) return 'text-blue-400';
      return '';
    };

    const getHintText = () => {
      if (charCount === 0) return null;
      if (isOverOptimal) return 'Getting long';
      if (isInOptimalRange) return 'Good length';
      if (isNearOptimal) return 'Almost there';
      return null;
    };

    return (
      <div className="relative group">
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 
            backdrop-blur-sm
            border
            rounded-lg rounded-b-none
            text-base leading-6
            placeholder-gray-500 
            focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            transition-all duration-200 ease-out
            overflow-hidden
          `}
          style={{
            minHeight: `${24 * minRows + 24}px`,
            backgroundColor: 'var(--color-surface-light)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />

        {showCharCount && (
          <div
            className={`
              flex items-center justify-between
              px-4 py-2
              backdrop-blur-sm
              border border-t-0
              rounded-b-lg
              transition-all duration-300
              ${disabled ? 'opacity-50' : ''}
            `}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="flex-1 h-1 rounded-full overflow-hidden max-w-32"
                style={{ backgroundColor: 'var(--color-surface-light)' }}
              >
                <div
                  className={`h-full ${getProgressColorClass()} transition-all duration-500 ease-out rounded-full`}
                  style={{ 
                    width: `${getProgressWidth()}%`,
                    backgroundColor: getProgressColor(),
                  }}
                />
              </div>

              {getHintText() && (
                <span
                  className={`
                    text-xs font-medium tracking-wide uppercase
                    ${getCounterColorClass()}
                    transition-all duration-300
                    animate-in fade-in slide-in-from-left-2 duration-200
                  `}
                  style={{ color: getCounterColor() }}
                >
                  {getHintText()}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span
                className={`
                  font-mono text-sm tabular-nums font-medium
                  ${getCounterColorClass()}
                  transition-colors duration-300
                `}
                style={{ color: getCounterColor() }}
              >
                {charCount}
              </span>
              <span 
                className="text-xs font-medium"
                style={{ color: 'var(--color-text-muted)' }}
              >/</span>
              <span 
                className="text-xs font-mono tabular-nums"
                style={{ color: 'var(--color-text-muted)' }}
              >
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
