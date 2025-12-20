interface Props {
  message?: string;
  submessage?: string;
}

export function TypingIndicator({
  message = 'AI is thinking...',
  submessage = 'Analyzing your translation',
}: Props) {
  return (
    <div
      className="flex min-h-[300px] flex-col items-center justify-center rounded-lg p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="mb-4 flex items-center gap-1">
        <span className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-blue-500" />
      </div>
      <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {message}
      </h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {submessage}
      </p>
    </div>
  );
}
