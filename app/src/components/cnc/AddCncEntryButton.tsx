type AddCncEntryButtonProps = {
  onClick: () => void;
};

export function AddCncEntryButton({ onClick }: AddCncEntryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-14 rounded-card border-[1.5px] border-dashed border-border-strong bg-bg-card text-body-lg font-semibold text-accent-600 transition-colors duration-[120ms] active:bg-accent-50"
    >
      + Add CNC Entry
    </button>
  );
}
