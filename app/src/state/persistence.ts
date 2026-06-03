import { normalizePersonName, sanitizeCustomPeople } from '../utils/people';
import { basePeople, toDateInputValue } from './reducer';
import type { ProductionEntryState } from './types';

export const KEY_CUSTOM_PEOPLE = 'productionEntry.v1.customPeople';
export const KEY_DRAFT = 'productionEntry.v1.draft';
export const KEY_PREVIEW_LIMIT = 'productionEntry.v1.previewLimit';
export const PREVIEW_DAILY_LIMIT = 3;

export type SaveDraftResult =
  | { ok: true }
  | { ok: false; reason: 'quota' | 'unavailable' | 'unknown' };

type DraftSaverOptions = {
  delayMs?: number;
  onError?: (result: SaveDraftResult) => void;
  onSuccess?: () => void;
};

export type PreviewLimitState = {
  date: string;
  count: number;
  locked: boolean;
};

function createPreviewLimitState(now = new Date()): PreviewLimitState {
  return {
    date: toDateInputValue(now),
    count: 0,
    locked: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function savePreviewLimitState(state: PreviewLimitState): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;

    localStorage.setItem(KEY_PREVIEW_LIMIT, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function loadPreviewLimitState(now = new Date()): PreviewLimitState {
  const resetState = createPreviewLimitState(now);

  try {
    if (typeof localStorage === 'undefined') return resetState;

    const raw = localStorage.getItem(KEY_PREVIEW_LIMIT);
    if (raw === null) return resetState;

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || typeof parsed.date !== 'string') {
      savePreviewLimitState(resetState);
      return resetState;
    }

    if (parsed.date !== resetState.date) {
      savePreviewLimitState(resetState);
      return resetState;
    }

    const parsedCount =
      typeof parsed.count === 'number' && Number.isFinite(parsed.count)
        ? Math.floor(parsed.count)
        : 0;
    const count = Math.max(0, Math.min(parsedCount, PREVIEW_DAILY_LIMIT));
    const locked = parsed.locked === true || count >= PREVIEW_DAILY_LIMIT;
    const normalized = {
      date: resetState.date,
      count,
      locked,
    };

    if (
      normalized.count !== parsed.count ||
      normalized.locked !== parsed.locked
    ) {
      savePreviewLimitState(normalized);
    }

    return normalized;
  } catch {
    return resetState;
  }
}

export function recordPreviewOpen(now = new Date()): PreviewLimitState {
  const current = loadPreviewLimitState(now);

  if (current.locked) return current;

  const count = Math.min(current.count + 1, PREVIEW_DAILY_LIMIT);
  const next = {
    date: current.date,
    count,
    locked: count >= PREVIEW_DAILY_LIMIT,
  };

  savePreviewLimitState(next);
  return next;
}

export function loadCustomPeople(): string[] {
  try {
    if (typeof localStorage === 'undefined') return [];

    const parsed = JSON.parse(
      localStorage.getItem(KEY_CUSTOM_PEOPLE) ?? '[]',
    ) as unknown;

    if (!Array.isArray(parsed)) return [];

    return sanitizeCustomPeople(
      parsed
        .filter((value): value is string => typeof value === 'string')
        .map(normalizePersonName),
      basePeople,
    );
  } catch {
    return [];
  }
}

export function saveCustomPeople(names: string[]): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;

    localStorage.setItem(
      KEY_CUSTOM_PEOPLE,
      JSON.stringify(sanitizeCustomPeople(names, basePeople)),
    );
    return true;
  } catch {
    return false;
  }
}

function classifyStorageError(error: unknown): SaveDraftResult {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    if (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    ) {
      return { ok: false, reason: 'quota' };
    }
  }

  return { ok: false, reason: 'unknown' };
}

export function saveDraftNow(state: ProductionEntryState): SaveDraftResult {
  try {
    if (typeof localStorage === 'undefined') {
      return { ok: false, reason: 'unavailable' };
    }

    localStorage.setItem(KEY_DRAFT, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    return classifyStorageError(error);
  }
}

export function loadDraft(): ProductionEntryState | null {
  try {
    if (typeof localStorage === 'undefined') return null;

    const raw = localStorage.getItem(KEY_DRAFT);
    if (raw === null) return null;

    return JSON.parse(raw) as ProductionEntryState;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(KEY_DRAFT);
  } catch {
    return;
  }
}

export function createDraftSaver(options: DraftSaverOptions = {}) {
  let timeoutId: number | null = null;

  return {
    schedule(state: ProductionEntryState) {
      if (timeoutId !== null) window.clearTimeout(timeoutId);

      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        const result = saveDraftNow(state);
        if (result.ok) {
          options.onSuccess?.();
        } else {
          options.onError?.(result);
        }
      }, options.delayMs ?? 400);
    },

    flush(state: ProductionEntryState): SaveDraftResult {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      const result = saveDraftNow(state);
      if (result.ok) {
        options.onSuccess?.();
      } else {
        options.onError?.(result);
      }

      return result;
    },

    cancel() {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}
