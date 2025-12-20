import type { TranslationError } from '../types/translation';

interface Props {
  userTranslation: string;
  errors: TranslationError[];
}

interface TextSegment {
  text: string;
  isError: boolean;
  correction?: string;
}

export function SuggestionLine({ userTranslation, errors }: Props) {
  const errorsWithPositions = errors.filter(
    (e) => e.startIndex != null && e.endIndex != null
  );

  if (errorsWithPositions.length === 0) {
    return <span className="text-amber-200">{userTranslation}</span>;
  }

  const sortedErrors = [...errorsWithPositions].sort(
    (a, b) => (a.startIndex ?? 0) - (b.startIndex ?? 0)
  );

  const segments: TextSegment[] = [];
  let currentIndex = 0;

  for (const error of sortedErrors) {
    const start = error.startIndex!;
    const end = error.endIndex!;

    if (start < currentIndex) continue;

    if (start > currentIndex) {
      segments.push({
        text: userTranslation.slice(currentIndex, start),
        isError: false,
      });
    }

    // Missing word (insertion point)
    if (start === end) {
      segments.push({
        text: '',
        isError: true,
        correction: error.correction,
      });
    } else {
      // Regular error (replacement)
      segments.push({
        text: userTranslation.slice(start, end),
        isError: true,
        correction: error.correction,
      });
    }

    currentIndex = end;
  }

  if (currentIndex < userTranslation.length) {
    segments.push({
      text: userTranslation.slice(currentIndex),
      isError: false,
    });
  }

  return (
    <span className="leading-relaxed">
      {segments.map((segment, index) =>
        segment.isError ? (
          <span key={index} className="inline">
            {segment.text && <span className="text-red-500 line-through">{segment.text}</span>}
            {segment.correction && (
              <span className="ml-0.5 font-medium text-green-400">
                {segment.text ? `(${segment.correction})` : `[+${segment.correction}]`}
              </span>
            )}
          </span>
        ) : (
          <span key={index} className="text-amber-200">
            {segment.text}
          </span>
        )
      )}
    </span>
  );
}
