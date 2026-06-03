import { useId } from 'react';
import type { SideType } from '../../state/types';
import { Select } from '../primitives/Select';

type SideToggleProps = {
  value: SideType;
  onChange: (value: SideType) => void;
};

const sideOptions: SideType[] = ['', 'Male', 'Female', 'Groove', 'Custom'];

export function SideToggle({ value, onChange }: SideToggleProps) {
  const selectId = useId();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-body-sm text-text-secondary font-medium"
      >
        Side
      </label>
      <Select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value as SideType)}
        aria-label="Select Side"
      >
        {sideOptions.map((option) => (
          <option key={option || 'blank'} value={option}>
            {option || 'Select...'}
          </option>
        ))}
      </Select>
    </div>
  );
}
