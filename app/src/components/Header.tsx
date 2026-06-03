import { BrandLogo } from './BrandLogo';

type HeaderProps = {
  date: string;
};

export default function Header({ date }: HeaderProps) {
  let dateStr = '';
  try {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    dateStr = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    dateStr = date;
  }

  return (
    <header className="sticky top-0 z-10 -mx-4 border-b border-border-soft/80 bg-bg-app/90 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-md supports-[backdrop-filter]:bg-bg-app/75">
      <div className="flex items-center justify-between gap-4">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-bg-card shadow-sm ring-1 ring-border-soft/90"
          aria-hidden="true"
        >
          <BrandLogo className="h-8 w-auto" />
        </div>

        <div className="min-w-0 flex-1 text-right">
          <h1 className="truncate text-heading-lg tracking-tight text-text-primary">
            Production Entry
          </h1>
          <p className="mt-0.5 truncate text-caption font-medium text-text-muted">
            {dateStr}
          </p>
        </div>
      </div>
    </header>
  );
}