import { useId } from 'react';
import { Chip } from '../primitives/Chip';
import { commonHexValues } from '../../state/reducer';

type HexInputWithChipsProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
};

export function HexInputWithChips({
  value,
  onChange,
  error,
}: HexInputWithChipsProps) {
  const inputId = useId();
  const errorId = useId();
  const isOutOfRange = value !== null && (value < 0 || value > 200);
  const displayedError =
    error ?? (isOutOfRange ? 'Hex must be between 0 and 200.' : undefined);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-body-sm text-text-secondary font-medium"
      >
        Hex
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value === null ? '' : value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? null : Number(v));
        }}
        className={`h-[48px] w-full px-[14px] rounded-[12px] border bg-bg-card text-right tabular-nums text-body-lg text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-accent-50 transition-all ${
          displayedError ? 'border-danger-600' : 'border-border-soft'
        }`}
        placeholder="0"
        aria-invalid={displayedError !== undefined}
        aria-describedby={displayedError ? errorId : undefined}
      />
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
        <div className="text-caption text-text-muted flex-shrink-0 pr-1">
          Common:
        </div>
        {commonHexValues.map((hexValue) => (
          <Chip
            key={hexValue}
            size="sm"
            selected={value === hexValue}
            onClick={() => onChange(hexValue)}
            className="flex-shrink-0"
          >
            {hexValue}
          </Chip>
        ))}
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
