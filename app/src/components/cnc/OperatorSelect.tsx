import { useId } from 'react';
import { Select } from '../primitives/Select';
import { useProductionEntryState } from '../../state/StateContext';

type OperatorSelectProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showAddPersonButton?: boolean;
  onAddPerson?: () => void;
  error?: string;
};

export function OperatorSelect({
  value,
  onChange,
  label = 'Operator',
  showAddPersonButton = true,
  onAddPerson,
  error,
}: OperatorSelectProps) {
  const { people } = useProductionEntryState();
  const selectId = useId();
  const errorId = useId();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-body-sm text-text-secondary font-medium"
      >
        {label}
      </label>
      <Select
        id={selectId}
        value={value}
        invalid={error !== undefined}
        aria-invalid={error !== undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {people.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </Select>
      {showAddPersonButton && onAddPerson && (
        <button
          type="button"
          className="text-left text-accent-600 text-body-sm font-semibold mt-1 self-start select-none active:opacity-70 transition-opacity"
          onClick={onAddPerson}
        >
          + Add new person
        </button>
      )}
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
