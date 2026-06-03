import {
  basePeople,
  createEmptyCncEntry,
  createInitialState,
  machines,
  toDateInputValue,
} from './reducer';
import { loadCustomPeople, loadDraft } from './persistence';
import type {
  BurmaField,
  CncEntry,
  Machine,
  ProductionEntryState,
  Shift,
  SideType,
} from './types';
import { mergePeople, sanitizeCustomPeople } from '../utils/people';

export type DraftBootState = {
  initialState: ProductionEntryState;
  rolloverDraft: ProductionEntryState | null;
  draftSaveEnabled: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeShift(value: unknown): Shift {
  return value === 'evening' ? 'evening' : 'morning';
}

function normalizeMachine(value: unknown): Machine {
  if (
    typeof value === 'string' &&
    (value === '' || (machines as readonly string[]).includes(value))
  ) {
    return value as Machine;
  }

  return '';
}

function normalizeSize(value: unknown): string {
  const size = normalizeString(value).trim();
  const legacyMap: Record<string, string> = {
    '1 inch': '1',
    '2 inch': '2',
    '3 inch': '3',
    '4 inch': '4',
    '1-1/2': '1 1/2',
    '2-1/2': '2 1/2',
  };

  return legacyMap[size] ?? size;
}

function normalizeSide(value: unknown): SideType {
  if (
    value === '' ||
    value === 'Male' ||
    value === 'Female' ||
    value === 'Groove' ||
    value === 'Custom'
  ) {
    return value;
  }

  return '';
}

function normalizeCncEntry(value: unknown, shift: Shift): CncEntry {
  const blank = createEmptyCncEntry(shift);
  if (!isRecord(value)) return blank;

  return {
    id:
      typeof value.id === 'string' && value.id.trim() !== ''
        ? value.id
        : blank.id,
    operator: normalizeString(value.operator),
    machine: normalizeMachine(value.machine),
    hex: normalizeNumber(value.hex),
    size: normalizeSize(value.size),
    side: normalizeSide(value.side),
    cycleMinutes: normalizeNumber(value.cycleMinutes),
    cycleSeconds: normalizeNumber(value.cycleSeconds),
    timeIn: normalizeString(value.timeIn) || blank.timeIn,
    timeOut: normalizeString(value.timeOut) || blank.timeOut,
    partsCount: normalizeNumber(value.partsCount),
    productionHours: normalizeNumber(value.productionHours),
    timeInTouched:
      typeof value.timeInTouched === 'boolean' ? value.timeInTouched : false,
    timeOutTouched:
      typeof value.timeOutTouched === 'boolean' ? value.timeOutTouched : false,
  };
}

function normalizeBurmaOperators(
  burma: Record<string, unknown>,
): Record<BurmaField, string> {
  const operators = isRecord(burma.operators) ? burma.operators : {};
  const legacyPerson = normalizeString(burma.person);

  return {
    burma1: normalizeString(operators.burma1) || legacyPerson,
    burma2: normalizeString(operators.burma2) || legacyPerson,
    burma3: normalizeString(operators.burma3) || legacyPerson,
  };
}

export function normalizeHydratedDraft(
  draft: unknown,
  storedCustomPeople: string[],
): ProductionEntryState | null {
  if (!isRecord(draft) || typeof draft.date !== 'string') return null;

  const shift = normalizeShift(draft.shift);
  const draftCustomPeople = Array.isArray(draft.customPeople)
    ? draft.customPeople.filter(
        (value): value is string => typeof value === 'string',
      )
    : [];
  const customPeople = sanitizeCustomPeople(
    [...storedCustomPeople, ...draftCustomPeople],
    basePeople,
  );

  const entries = Array.isArray(draft.cncEntries)
    ? draft.cncEntries.map((entry) => normalizeCncEntry(entry, shift))
    : [];

  const burma = isRecord(draft.burma) ? draft.burma : {};
  const repair = isRecord(draft.repair) ? draft.repair : {};
  const ui = isRecord(draft.ui) ? draft.ui : {};

  return {
    date: draft.date,
    shift,
    customPeople,
    people: mergePeople(basePeople, customPeople),
    cncEntries: entries.length > 0 ? entries : [createEmptyCncEntry(shift)],
    burma: {
      operators: normalizeBurmaOperators(burma),
      burma1: normalizeNumber(burma.burma1),
      burma2: normalizeNumber(burma.burma2),
      burma3: normalizeNumber(burma.burma3),
    },
    repair: {
      person: normalizeString(repair.person),
      count: normalizeNumber(repair.count),
      note: normalizeString(repair.note),
    },
    notes: normalizeString(draft.notes),
    ui: {
      incompleteHighlights:
        typeof ui.incompleteHighlights === 'boolean'
          ? ui.incompleteHighlights
          : false,
    },
  };
}

export function createDraftBootState(now = new Date()): DraftBootState {
  const customPeople = loadCustomPeople();
  const draft = normalizeHydratedDraft(loadDraft(), customPeople);
  const today = toDateInputValue(now);

  if (draft === null) {
    return {
      initialState: createInitialState(now, customPeople),
      rolloverDraft: null,
      draftSaveEnabled: true,
    };
  }

  if (draft.date === today) {
    return {
      initialState: draft,
      rolloverDraft: null,
      draftSaveEnabled: true,
    };
  }

  return {
    initialState: createInitialState(now, customPeople),
    rolloverDraft: draft,
    draftSaveEnabled: false,
  };
}
