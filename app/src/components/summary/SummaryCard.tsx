import type { ProductionEntryState } from '../../state/types';
import type {
  CncMachineSummaryGroup,
  CncOperatorSummaryGroup,
  CncSummaryEntry,
} from '../../state/selectors';
import {
  cncOperatorSummaryGroups,
  cncSummaryTotals,
  entryProductionHours,
  hasNotes,
  hasRepairData,
  totalBurma,
} from '../../state/selectors';
import {
  formatCount,
  formatCycleTime,
  formatDateShort,
  formatEntryCount,
  formatGeneratedAt,
  formatHours,
  formatShiftShort,
} from '../../utils/format';

type SummaryCardProps = {
  state: ProductionEntryState;
  generatedAt: Date;
  mode?: 'preview' | 'capture';
};

function Divider() {
  return <div className="my-4 h-px w-full bg-border-soft" />;
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <div
        className={
          strong
            ? 'text-body-md font-semibold text-text-primary'
            : 'text-body-md text-text-muted'
        }
      >
        {label}
      </div>
      <div
        className={`text-right tabular-nums ${
          strong
            ? 'text-heading-lg font-bold text-text-primary'
            : 'text-body-md text-text-primary'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function machineList(group: CncOperatorSummaryGroup): string {
  return group.machines.map((machineGroup) => machineGroup.machine).join(', ');
}

function CncDetailRow({
  summaryEntry,
  compact,
}: {
  summaryEntry: CncSummaryEntry;
  compact: boolean;
}) {
  const { entry } = summaryEntry;
  const detailParts = [`Hex ${entry.hex}`, `Size ${entry.size}`];

  if (entry.side !== '') {
    detailParts.push(`Side ${entry.side}`);
  }

  detailParts.push(
    formatCycleTime(entry),
    `Count ${formatCount(entry.partsCount)}`,
  );

  return (
    <div
      className={`tabular-nums text-text-primary ${
        compact ? 'mb-1 text-caption' : 'mb-1 text-body-sm'
      } last:mb-0`}
    >
      {detailParts.join(' - ')} -{' '}
      <span className="font-semibold">
        {formatHours(entryProductionHours(entry))}
      </span>
    </div>
  );
}

function MachineGroup({
  group,
  compact,
}: {
  group: CncMachineSummaryGroup;
  compact: boolean;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-baseline justify-between gap-4 border-b border-border-soft pb-1">
        <div className="text-body-sm font-semibold text-text-primary">
          {group.machine}
        </div>
        <div className="text-right text-caption tabular-nums text-text-muted">
          {formatCount(group.totals.sides)} sides -{' '}
          {formatHours(group.totals.hours)}
        </div>
      </div>
      <div>
        {group.entries.map((summaryEntry) => (
          <CncDetailRow
            key={summaryEntry.entry.id}
            summaryEntry={summaryEntry}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function OperatorGroup({
  group,
  compact,
}: {
  group: CncOperatorSummaryGroup;
  compact: boolean;
}) {
  return (
    <div className="mb-3 rounded-[10px] border border-border-soft px-3 py-3 last:mb-0">
      <div className="mb-2">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-heading-sm font-bold text-text-primary">
            {group.operator}
          </div>
          <div className="text-heading-sm font-bold tabular-nums text-text-primary">
            {formatHours(group.totals.hours)}
          </div>
        </div>
        <div className="mt-1 text-caption tabular-nums text-text-muted">
          {machineList(group)} - {formatCount(group.totals.sides)} sides -{' '}
          {formatEntryCount(group.totals.entries)}
        </div>
      </div>
      {group.machines.map((machineGroup) => (
        <MachineGroup
          key={machineGroup.machine}
          group={machineGroup}
          compact={compact}
        />
      ))}
    </div>
  );
}

function CncSummarySection({ state }: { state: ProductionEntryState }) {
  const totals = cncSummaryTotals(state);
  const groups = cncOperatorSummaryGroups(state);
  const compact = totals.entries > 12;

  return (
    <section aria-label="CNC Production">
      <h3 className="mb-2 text-heading-sm font-bold text-text-primary">
        CNC Overview
      </h3>
      {totals.entries === 0 ? (
        <div className="text-body-md text-text-muted">No CNC entries</div>
      ) : (
        <>
          <SummaryRow
            label="Total CNC Hours"
            value={formatHours(totals.hours)}
            strong
          />
          <SummaryRow
            label="Total CNC Sides"
            value={formatCount(totals.sides)}
          />

          <div className="mt-4">
            <h3 className="mb-2 text-heading-sm font-bold text-text-primary">
              CNC Production by Operator
            </h3>
            {groups.map((group) => (
              <OperatorGroup
                key={group.operator}
                group={group}
                compact={compact}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function RepairSection({ state }: { state: ProductionEntryState }) {
  if (!hasRepairData(state)) return null;

  const repairParts: string[] = [];
  if (state.repair.person.trim() !== '') {
    repairParts.push(state.repair.person.trim());
  }
  if (state.repair.count !== null) {
    repairParts.push(`${formatCount(state.repair.count)} pcs`);
  }
  if (state.repair.note.trim() !== '') {
    repairParts.push(state.repair.note.trim());
  }

  return (
    <>
      <Divider />
      <section aria-label="Repair">
        <h3 className="mb-2 text-heading-md font-bold text-text-primary">
          Repair
        </h3>
        <div className="text-body-lg text-text-primary">
          {repairParts.join(' - ')}
        </div>
      </section>
    </>
  );
}

function NotesSection({ state }: { state: ProductionEntryState }) {
  if (!hasNotes(state)) return null;

  return (
    <>
      <Divider />
      <section aria-label="Notes">
        <h3 className="mb-2 text-heading-md font-bold text-text-primary">
          Notes
        </h3>
        <div className="whitespace-pre-wrap text-body-lg text-text-primary">
          {state.notes}
        </div>
      </section>
    </>
  );
}

function formatBurmaLabel(label: string, operator: string): string {
  return operator.trim() === '' ? label : `${label} (${operator.trim()})`;
}

export function SummaryCard({
  state,
  generatedAt,
  mode = 'preview',
}: SummaryCardProps) {
  const burmaTotal = totalBurma(state);
  const cardClass =
    mode === 'capture'
      ? 'w-[540px] max-w-none rounded-[12px] border border-border-soft bg-white p-6 text-text-primary'
      : 'mx-auto w-full max-w-[540px] rounded-[12px] border border-border-soft bg-white p-4 text-text-primary min-[420px]:p-6';

  return (
    <article className={cardClass}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-heading-lg font-bold text-text-primary">
          Daily Production - {formatDateShort(state.date)}
        </h2>
        <div className="text-body-md font-semibold text-text-muted">
          {formatShiftShort(state.shift)} Shift
        </div>
      </header>

      <Divider />

      <CncSummarySection state={state} />

      <Divider />

      <section aria-label="Burma Production">
        <h3 className="mb-2 text-heading-sm font-bold text-text-primary">
          Burma Production
        </h3>
        <SummaryRow
          label={formatBurmaLabel('Burma 1', state.burma.operators.burma1)}
          value={formatCount(state.burma.burma1)}
        />
        <SummaryRow
          label={formatBurmaLabel('Burma 2', state.burma.operators.burma2)}
          value={formatCount(state.burma.burma2)}
        />
        <SummaryRow
          label={formatBurmaLabel('Burma 3', state.burma.operators.burma3)}
          value={formatCount(state.burma.burma3)}
        />
        <div className="mt-4">
          <SummaryRow
            label="Total Burma"
            value={formatCount(burmaTotal)}
            strong
          />
        </div>
      </section>

      <RepairSection state={state} />
      <NotesSection state={state} />

      <footer className="mt-5 text-right text-caption text-text-muted">
        {formatGeneratedAt(state.date, generatedAt)}
      </footer>
    </article>
  );
}
