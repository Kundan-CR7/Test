import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductionEntryState } from '../../state/types';
import { buildTextSummary } from '../../utils/textSummary';
import { downloadFile, shareSummary } from '../../utils/share';
import {
  sheetsErrorMessage,
  submitProductionToSheets,
} from '../../utils/submitProduction';

type ToastInput = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

type ShareActionState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'ready'; file: File; thumbnailUrl: string }
  | { status: 'sharing'; file: File; thumbnailUrl: string };

type ShareActionsProps = {
  state: ProductionEntryState;
  generatedAt: Date;
  onCapture: () => Promise<File>;
  onEdit: () => void;
  showToast: (toast: ToastInput) => void;
};

const primaryButtonClass =
  'flex h-[48px] w-full items-center justify-center gap-2 rounded-button bg-accent-600 px-4 text-body-md font-semibold text-text-inverse outline-none transition-all duration-[120ms] focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 active:scale-[0.99] active:bg-accent-700 disabled:cursor-wait disabled:opacity-70 disabled:active:scale-100';

const secondaryButtonClass =
  'h-[48px] w-full rounded-button border border-border-strong bg-bg-card px-4 text-body-md font-semibold text-text-primary outline-none transition-all duration-[120ms] focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 active:opacity-80';

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-text-inverse/40 border-t-text-inverse"
    />
  );
}

export function ShareActions({
  state,
  generatedAt,
  onCapture,
  onEdit,
  showToast,
}: ShareActionsProps) {
  const [actionState, setActionState] = useState<ShareActionState>({
    status: 'idle',
  });
  const thumbnailUrlRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  const revokeThumbnail = useCallback(() => {
    if (thumbnailUrlRef.current !== null) {
      URL.revokeObjectURL(thumbnailUrlRef.current);
      thumbnailUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      revokeThumbnail();
    };
  }, [revokeThumbnail]);

  useEffect(() => {
    revokeThumbnail();
    setActionState({ status: 'idle' });
  }, [generatedAt, revokeThumbnail, state]);

  const handleGenerate = async () => {
    if (
      actionState.status === 'generating' ||
      actionState.status === 'sharing'
    ) {
      return;
    }

    revokeThumbnail();
    setActionState({ status: 'generating' });

    try {
      await nextFrame();
      const file = await onCapture();
      if (!mountedRef.current) return;

      const thumbnailUrl = URL.createObjectURL(file);
      thumbnailUrlRef.current = thumbnailUrl;
      setActionState({ status: 'ready', file, thumbnailUrl });

      // Append to Google Sheets on Generate Image (not on share), as requested.
      const sheetsResult = await submitProductionToSheets(state, generatedAt);
      if (!mountedRef.current) return;

      if (sheetsResult.status === 'disabled') {
        showToast({
          message:
            'Image generated, but sheet sync is off. Set VITE_SUBMIT_API_KEY on Vercel (same as SUBMIT_API_KEY) and redeploy.',
          durationMs: 6000,
        });
      } else if (sheetsResult.status === 'unreachable') {
        showToast({
          message:
            'Image generated, but sheet API not reachable. Check your site URL and /api/append-production.',
          durationMs: 6000,
        });
      } else if (sheetsResult.status === 'failed') {
        showToast({
          message: `Image generated. ${sheetsErrorMessage(
            sheetsResult.error,
            sheetsResult.httpStatus,
          )}`,
          durationMs: 7000,
        });
      }
    } catch {
      if (!mountedRef.current) return;
      setActionState({ status: 'idle' });
      showToast({
        message: "Couldn't generate image. Please try again.",
        durationMs: 3500,
      });
    }
  };

  const handleShare = async () => {
    if (actionState.status !== 'ready') return;

    const { file, thumbnailUrl } = actionState;
    setActionState({ status: 'sharing', file, thumbnailUrl });

    try {
      const result = await shareSummary(
        file,
        buildTextSummary(state, generatedAt),
      );
      if (!mountedRef.current) return;

      setActionState({ status: 'ready', file, thumbnailUrl });

      if (result === 'shared') {
        showToast({ message: 'Shared to WhatsApp.', durationMs: 3000 });
      } else if (result === 'downloaded') {
        showToast({
          message: 'Image saved to your phone. Share it manually in the group.',
          durationMs: 4500,
        });
      }
    } catch {
      if (!mountedRef.current) return;
      setActionState({ status: 'ready', file, thumbnailUrl });
      showToast({
        message:
          'Sharing did not work on this phone. Please download the image and share manually.',
        durationMs: 5000,
      });
    }
  };

  const handleDownload = () => {
    if (actionState.status !== 'ready' && actionState.status !== 'sharing') {
      return;
    }

    try {
      downloadFile(actionState.file);
      showToast({ message: 'Image downloaded.', durationMs: 3000 });
    } catch {
      showToast({
        message:
          'Sharing did not work on this phone. Please download the image and share manually.',
        durationMs: 5000,
      });
    }
  };

  const isGenerating = actionState.status === 'generating';
  const isSharing = actionState.status === 'sharing';
  const isReady = actionState.status === 'ready' || isSharing;

  return (
    <div className="flex-shrink-0 border-t border-border-soft bg-bg-card px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 sm:px-5 sm:pb-5">
      {isReady && (
        <div className="mb-4 text-center" aria-live="polite">
          <div className="mb-3 text-body-sm font-semibold text-success-600">
            Image ready.
          </div>
          <img
            src={actionState.thumbnailUrl}
            alt="Generated production summary preview"
            className="mx-auto w-[180px] rounded-[8px] border border-border-soft bg-white shadow-sm"
          />
        </div>
      )}

      {!isReady && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className={primaryButtonClass}
        >
          {isGenerating && <Spinner />}
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>
      )}

      {isReady && (
        <>
          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className={primaryButtonClass}
          >
            {isSharing && <Spinner />}
            {isSharing ? 'Sharing...' : 'Share on WhatsApp'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className={`${secondaryButtonClass} mt-2`}
          >
            Download Image
          </button>
        </>
      )}

      {!isReady && (
        <button
          type="button"
          onClick={onEdit}
          className={`${secondaryButtonClass} mt-2`}
        >
          Edit Entry
        </button>
      )}
    </div>
  );
}
