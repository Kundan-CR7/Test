import { formatDateLong } from '../utils/format';

type DraftRolloverBannerProps = {
  draftDate: string;
  onResume: () => void;
  onStartFresh: () => void;
};

export function DraftRolloverBanner({
  draftDate,
  onResume,
  onStartFresh,
}: DraftRolloverBannerProps) {
  return (
    <div
      className="rounded-[14px] border border-warning-600/20 bg-warning-50 px-3 py-3 text-warning-600 shadow-sm"
      role="status"
    >
      <div className="text-body-sm font-semibold">
        You have an unsent entry from {formatDateLong(draftDate)}.
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onResume}
          className="h-9 rounded-[10px] bg-warning-600 px-3 text-body-sm font-semibold text-text-inverse active:opacity-80"
        >
          Resume
        </button>
        <button
          type="button"
          onClick={onStartFresh}
          className="h-9 rounded-[10px] border border-warning-600/30 bg-bg-card px-3 text-body-sm font-semibold text-warning-600 active:opacity-80"
        >
          Start fresh
        </button>
      </div>
    </div>
  );
}
