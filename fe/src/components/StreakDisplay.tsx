import { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weekDays: boolean[];
  lastActivityDate?: string;
}

const MOCK_STREAK_DATA: StreakData = {
  currentStreak: 3,
  longestStreak: 7,
  weekDays: [true, true, true, false, false, false, false],
  lastActivityDate: new Date().toISOString(),
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getMilestoneMessage(streak: number): string | null {
  if (streak >= 100) return "🏆 Century!";
  if (streak >= 30) return "🌟 Monthly Master!";
  if (streak >= 7) return "🔥 Week Champion!";
  return null;
}

function StreakTooltip({
  position,
  data,
  milestone,
}: {
  position: { top: number; left: number };
  data: StreakData;
  milestone: string | null;
}) {
  return createPortal(
    <div
      className="fixed z-[9999] w-48 p-3 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150"
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: "var(--color-surface)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Arrow */}
      <div
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
        style={{
          backgroundColor: "var(--color-surface)",
          borderLeftWidth: "1px",
          borderTopWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--color-border)",
        }}
      />

      <div className="relative space-y-2">
        {/* Current streak */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Current Streak
          </span>
          <span className="font-bold text-amber-500">
            {data.currentStreak} days
          </span>
        </div>

        {/* Longest streak */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Longest Streak
          </span>
          <span
            className="font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {data.longestStreak} days
          </span>
        </div>

        {/* Week visualization */}
        <div
          className="pt-2"
          style={{
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            {DAY_LABELS.map((label, idx) => (
              <span
                key={idx}
                className="text-[10px] w-4 text-center"
                style={{ color: "var(--color-text-muted)" }}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            {data.weekDays.map((active, idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  active ? "bg-amber-500/20 border border-amber-500" : ""
                }`}
                style={
                  !active
                    ? {
                        backgroundColor: "var(--color-surface-light)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "var(--color-border)",
                      }
                    : undefined
                }
              >
                {active && <span className="text-[8px]">🔥</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Milestone */}
        {milestone && (
          <div
            className="pt-2 text-center"
            style={{
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "var(--color-border)",
            }}
          >
            <span className="text-xs font-medium text-amber-400">
              {milestone}
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function StreakDisplay() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const data = MOCK_STREAK_DATA;

  const milestone = getMilestoneMessage(data.currentStreak);
  const isActiveToday = data.weekDays[0];

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const tooltipWidth = 192;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      if (left < 8) left = 8;
      if (left + tooltipWidth > window.innerWidth - 8) {
        left = window.innerWidth - tooltipWidth - 8;
      }

      setTooltipPos({
        top: rect.bottom + 8,
        left,
      });
      setShowTooltip(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-105"
      style={{
        backgroundColor: "var(--color-surface-light)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "var(--color-border)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Flame icon with animation */}
      <span
        className={`text-lg ${isActiveToday ? "animate-flame" : "opacity-50"}`}
      >
        🔥
      </span>

      {/* Week grid */}
      <div className="flex items-center gap-0.5">
        {data.weekDays.map((active, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              active ? "bg-amber-500 shadow-sm shadow-amber-500/50" : ""
            }`}
            style={
              !active
                ? { backgroundColor: "var(--color-surface-elevated)" }
                : undefined
            }
            title={DAY_LABELS[idx]}
          />
        ))}
      </div>

      {/* Current streak count */}
      <span className="font-bold text-amber-500 text-sm tabular-nums">
        {data.currentStreak}
      </span>

      {/* Tooltip - rendered via portal to document.body */}
      {showTooltip && (
        <StreakTooltip
          position={tooltipPos}
          data={data}
          milestone={milestone}
        />
      )}
    </div>
  );
}
