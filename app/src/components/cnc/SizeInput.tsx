import { useId } from 'react';

type SizeInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function SizeInput({ value, onChange, error }: SizeInputProps) {
  const inputId = useId();
  const errorId = useId();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-body-sm text-text-secondary font-medium"
      >
        Size
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        autoComplete="off"
        className={`w-full h-[48px] px-[14px] rounded-[12px] border bg-bg-card text-body-lg text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-accent-50 transition-all ${
          error ? 'border-danger-600' : 'border-border-soft'
        }`}
        placeholder="e.g. 1 1/2 or 2"
        aria-invalid={error !== undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <div
          id={errorId}
          className="text-danger-600 text-caption font-medium mt-1"
        >
          {error}
        </div>
      )}
    </div>
  );
}
