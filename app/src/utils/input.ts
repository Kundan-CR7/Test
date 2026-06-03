export function parseOptionalWholeNumber(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return null;
  return Number(digits);
}

export function optionalNumberInputValue(value: number | null): string {
  return value === null ? '' : String(value);
}
