import type { ProductionEntryState } from '../state/types';
import {
  cncOperatorSummaryGroups,
  cncSummaryTotals,
  entryProductionHours,
  hasNotes,
  hasRepairData,
  totalBurma,
} from '../state/selectors';
import {
  formatCount,
  formatCycleTime,
  formatDateShort,
  formatEntryCount,
  formatGeneratedAt,
  formatHours,
  formatShiftShort,
} from './format';

function machineList(machines: { machine: string }[]): string {
  return machines.map((machineGroup) => machineGroup.machine).join(', ');
}

function burmaLine(
  label: string,
  operator: string,
  count: number | null,
): string {
  const operatorText = operator.trim() === '' ? '' : ` (${operator.trim()})`;
  return `${label}${operatorText}: ${formatCount(count)}`;
}

export function buildTextSummary(
  state: ProductionEntryState,
  generatedAt: Date,
): string {
  const totals = cncSummaryTotals(state);
  const groups = cncOperatorSummaryGroups(state);
  const lines: string[] = [
    `Daily Production - ${formatDateShort(state.date)} - ${formatShiftShort(
      state.shift,
    )} Shift`,
    '',
    'CNC Overview',
  ];

  if (totals.entries === 0) {
    lines.push('No CNC entries');
  } else {
    lines.push(`Total CNC Hours: ${formatHours(totals.hours)}`);
    lines.push(`Total CNC Sides: ${formatCount(totals.sides)}`);
    lines.push('');
    lines.push('CNC Production by Operator');

    groups.forEach((group) => {
      lines.push(
        `${group.operator} - ${formatHours(
          group.totals.hours,
        )} - ${formatCount(group.totals.sides)} sides - ${formatEntryCount(
          group.totals.entries,
        )} - ${machineList(group.machines)}`,
      );

      group.machines.forEach((machineGroup) => {
        lines.push(
          `  ${machineGroup.machine} - ${formatEntryCount(
            machineGroup.totals.entries,
          )} - ${formatCount(machineGroup.totals.sides)} sides - ${formatHours(
            machineGroup.totals.hours,
          )}`,
        );

        machineGroup.entries.forEach(({ entry }) => {
          const detailParts = [`Hex ${entry.hex}`, `Size ${entry.size}`];

          if (entry.side !== '') {
            detailParts.push(`Side ${entry.side}`);
          }

          detailParts.push(
            formatCycleTime(entry),
            `Count ${formatCount(entry.partsCount)}`,
            formatHours(entryProductionHours(entry)),
          );

          lines.push(`    ${detailParts.join(' - ')}`);
        });
      });
    });
  }

  lines.push('');
  lines.push('Burma Production');

  lines.push(
    burmaLine('Burma 1', state.burma.operators.burma1, state.burma.burma1),
  );
  lines.push(
    burmaLine('Burma 2', state.burma.operators.burma2, state.burma.burma2),
  );
  lines.push(
    burmaLine('Burma 3', state.burma.operators.burma3, state.burma.burma3),
  );
  lines.push(`Total Burma: ${formatCount(totalBurma(state))}`);

  if (hasRepairData(state)) {
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

    lines.push('');
    lines.push('Repair');
    lines.push(repairParts.join(' - '));
  }

  if (hasNotes(state)) {
    lines.push('');
    lines.push('Notes');
    lines.push(state.notes);
  }

  lines.push('');
  lines.push(formatGeneratedAt(state.date, generatedAt));

  return lines.join('\n');
}
