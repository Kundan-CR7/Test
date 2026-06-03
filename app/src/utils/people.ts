export function normalizePersonName(name: string): string {
  return name.trim();
}

export function personKey(name: string): string {
  return normalizePersonName(name).toLocaleLowerCase();
}

export function hasPerson(people: string[], name: string): boolean {
  const key = personKey(name);
  if (key === '') return false;

  return people.some((person) => personKey(person) === key);
}

export function mergePeople(basePeople: string[], customPeople: string[]) {
  const seen = new Set<string>();
  const merged: string[] = [];

  [...basePeople, ...customPeople].forEach((person) => {
    const normalized = normalizePersonName(person);
    const key = personKey(normalized);

    if (key === '' || seen.has(key)) return;

    seen.add(key);
    merged.push(normalized);
  });

  return merged;
}

export function sanitizeCustomPeople(
  customPeople: string[],
  basePeople: string[],
): string[] {
  const seen = new Set(basePeople.map(personKey).filter(Boolean));
  const sanitized: string[] = [];

  customPeople.forEach((person) => {
    const normalized = normalizePersonName(person);
    const key = personKey(normalized);

    if (key === '' || seen.has(key)) return;

    seen.add(key);
    sanitized.push(normalized);
  });

  return sanitized;
}

export function addCustomPerson(
  customPeople: string[],
  name: string,
  basePeople: string[],
): string[] {
  const sanitized = sanitizeCustomPeople(customPeople, basePeople);
  const normalized = normalizePersonName(name);

  if (normalized === '') return sanitized;
  if (hasPerson(mergePeople(basePeople, sanitized), normalized)) {
    return sanitized;
  }

  return [...sanitized, normalized];
}
