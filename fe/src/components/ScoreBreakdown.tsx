import { useState } from 'react';
import type { ScoreBreakdown as ScoreBreakdownType } from '../types/translation';

interface Props {
  scores: ScoreBreakdownType;
}

interface ScoreConfig {
  key: keyof Omit<ScoreBreakdownType, 'overallScore'>;
  label: string;
  tooltip: string;
}

const scoreConfigs: ScoreConfig[] = [
  {
    key: 'grammarScore',
    label: 'Grammar',
    tooltip: 'Evaluates syntax, verb forms, articles, and sentence structure',
  },
  {
    key: 'wordChoiceScore',
    label: 'Word Choice',
    tooltip: 'Evaluates vocabulary accuracy and collocations',
  },
  {
    key: 'naturalnessScore',
    label: 'Naturalness',
    tooltip: 'Evaluates natural phrasing and idiomatic expressions',
  },
];

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getScoreStrokeColor(score: number): string {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

function getScoreTrackColor(score: number): string {
  if (score >= 80) return 'stroke-green-100';
  if (score >= 60) return 'stroke-yellow-100';
  return 'stroke-red-100';
}

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  tooltip: string;
  isOverall?: boolean;
}

function CircularProgress({
  score,
  size = 64,
  strokeWidth = 6,
  label,
  tooltip,
  isOverall = false,
}: CircularProgressProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const actualSize = isOverall ? size * 1.25 : size;
  const actualRadius = (actualSize - (isOverall ? strokeWidth * 1.5 : strokeWidth)) / 2;
  const actualCircumference = 2 * Math.PI * actualRadius;
  const actualOffset = actualCircumference - (score / 100) * actualCircumference;

  return (
    <div
      className="flex flex-col items-center gap-1 relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <svg
          width={actualSize}
          height={actualSize}
          className="transform -rotate-90"
        >
          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={actualRadius}
            fill="none"
            strokeWidth={isOverall ? strokeWidth * 1.5 : strokeWidth}
            className={getScoreTrackColor(score)}
          />
          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={actualRadius}
            fill="none"
            strokeWidth={isOverall ? strokeWidth * 1.5 : strokeWidth}
            strokeLinecap="round"
            className={`${getScoreStrokeColor(score)} transition-all duration-700 ease-out`}
            style={{
              strokeDasharray: actualCircumference,
              strokeDashoffset: actualOffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${isOverall ? 'text-xl' : 'text-sm'} font-bold ${getScoreColor(score)}`}>
            {score}%
          </span>
        </div>
      </div>
      <span className={`${isOverall ? 'text-sm font-semibold' : 'text-xs'} text-gray-600 text-center`}>
        {label}
      </span>
      {showTooltip && !isOverall && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 bg-gray-800 text-white text-xs rounded py-1.5 px-2.5 max-w-[180px] text-center whitespace-normal">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}

export function ScoreBreakdown({ scores }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-center gap-6">
        <CircularProgress
          score={scores.overallScore}
          label="Overall"
          tooltip=""
          isOverall
        />
        <div className="h-16 w-px bg-gray-200" />
        <div className="flex gap-4">
          {scoreConfigs.map(({ key, label, tooltip }) => (
            <CircularProgress
              key={key}
              score={scores[key]}
              label={label}
              tooltip={tooltip}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
