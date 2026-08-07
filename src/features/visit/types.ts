import type { TriageLevel } from '@/shared/theme/tokens';

export type VisitCohort = 'pregnancy' | 'postpartum' | 'newborn' | 'child';

export type VisitStep =
  | 'household'
  | 'cohort'
  | 'danger'
  | 'result'
  | 'vitals'
  | 'treat'
  | 'facility'
  | 'slip'
  | 'complete'
  | 'followup';

export type CapacityStatus = 'yes' | 'limited' | 'no' | 'unknown';

export type FollowUpOutcome =
  | 'arrived'
  | 'left_without_care'
  | 'did_not_arrive'
  | 'counter_referral';

export type DangerSignItem = {
  id: string;
  prompt: string;
  lookHint?: string;
};

export type FacilitySector =
  | 'chps'
  | 'health_centre'
  | 'hospital'
  | 'teaching'
  | 'nutrition'
  | 'other';

export type FacilityOption = {
  id: string;
  name: string;
  sector: FacilitySector;
  level: string;
  distance: string;
  distanceKm: number;
  services: string[];
  routeNote: string;
  capacity: CapacityStatus;
  canHandle: VisitCohort[];
  suggested?: boolean;
};

export type TreatProtocol = {
  id: string;
  title: string;
  cohort: VisitCohort | 'any';
  steps: string[];
  drugs: string[];
};

export type HouseholdDetail = {
  id: string;
  name: string;
  patientType: string;
  reason: string;
  level: TriageLevel;
  distance: string;
  dueLabel: string;
  landmark: string;
  caregiver: string;
  members: { name: string; role: string }[];
  openFlags: string[];
  suggestedCohort: VisitCohort;
};

export type VisitFlowState = {
  householdId: string;
  step: VisitStep;
  cohort: VisitCohort | null;
  dangerAnswers: Record<string, boolean | null>;
  triage: TriageLevel | null;
  vitals: {
    bpSystolic: string;
    bpDiastolic: string;
    pulse: string;
    temp: string;
    respRate: string;
    pallor: boolean;
  };
  facilityId: string | null;
  capacityChecked: boolean;
  companion: string;
  followUpOutcome: FollowUpOutcome | null;
};

export type VisitFlowLaunch =
  | { mode: 'visit'; householdId: string }
  | { mode: 'voice'; householdId: string }
  | { mode: 'followup'; householdId: string; referralId?: string };
