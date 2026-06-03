import { useId } from 'react';

type PartsCountInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  warning?: string;
};

function parseNumericInput(value: string): number | null {
  const normalizedValue = value.trim();
  if (normalizedValue === '') return null;
  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : null;
}

export function PartsCountInput({
  value,
  onChange,
  error,
  warning,
}: PartsCountInputProps) {
  const inputId = useId();
  const messageId = useId();
  const localError = value !== null && value <= 0 ? 'Required' : undefined;
  const displayedError = error ?? localError;
  const displayedWarning = displayedError ? undefined : warning;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-body-sm text-text-secondary font-medium"
      >
        Parts Count
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={value === null ? '' : value}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => onChange(parseNumericInput(event.target.value))}
          className={`h-[56px] w-full rounded-[12px] border bg-bg-card pl-[14px] pr-[56px] text-right text-[22px] leading-[28px] font-semibold tabular-nums text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-accent-50 transition-all ${
            displayedError ? 'border-danger-600' : 'border-border-soft'
          }`}
          aria-invalid={displayedError !== undefined}
          aria-describedby={
            displayedError || displayedWarning ? messageId : undefined
          }
        />
        <div className="absolute right-[14px] top-1/2 -translate-y-1/2 text-body-md text-text-muted pointer-events-none">
          pcs
        </div>
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
