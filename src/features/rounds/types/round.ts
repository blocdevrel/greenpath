import type { HouseholdVisit } from '@/shared/types/visit';

/** The four signals that drive today's household ranking (plan.md). */
export type RankFactor = 'danger' | 'overdue' | 'reach' | 'food';

export type ReachDifficulty = 'easy' | 'hard' | 'flood';

export type RoundVisit = HouseholdVisit & {
  rank: number;
  /** Short reason the worker should care — shown under the name. */
  why: string;
  factors: RankFactor[];
  reach: ReachDifficulty;
  foodRisk?: boolean;
};
