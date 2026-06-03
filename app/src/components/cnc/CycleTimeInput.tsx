import { useId, useState } from 'react';

type CycleTimeInputProps = {
  minutes: number | null;
  seconds: number | null;
  onMinutesChange: (value: number | null) => void;
  onSecondsChange: (value: number | null) => void;
  error?: string;
  warning?: string;
};

function parseNumericInput(value: string): number | null {
  const normalizedValue = value.trim();
  if (normalizedValue === '') return null;
  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : null;
}

export function CycleTimeInput({
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  error,
  warning,
}: CycleTimeInputProps) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const minutesId = useId();
  const secondsId = useId();
  const messageId = useId();
  const minuteValue = minutes ?? 0;
  const secondValue = seconds ?? 0;
  const totalSeconds = minuteValue * 60 + secondValue;
  const secondsOutOfRange = seconds !== null && (seconds < 0 || seconds > 59);
  const minutesNegative = minutes !== null && minutes < 0;
  const showZeroError =
    hasInteracted &&
    !secondsOutOfRange &&
    !minutesNegative &&
    (minutes !== null || seconds !== null) &&
    totalSeconds === 0;
  const showLowWarning =
    !secondsOutOfRange &&
    !minutesNegative &&
    totalSeconds > 0 &&
    totalSeconds < 20;
  const showHighWarning =
    !secondsOutOfRange && !minutesNegative && totalSeconds > 600;
  const localError = secondsOutOfRange
    ? 'Seconds should be 0 to 59.'
    : minutesNegative || showZeroError
      ? "Cycle time can't be zero."
      : undefined;
  const localWarning = showLowWarning
    ? 'Cycle time looks low - please confirm.'
    : showHighWarning
      ? 'Cycle time looks high - please confirm.'
      : undefined;
  const displayedError = error ?? localError;
  const displayedWarning = displayedError
    ? undefined
    : (warning ?? localWarning);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={minutesId}
        className="text-body-sm text-text-secondary font-medium"
      >
        Cycle Time
      </label>
      <div
        className={`h-[48px] rounded-[12px] border bg-bg-card flex items-center overflow-hidden focus-within:border-border-focus focus-within:ring-4 focus-within:ring-accent-50 transition-all ${
          displayedError ? 'border-danger-600' : 'border-border-soft'
        }`}
        aria-invalid={displayedError !== undefined}
        aria-describedby={
          displayedError || displayedWarning ? messageId : undefined
        }
      >
        <input
          id={minutesId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={minutes === null ? '' : minutes}
          onChange={(event) => {
            setHasInteracted(true);
            onMinutesChange(parseNumericInput(event.target.value));
          }}
          className="min-w-0 flex-1 h-full border-0 bg-transparent px-2 text-center tabular-nums text-body-lg text-text-primary outline-none focus:ring-0"
          placeholder="0"
          aria-label="Cycle minutes"
        />
        <div className="text-caption text-text-muted pr-3">min</div>
        <div className="h-full w-px bg-border-soft" />
        <input
          id={secondsId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={seconds === null ? '' : seconds}
          onChange={(event) => {
            setHasInteracted(true);
            onSecondsChange(parseNumericInput(event.target.value));
          }}
          className="min-w-0 flex-1 h-full border-0 bg-transparent px-2 text-center tabular-nums text-body-lg text-text-primary outline-none focus:ring-0"
          placeholder="00"
          aria-label="Cycle seconds"
        />
        <div className="text-caption text-text-muted pr-3">sec</div>
      </div>
      {displayedError && (
        <div
          id={messageId}
          className="text-danger-600 text-caption font-medium mt-1"
        >
          {displayedError}
        </div>
      )}
      {displayedWarning && (
        <div
          id={messageId}
          className="text-warning-600 text-caption font-medium mt-1"
        >
          {displayedWarning}
        </div>
      )}
    </div>
  );
}
