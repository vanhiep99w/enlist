import { useState, useEffect } from 'react';
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
  if (score >= 90) return 'var(--color-primary)'; // Excellent
  if (score >= 80) return 'var(--color-primary-light)'; // Good
  if (score >= 60) return 'var(--color-accent)'; // Average
  return 'var(--color-text-muted)'; // Poor
}

function getScoreStrokeColor(score: number): string {
  if (score >= 90) return 'var(--color-primary)'; // Excellent
  if (score >= 80) return 'var(--color-primary-light)'; // Good
  if (score >= 60) return 'var(--color-accent)'; // Average
  return 'var(--color-text-muted)'; // Poor
}

function getScoreTrackColor(): string {
  return 'var(--color-surface-elevated)';
}

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  tooltip: string;
  isOverall?: boolean;
  delay?: number;
}

function CircularProgress({
  score,
  size = 64,
  strokeWidth = 6,
  label,
  tooltip,
  isOverall = false,
  delay = 0,
}: CircularProgressProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  useEffect(() => {
    if (animatedScore === 0) {
      setDisplayScore(0);
      return;
    }

    const duration = 800;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = animatedScore;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOut);

      setDisplayScore(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animatedScore]);

  const actualSize = isOverall ? size * 1.25 : size;
  const actualRadius = (actualSize - (isOverall ? strokeWidth * 1.5 : strokeWidth)) / 2;
  const actualCircumference = 2 * Math.PI * actualRadius;
  const actualOffset = actualCircumference - (animatedScore / 100) * actualCircumference;

  return (
    <div
      className="relative flex flex-col items-center gap-1"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <svg width={actualSize} height={actualSize} className="-rotate-90 transform">
          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={actualRadius}
            fill="none"
            strokeWidth={isOverall ? strokeWidth * 1.5 : strokeWidth}
            style={{ stroke: getScoreTrackColor() }}
          />
          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={actualRadius}
            fill="none"
            strokeWidth={isOverall ? strokeWidth * 1.5 : strokeWidth}
            strokeLinecap="round"
            style={{
              stroke: getScoreStrokeColor(score),
              strokeDasharray: actualCircumference,
              strokeDashoffset: actualOffset,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`${isOverall ? 'text-xl' : 'text-sm'} font-bold tabular-nums`}
            style={{ color: getScoreColor(score) }}
          >
            {displayScore}%
          </span>
        </div>
      </div>
      <span
        className={`${isOverall ? 'text-sm font-semibold' : 'text-xs'} text-center`}
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </span>
      {showTooltip && !isOverall && (
        <div
          className="absolute -top-2 left-1/2 z-10 max-w-[180px] -translate-x-1/2 -translate-y-full rounded px-2.5 py-1.5 text-center text-xs whitespace-normal"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
        >
          {tooltip}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: 'var(--color-surface)' }}
          />
        </div>
      )}
    </div>
  );
}

export function ScoreBreakdown({ scores }: Props) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-center gap-6">
        <CircularProgress
          score={scores.overallScore}
          label="Overall"
          tooltip=""
          isOverall
          delay={0}
        />
        <div className="h-16 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="flex gap-4">
          {scoreConfigs.map(({ key, label, tooltip }, idx) => (
            <CircularProgress
              key={key}
              score={scores[key]}
              label={label}
              tooltip={tooltip}
              delay={300 + idx * 150}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
