import { describe, expect, it } from 'vitest';
import { canChangeStatus, canTransition } from './work-orders';
describe('work order status rules', () => {
  it('allows assigned work to begin', () => expect(canTransition('ASSIGNED', 'IN_PROGRESS')).toBe(true));
  it('blocks technicians from closing jobs', () => expect(canChangeStatus('TECHNICIAN', 'COMPLETED', 'CLOSED')).toBe(false));
  it('allows dispatchers to close completed jobs', () => expect(canChangeStatus('DISPATCHER', 'COMPLETED', 'CLOSED')).toBe(true));
});