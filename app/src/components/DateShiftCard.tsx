import type { ChangeEvent } from 'react';
import { useProductionEntry } from '../state/StateContext';
import { Segmented } from './primitives/Segmented';
import type { Shift } from '../state/types';

export default function DateShiftCard() {
  const { state, dispatch } = useProductionEntry();

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'DATE_SET', date: e.target.value });
  };

  const handleShiftChange = (value: string) => {
    dispatch({ type: 'SHIFT_SET', shift: value as Shift });
  };

  return (
    <div className="bg-bg-card border border-border-soft rounded-[16px] shadow-sm p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="date-input"
          className="text-body-sm text-text-secondary font-medium"
        >
          Date
        </label>
        <div className="relative">
          <input
            id="date-input"
            type="date"
            value={state.date}
            onChange={handleDateChange}
            className="w-full h-[48px] px-3 bg-bg-app border border-border-soft rounded-[12px] text-[17px] text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-accent-50 transition-all"
          />
        </div>
      </div>

      <Segmented<Shift>
        value={state.shift}
        options={[
          { value: 'morning', label: 'Morning Shift' },
          { value: 'evening', label: 'Evening Shift' },
        ]}
        onChange={handleShiftChange}
        ariaLabel="Select Shift"
      />
    </div>
  );
}
