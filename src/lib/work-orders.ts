export const transitions: Record<string, string[]> = {
  REQUESTED: ['ASSIGNED', 'CLOSED'], ASSIGNED: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['BLOCKED', 'COMPLETED'], BLOCKED: ['ASSIGNED', 'IN_PROGRESS'],
  COMPLETED: ['CLOSED'], CLOSED: [],
};
export function canTransition(from: string, to: string) { return transitions[from]?.includes(to) ?? false; }
export function canChangeStatus(role: string, from: string, to: string) {
  if (!canTransition(from, to)) return false;
  if (role === 'TECHNICIAN') return ['IN_PROGRESS', 'BLOCKED', 'COMPLETED'].includes(to);
  return ['OWNER', 'ADMIN', 'DISPATCHER'].includes(role);
}