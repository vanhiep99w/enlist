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

// Helper function to expand selection to word boundaries
const expandToWordBoundaries = (range: Range): Range => {
  const newRange = range.cloneRange();

  // Word boundary regex that handles Vietnamese characters with diacritics
  // Matches: letters (including Vietnamese), numbers, hyphens, apostrophes
  const wordCharRegex = /[\p{L}\p{N}\-']/u;

  // Expand start to word boundary
  let startContainer = newRange.startContainer;
  let startOffset = newRange.startOffset;

  if (startContainer.nodeType === Node.TEXT_NODE) {
    const text = startContainer.textContent || '';
    // Move backward to find word start
    while (startOffset > 0 && wordCharRegex.test(text[startOffset - 1])) {
      startOffset--;
    }
    newRange.setStart(startContainer, startOffset);
  }

  // Expand end to word boundary
  let endContainer = newRange.endContainer;
  let endOffset = newRange.endOffset;

  if (endContainer.nodeType === Node.TEXT_NODE) {
    const text = endContainer.textContent || '';
    // Move forward to find word end
    while (endOffset < text.length && wordCharRegex.test(text[endOffset])) {
      endOffset++;
    }
    newRange.setEnd(endContainer, endOffset);
  }

  return newRange;
};

export const useTextSelection = ({
  onSelect,
  minLength = 1,
  containerRef,
}: UseTextSelectionOptions = {}) => {
  const [selection, setSelection] = useState<SelectionState | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }

      // Check if selection is within the container
      if (containerRef?.current) {
        const range = sel.getRangeAt(0);
        if (!containerRef.current.contains(range.commonAncestorContainer)) {
          return;
        }
      }

      const originalRange = sel.getRangeAt(0);
      const selectedText = sel.toString().trim();

      if (!selectedText || selectedText.length < minLength) {
        setSelection(null);
        return;
      }

      // Expand selection to word boundaries
      const expandedRange = expandToWordBoundaries(originalRange);
      const expandedText = expandedRange.toString().trim();

      // Only update selection if there's a valid expanded text
      if (expandedText && expandedText.length >= minLength) {
        // Update the actual browser selection
        sel.removeAllRanges();
        sel.addRange(expandedRange);

        const rect = expandedRange.getBoundingClientRect();
        const selectionState: SelectionState = {
          text: expandedText,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        };

        setSelection(selectionState);
        onSelect?.(selectionState);
      }
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
