import type {
  BurmaField,
  CncEntry,
  CncFieldUpdate,
  ProductionEntryState,
  RepairFieldUpdate,
  Shift,
} from './types';
import {
  addCustomPerson,
  hasPerson,
  mergePeople,
  normalizePersonName,
  sanitizeCustomPeople,
} from '../utils/people';

export const basePeople = ['Radhe', 'Sanju', 'Avinash', 'Manish', 'Kamal'];

export const defaultShiftTimes = {
  morning: { timeIn: '08:30', timeOut: '19:00' },
  evening: { timeIn: '19:00', timeOut: '21:30' },
} satisfies Record<Shift, { timeIn: string; timeOut: string }>;

export const machines = [
  'M1',
  'M2',
  'M3',
  'M4',
  'M5',
  'M6',
  'M7',
  'M8',
] as const;
export const commonHexValues = [37, 41, 46, 50, 60, 65] as const;

type CreateBlankCncEntryParams = {
  shift: Shift;
  id?: string;
  timeIn?: string;
  timeOut?: string;
  timeInTouched?: boolean;
  timeOutTouched?: boolean;
};

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createBlankCncEntry({
  shift,
  id = crypto.randomUUID(),
  timeIn,
  timeOut,
  timeInTouched = false,
  timeOutTouched = false,
}: CreateBlankCncEntryParams): CncEntry {
  const defaults = defaultShiftTimes[shift];
  return {
    id,
    operator: '',
    machine: '',
    hex: null,
    size: '',
    side: '',
    cycleMinutes: null,
    cycleSeconds: null,
    timeIn: timeIn ?? defaults.timeIn,
    timeOut: timeOut ?? defaults.timeOut,
    partsCount: null,
    productionHours: null,
    timeInTouched,
    timeOutTouched,
  };
}

export function createEmptyCncEntry(
  shift: Shift,
  id = crypto.randomUUID(),
): CncEntry {
  return createBlankCncEntry({ shift, id });
}

function createAddedCncEntry(state: ProductionEntryState): CncEntry {
  const previousEntry = state.cncEntries[state.cncEntries.length - 1];

  if (previousEntry === undefined) {
    return createBlankCncEntry({ shift: state.shift });
  }

  const defaults = defaultShiftTimes[state.shift];
  const timeInIsShiftDefault =
    !previousEntry.timeInTouched && previousEntry.timeIn === defaults.timeIn;
  const timeOutIsShiftDefault =
    !previousEntry.timeOutTouched && previousEntry.timeOut === defaults.timeOut;

  return createBlankCncEntry({
    shift: state.shift,
    timeIn: timeInIsShiftDefault ? defaults.timeIn : previousEntry.timeIn,
    timeOut: timeOutIsShiftDefault ? defaults.timeOut : previousEntry.timeOut,
    timeInTouched: !timeInIsShiftDefault,
    timeOutTouched: !timeOutIsShiftDefault,
  });
}

function createDuplicatedCncEntry(source: CncEntry): CncEntry {
  return {
    ...source,
    id: crypto.randomUUID(),
    partsCount: null,
    productionHours: null,
  };
}

export function createInitialState(
  now = new Date(),
  customPeople: string[] = [],
): ProductionEntryState {
  const cleanCustomPeople = sanitizeCustomPeople(customPeople, basePeople);

  return {
    date: toDateInputValue(now),
    shift: 'morning',
    customPeople: cleanCustomPeople,
    people: mergePeople(basePeople, cleanCustomPeople),
    cncEntries: [createEmptyCncEntry('morning')],
    burma: {
      operators: { burma1: '', burma2: '', burma3: '' },
      burma1: null,
      burma2: null,
      burma3: null,
    },
    repair: { person: '', count: null, note: '' },
    notes: '',
    ui: { incompleteHighlights: false },
  };
}

export type ProductionEntryAction =
  | { type: 'STATE_REPLACE'; state: ProductionEntryState }
  | { type: 'STATE_RESET_FRESH'; now?: Date; customPeople?: string[] }
  | { type: 'DATE_SET'; date: string }
  | { type: 'SHIFT_SET'; shift: Shift }
  | ({ type: 'CNC_FIELD_SET'; entryId: string } & CncFieldUpdate)
  | { type: 'CNC_ENTRY_ADD' }
  | { type: 'CNC_ENTRY_REMOVE'; entryId: string }
  | { type: 'CNC_ENTRY_DUPLICATE'; entryId: string }
  | { type: 'CNC_ENTRY_RESTORE'; entry: CncEntry; index: number }
  | { type: 'PERSON_ADD'; name: string }
  | { type: 'BURMA_SET'; field: BurmaField; value: number | null }
  | { type: 'BURMA_OPERATOR_SET'; field: BurmaField; value: string }
  | ({ type: 'REPAIR_SET' } & RepairFieldUpdate)
  | { type: 'NOTES_SET'; value: string }
  | { type: 'UI_INCOMPLETE_HIGHLIGHTS_SET'; value: boolean };

