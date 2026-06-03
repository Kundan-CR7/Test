import type { CncEntry, ProductionEntryState, Shift } from './types';
import { defaultShiftTimes, machines } from './reducer';

export type ValidationSeverity = 'hard' | 'soft';

export type ValidationIssueField =
  | 'operator'
  | 'machine'
  | 'hex'
  | 'size'
  | 'side'
  | 'cycle'
  | 'cycleMinutes'
  | 'cycleSeconds'
  | 'timeIn'
  | 'timeOut'
  | 'partsCount'
  | 'productionHours';

export type ValidationIssueCode =
  | 'operator_required'
  | 'machine_required'
  | 'hex_required'
  | 'hex_range'
  | 'size_required'
  | 'cycle_required'
  | 'cycle_seconds_range'
  | 'cycle_zero'
  | 'parts_required'
  | 'parts_positive'
  | 'time_required'
  | 'time_order'
  | 'cycle_low'
  | 'cycle_high'
  | 'hours_exceed_shift'
  | 'parts_high';

export type ValidationIssue = {
  severity: ValidationSeverity;
  code: ValidationIssueCode;
  field: ValidationIssueField;
  message: string;
};

export type ValidationReport = {
  hard: ValidationIssue[];
  soft: ValidationIssue[];
  complete: boolean;
};

export type ValidationContext = {
  shift: Shift;
  shiftWindowMinutes?: number;
};

function issue(
  severity: ValidationSeverity,
  code: ValidationIssueCode,
  field: ValidationIssueField,
  message: string,
): ValidationIssue {
  return { severity, code, field, message };
}

