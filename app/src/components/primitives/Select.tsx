import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ invalid, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full h-[48px] px-[14px] pr-[32px] rounded-[12px] border bg-bg-card text-body-lg text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-accent-50 transition-all appearance-none ${
          invalid ? 'border-danger-600' : 'border-border-soft'
        } ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
        {...props}
      />
    );
  },
);
Select.displayName = 'Select';
