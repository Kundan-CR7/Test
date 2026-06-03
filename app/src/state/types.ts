export type Shift = 'morning' | 'evening';

export type Machine =
  | ''
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'M6'
  | 'M7'
  | 'M8';

export type SideType = '' | 'Male' | 'Female' | 'Groove' | 'Custom';

export type CncIdentityFieldUpdate =
  | { field: 'operator'; value: string }
  | { field: 'machine'; value: Machine }
  | { field: 'hex'; value: number | null }
  | { field: 'size'; value: string }
  | { field: 'side'; value: SideType };

export type CncIdentityField = CncIdentityFieldUpdate['field'];

export type CncProductionFieldUpdate =
  | { field: 'cycleMinutes'; value: number | null }
  | { field: 'cycleSeconds'; value: number | null }
  | { field: 'partsCount'; value: number | null }
  | { field: 'timeIn'; value: string; markTouched?: boolean }
  | { field: 'timeOut'; value: string; markTouched?: boolean };

export type CncProductionField = CncProductionFieldUpdate['field'];
export type CncFieldUpdate = CncIdentityFieldUpdate | CncProductionFieldUpdate;

export type BurmaField = 'burma1' | 'burma2' | 'burma3';

export type RepairFieldUpdate =
  | { field: 'person'; value: string }
  | { field: 'count'; value: number | null }
  | { field: 'note'; value: string };

export type ProductionEntryState = {
  date: string;
  shift: Shift;
  people: string[];
  customPeople: string[];
  cncEntries: CncEntry[];
  burma: {
    operators: Record<BurmaField, string>;
    burma1: number | null;
    burma2: number | null;
    burma3: number | null;
  };
  repair: {
    person: string;
    count: number | null;
    note: string;
  };
  notes: string;
  ui: {
    incompleteHighlights: boolean;
  };
};

export type CncEntry = {
  id: string;
  operator: string;
  machine: Machine;
  hex: number | null;
  size: string;
  side: SideType;
  cycleMinutes: number | null;
  cycleSeconds: number | null;
  timeIn: string;
  timeOut: string;
  partsCount: number | null;
  productionHours: number | null;
  timeInTouched: boolean;
  timeOutTouched: boolean;
};
