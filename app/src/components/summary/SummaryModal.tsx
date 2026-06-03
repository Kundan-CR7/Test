import { useCallback, useRef, useState } from 'react';
import type { ProductionEntryState } from '../../state/types';
import { captureSummary } from '../../utils/png';
import { Sheet } from '../primitives/Sheet';
import { SummaryCard } from './SummaryCard';
import { ShareActions } from './ShareActions';

type SummaryModalProps = {
  open: boolean;
  state: ProductionEntryState;
  generatedAt: Date;
  incompleteCount: number;
  onClose: () => void;
  showToast: (toast: {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    durationMs?: number;
  }) => void;
};

function incompleteMessage(incompleteCount: number): string {
  return `${incompleteCount} CNC ${
    incompleteCount === 1 ? 'entry is' : 'entries are'
  } incomplete and won't be included.`;
}

export function SummaryModal({
  open,
  state,
  generatedAt,
  incompleteCount,
  onClose,
  showToast,
}: SummaryModalProps) {
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [captureMounted, setCaptureMounted] = useState(false);

  const handleCapture = useCallback(async () => {
    setCaptureMounted(true);

    try {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
      await document.fonts?.ready;

      if (captureRef.current === null) {
        throw new Error('Summary capture source is not mounted.');
      }

      return await captureSummary({
        node: captureRef.current,
        date: state.date,
        shift: state.shift,
      });
    } finally {
      setCaptureMounted(false);
    }
  }, [state.date, state.shift]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      initialFocusRef={editButtonRef}
      labelledBy="summary-modal-title"
    >
      <div className="flex h-full min-h-0 flex-col sm:max-h-[calc(100dvh-48px)]">
        <div className="flex h-[56px] flex-shrink-0 items-center justify-between border-b border-border-soft px-2">
          <button
            ref={editButtonRef}
            type="button"
            onClick={onClose}
            className="h-10 min-w-[52px] rounded-[10px] px-2 text-left text-body-sm font-semibold text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 active:opacity-70 min-[360px]:min-w-[72px] min-[360px]:px-3"
            aria-label="Edit Entry"
          >
            Edit
          </button>
          <h2
            id="summary-modal-title"
            className="min-w-0 flex-1 whitespace-nowrap text-center text-heading-sm text-text-primary min-[360px]:text-heading-md min-[420px]:text-heading-lg"
          >
            Production Summary
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 min-w-[52px] rounded-[10px] px-2 text-right text-body-sm font-semibold text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 active:opacity-70 min-[360px]:min-w-[72px] min-[360px]:px-3"
            aria-label="Close summary"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-bg-app px-4 py-4 sm:px-5">
          {incompleteCount > 0 && (
            <div className="mb-4 rounded-[12px] bg-warning-50 px-3 py-3 text-body-sm font-semibold text-warning-600">
              {incompleteMessage(incompleteCount)}
            </div>
          )}

          <SummaryCard state={state} generatedAt={generatedAt} />
        </div>

        {captureMounted && (
          <div
            ref={captureRef}
            className="summary-capture-host"
            aria-hidden="true"
          >
            <SummaryCard
              state={state}
              generatedAt={generatedAt}
              mode="capture"
            />
          </div>
        )}

        <ShareActions
          state={state}
          generatedAt={generatedAt}
          onCapture={handleCapture}
          onEdit={onClose}
          showToast={showToast}
        />
      </div>
    </Sheet>
  );
}
