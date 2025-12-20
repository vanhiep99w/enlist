interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Translation',
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Submit translation / Continue to next' },
      { keys: ['Ctrl', "'"], description: 'Retry current sentence (after passing)' },
    ],
  },
  {
    title: 'Tools',
    shortcuts: [
      { keys: ['Ctrl', 'D'], description: 'Toggle dictionary' },
      { keys: ['?'], description: 'Show this help' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['Esc'], description: 'Close modal / dialog' },
    ],
  },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}
        >
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span>⌨️</span>
            Keyboard Shortcuts
          </h2>
          <button 
            onClick={onClose}
            className="hover:opacity-80 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 
                className="text-sm font-medium uppercase tracking-wider mb-3"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between py-2"
                  >
                    <span style={{ color: 'var(--color-text-secondary)' }}>{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center gap-1">
                          <kbd 
                            className="px-2 py-1 rounded text-sm font-mono min-w-[2rem] text-center"
                            style={{ backgroundColor: 'var(--color-surface-dark)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                          >
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div 
          className="px-6 py-4"
          style={{ backgroundColor: 'var(--color-surface-dark)', opacity: 0.5, borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}
        >
          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            Press <kbd 
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
            >Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
