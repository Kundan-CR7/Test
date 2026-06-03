type ProductionHoursDisplayProps = {
  value: number | null;
  warning?: string;
};

export function ProductionHoursDisplay({
  value,
  warning,
}: ProductionHoursDisplayProps) {
  const isValid = value !== null;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-body-sm text-text-secondary font-medium">
        Production Hours
      </div>
      <div
        className={`h-[56px] rounded-[12px] flex items-center justify-end px-[14px] gap-1 tabular-nums ${
          isValid ? 'bg-accent-50' : 'bg-bg-sunken'
        }`}
        aria-live="polite"
      >
        <span
          className={`text-display-lg ${
            isValid ? 'text-accent-600' : 'text-text-muted'
          }`}
        >
          {isValid ? value.toFixed(2) : '-'}
        </span>
        <span className="text-body-md text-text-secondary">hrs</span>
      </div>
      {warning && (
        <div className="text-warning-600 text-caption font-medium mt-1">
          {warning}
        </div>
      )}
    </div>
  );
}
