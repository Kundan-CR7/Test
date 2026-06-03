type UpdateAvailableToastProps = {
  onRefresh: () => void;
  onDismiss: () => void;
};

export function UpdateAvailableToast({
  onRefresh,
  onDismiss,
}: UpdateAvailableToastProps) {
  return (
    <div
      className="fixed left-1/2 bottom-[calc(72px+env(safe-area-inset-bottom)+12px)] z-[95] flex w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 items-center justify-between gap-3 rounded-[12px] bg-text-primary px-4 py-3 text-body-sm font-medium text-text-inverse shadow-lg"
      role="status"
      aria-live="polite"
    >
      <span>Update available.</span>
      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onRefresh}
          className="font-semibold underline underline-offset-2 active:opacity-80"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-text-disabled active:opacity-80"
          aria-label="Dismiss update message"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
