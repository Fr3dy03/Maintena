export type CoverageInput = { startsAt: Date; endsAt: Date; occurredAt: Date };
export function evaluateWarranty({ startsAt, endsAt, occurredAt }: CoverageInput) {
  if (occurredAt < startsAt) return { outcome: 'manual_review', explanation: 'Fault predates the stored warranty start date.' } as const;
  if (occurredAt > endsAt) return { outcome: 'outside_coverage', explanation: 'Fault date is after the stored warranty end date.' } as const;
  return { outcome: 'potentially_covered', explanation: 'Fault date falls within the stored coverage dates; exclusions still require review.' } as const;
}
export function canManage(role: string) { return ['OWNER','ADMIN','DISPATCHER'].includes(role); }