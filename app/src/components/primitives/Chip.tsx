import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  children: ReactNode;
  className?: string;
  size?: 'md' | 'sm';
};

export function Chip({
  selected = false,
  children,
  onClick,
  className = '',
  size = 'md',
  type = 'button',
  ...rest
}: ChipProps) {
  const sizeClasses =
    size === 'md'
      ? 'h-[44px] min-w-[56px] rounded-full text-body-lg font-semibold'
      : 'h-[32px] px-[16px] rounded-full text-body-md font-medium';

  const stateClasses = selected
    ? 'bg-accent-600 text-text-inverse shadow-sm'
    : 'bg-bg-sunken text-text-secondary hover:text-text-primary';
  const ariaPressed =
    rest.role === 'radio'
      ? rest['aria-pressed']
      : (rest['aria-pressed'] ?? selected);

  return (
    <button
      type={type}
      onClick={onClick}
      aria-pressed={ariaPressed}
      className={`inline-flex items-center justify-center select-none outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 transition-all duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)] ${sizeClasses} ${stateClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
