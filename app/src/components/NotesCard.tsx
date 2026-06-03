import { useLayoutEffect, useRef } from 'react';
import { useProductionEntry } from '../state/StateContext';

const MAX_TEXTAREA_HEIGHT = 240;

function resizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = 'auto';
  const nextHeight = Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT);
  element.style.height = `${nextHeight}px`;
  element.style.overflowY =
    element.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
}

export default function NotesCard() {
  const { state, dispatch } = useProductionEntry();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      resizeTextarea(textareaRef.current);
    }
  }, [state.notes]);

  return (
    <section
      aria-labelledby="notes-heading"
      className="bg-bg-card border border-border-soft rounded-[16px] shadow-sm p-4 min-[380px]:p-5"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2
          id="notes-heading"
          className="text-heading-md text-text-primary tracking-tight"
        >
          Notes
        </h2>
        <span className="rounded-full bg-bg-sunken px-2 py-[2px] text-caption text-text-muted">
          Optional
        </span>
      </div>

      <textarea
        ref={textareaRef}
        aria-labelledby="notes-heading"
        value={state.notes}
        onChange={(event) =>
          dispatch({ type: 'NOTES_SET', value: event.target.value })
        }
        className="min-h-[96px] max-h-[240px] w-full resize-none rounded-[12px] border border-border-soft bg-bg-card px-[14px] py-3 text-body-lg text-text-primary outline-none transition-all placeholder:text-text-disabled focus:border-border-focus focus:ring-4 focus:ring-accent-50"
        placeholder="Anything extra - machine issue, power cut, material delay..."
      />
    </section>
  );
}
