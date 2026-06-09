import type { ProductionEntryState } from '../state/types';
import {
  cncSummaryTotals,
  cycleSeconds,
  entryProductionHours,
  totalBurma,
  validCncEntries,
} from '../state/selectors';
import { defaultShiftTimes } from '../state/reducer';

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

// =============================================================================
// New raw per-record production log rows for the configured Logs tab (or GOOGLE_SHEET_RAW_LOG_TAB_NAME if set)
// One row per individual production record (CNC entry / Burma station / Repair).
// Uses MachineID convention for record type (M1-M8 / B1/B2/B3 / Repair).
// Quantities use TotalParts for all record types.
// Matches target manufacturing log schema: removed EntryType/BurmaQuantity/RepairCount/RepairNote,
// reordered, Date=DD-MM-YYYY, Shift=Day/Evening, PartSide=OP1 for B/Repair (Part_ID left blank unless provided from frontend),
// default manufacturing fields populated (0 or computed) to visually match historical rows.
// =============================================================================

export const RAW_LOG_HEADERS = [
  "Date",
  "Month",
  "Shift",
  "MachineID",
  "Operator",
  "Part_ID",
  "PartSide",
  "IdealCycle_sec",
  "MachineCycle_sec",
  "TotalParts",
  "ShiftStart",
  "ShiftEnd",
  "Downtime_PowerCut_min",
  "Downtime_MaterialShortage_min",
  "Downtime_MachineBreakdown/setting_min",
  "Downtime_Others_min",
  "TotalDowntime_min",
  "DowntimeReason",
  "Notes",
  "PlannedTime_min",
  "RunTime_min",
  "MachineRuntime_min",
  "IdealMachineTime_min",
  "CycleDiff_pct",
  "TimeFlag",
  "Availability_pct",
  "Performance_pct",
  "Quality_pct",
  "OEE_like",
  "Parts_per_Hour",
  "TotalProduction_hr"
] as const;

export type ProductionLogRow = {
  [K in typeof RAW_LOG_HEADERS[number]]: string | number | null;
};

function createEmptyRawRow(): ProductionLogRow {
  const row = {} as ProductionLogRow;
  for (const header of RAW_LOG_HEADERS) {
    (row as any)[header] = '';
  }
  return row;
}

