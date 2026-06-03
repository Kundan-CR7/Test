export type ShareSummaryResult = 'shared' | 'downloaded' | 'failed';

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openWhatsAppText(textFallback: string): void {
  window.location.href = `whatsapp://send?text=${encodeURIComponent(
    textFallback,
  )}`;
}

function canNativeShareFile(file: File): boolean {
  if (
    typeof navigator.share !== 'function' ||
    typeof navigator.canShare !== 'function'
  ) {
    return false;
  }

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export async function shareSummary(
  file: File,
  textFallback: string,
): Promise<ShareSummaryResult> {
  if (canNativeShareFile(file)) {
    try {
      await navigator.share({
        files: [file],
        title: 'Production Summary',
        text: textFallback,
      });
      return 'shared';
    } catch (error) {
      if (isAbortError(error)) {
        return 'failed';
      }
    }
  }

  downloadFile(file);
  openWhatsAppText(textFallback);
  return 'downloaded';
}
