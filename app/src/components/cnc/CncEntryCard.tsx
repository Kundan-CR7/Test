import { useState } from 'react';
import type { CncEntry, CncFieldUpdate, Shift } from '../../state/types';
import { OperatorSelect } from './OperatorSelect';
import { MachineGrid } from './MachineGrid';
import { HexInputWithChips } from './HexInputWithChips';
import { SizeSelect } from './SizeSelect';
import { SideToggle } from './SideToggle';
import { CycleTimeInput } from './CycleTimeInput';
import { TimeRangeInput } from './TimeRangeInput';
import { PartsCountInput } from './PartsCountInput';
import { cncIdentitySubtitle } from '../../state/selectors';
import { isCncEntryBlank, validateEntry } from '../../state/validation';
import type {
  ValidationIssueCode,
  ValidationReport,
} from '../../state/validation';

type CncEntryCardProps = {
  index: number;
  entry: CncEntry;
  isBlank: boolean;
  shift: Shift;
  showValidation: boolean;
  isExiting?: boolean;
  onSetField: (entryId: string, update: CncFieldUpdate) => void;
  onDuplicate: (entryId: string) => void;
  onRemove: (entryId: string) => void;
  onAddPerson: (entryId: string) => void;
};

export function CncEntryCard({
  index,
  entry,
  isBlank,
  shift,
  showValidation,
  isExiting = false,
  onSetField,
  onDuplicate,
  onRemove,
  onAddPerson,
}: CncEntryCardProps) {
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const subtitle = cncIdentitySubtitle(entry);
  const validationContext = { shift };
  const report = validateEntry(entry, validationContext);
  const isBlankEntry = isCncEntryBlank(entry, validationContext);
  const isComplete = report.complete && !isBlankEntry;
  const showRequiredErrors = showValidation && !isBlankEntry;
  const showCardWarning = showRequiredErrors && report.hard.length > 0;
  const shellStateClass = isComplete
    ? 'border-success-600 shadow-sm ring-1 ring-success-600/20'
    : 'border-border-soft shadow-sm';
  const statusClass = isComplete
    ? 'text-success-600 text-caption font-semibold'
    : showCardWarning
      ? 'text-warning-600 text-caption font-medium'
      : 'text-text-muted text-caption font-medium';

  const handleSetField = (update: CncFieldUpdate) => {
    onSetField(entry.id, update);
  };

  const handleRemoveClick = () => {
    if (isExiting) return;
    if (isBlank) {
      onRemove(entry.id);
      return;
    }
    setIsConfirmingRemove(true);
  };

  const handleConfirmRemove = () => {
    setIsConfirmingRemove(false);
    onRemove(entry.id);
  };

  return (
    <div
      className={`cnc-card-shell bg-bg-card border rounded-[16px] w-full p-4 min-[380px]:p-5 mb-4 last:mb-0 transition-colors ${shellStateClass} ${
        isExiting ? 'cnc-card-shell--exiting pointer-events-none' : ''
      }`}
      aria-disabled={isExiting}
    >
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-heading-sm text-text-primary">
            CNC Entry {index + 1}
          </h2>
          <span className={statusClass}>
            {isComplete ? 'Complete' : 'Incomplete'}
          </span>
        </div>

        {subtitle && (
          <div className="text-body-md text-text-secondary mb-3">
            {subtitle}
          </div>
        )}

        {isConfirmingRemove ? (
          <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-3 rounded-[12px] bg-bg-sunken p-3">
            <div className="text-body-sm text-text-secondary">
              Remove this CNC entry?
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isExiting}
                onClick={() => setIsConfirmingRemove(false)}
                className="h-9 px-3 rounded-[10px] bg-bg-card border border-border-soft text-body-sm text-text-secondary font-semibold active:opacity-80 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExiting}
                onClick={handleConfirmRemove}
                className="h-9 px-3 rounded-[10px] bg-danger-600 text-body-sm text-text-inverse font-semibold active:opacity-80 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              type="button"
              disabled={isExiting}
              onClick={() => onDuplicate(entry.id)}
              className="text-text-muted text-body-sm font-medium hover:text-text-primary transition-colors active:opacity-70 disabled:opacity-50"
            >
              Duplicate
            </button>
            <button
              type="button"
              disabled={isExiting}
              onClick={handleRemoveClick}
              className="text-text-muted text-body-sm font-medium hover:text-text-primary transition-colors active:opacity-70 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {showCardWarning && (
          <div className="rounded-[12px] bg-warning-50 px-3 py-3 text-body-sm font-semibold text-warning-600">
            Please complete this entry.
          </div>
        )}
        <OperatorSelect
          value={entry.operator}
          onChange={(value) => handleSetField({ field: 'operator', value })}
          onAddPerson={() => onAddPerson(entry.id)}
          error={hardIssue(report, ['operator_required'], showRequiredErrors)}
        />
        <MachineGrid
          value={entry.machine}
          onChange={(value) => handleSetField({ field: 'machine', value })}
          error={hardIssue(report, ['machine_required'], showRequiredErrors)}
        />
        <HexInputWithChips
          value={entry.hex}
          onChange={(value) => handleSetField({ field: 'hex', value })}
          error={hardIssue(
            report,
            ['hex_required', 'hex_range'],
            showRequiredErrors,
          )}
        />
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4">
          <SizeSelect
            value={entry.size}
            onChange={(value) => handleSetField({ field: 'size', value })}
            error={hardIssue(report, ['size_required'], showRequiredErrors)}
          />
          <SideToggle
            value={entry.side}
            onChange={(value) => handleSetField({ field: 'side', value })}
          />
        </div>
        <CycleTimeInput
          minutes={entry.cycleMinutes}
          seconds={entry.cycleSeconds}
          onMinutesChange={(value) =>
            handleSetField({ field: 'cycleMinutes', value })
          }
          onSecondsChange={(value) =>
            handleSetField({ field: 'cycleSeconds', value })
          }
          error={hardIssue(
            report,
            ['cycle_required', 'cycle_seconds_range', 'cycle_zero'],
            showRequiredErrors,
          )}
          warning={softIssue(report, ['cycle_low', 'cycle_high'])}
        />
        <TimeRangeInput
          timeIn={entry.timeIn}
          timeOut={entry.timeOut}
          onTimeInChange={(value) =>
            handleSetField({ field: 'timeIn', value, markTouched: true })
          }
          onTimeOutChange={(value) =>
            handleSetField({ field: 'timeOut', value, markTouched: true })
          }
          error={hardIssue(
            report,
            ['time_required', 'time_order'],
            showRequiredErrors,
          )}
        />
        <PartsCountInput
          value={entry.partsCount}
          onChange={(value) => handleSetField({ field: 'partsCount', value })}
          error={hardIssue(
            report,
            ['parts_required', 'parts_positive'],
            showRequiredErrors,
          )}
          warning={softIssue(report, ['parts_high'])}
        />
      </div>
    </div>
  );
}

const requiredIssueCodes = new Set<ValidationIssueCode>([
  'operator_required',
  'machine_required',
  'hex_required',
  'size_required',
  'cycle_required',
  'parts_required',
  'time_required',
]);

function hardIssue(
  report: ValidationReport,
  codes: ValidationIssueCode[],
  showRequiredErrors: boolean,
): string | undefined {
  return report.hard.find((issue) => {
    if (!codes.includes(issue.code)) return false;
    if (requiredIssueCodes.has(issue.code)) return showRequiredErrors;
    return true;
  })?.message;
}

function softIssue(
  report: ValidationReport,
  codes: ValidationIssueCode[],
): string | undefined {
  return report.soft.find((issue) => codes.includes(issue.code))?.message;
}
