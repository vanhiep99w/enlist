interface Props {
  message?: string;
  submessage?: string;
}

export function TypingIndicator({ 
  message = 'AI is thinking...', 
  submessage = 'Analyzing your translation' 
}: Props) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex flex-col items-center justify-center min-h-[300px]">
      <div className="flex items-center gap-1 mb-4">
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
      </div>
      <h3 className="text-lg font-medium text-gray-300">{message}</h3>
      <p className="text-sm text-gray-500 mt-1">{submessage}</p>
    </div>
  );
}
