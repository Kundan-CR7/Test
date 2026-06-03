import type { ProductionEntryState, CncEntry, Machine } from './types';
import {
  cycleSeconds as validationCycleSeconds,
  entryProductionHours as validationEntryProductionHours,
  invalidNonBlankCncEntries as validationInvalidNonBlankCncEntries,
  isCncEntryBlank as validationIsCncEntryBlank,
  isCncEntryComplete as validationIsCncEntryComplete,
  validCncEntries as validationValidCncEntries,
} from './validation';

export type CncEntryCompletenessReport = {
  valid: number;
  incomplete: number;
  blank: number;
  total: number;
};

export type PreviewCtaState = 'disabled' | 'warning' | 'ready';

export type CncSummaryTotals = {
  entries: number;
  sides: number;
  estimatedParts: number;
  hours: number;
};

export type CncSummaryEntry = {
  entry: CncEntry;
  originalIndex: number;
};

export type CncMachineSummaryGroup = {
  machine: Machine;
  entries: CncSummaryEntry[];
  totals: CncSummaryTotals;
};

export type CncOperatorSummaryGroup = {
  operator: string;
  machines: CncMachineSummaryGroup[];
  totals: CncSummaryTotals;
};

type MutableCncMachineSummaryGroup = CncMachineSummaryGroup & {
  firstEntryIndex: number;
  machineRank: number;
};

type MutableCncOperatorSummaryGroup = {
  operator: string;
  firstEntryIndex: number;
  primaryMachineRank: number;
  machineMap: Map<Machine, MutableCncMachineSummaryGroup>;
  totals: CncSummaryTotals;
};

export function cycleSeconds(entry: CncEntry): number | null {
  return validationCycleSeconds(entry);
}

export function entryProductionHours(entry: CncEntry): number | null {
  return validationEntryProductionHours(entry);
}

export function isCncEntryComplete(
  entry: CncEntry,
  state?: ProductionEntryState,
): boolean {
  return validationIsCncEntryComplete(entry, {
    shift: state?.shift ?? 'morning',
  });
}

export function isCncEntryBlankForRemoval(
  entry: CncEntry,
  state: ProductionEntryState,
): boolean {
  return isCncEntryBlank(entry, state);
}

export function isCncEntryBlank(
  entry: CncEntry,
  state: ProductionEntryState,
): boolean {
  return validationIsCncEntryBlank(entry, { shift: state.shift });
}

export function cncEntryCompletenessReport(
  state: ProductionEntryState,
): CncEntryCompletenessReport {
  const invalidEntries = validationInvalidNonBlankCncEntries(state);
  const validEntries = validationValidCncEntries(state);
  const blank =
    state.cncEntries.length - invalidEntries.length - validEntries.length;

  return {
    valid: validEntries.length,
    incomplete: invalidEntries.length,
    blank,
    total: state.cncEntries.length,
  };
}

export function invalidNonBlankCncEntries(
  state: ProductionEntryState,
): CncEntry[] {
  return validationInvalidNonBlankCncEntries(state);
}

export function validCncEntries(state: ProductionEntryState): CncEntry[] {
  return validationValidCncEntries(state);
}

export function incompleteCncEntryCount(state: ProductionEntryState): number {
  return validationInvalidNonBlankCncEntries(state).length;
}

export function totalCncHours(state: ProductionEntryState): number {
  const total = validCncEntries(state).reduce((sum, entry) => {
    const hours = entryProductionHours(entry);
    return hours === null ? sum : sum + hours;
  }, 0);

  return Math.round(total * 100) / 100;
}

export function totalSummaryCncHours(state: ProductionEntryState): number {
  return cncSummaryTotals(state).hours;
}

