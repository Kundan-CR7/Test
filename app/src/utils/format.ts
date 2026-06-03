import type { CncEntry, Shift } from '../state/types';

const countFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

function parseDateInputValue(dateInputValue: string): Date | null {
  const [year, month, day] = dateInputValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function formatDateLong(dateInputValue: string): string {
  const date = parseDateInputValue(dateInputValue);
  if (date === null) return dateInputValue;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(dateInputValue: string): string {
  const date = parseDateInputValue(dateInputValue);
  if (date === null) return dateInputValue;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatShift(shift: Shift): string {
  return shift === 'morning' ? 'Morning Shift' : 'Evening Shift';
}

export function formatShiftShort(shift: Shift): string {
  return shift === 'morning' ? 'Morning' : 'Evening';
}

export function formatCycleTime(entry: CncEntry): string {
  return `${entry.cycleMinutes ?? 0}m ${entry.cycleSeconds ?? 0}s`;
}

export function formatCount(count: number | null | undefined): string {
  return countFormatter.format(count ?? 0);
}

export function formatEstimatedParts(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatHours(hours: number | null | undefined): string {
  return `${(hours ?? 0).toFixed(2)} hrs`;
}

export function formatEntryCount(count: number): string {
  return `${countFormatter.format(count)} ${count === 1 ? 'entry' : 'entries'}`;
}

export function formatGeneratedAt(
  dateInputValue: string,
  generatedAt: Date,
): string {
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(generatedAt);

  return `Generated ${formatDateLong(dateInputValue)} · ${time}`;
}
