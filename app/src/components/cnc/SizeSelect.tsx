import { useEffect, useId, useState } from 'react';
import { Select } from '../primitives/Select';
import { sizeOptions } from '../../state/reducer';

type SizeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function SizeSelect({ value, onChange, error }: SizeSelectProps) {
  const [isCustom, setIsCustom] = useState(false);
  const selectId = useId();
  const customId = useId();
  const errorId = useId();

  useEffect(() => {
    if (value !== '' && !(sizeOptions as readonly string[]).includes(value)) {
      setIsCustom(true);
    }
  }, [value]);

  if (isCustom) {
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={customId}
          className="text-body-sm text-text-secondary font-medium"
        >
          Size
        </label>
        <input
          id={customId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-[48px] px-[14px] rounded-[12px] border bg-bg-card text-body-lg text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-accent-50 transition-all ${
            error ? 'border-danger-600' : 'border-border-soft'
          }`}
          placeholder="Enter size..."
          autoFocus
          aria-invalid={error !== undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          onClick={() => {
            setIsCustom(false);
            onChange('');
          }}
          className="text-text-muted text-body-sm font-medium mt-1 self-start hover:text-text-primary"
        >
          ← back to list
        </button>
        {error && (
          <div
            id={errorId}
            className="text-danger-600 text-caption font-medium mt-1"
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-body-sm text-text-secondary font-medium"
      >
        Size
      </label>
      <Select
        id={selectId}
        value={value}
        invalid={error !== undefined}
        aria-invalid={error !== undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => {
          if (e.target.value === 'CUSTOM') {
            setIsCustom(true);
            onChange('');
          } else {
            onChange(e.target.value);
          }
        }}
      >
        <option value="">Select...</option>
        {sizeOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="CUSTOM">Custom...</option>
      </Select>
      {error && (
        <div
          id={errorId}
          className="text-danger-600 text-caption font-medium mt-1"
        >
          {error}
        </div>
      )}
    </div>
  );
}