function createEmptyCncSummaryTotals(): CncSummaryTotals {
  return {
    entries: 0,
    sides: 0,
    estimatedParts: 0,
    hours: 0,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function finalizeTotals(totals: CncSummaryTotals): CncSummaryTotals {
  return {
    entries: totals.entries,
    sides: totals.sides,
    estimatedParts: totals.sides / 2,
    hours: round2(totals.hours),
  };
}

function addEntryToTotals(totals: CncSummaryTotals, entry: CncEntry): void {
  totals.entries += 1;
  totals.sides += entry.partsCount ?? 0;
  totals.hours += entryProductionHours(entry) ?? 0;
  totals.estimatedParts = totals.sides / 2;
}

function machineRank(machine: Machine): number {
  const match = /^M(\d+)$/.exec(machine);
  return match === null ? Number.MAX_SAFE_INTEGER : Number(match[1]);
}

function indexedValidCncEntries(
  state: ProductionEntryState,
): CncSummaryEntry[] {
  return state.cncEntries.reduce<CncSummaryEntry[]>((entries, entry, index) => {
    if (isCncEntryComplete(entry, state)) {
      entries.push({ entry, originalIndex: index });
    }

    return entries;
  }, []);
}

export function cncSummaryTotals(
  state: ProductionEntryState,
): CncSummaryTotals {
  const totals = createEmptyCncSummaryTotals();

  indexedValidCncEntries(state).forEach(({ entry }) => {
    addEntryToTotals(totals, entry);
  });

  return finalizeTotals(totals);
}

export function cncOperatorSummaryGroups(
  state: ProductionEntryState,
): CncOperatorSummaryGroup[] {
  const operatorMap = new Map<string, MutableCncOperatorSummaryGroup>();

  indexedValidCncEntries(state).forEach(({ entry, originalIndex }) => {
    const operator = entry.operator.trim();
    const operatorKey = operator.toLocaleLowerCase();
    const rank = machineRank(entry.machine);

    let operatorGroup = operatorMap.get(operatorKey);
    if (operatorGroup === undefined) {
      operatorGroup = {
        operator,
        firstEntryIndex: originalIndex,
        primaryMachineRank: rank,
        machineMap: new Map(),
        totals: createEmptyCncSummaryTotals(),
      };
      operatorMap.set(operatorKey, operatorGroup);
    }

    operatorGroup.firstEntryIndex = Math.min(
      operatorGroup.firstEntryIndex,
      originalIndex,
    );
    operatorGroup.primaryMachineRank = Math.min(
      operatorGroup.primaryMachineRank,
      rank,
    );
    addEntryToTotals(operatorGroup.totals, entry);

    let machineGroup = operatorGroup.machineMap.get(entry.machine);
    if (machineGroup === undefined) {
      machineGroup = {
        machine: entry.machine,
        machineRank: rank,
        firstEntryIndex: originalIndex,
        entries: [],
        totals: createEmptyCncSummaryTotals(),
      };
      operatorGroup.machineMap.set(entry.machine, machineGroup);
    }

    machineGroup.firstEntryIndex = Math.min(
      machineGroup.firstEntryIndex,
      originalIndex,
    );
    machineGroup.entries.push({ entry, originalIndex });
    addEntryToTotals(machineGroup.totals, entry);
  });

  return Array.from(operatorMap.values())
    .sort((left, right) => {
      const primaryMachineDiff =
        left.primaryMachineRank - right.primaryMachineRank;
      if (primaryMachineDiff !== 0) return primaryMachineDiff;

      const entryIndexDiff = left.firstEntryIndex - right.firstEntryIndex;
      if (entryIndexDiff !== 0) return entryIndexDiff;

      return left.operator.localeCompare(right.operator);
    })
    .map((operatorGroup) => ({
      operator: operatorGroup.operator,
      totals: finalizeTotals(operatorGroup.totals),
      machines: Array.from(operatorGroup.machineMap.values())
        .sort((left, right) => {
          const machineDiff = left.machineRank - right.machineRank;
          if (machineDiff !== 0) return machineDiff;
          return left.firstEntryIndex - right.firstEntryIndex;
        })
        .map((machineGroup) => ({
          machine: machineGroup.machine,
          entries: [...machineGroup.entries].sort(
            (left, right) => left.originalIndex - right.originalIndex,
          ),
          totals: finalizeTotals(machineGroup.totals),
        })),
    }));
}

function toCount(value: number | null | undefined): number {
  return value ?? 0;
}

export function totalBurma(state: ProductionEntryState): number {
  return (
    toCount(state.burma.burma1) +
    toCount(state.burma.burma2) +
    toCount(state.burma.burma3)
  );
}

export function hasPreviewableProductionData(
  state: ProductionEntryState,
): boolean {
  const report = cncEntryCompletenessReport(state);

  return report.valid > 0 || report.incomplete > 0 || totalBurma(state) > 0;
}

export function previewCtaState(state: ProductionEntryState): PreviewCtaState {
  const report = cncEntryCompletenessReport(state);

  if (!hasPreviewableProductionData(state)) return 'disabled';
  if (report.incomplete > 0) return 'warning';
  return 'ready';
}

export function hasRepairData(state: ProductionEntryState): boolean {
  return (
    state.repair.person.trim() !== '' ||
    state.repair.count !== null ||
    state.repair.note.trim() !== ''
  );
}

export function hasNotes(state: ProductionEntryState): boolean {
  return state.notes.trim() !== '';
}

export function cncEntryCount(state: ProductionEntryState): number {
  return state.cncEntries.length;
}

export function cncIdentitySubtitle(entry: CncEntry): string {
  const parts: string[] = [];
  if (entry.operator) parts.push(entry.operator);
  if (entry.machine) parts.push(entry.machine);
  if (entry.size) parts.push(entry.size);
  if (entry.side !== '') parts.push(`Side ${entry.side}`);

  return parts.join(' - ');
}
