import type { TriageLevel } from '@/shared/theme/tokens';

export type HouseholdVisit = {
  id: string;
  name: string;
  patientType: string;
  reason: string;
  level: TriageLevel;
  distance: string;
  dueLabel: string;
  /** When true, the household has already been seen on today's round. */
  completed?: boolean;
};
