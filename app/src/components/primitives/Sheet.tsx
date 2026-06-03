import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode, RefObject } from 'react';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea',
  'input',
  'select',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type SheetProps = {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement>;
  labelledBy?: string;
  variant?: 'fullscreen' | 'bottom-sheet';
  showHandle?: boolean;
  className?: string;
};

export function Sheet({
  open,
  children,
  onClose,
  initialFocusRef,
  labelledBy,
  variant = 'fullscreen',
  showHandle = false,
  className = '',
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
      const focusTarget =
        initialFocusRef?.current ??
        panelRef.current?.querySelector<HTMLElement>(focusableSelector) ??
        panelRef.current;
      focusTarget?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      setIsVisible(false);
      document.body.style.overflow = previousOverflow;
      if (
        previouslyFocusedRef.current &&
        document.contains(previouslyFocusedRef.current)
      ) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [initialFocusRef, open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !panelRef.current) return;

    const focusableElements = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter((element) => !element.hasAttribute('disabled'));

    if (focusableElements.length === 0) {
      event.preventDefault();
      panelRef.current.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const overlayClass =
    variant === 'fullscreen'
      ? 'fixed inset-0 z-[70] flex justify-center bg-bg-overlay transition-opacity duration-[160ms] motion-reduce:transition-none sm:items-center'
      : 'fixed inset-0 z-[70] flex items-end justify-center bg-bg-overlay transition-opacity duration-[160ms] motion-reduce:transition-none sm:items-center';

  const panelClass =
    variant === 'fullscreen'
      ? 'mt-auto flex h-[100dvh] w-full flex-col bg-bg-card shadow-lg outline-none transition-transform duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transform-none motion-reduce:transition-none sm:mt-0 sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:max-w-[520px] sm:rounded-[16px]'
      : 'mt-auto flex max-h-[calc(100dvh-24px)] w-full flex-col rounded-t-[20px] bg-bg-card shadow-lg outline-none transition-transform duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transform-none motion-reduce:transition-none sm:mt-0 sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:max-w-[420px] sm:rounded-[16px]';

  return (
    <div
      className={`${overlayClass} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`${panelClass} ${
          isVisible
            ? 'translate-y-0 sm:scale-100'
            : 'translate-y-full sm:translate-y-5 sm:scale-95'
        } ${className}`}
      >
        {showHandle && (
          <div
            aria-hidden="true"
            className="mx-auto mt-3 h-1 w-10 flex-shrink-0 rounded-pill bg-border-strong sm:hidden"
          />
        )}
        {children}
      </div>
    </div>
  );
}