export function timeToMinutes(value: string): number | null {
  if (value.trim() === '') return null;

  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (match === null) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

export function shiftWindowMinutes(context: ValidationContext): number {
  if (context.shiftWindowMinutes !== undefined) {
    return context.shiftWindowMinutes;
  }

  const defaults = defaultShiftTimes[context.shift];
  const timeIn = timeToMinutes(defaults.timeIn);
  const timeOut = timeToMinutes(defaults.timeOut);

  if (timeIn === null || timeOut === null || timeOut <= timeIn) return 0;

  return timeOut - timeIn;
}

export function cycleSeconds(entry: CncEntry): number | null {
  const hasCycleValue =
    entry.cycleMinutes !== null || entry.cycleSeconds !== null;

  if (!hasCycleValue) return null;

  const minutes = entry.cycleMinutes ?? 0;
  const seconds = entry.cycleSeconds ?? 0;

  if (minutes < 0) return null;
  if (seconds < 0 || seconds > 59) return null;

  return minutes * 60 + seconds;
}

export function entryProductionHours(entry: CncEntry): number | null {
  const totalCycleSeconds = cycleSeconds(entry);
  const partsCount = entry.partsCount ?? 0;

  if (totalCycleSeconds === null || totalCycleSeconds <= 0) return null;
  if (partsCount <= 0) return null;

  return Math.round(((totalCycleSeconds * partsCount) / 3600) * 100) / 100;
}

export function isCncEntryBlank(
  entry: CncEntry,
  context: ValidationContext,
): boolean {
  const defaults = defaultShiftTimes[context.shift];
  const timeInIsDefault =
    !entry.timeInTouched && entry.timeIn === defaults.timeIn;
  const timeOutIsDefault =
    !entry.timeOutTouched && entry.timeOut === defaults.timeOut;

  return (
    entry.operator.trim() === '' &&
    entry.machine === '' &&
    entry.hex === null &&
    entry.size.trim() === '' &&
    (entry.cycleMinutes === null || entry.cycleMinutes === 0) &&
    (entry.cycleSeconds === null || entry.cycleSeconds === 0) &&
    (entry.partsCount === null || entry.partsCount === 0) &&
    timeInIsDefault &&
    timeOutIsDefault
  );
}

export function validateEntry(
  entry: CncEntry,
  context: ValidationContext,
): ValidationReport {
  const hard: ValidationIssue[] = [];
  const soft: ValidationIssue[] = [];
  const isBlank = isCncEntryBlank(entry, context);

  if (isBlank) {
    return { hard, soft, complete: false };
  }

  if (entry.operator.trim() === '') {
    hard.push(issue('hard', 'operator_required', 'operator', 'Required'));
  }

  if (!(machines as readonly string[]).includes(entry.machine)) {
    hard.push(issue('hard', 'machine_required', 'machine', 'Required'));
  }

  if (entry.hex === null) {
    hard.push(issue('hard', 'hex_required', 'hex', 'Required'));
  } else if (entry.hex < 0 || entry.hex > 200) {
    hard.push(
      issue('hard', 'hex_range', 'hex', 'Hex must be between 0 and 200.'),
    );
  }

  if (entry.size.trim() === '') {
    hard.push(issue('hard', 'size_required', 'size', 'Required'));
  }

  const hasCycleValue =
    entry.cycleMinutes !== null || entry.cycleSeconds !== null;
  const totalCycleSeconds = cycleSeconds(entry);

  if (!hasCycleValue) {
    hard.push(issue('hard', 'cycle_required', 'cycle', 'Required'));
  } else if (
    entry.cycleSeconds !== null &&
    (entry.cycleSeconds < 0 || entry.cycleSeconds > 59)
  ) {
    hard.push(
      issue(
        'hard',
        'cycle_seconds_range',
        'cycleSeconds',
        'Seconds should be 0 to 59.',
      ),
    );
  } else if (entry.cycleMinutes !== null && entry.cycleMinutes < 0) {
    hard.push(
      issue('hard', 'cycle_zero', 'cycleMinutes', "Cycle time can't be zero."),
    );
  } else if (totalCycleSeconds === 0) {
    hard.push(
      issue('hard', 'cycle_zero', 'cycle', "Cycle time can't be zero."),
    );
  }

  if (entry.partsCount === null) {
    hard.push(issue('hard', 'parts_required', 'partsCount', 'Required'));
  } else if (entry.partsCount <= 0) {
    hard.push(issue('hard', 'parts_positive', 'partsCount', 'Required'));
  }

  const timeInMinutes = timeToMinutes(entry.timeIn);
  const timeOutMinutes = timeToMinutes(entry.timeOut);

  if (timeInMinutes === null || timeOutMinutes === null) {
    hard.push(issue('hard', 'time_required', 'timeIn', 'Required'));
  } else if (timeOutMinutes <= timeInMinutes) {
    hard.push(
      issue(
        'hard',
        'time_order',
        'timeOut',
        'Time Out should be after Time In.',
      ),
    );
  }

  if (totalCycleSeconds !== null && totalCycleSeconds > 0) {
    if (totalCycleSeconds < 20) {
      soft.push(
        issue(
          'soft',
          'cycle_low',
          'cycle',
          'Cycle time looks low - please confirm.',
        ),
      );
    }

    if (totalCycleSeconds > 600) {
      soft.push(
        issue(
          'soft',
          'cycle_high',
          'cycle',
          'Cycle time looks high - please confirm.',
        ),
      );
    }
  }

  if (entry.partsCount !== null && entry.partsCount > 1000) {
    soft.push(
      issue(
        'soft',
        'parts_high',
        'partsCount',
        'Please check if count is correct.',
      ),
    );
  }

  const hours = entryProductionHours(entry);
  if (hours !== null && hours * 60 > shiftWindowMinutes(context)) {
    soft.push(
      issue(
        'soft',
        'hours_exceed_shift',
        'productionHours',
        'Hours exceed shift window - please check count or cycle.',
      ),
    );
  }

  return {
    hard,
    soft,
    complete: hard.length === 0,
  };
}

export function isCncEntryComplete(
  entry: CncEntry,
  context: ValidationContext,
): boolean {
  return (
    !isCncEntryBlank(entry, context) && validateEntry(entry, context).complete
  );
}

export function validCncEntries(state: ProductionEntryState): CncEntry[] {
  const context = { shift: state.shift };
  return state.cncEntries.filter((entry) => isCncEntryComplete(entry, context));
}

export function invalidNonBlankCncEntries(
  state: ProductionEntryState,
): CncEntry[] {
  const context = { shift: state.shift };
  return state.cncEntries.filter(
    (entry) =>
      !isCncEntryBlank(entry, context) &&
      validateEntry(entry, context).hard.length > 0,
  );
}
