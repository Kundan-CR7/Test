import type { PreviewCtaState } from '../state/selectors';

type StickyActionBarProps = {
  ctaState: PreviewCtaState;
  elevated: boolean;
  onPreview: () => void;
  onEmptyTap: () => void;
};

export default function StickyActionBar({
  ctaState,
  elevated,
  onPreview,
  onEmptyTap,
}: StickyActionBarProps) {
  const isDisabled = ctaState === 'disabled';
  const isWarning = ctaState === 'warning';

  const handlePreviewClick = () => {
    if (isDisabled) {
      onEmptyTap();
      return;
    }

    onPreview();
  };

  return (
    <div
      role="region"
      aria-label="Production action bar"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-bg-card transition-shadow duration-150 ${
        elevated ? 'shadow-md' : ''
      }`}
      style={{
        minHeight: 'calc(72px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="mx-auto flex h-[72px] max-w-[480px] items-center px-4">
        <button
          type="button"
          aria-disabled={isDisabled}
          aria-label={
            isDisabled
              ? 'Preview Summary. Add an entry first.'
              : isWarning
                ? 'Preview Summary. Some CNC entries are incomplete.'
                : 'Preview Summary'
          }
          onClick={handlePreviewClick}
          className={`flex h-[48px] min-w-0 flex-1 items-center justify-center rounded-button bg-accent-600 px-5 text-body-md font-semibold text-text-inverse outline-none transition-all duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 active:scale-[0.98] active:bg-accent-700 ${
            isDisabled ? 'opacity-30 shadow-none' : 'shadow-sm'
          }`}
        >
          <span className="truncate">Preview Summary</span>
        </button>
      </div>
    </div>
  );
}