function formatDateForLog(yyyy_mm_dd: string): string {
  if (!yyyy_mm_dd) return '';
  const [y, m, d] = yyyy_mm_dd.split('-');
  if (!y || !m || !d) return yyyy_mm_dd;
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${dd}-${mm}-${y}`; // DD-MM-YYYY text for first Date column (historical)
}

function formatShiftForLog(s: string): string {
  if (s === 'morning') return 'Day';
  if (s === 'evening') return 'Evening';
  return s;
}

function timeToMinutes(t: string): number {
  if (!t || typeof t !== 'string') return 0;
  const [h, m] = t.split(':').map((n) => parseInt(n, 10) || 0);
  return h * 60 + m;
}

function createBaseRawRow(
  date: string,
  month: string,
  shift: string,
  machineId: string,
  operator: string,
  notes: string,
): ProductionLogRow {
  const row = createEmptyRawRow();
  const formattedDate = formatDateForLog(date);
  row.Date = formattedDate;
  row.Month = month;
  row.Shift = formatShiftForLog(shift);
  row.MachineID = machineId;
  row.Operator = operator;
  row.Notes = notes;
  row.Part_ID = '';

  // No blanket defaults for PlannedTime_min, RunTime_min, MachineRuntime_min,
  // IdealMachineTime_min, TimeFlag, Availability_pct, Quality_pct, MachineCycle_sec, etc.
  // They remain empty (as initialized in createEmptyRawRow) unless actual values
  // can be derived from user input in the frontend form.
  //
  // Downtime fields kept at 0 (historical preference) since not mentioned in this request.
  // Downtime fields: 0 (not blank)
  row.Downtime_PowerCut_min = 0;
  row.Downtime_MaterialShortage_min = 0;
  row['Downtime_MachineBreakdown/setting_min'] = 0;
  row.Downtime_Others_min = 0;
  row.TotalDowntime_min = 0;

  return row;
}

export function buildProductionLogRows(
  state: ProductionEntryState,
  _generatedAt: Date,
): ProductionLogRow[] {
  const rows: ProductionLogRow[] = [];

  const date = state.date;
  const month = date.slice(0, 7); // YYYY-MM (kept for grouping)
  const shift = state.shift;
  const globalNotes = state.notes || '';

  // Common formatting for ShiftStart/ShiftEnd to match historical manufacturing log exactly
  // for ALL row types (CNC, Burma, Repair). Format: "DD-MM-YYYY HH:MM" (e.g. "06-06-2026 8:30")
  const dateForShift = formatDateForLog(date);
  const fmtTime = (t: string) => (t || '').replace(/^0/, '');

  // --- CNC rows: one per valid (complete, non-blank) entry ---
  const validCnc = validCncEntries(state);
  for (const entry of validCnc) {
    const cycSec = cycleSeconds(entry);
    const prodHr = entryProductionHours(entry) || 0;

    const row = createBaseRawRow(
      date,
      month,
      shift,
      entry.machine || '',
      entry.operator || '',
      globalNotes,
    );

    // PartSide left blank (no default). Only populate if a dedicated partSide / operation field is provided from the frontend/state.

    row.MachineCycle_sec = cycSec ?? 0;
    row.TotalParts = entry.partsCount ?? 0;

    const machineCycleSec = cycSec ?? 0;
    const totalParts = entry.partsCount ?? 0;

    // Use full datetime for ShiftStart/ShiftEnd (consistent historical format for ALL row types)
    row.ShiftStart = String(`${dateForShift} ${fmtTime(entry.timeIn)}`);
    row.ShiftEnd = String(`${dateForShift} ${fmtTime(entry.timeOut)}`);
    row.TotalProduction_hr = prodHr;

    // Enrich Notes per CNC row with metadata (historical rows contain useful context like "Hex 41; size 1 inch; male; cycle 1m39s.")
    const metaParts: string[] = [];
    if (entry.hex != null) metaParts.push(`Hex ${entry.hex}`);
    if (entry.size) metaParts.push(`size ${entry.size}`);
    if (entry.side) metaParts.push(entry.side.toLowerCase());
    const cycForNote = cycleSeconds(entry);
    if (cycForNote != null && cycForNote > 0) {
      const mins = Math.floor(cycForNote / 60);
      const secs = cycForNote % 60;
      metaParts.push(`cycle ${mins}m${secs}s`);
    }
    if (metaParts.length > 0) {
      const meta = metaParts.join('; ');
      const existing = String(row.Notes || '').trim();
      row.Notes = existing ? `${existing} | ${meta}` : meta;
    }

    // Manufacturing metric calculations for CNC rows only (RunTime_min and MachineRuntime_min)
    // PlannedTime_min left unchanged (current logic / empty)
    const startMin = timeToMinutes(entry.timeIn || '');
    const endMin = timeToMinutes(entry.timeOut || '');
    const runTimeMin = Math.max(0, endMin - startMin);
    const machineRuntimeMin = (machineCycleSec * totalParts) / 60;

    row.RunTime_min = Math.round(runTimeMin);
    row.MachineRuntime_min = Math.round(machineRuntimeMin * 100) / 100;

    // Temporary logs for verification during testing (as specified)
    console.log('CNC metric calc verification:', {
      MachineCycle_sec: machineCycleSec,
      TotalParts: totalParts,
      TimeIn: entry.timeIn,
      TimeOut: entry.timeOut,
      RunTime_min: row.RunTime_min,
      MachineRuntime_min: row.MachineRuntime_min
    });

    const tp = Number(row.TotalParts) || 0;
    const hr = Number(row.TotalProduction_hr) || 0;
    row.Parts_per_Hour = hr > 0 ? Math.round((tp / hr) * 100) / 100 : 0;

    rows.push(row);
  }

  // --- Burma rows: one per station with positive quantity ---
  // MachineID = B1/B2/B3 (per spec)
  // Part_ID left blank (no defaults). Only fill if provided from frontend.
  const burmaStations: Array<{ label: string; field: 'burma1' | 'burma2' | 'burma3' }> = [
    { label: 'B1', field: 'burma1' },
    { label: 'B2', field: 'burma2' },
    { label: 'B3', field: 'burma3' },
  ];

  for (const station of burmaStations) {
    const qty = state.burma[station.field];
    if (qty != null && qty > 0) {
      const op = state.burma.operators[station.field] || '';
      const row = createBaseRawRow(
        date,
        month,
        shift,
        station.label,
        op,
        globalNotes,
      );
      row.TotalParts = qty;
      // Part_ID left blank (per current requirement: no defaults, only what comes from frontend)

      // Use the common dateForShift + fmtTime (defined once for consistent formatting across all row types)
      const shiftDefaults = defaultShiftTimes[shift];
      row.ShiftStart = String(`${dateForShift} ${fmtTime(shiftDefaults.timeIn)}`);
      row.ShiftEnd = String(`${dateForShift} ${fmtTime(shiftDefaults.timeOut)}`);

      // Notes default for Burma (historical)
      const burmaDefaultNote = 'Burma production; cycle time not provided.';
      const existing = String(row.Notes || '').trim();
      row.Notes = existing ? `${existing} | ${burmaDefaultNote}` : burmaDefaultNote;

      rows.push(row);
    }
  }

  // --- Repair row: 0 or 1 if has meaningful data ---
  // MachineID = Repair (per spec)
  // Part_ID left blank (no defaults from repair note or elsewhere)
  const repair = state.repair;
  const hasRepair =
    (repair.count != null && repair.count > 0) ||
    repair.person.trim() !== '' ||
    repair.note.trim() !== '';

  if (hasRepair) {
    const repairNote = repair.note && repair.note.trim() ? repair.note.trim() : '';
    // Pass only globalNotes to base. The repair-specific note (repairNote) will only be
    // considered for the Repair row's final Notes (see below). This prevents it from
    // affecting CNC or Burma rows.

    const row = createBaseRawRow(
      date,
      month,
      shift,
      'Repair',
      repair.person || '',
      globalNotes,
    );
    row.TotalParts = repair.count ?? 0;
    // Part_ID left blank (no logic/defaults; only populate if a partId field is provided from frontend)

    // Use the common dateForShift + fmtTime (defined once for consistent formatting across all row types)
    const shiftDefaults = defaultShiftTimes[shift];
    row.ShiftStart = String(`${dateForShift} ${fmtTime(shiftDefaults.timeIn)}`);
    row.ShiftEnd = String(`${dateForShift} ${fmtTime(shiftDefaults.timeOut)}`);

    // Notes for Repair row ONLY.
    // The raw repair note (from frontend) is NOT merged here (to avoid it leaking into
    // CNC or Burma rows' Notes). Only the generic repair template + global notes (if any).
    const partForNote = String(row.Part_ID || '').trim();
    const repairDefaultNote = partForNote
      ? `Repair work; ${partForNote}; cycle time not provided.`
      : 'Repair work; cycle time not provided.';
    const existing = String(globalNotes || '').trim();
    row.Notes = existing ? `${existing} | ${repairDefaultNote}` : repairDefaultNote;

    rows.push(row);
  }

  return rows;
}