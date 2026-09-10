import { randomUUID } from 'node:crypto';
import { ReportStatus } from '@app/common';
export interface EventPayloads {
  'user.created': { userId: string };
  'user.logged_in': { userId: string };
  'report.created': { reportId: string; citizenId: string; categoryId: string };
  'report.validated': { reportId: string };
  'report.rejected': { reportId: string };
  'report.assigned': { reportId: string; entityId: string };
  'report.status.changed': { reportId: string; status: ReportStatus };
  'report.resolved': { reportId: string };
  'report.closed': { reportId: string };
}
export type EventName = keyof EventPayloads;
export interface DomainEvent<K extends EventName = EventName> {
  id: string;
  type: K;
  version: 1;
  occurredAt: string;
  producer: string;
  correlationId: string;
  data: EventPayloads[K];
}
export function createEvent<K extends EventName>(
  type: K,
  data: EventPayloads[K],
  producer: string,
  correlationId = randomUUID(),
): DomainEvent<K> {
  return {
    id: randomUUID(),
    type,
    version: 1,
    occurredAt: new Date().toISOString(),
    producer,
    correlationId,
    data,
  };
}
