import { useCallback, useEffect, useRef, useState } from 'react';

type ToastProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  durationMs?: number;
};

export function Toast({
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 4000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    setIsVisible(false);
    exitTimerRef.current = window.setTimeout(() => {
      onDismiss?.();
    }, 180);
  }, [clearTimers, onDismiss]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    dismissTimerRef.current = window.setTimeout(dismiss, durationMs);

    return () => {
      window.cancelAnimationFrame(frame);
      clearTimers();
    };
  }, [clearTimers, dismiss, durationMs]);

  return (
    <div
      className={`toast-shell ${isVisible ? 'toast-shell--visible' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <>
          <span aria-hidden="true" className="text-text-disabled">
            ·
          </span>
          <button
            type="button"
            onClick={() => {
              onAction();
              dismiss();
            }}
            className="text-text-inverse font-semibold underline-offset-2 active:opacity-80"
          >
            {actionLabel}
          </button>
        </>
      )}
    </div>
  );
}
