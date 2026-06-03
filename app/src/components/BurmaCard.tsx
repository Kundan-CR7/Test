import { useEffect, useState } from 'react';
import { useProductionEntry } from '../state/StateContext';
import { totalBurma } from '../state/selectors';
import type { BurmaField } from '../state/types';
import {
  optionalNumberInputValue,
  parseOptionalWholeNumber,
} from '../utils/input';
import { Select } from './primitives/Select';

const countFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

type BurmaInputRowProps = {
  field: BurmaField;
  label: string;
  value: number | null;
  operator: string;
  people: string[];
  onChange: (field: BurmaField, value: number | null) => void;
  onOperatorChange: (field: BurmaField, value: string) => void;
  onAddPerson: (field: BurmaField) => void;
};

type BurmaCardProps = {
  onAddPerson: (field: BurmaField) => void;
};

function BurmaInputRow({
  field,
  label,
  value,
  operator,
  people,
  onChange,
  onOperatorChange,
  onAddPerson,
}: BurmaInputRowProps) {
  const inputId = `burma-${field}`;
  const operatorId = `burma-${field}-operator`;
  const [isChangingOperator, setIsChangingOperator] = useState(
    () => operator === '',
  );

  useEffect(() => {
    if (operator === '') {
      setIsChangingOperator(true);
    }
  }, [operator]);

  return (
    <div className="rounded-[12px] bg-bg-sunken p-3">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className="min-w-0 text-body-md font-semibold text-text-primary"
        >
          {label}
        </label>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={optionalNumberInputValue(value)}
          onChange={(event) =>
            onChange(field, parseOptionalWholeNumber(event.target.value))
          }
          className="h-[44px] w-[100px] flex-shrink-0 rounded-[12px] border border-border-soft bg-bg-card px-[12px] text-right text-body-lg tabular-nums text-text-primary outline-none transition-all focus:border-border-focus focus:ring-4 focus:ring-accent-50"
        />
      </div>

      {isChangingOperator ? (
        <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-2">
          <div className="min-w-0">
            <label
              htmlFor={operatorId}
              className="mb-1 block text-caption font-semibold text-text-muted"
            >
              Operator
            </label>
            <Select
              id={operatorId}
              value={operator}
              onChange={(event) => {
                onOperatorChange(field, event.target.value);
                if (event.target.value !== '') {
                  setIsChangingOperator(false);
                }
              }}
            >
              <option value="">Select...</option>
              {people.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </Select>
          </div>
          <button
            type="button"
            onClick={() => onAddPerson(field)}
            className="h-[48px] rounded-[12px] px-3 text-body-sm font-semibold text-accent-600 active:opacity-70"
          >
            Add
          </button>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="min-w-0 truncate text-body-sm text-text-secondary">
            Operator:{' '}
            <span className="font-semibold text-text-primary">{operator}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsChangingOperator(true)}
            className="flex-shrink-0 text-body-sm font-semibold text-accent-600 active:opacity-70"
          >
            Change operator
          </button>
        </div>
      )}
    </div>
  );
}

export default function BurmaCard({ onAddPerson }: BurmaCardProps) {
  const { state, dispatch } = useProductionEntry();
  const total = totalBurma(state);

  const handleChange = (field: BurmaField, value: number | null) => {
    dispatch({ type: 'BURMA_SET', field, value });
  };

  const handleOperatorChange = (field: BurmaField, value: string) => {
    dispatch({ type: 'BURMA_OPERATOR_SET', field, value });
  };

  return (
    <section
      aria-labelledby="burma-heading"
      className="bg-bg-card border border-border-soft rounded-[16px] shadow-sm p-4 min-[380px]:p-5"
    >
      <h2
        id="burma-heading"
        className="text-heading-md text-text-primary tracking-tight mb-4"
      >
        Burma Production
      </h2>

      <div className="space-y-4 border-b border-border-soft pb-4">
        <BurmaInputRow
          field="burma1"
          label="Burma 1"
          value={state.burma.burma1}
          operator={state.burma.operators.burma1}
          people={state.people}
          onChange={handleChange}
          onOperatorChange={handleOperatorChange}
          onAddPerson={onAddPerson}
        />
        <BurmaInputRow
          field="burma2"
          label="Burma 2"
          value={state.burma.burma2}
          operator={state.burma.operators.burma2}
          people={state.people}
          onChange={handleChange}
          onOperatorChange={handleOperatorChange}
          onAddPerson={onAddPerson}
        />
        <BurmaInputRow
          field="burma3"
          label="Burma 3"
          value={state.burma.burma3}
          operator={state.burma.operators.burma3}
          people={state.people}
          onChange={handleChange}
          onOperatorChange={handleOperatorChange}
          onAddPerson={onAddPerson}
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-4">
        <div className="text-body-sm font-semibold text-text-secondary">
          Total Burma Count
        </div>
        <div className="text-heading-md font-bold tabular-nums text-text-primary text-right">
          {countFormatter.format(total)}
        </div>
      </div>
    </section>
  );
}
