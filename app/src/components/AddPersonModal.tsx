import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { hasPerson, normalizePersonName } from '../utils/people';
import { Sheet } from './primitives/Sheet';

type AddPersonErrorReason = 'blank' | 'duplicate' | 'storage';

export type AddPersonSubmitResult =
  | { ok: true; name: string }
  | { ok: false; reason: AddPersonErrorReason };

type AddPersonModalProps = {
  open: boolean;
  people: string[];
  onCancel: () => void;
  onSubmit: (name: string) => AddPersonSubmitResult;
};

function errorMessage(reason: AddPersonErrorReason): string {
  if (reason === 'blank') return 'Please enter a name.';
  if (reason === 'duplicate') return 'This person is already in the list.';
  return "Couldn't save. Try again.";
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-text-inverse/40 border-t-text-inverse"
    />
  );
}

export function AddPersonModal({
  open,
  people,
  onCancel,
  onSubmit,
}: AddPersonModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const helperId = useId();
  const errorId = useId();
  const [draftName, setDraftName] = useState('');
  const [submitError, setSubmitError] = useState<AddPersonErrorReason | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setDraftName('');
    setSubmitError(null);
    setIsSubmitting(false);
  }, [open]);

  const trimmedName = normalizePersonName(draftName);
  const duplicate = trimmedName !== '' && hasPerson(people, trimmedName);
  const displayedError = duplicate ? 'duplicate' : submitError;
  const canSubmit =
    trimmedName !== '' &&
    !duplicate &&
    submitError !== 'blank' &&
    submitError !== 'storage' &&
    !isSubmitting;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (trimmedName === '') {
      setSubmitError('blank');
      return;
    }

    if (duplicate) {
      setSubmitError('duplicate');
      return;
    }

    setIsSubmitting(true);
    const result = onSubmit(trimmedName);

    if (!result.ok) {
      setSubmitError(result.reason);
      setIsSubmitting(false);
      return;
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onCancel}
      initialFocusRef={inputRef}
      labelledBy="add-person-title"
      variant="bottom-sheet"
      showHandle
    >
      <form
        className="px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4"
        onSubmit={handleSubmit}
      >
        <div className="mb-5">
          <h2
            id="add-person-title"
            className="text-heading-lg text-text-primary"
          >
            Add New Person
          </h2>
          <p className="mt-1 text-body-md text-text-muted">
            Add a new operator to this device.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={inputId}
            className="text-body-sm font-medium text-text-secondary"
          >
            Person Name
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={draftName}
            onChange={(event) => {
              setDraftName(event.target.value);
              setSubmitError(null);
            }}
            autoComplete="off"
            placeholder="Type a name..."
            aria-describedby={`${helperId}${
              displayedError ? ` ${errorId}` : ''
            }`}
            aria-invalid={displayedError ? true : undefined}
            className="h-[48px] w-full rounded-[12px] border border-border-soft bg-bg-card px-[14px] text-body-lg text-text-primary outline-none transition-all placeholder:text-text-disabled focus:border-border-focus focus:ring-4 focus:ring-accent-50 aria-[invalid=true]:border-danger-600 aria-[invalid=true]:focus:ring-danger-50"
          />
          <div id={helperId} className="text-caption text-text-muted">
            This name will be saved on this phone for future entries.
          </div>
          {displayedError && (
            <div
              id={errorId}
              aria-live="polite"
              className="text-body-sm font-medium text-danger-600"
            >
              {errorMessage(displayedError)}
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-[48px] rounded-button border border-border-strong bg-bg-card px-4 text-body-md font-semibold text-text-primary outline-none transition-all duration-[120ms] focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 active:opacity-80"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-[48px] items-center justify-center gap-2 rounded-button bg-accent-600 px-4 text-body-md font-semibold text-text-inverse outline-none transition-all duration-[120ms] focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 active:scale-[0.99] active:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? 'Adding...' : 'Add Person'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
