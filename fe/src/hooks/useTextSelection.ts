import { useState, useEffect } from 'react';

interface SelectionState {
  text: string;
  x: number;
  y: number;
}

interface UseTextSelectionOptions {
  onSelect?: (selection: SelectionState) => void;
  minLength?: number;
  containerRef?: React.RefObject<HTMLElement>;
}

export const useTextSelection = ({
  onSelect,
  minLength = 1,
  containerRef,
}: UseTextSelectionOptions = {}) => {
  const [selection, setSelection] = useState<SelectionState | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selectedText = window.getSelection()?.toString().trim();
      
      if (!selectedText || selectedText.length < minLength) {
        setSelection(null);
        return;
      }

      // Check if selection is within the container
      if (containerRef?.current) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (!containerRef.current.contains(range.commonAncestorContainer)) {
            return;
          }
        }
      }

      const range = window.getSelection()?.getRangeAt(0);
      if (!range) return;

      const rect = range.getBoundingClientRect();
      const selectionState: SelectionState = {
        text: selectedText,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      };

      setSelection(selectionState);
      onSelect?.(selectionState);
    };

    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleSelection, 10);
    };

    const handleMouseDown = () => {
      setSelection(null);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onSelect, minLength, containerRef]);

  const clearSelection = () => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  return { selection, clearSelection };
};
