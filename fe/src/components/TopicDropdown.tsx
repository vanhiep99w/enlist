import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TopicDropdownProps {
  topics: string[];
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

const topicIcons: Record<string, string> = {
  business: '💼',
  culture: '🎭',
  daily_life: '☀️',
  education: '📚',
  entertainment: '🎬',
  environment: '🌿',
  family: '👨‍👩‍👧‍👦',
  food: '🍜',
  health: '💪',
  shopping: '🛍️',
  technology: '💻',
  travel: '✈️',
};

export function TopicDropdown({ topics, selectedTopic, onTopicChange }: TopicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (topic: string) => {
    onTopicChange(topic);
    setIsOpen(false);
  };

  const formatTopicName = (topic: string) => {
    return topic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getTopicIcon = (topic: string) => {
    return topicIcons[topic.toLowerCase()] || '📌';
  };

  const displayValue = selectedTopic ? formatTopicName(selectedTopic) : 'All Topics';

  const allOptions = [{ value: '', label: 'All Topics', icon: '🌐' }, ...topics.map(t => ({ value: t, label: formatTopicName(t), icon: getTopicIcon(t) }))];

  return (
    <div ref={dropdownRef} className="relative min-w-[200px]">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3
          bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-dark)]
          border border-[var(--color-border)] rounded-xl
          text-[var(--color-text-primary)] cursor-pointer
          transition-all duration-200
          hover:border-[var(--color-primary)]/50
          ${isOpen ? 'ring-2 ring-[var(--color-primary)]/30 border-[var(--color-primary)]' : ''}
        `}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{selectedTopic ? getTopicIcon(selectedTopic) : '🌐'}</span>
          <span className="font-medium">{displayValue}</span>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-4 h-4 text-[var(--color-text-muted)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-2 w-full min-w-[220px] py-2
              bg-[var(--color-surface)] border border-[var(--color-border)]
              rounded-xl shadow-xl shadow-black/20 max-h-[320px] overflow-y-auto"
          >
            {allOptions.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left
                  transition-all duration-150
                  ${selectedTopic === option.value 
                    ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' 
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]'
                  }
                  ${index === 0 ? 'border-b border-[var(--color-border)] mb-1 pb-3' : ''}
                `}
              >
                <span className="text-lg w-6 text-center">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
                {selectedTopic === option.value && (
                  <svg
                    className="ml-auto w-4 h-4 text-[var(--color-primary)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
