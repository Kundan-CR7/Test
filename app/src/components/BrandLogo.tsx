type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = 'h-9 w-auto' }: BrandLogoProps) {
  return (
    <img
      src="/icons/antropi-logo.svg"
      alt=""
      aria-hidden="true"
      className={className}
      width={45}
      height={36}
      decoding="async"
    />
  );
}