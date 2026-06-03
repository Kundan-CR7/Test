import html2canvas from 'html2canvas';
import type { Shift } from '../state/types';

type CaptureSummaryOptions = {
  node: HTMLElement;
  date: string;
  shift: Shift;
};

function filenameForSummary(date: string, shift: Shift): string {
  const shiftSlug = shift === 'morning' ? 'morning' : 'evening';
  return `production-summary-${date}-${shiftSlug}.png`;
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not create PNG blob.'));
        return;
      }

      resolve(blob);
    }, 'image/png');
  });
}

export async function captureSummary({
  node,
  date,
  shift,
}: CaptureSummaryOptions): Promise<File> {
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#FFFFFF',
    useCORS: false,
    logging: false,
    windowWidth: 540,
    width: 540,
  });

  if (canvas.width !== 1080) {
    throw new Error(
      `Summary PNG width was ${canvas.width}px, expected 1080px.`,
    );
  }

  const blob = await canvasToPngBlob(canvas);

  return new File([blob], filenameForSummary(date, shift), {
    type: 'image/png',
    lastModified: Date.now(),
  });
}