export function productionEntryReducer(
  state: ProductionEntryState,
  action: ProductionEntryAction,
): ProductionEntryState {
  switch (action.type) {
    case 'STATE_REPLACE': {
      return action.state;
    }
    case 'STATE_RESET_FRESH': {
      return createInitialState(action.now ?? new Date(), action.customPeople);
    }
    case 'DATE_SET': {
      if (state.date === action.date) return state;
      return { ...state, date: action.date };
    }
    case 'SHIFT_SET': {
      if (state.shift === action.shift) return state;

      const newShiftDefaults = defaultShiftTimes[action.shift];

      const newEntries = state.cncEntries.map((entry) => {
        let needsUpdate = false;
        let newTimeIn = entry.timeIn;
        let newTimeOut = entry.timeOut;

        if (!entry.timeInTouched) {
          newTimeIn = newShiftDefaults.timeIn;
          needsUpdate = true;
        }
        if (!entry.timeOutTouched) {
          newTimeOut = newShiftDefaults.timeOut;
          needsUpdate = true;
        }

        if (needsUpdate) {
          return { ...entry, timeIn: newTimeIn, timeOut: newTimeOut };
        }
        return entry;
      });

      return { ...state, shift: action.shift, cncEntries: newEntries };
    }
    case 'CNC_FIELD_SET': {
      const idx = state.cncEntries.findIndex(
        (entry) => entry.id === action.entryId,
      );
      if (idx === -1) return state;

      const entry = state.cncEntries[idx];

      let updatedEntry: CncEntry;

      switch (action.field) {
        case 'operator': {
          if (entry.operator === action.value) return state;
          updatedEntry = { ...entry, operator: action.value };
          break;
        }
        case 'machine': {
          if (entry.machine === action.value) return state;
          updatedEntry = { ...entry, machine: action.value };
          break;
        }
        case 'hex': {
          if (entry.hex === action.value) return state;
          updatedEntry = { ...entry, hex: action.value };
          break;
        }
        case 'size': {
          if (entry.size === action.value) return state;
          updatedEntry = { ...entry, size: action.value };
          break;
        }
        case 'side': {
          if (entry.side === action.value) return state;
          updatedEntry = { ...entry, side: action.value };
          break;
        }
        case 'cycleMinutes': {
          if (entry.cycleMinutes === action.value) return state;
          updatedEntry = { ...entry, cycleMinutes: action.value };
          break;
        }
        case 'cycleSeconds': {
          if (entry.cycleSeconds === action.value) return state;
          updatedEntry = { ...entry, cycleSeconds: action.value };
          break;
        }
        case 'partsCount': {
          if (entry.partsCount === action.value) return state;
          updatedEntry = { ...entry, partsCount: action.value };
          break;
        }
        case 'timeIn': {
          const nextTouched =
            entry.timeInTouched || action.markTouched === true;
          if (
            entry.timeIn === action.value &&
            entry.timeInTouched === nextTouched
          ) {
            return state;
          }
          updatedEntry = {
            ...entry,
            timeIn: action.value,
            timeInTouched: nextTouched,
          };
          break;
        }
        case 'timeOut': {
          const nextTouched =
            entry.timeOutTouched || action.markTouched === true;
          if (
            entry.timeOut === action.value &&
            entry.timeOutTouched === nextTouched
          ) {
            return state;
          }
          updatedEntry = {
            ...entry,
            timeOut: action.value,
            timeOutTouched: nextTouched,
          };
          break;
        }
      }

      const newEntries = [...state.cncEntries];
      newEntries[idx] = updatedEntry;
      return { ...state, cncEntries: newEntries };
    }
    case 'CNC_ENTRY_ADD': {
      return {
        ...state,
        cncEntries: [...state.cncEntries, createAddedCncEntry(state)],
      };
    }
    case 'CNC_ENTRY_REMOVE': {
      if (!state.cncEntries.some((entry) => entry.id === action.entryId)) {
        return state;
      }

      return {
        ...state,
        cncEntries: state.cncEntries.filter(
          (entry) => entry.id !== action.entryId,
        ),
      };
    }
    case 'CNC_ENTRY_DUPLICATE': {
      const index = state.cncEntries.findIndex(
        (entry) => entry.id === action.entryId,
      );
      if (index === -1) return state;

      const duplicatedEntry = createDuplicatedCncEntry(state.cncEntries[index]);

      return {
        ...state,
        cncEntries: [
          ...state.cncEntries.slice(0, index + 1),
          duplicatedEntry,
          ...state.cncEntries.slice(index + 1),
        ],
      };
    }
    case 'CNC_ENTRY_RESTORE': {
      if (state.cncEntries.some((entry) => entry.id === action.entry.id)) {
        return state;
      }

      const index = Math.max(
        0,
        Math.min(action.index, state.cncEntries.length),
      );

      return {
        ...state,
        cncEntries: [
          ...state.cncEntries.slice(0, index),
          action.entry,
          ...state.cncEntries.slice(index),
        ],
      };
    }
    case 'PERSON_ADD': {
      const name = normalizePersonName(action.name);
      if (name === '') return state;
      if (hasPerson(state.people, name)) return state;

      const customPeople = addCustomPerson(
        state.customPeople,
        name,
        basePeople,
      );

      if (customPeople.length === state.customPeople.length) return state;

      return {
        ...state,
        customPeople,
        people: mergePeople(basePeople, customPeople),
      };
    }
    case 'BURMA_SET': {
      if (state.burma[action.field] === action.value) return state;

      return {
        ...state,
        burma: {
          ...state.burma,
          [action.field]: action.value,
        },
      };
    }
    case 'BURMA_OPERATOR_SET': {
      if (state.burma.operators[action.field] === action.value) return state;

      return {
        ...state,
        burma: {
          ...state.burma,
          operators: {
            ...state.burma.operators,
            [action.field]: action.value,
          },
        },
      };
    }
    case 'REPAIR_SET': {
      if (state.repair[action.field] === action.value) return state;

      return {
        ...state,
        repair: {
          ...state.repair,
          [action.field]: action.value,
        },
      };
    }
    case 'NOTES_SET': {
      if (state.notes === action.value) return state;
      return { ...state, notes: action.value };
    }
    case 'UI_INCOMPLETE_HIGHLIGHTS_SET': {
      if (state.ui.incompleteHighlights === action.value) return state;

      return {
        ...state,
        ui: {
          ...state.ui,
          incompleteHighlights: action.value,
        },
      };
    }
    default:
      return state;
  }
}
