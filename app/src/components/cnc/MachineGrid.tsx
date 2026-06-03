import { useId } from 'react';
import { Chip } from '../primitives/Chip';
import { machines } from '../../state/reducer';
import type { Machine } from '../../state/types';

type MachineGridProps = {
  value: Machine;
  onChange: (value: Machine) => void;
  error?: string;
};

export function MachineGrid({ value, onChange, error }: MachineGridProps) {
  const labelId = useId();
  const errorId = useId();

  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-body-sm text-text-secondary font-medium"
        id={labelId}
      >
        Machine
      </label>
      <div
        className={`grid grid-cols-4 gap-2 rounded-[12px] ${
          error
            ? 'ring-2 ring-danger-600 ring-offset-2 ring-offset-bg-card'
            : ''
        }`}
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error !== undefined}
      >
        {machines.map((m) => {
          const isSelected = value === m;
          return (
            <Chip
              key={m}
              size="md"
              selected={isSelected}
              onClick={() => {
                // Clicking selected keeps it selected in Phase 3
                onChange(m);
              }}
              role="radio"
              aria-checked={isSelected}
            >
              {m}
            </Chip>
          );
        })}
      </div>
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
