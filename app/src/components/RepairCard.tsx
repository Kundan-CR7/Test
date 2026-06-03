import { OperatorSelect } from './cnc/OperatorSelect';
import { useProductionEntry } from '../state/StateContext';
import {
  optionalNumberInputValue,
  parseOptionalWholeNumber,
} from '../utils/input';

type RepairCardProps = {
  onAddPerson: () => void;
};

export default function RepairCard({ onAddPerson }: RepairCardProps) {
  const { state, dispatch } = useProductionEntry();

  return (
    <section
      aria-labelledby="repair-heading"
      className="bg-bg-card border border-border-soft rounded-[16px] shadow-sm p-4 min-[380px]:p-5"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2
          id="repair-heading"
          className="text-heading-md text-text-primary tracking-tight"
        >
          Repair Work
        </h2>
        <span className="rounded-full bg-bg-sunken px-2 py-[2px] text-caption text-text-muted">
          Optional
        </span>
      </div>

      <div className="space-y-4">
        <OperatorSelect
          label="Repair Person"
          value={state.repair.person}
          onChange={(value) =>
            dispatch({ type: 'REPAIR_SET', field: 'person', value })
          }
          onAddPerson={onAddPerson}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="repair-count"
            className="text-body-sm text-text-secondary font-medium"
          >
            Repair Count
          </label>
          <input
            id="repair-count"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={optionalNumberInputValue(state.repair.count)}
            onChange={(event) =>
              dispatch({
                type: 'REPAIR_SET',
                field: 'count',
                value: parseOptionalWholeNumber(event.target.value),
              })
            }
            className="h-[48px] w-full rounded-[12px] border border-border-soft bg-bg-card px-[14px] text-right text-body-lg tabular-nums text-text-primary outline-none transition-all focus:border-border-focus focus:ring-4 focus:ring-accent-50"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="repair-note"
            className="text-body-sm text-text-secondary font-medium"
          >
            Repair Note
          </label>
          <input
            id="repair-note"
            type="text"
            value={state.repair.note}
            onChange={(event) =>
              dispatch({
                type: 'REPAIR_SET',
                field: 'note',
                value: event.target.value,
              })
            }
            className="h-[48px] w-full rounded-[12px] border border-border-soft bg-bg-card px-[14px] text-body-lg text-text-primary outline-none transition-all placeholder:text-text-disabled focus:border-border-focus focus:ring-4 focus:ring-accent-50"
            placeholder="e.g. Thread repair"
          />
        </div>
      </div>
    </section>
  );
}
