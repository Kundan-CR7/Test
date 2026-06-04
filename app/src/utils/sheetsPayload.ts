import type { ProductionEntryState } from '../state/types';
import {
  cncSummaryTotals,
  entryProductionHours,
  totalBurma,
  validCncEntries,
} from '../state/selectors';

export type SheetsCncEntryRow = {
  operator: string;
  machine: string;
  hex: number | null;
  size: string;
  side: string;
  cycleMinutes: number | null;
  cycleSeconds: number | null;
  timeIn: string;
  timeOut: string;
  partsCount: number | null;
  productionHours: number | null;
};

export type ProductionSheetsPayload = {
  submittedAt: string;
  productionDate: string;
  shift: string;

  cncOperator: string;

  cncEntryCount: number;
  cncTotalHours: number;
  cncTotalSides: number;

  burma1Operator: string;
  burma1: number | null;

  burma2Operator: string;
  burma2: number | null;

  burma3Operator: string;
  burma3: number | null;

  burmaTotal: number;

  repairPerson: string;
  repairCount: number | null;
  repairNote: string;

  notes: string;
};

export function buildProductionSheetsPayload(
  state: ProductionEntryState,
  generatedAt: Date,
): ProductionSheetsPayload {
  const totals = cncSummaryTotals(state);
  const cncRows: SheetsCncEntryRow[] = validCncEntries(state).map((entry) => ({
    operator: entry.operator,
    machine: entry.machine,
    hex: entry.hex,
    size: entry.size,
    side: entry.side,
    cycleMinutes: entry.cycleMinutes,
    cycleSeconds: entry.cycleSeconds,
    timeIn: entry.timeIn,
    timeOut: entry.timeOut,
    partsCount: entry.partsCount,
    productionHours: entryProductionHours(entry),
  }));

  return {
  submittedAt: generatedAt.toISOString(),
  productionDate: state.date,
  shift: state.shift,

  cncOperator: cncRows[0]?.operator ?? '',

  cncEntryCount: totals.entries,
  cncTotalHours: totals.hours,
  cncTotalSides: totals.sides,

  burma1Operator: state.burma.operators.burma1,
  burma1: state.burma.burma1,

  burma2Operator: state.burma.operators.burma2,
  burma2: state.burma.burma2,

  burma3Operator: state.burma.operators.burma3,
  burma3: state.burma.burma3,

  burmaTotal: totalBurma(state),

  repairPerson: state.repair.person,
  repairCount: state.repair.count,
  repairNote: state.repair.note,

  notes: state.notes,
};
}