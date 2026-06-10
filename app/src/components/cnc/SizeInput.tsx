import { useId } from 'react';
import { Select } from '../primitives/Select';
import { sizeOptions } from '../../state/reducer';

type SizeInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function SizeInput({ value, onChange, error }: SizeInputProps) {
  const selectId = useId();
  const errorId = useId();

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
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select size...</option>
        {sizeOptions.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
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
