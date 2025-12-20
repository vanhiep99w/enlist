interface Props {
  message?: string;
  submessage?: string;
}

export function TypingIndicator({ 
  message = 'AI is thinking...', 
  submessage = 'Analyzing your translation' 
}: Props) {
  return (
    <div 
      className="rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]"
      style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-1 mb-4">
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
      </div>
      <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>{message}</h3>
      <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{submessage}</p>
    </div>
  );
}
