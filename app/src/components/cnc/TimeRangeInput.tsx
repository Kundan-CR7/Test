import { useId } from 'react';

type TimeRangeInputProps = {
  timeIn: string;
  timeOut: string;
  onTimeInChange: (value: string) => void;
  onTimeOutChange: (value: string) => void;
  error?: string;
};

export function TimeRangeInput({
  timeIn,
  timeOut,
  onTimeInChange,
  onTimeOutChange,
  error,
}: TimeRangeInputProps) {
  const timeInId = useId();
  const timeOutId = useId();
  const errorId = useId();
  const hasTimeError = timeIn !== '' && timeOut !== '' && timeOut <= timeIn;
  const displayedError =
    error ?? (hasTimeError ? 'Time Out should be after Time In.' : undefined);
  const hasRequiredError = displayedError === 'Required';

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={timeInId}
            className="text-body-sm text-text-secondary font-medium"
          >
            Time In
          </label>
          <input
            id={timeInId}
            type="time"
            value={timeIn}
            onChange={(event) => onTimeInChange(event.target.value)}
            className={`h-[48px] w-full px-[14px] rounded-[12px] border bg-bg-card tabular-nums text-body-lg text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-accent-50 transition-all ${
              hasRequiredError ? 'border-danger-600' : 'border-border-soft'
            }`}
            aria-invalid={hasRequiredError}
            aria-describedby={hasRequiredError ? errorId : undefined}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={timeOutId}
            className="text-body-sm text-text-secondary font-medium"
          >
            Time Out
          </label>
          <input
            id={timeOutId}
            type="time"
            value={timeOut}
            onChange={(event) => onTimeOutChange(event.target.value)}
            className={`h-[48px] w-full px-[14px] rounded-[12px] border bg-bg-card tabular-nums text-body-lg text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-accent-50 transition-all ${
              displayedError ? 'border-danger-600' : 'border-border-soft'
            }`}
            aria-invalid={displayedError !== undefined}
            aria-describedby={displayedError ? errorId : undefined}
          />
        </div>
      </div>
      {displayedError && (
        <div
          id={errorId}
          className="text-danger-600 text-caption font-medium mt-1"
        >
          {displayedError}
        </div>
      )}
    </div>
  );
}
