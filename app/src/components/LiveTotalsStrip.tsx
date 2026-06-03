import { useProductionEntryState } from '../state/StateContext';
import { totalCncHours, cncEntryCount, totalBurma } from '../state/selectors';

const countFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

type AnimatedValueProps = {
  value: string;
  className: string;
};

type LiveTotalsStripProps = {
  elevated?: boolean;
};

function AnimatedValue({ value, className }: AnimatedValueProps) {
  return (
    <div key={value} className={`value-crossfade ${className}`}>
      {value}
    </div>
  );
}

export default function LiveTotalsStrip({
  elevated = false,
}: LiveTotalsStripProps) {
  const state = useProductionEntryState();
  const hours = totalCncHours(state);
  const entries = cncEntryCount(state);
  const burma = totalBurma(state);
  const tileClassName = `bg-bg-card border border-border-soft rounded-[16px] p-3 flex flex-col items-center transition-shadow duration-150 ${
    elevated ? 'shadow-md' : ''
  }`;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className={tileClassName}>
        <div className="text-micro font-semibold text-text-muted uppercase tracking-wider">
          CNC Hours
        </div>
        <AnimatedValue
          value={hours.toFixed(2)}
          className={`text-display-lg tabular-nums mt-1 ${
            hours === 0 ? 'text-text-muted' : 'text-text-primary font-bold'
          }`}
        />
      </div>
      <div className={tileClassName}>
        <div className="text-micro font-semibold text-text-muted uppercase tracking-wider">
          Entries
        </div>
        <AnimatedValue
          value={String(entries)}
          className={`text-display-lg tabular-nums mt-1 ${
            entries === 0 ? 'text-text-muted' : 'text-text-primary font-bold'
          }`}
        />
      </div>
      <div className={tileClassName}>
        <div className="text-micro font-semibold text-text-muted uppercase tracking-wider">
          Burma
        </div>
        <AnimatedValue
          value={countFormatter.format(burma)}
          className={`text-display-lg tabular-nums mt-1 ${
            burma === 0 ? 'text-text-muted' : 'text-text-primary font-bold'
          }`}
        />
      </div>
    </div>
  );
}
