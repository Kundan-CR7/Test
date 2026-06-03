import { useRef } from 'react';
import type { KeyboardEvent } from 'react';

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  className?: string;
};

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  ariaDescribedBy,
  ariaInvalid,
  className = '',
}: SegmentedProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = options.findIndex((o) => o.value === value);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = options.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    onChange(options[nextIndex].value);

    // Focus the new selected button
    const buttons = containerRef.current?.querySelectorAll('[role="radio"]');
    if (buttons && buttons[nextIndex]) {
      (buttons[nextIndex] as HTMLElement).focus();
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      className={`bg-bg-sunken rounded-[12px] p-[4px] flex relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <div
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(option.value);
              }
            }}
            className={`flex-1 h-[44px] flex items-center justify-center rounded-[10px] cursor-pointer text-body-sm select-none outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 transition-all duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)] ${
              isSelected
                ? 'bg-bg-card shadow-sm text-text-primary font-semibold'
                : 'text-text-secondary font-medium hover:text-text-primary'
            }`}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
}
