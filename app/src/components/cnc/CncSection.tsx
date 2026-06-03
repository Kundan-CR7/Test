import { useEffect, useRef, useState } from 'react';
import { useProductionEntry } from '../../state/StateContext';
import { CncEntryCard } from './CncEntryCard';
import { AddCncEntryButton } from './AddCncEntryButton';
import {
  invalidNonBlankCncEntries,
  isCncEntryBlankForRemoval,
} from '../../state/selectors';
import type { CncEntry, CncFieldUpdate } from '../../state/types';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export type ToastRequest = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

type CncSectionProps = {
  showToast: (toast: ToastRequest) => void;
  onAddPerson: (entryId: string) => void;
};

export function CncSection({ showToast, onAddPerson }: CncSectionProps) {
  const { state, dispatch } = useProductionEntry();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [exitingEntryIds, setExitingEntryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const exitingEntryIdsRef = useRef<Set<string>>(new Set());
  const removeTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      removeTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      removeTimeoutsRef.current = [];
      exitingEntryIdsRef.current.clear();
    };
  }, []);

  const handleSetField = (entryId: string, update: CncFieldUpdate) => {
    dispatch({ type: 'CNC_FIELD_SET', entryId, ...update });
  };

  const blockWhenEntryIsUnfinished = (): boolean => {
    const lastEntry = state.cncEntries[state.cncEntries.length - 1];
    const hasInvalidEntry = invalidNonBlankCncEntries(state).length > 0;
    const hasTrailingBlank =
      lastEntry !== undefined && isCncEntryBlankForRemoval(lastEntry, state);

    if (hasInvalidEntry || hasTrailingBlank) {
      dispatch({ type: 'UI_INCOMPLETE_HIGHLIGHTS_SET', value: true });
      showToast({
        message: 'Complete this CNC entry first.',
        durationMs: 3000,
      });
      return true;
    }

    return false;
  };

  const handleAddEntry = () => {
    if (blockWhenEntryIsUnfinished()) return;

    dispatch({ type: 'CNC_ENTRY_ADD' });
  };

  const handleDuplicateEntry = (entryId: string) => {
    if (exitingEntryIdsRef.current.has(entryId)) return;
    if (blockWhenEntryIsUnfinished()) return;

    dispatch({ type: 'CNC_ENTRY_DUPLICATE', entryId });
  };

  const showRemoveToast = (removedEntry: CncEntry, index: number) => {
    showToast({
      message: 'Entry removed',
      actionLabel: 'Undo',
      durationMs: 4000,
      onAction: () => {
        dispatch({ type: 'CNC_ENTRY_RESTORE', entry: removedEntry, index });
      },
    });
  };

  const handleRemoveEntry = (entryId: string) => {
    if (exitingEntryIdsRef.current.has(entryId)) return;

    const index = state.cncEntries.findIndex((entry) => entry.id === entryId);
    if (index === -1) return;

    const removedEntry = state.cncEntries[index];
    const removeDelay = prefersReducedMotion ? 0 : 180;

    exitingEntryIdsRef.current.add(entryId);
    setExitingEntryIds(new Set(exitingEntryIdsRef.current));

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'CNC_ENTRY_REMOVE', entryId });
      exitingEntryIdsRef.current.delete(entryId);
      setExitingEntryIds(new Set(exitingEntryIdsRef.current));
      removeTimeoutsRef.current = removeTimeoutsRef.current.filter(
        (id) => id !== timeoutId,
      );
      showRemoveToast(removedEntry, index);
    }, removeDelay);

    removeTimeoutsRef.current.push(timeoutId);
  };

  return (
    <section aria-label="CNC Production" className="mb-8">
      <div className="px-2 mb-4">
        <h2 className="text-heading-md text-text-primary tracking-tight">
          CNC Production
        </h2>
        <p className="text-body-md text-text-muted mt-1">
          Add one entry per machine and size.
        </p>
      </div>

      <div className="flex flex-col mb-4">
        {state.cncEntries.length === 0 ? (
          <div className="rounded-[16px] border border-border-soft bg-bg-card p-5 mb-4 text-center">
            <div className="text-body-md font-semibold text-text-secondary">
              No CNC entries yet.
            </div>
            <div className="text-body-md text-text-muted mt-1">
              Tap + Add CNC Entry to start.
            </div>
          </div>
        ) : (
          state.cncEntries.map((entry, index) => (
            <CncEntryCard
              key={entry.id}
              index={index}
              entry={entry}
              isBlank={isCncEntryBlankForRemoval(entry, state)}
              shift={state.shift}
              showValidation={state.ui.incompleteHighlights}
              isExiting={exitingEntryIds.has(entry.id)}
              onSetField={handleSetField}
              onDuplicate={handleDuplicateEntry}
              onRemove={handleRemoveEntry}
              onAddPerson={onAddPerson}
            />
          ))
        )}
        <AddCncEntryButton onClick={handleAddEntry} />
      </div>
    </section>
  );
}
