import { useMemo, useState } from 'react';

import { Screen } from '@/shared/components/ui';
import type { TriageLevel } from '@/shared/theme/tokens';

import {
  dangerSignsByCohort,
  facilitiesForCohort,
  householdsById,
  protocolForCohort,
  suggestedFacilityId,
} from './data/visitMockData';
import { CohortScreen } from './screens/CohortScreen';
import { DangerSignsScreen } from './screens/DangerSignsScreen';
import { FollowUpScreen } from './screens/FollowUpScreen';
import { HouseholdScreen } from './screens/HouseholdScreen';
import { ReferralFacilityScreen } from './screens/ReferralFacilityScreen';
import { ReferralSlipScreen } from './screens/ReferralSlipScreen';
import { TreatHomeScreen } from './screens/TreatHomeScreen';
import { TriageResultScreen } from './screens/TriageResultScreen';
import { VisitCompleteScreen } from './screens/VisitCompleteScreen';
import { VitalsScreen } from './screens/VitalsScreen';
import type {
  FollowUpOutcome,
  VisitCohort,
  VisitFlowLaunch,
  VisitFlowState,
  VisitStep,
} from './types';

function initialAnswers(cohort: VisitCohort): Record<string, boolean | null> {
  return Object.fromEntries(dangerSignsByCohort[cohort].map((item) => [item.id, null]));
}

function deriveTriage(answers: Record<string, boolean | null>): TriageLevel {
  const positives = Object.values(answers).filter((value) => value === true).length;
  if (positives > 0) return 'refer';
  // Mock: nutrition / mild follow-up households lean treat when no danger signs.
  return 'watch';
}

function createState(launch: VisitFlowLaunch): VisitFlowState {
  const household = householdsById[launch.householdId] ?? householdsById['amina-yakubu'];
  const baseVitals = {
    bpSystolic: '',
    bpDiastolic: '',
    pulse: '',
    temp: '',
    respRate: '',
    pallor: false,
  };

  if (launch.mode === 'followup') {
    return {
      householdId: household.id,
      step: 'followup',
      cohort: household.suggestedCohort,
      dangerAnswers: {},
      triage: 'refer',
      vitals: baseVitals,
      facilityId: facilitiesForCohort(household.suggestedCohort)[0]?.id ?? null,
      capacityChecked: true,
      companion: '',
      followUpOutcome: null,
    };
  }

  // Voice check jumps straight into the danger-sign protocol for the suggested cohort.
  if (launch.mode === 'voice') {
    return {
      householdId: household.id,
      step: 'danger',
      cohort: household.suggestedCohort,
      dangerAnswers: initialAnswers(household.suggestedCohort),
      triage: null,
      vitals: baseVitals,
      facilityId: null,
      capacityChecked: false,
      companion: '',
      followUpOutcome: null,
    };
  }

  return {
    householdId: household.id,
    step: 'household',
    cohort: household.suggestedCohort,
    dangerAnswers: initialAnswers(household.suggestedCohort),
    triage: null,
    vitals: baseVitals,
    facilityId: null,
    capacityChecked: false,
    companion: '',
    followUpOutcome: null,
  };
}

const backMap: Partial<Record<VisitStep, VisitStep>> = {
  cohort: 'household',
  danger: 'cohort',
  result: 'danger',
  vitals: 'result',
  treat: 'result',
  facility: 'result',
  slip: 'facility',
};

export function VisitFlow({
  launch,
  onClose,
}: {
  launch: VisitFlowLaunch;
  onClose: () => void;
}) {
  const [state, setState] = useState<VisitFlowState>(() => createState(launch));

  const household = householdsById[state.householdId] ?? householdsById['amina-yakubu'];
  const cohort = state.cohort ?? household.suggestedCohort;
  const dangerItems = dangerSignsByCohort[cohort];
  const facilities = useMemo(() => facilitiesForCohort(cohort), [cohort]);
  const suggestedId = useMemo(() => suggestedFacilityId(cohort), [cohort]);
  const selectedFacility =
    facilities.find((item) => item.id === state.facilityId) ??
    facilities.find((item) => item.id === suggestedId) ??
    facilities[0];
  const protocol = protocolForCohort(cohort);
  const positiveCount = Object.values(state.dangerAnswers).filter((v) => v === true).length;
  const triage = state.triage ?? 'watch';

  const go = (step: VisitStep) => setState((prev) => ({ ...prev, step }));

  const onBack = () => {
    const prev = backMap[state.step];
    if (prev) go(prev);
    else onClose();
  };

  const afterResult = (level: TriageLevel) => {
    if (level === 'refer') go('facility');
    else if (level === 'treat') go('treat');
    else go('vitals');
  };

  let body = null;

  if (state.step === 'household') {
    body = (
      <HouseholdScreen
        household={household}
        onClose={onClose}
        onStart={() => go('cohort')}
      />
    );
  } else if (state.step === 'cohort') {
    body = (
      <CohortScreen
        suggested={household.suggestedCohort}
        selected={state.cohort}
        onSelect={(next) =>
          setState((prev) => ({
            ...prev,
            cohort: next,
            dangerAnswers: initialAnswers(next),
            triage: null,
          }))
        }
        onBack={onBack}
        onClose={onClose}
        onContinue={() => go('danger')}
      />
    );
  } else if (state.step === 'danger') {
    body = (
      <DangerSignsScreen
        items={dangerItems}
        answers={state.dangerAnswers}
        onAnswer={(id, value) =>
          setState((prev) => ({
            ...prev,
            dangerAnswers: { ...prev.dangerAnswers, [id]: value },
          }))
        }
        onBack={onBack}
        onClose={onClose}
        onSubmit={() => {
          const next = deriveTriage(state.dangerAnswers);
          // Mild anaemia / nutrition demo: if Amina answers all No, still allow treat path via override;
          // if Fatima child with no danger → treat protocol is more natural.
          const adjusted =
            next === 'watch' && household.id === 'fatima-adam' ? 'treat' : next;
          setState((prev) => ({ ...prev, triage: adjusted, step: 'result' }));
        }}
      />
    );
  } else if (state.step === 'result' && state.triage) {
    body = (
      <TriageResultScreen
        level={state.triage}
        positiveCount={positiveCount}
        onBack={onBack}
        onClose={onClose}
        onOverride={(level) => setState((prev) => ({ ...prev, triage: level }))}
        onConfirm={() => afterResult(state.triage!)}
      />
    );
  } else if (state.step === 'vitals') {
    body = (
      <VitalsScreen
        vitals={state.vitals}
        onChange={(patch) =>
          setState((prev) => {
            const vitals = { ...prev.vitals, ...patch };
            const critical =
              vitals.pallor ||
              Number(vitals.bpSystolic) >= 160 ||
              Number(vitals.temp) >= 38.5;
            return {
              ...prev,
              vitals,
              triage: critical ? 'refer' : prev.triage,
              step: critical ? 'result' : prev.step,
            };
          })
        }
        onBack={onBack}
        onClose={onClose}
        onContinue={() => go('complete')}
        onSkipToRoutine={() => go('complete')}
      />
    );
  } else if (state.step === 'treat') {
    body = (
      <TreatHomeScreen
        protocol={protocol}
        onBack={onBack}
        onClose={onClose}
        onDone={() => go('complete')}
        onEscalate={() => setState((prev) => ({ ...prev, triage: 'refer', step: 'facility' }))}
      />
    );
  } else if (state.step === 'facility') {
    body = (
      <ReferralFacilityScreen
        facilities={facilities}
        cohort={cohort}
        selectedId={state.facilityId ?? suggestedId}
        suggestedId={suggestedId}
        capacityChecked={state.capacityChecked}
        onSelect={(facilityId) =>
          setState((prev) => ({ ...prev, facilityId, capacityChecked: false }))
        }
        onCheckCapacity={() => setState((prev) => ({ ...prev, capacityChecked: true }))}
        onBack={onBack}
        onClose={onClose}
        onContinue={() => {
          if (!state.facilityId && suggestedId) {
            setState((prev) => ({ ...prev, facilityId: suggestedId, step: 'slip' }));
          } else {
            go('slip');
          }
        }}
      />
    );
  } else if (state.step === 'slip' && selectedFacility) {
    body = (
      <ReferralSlipScreen
        household={household}
        facility={selectedFacility}
        companion={state.companion}
        onCompanionChange={(companion) => setState((prev) => ({ ...prev, companion }))}
        onBack={onBack}
        onClose={onClose}
        onPrintAndDepart={() => go('complete')}
      />
    );
  } else if (state.step === 'followup') {
    body = (
      <FollowUpScreen
        household={household}
        selected={state.followUpOutcome}
        onSelect={(followUpOutcome: FollowUpOutcome) =>
          setState((prev) => ({ ...prev, followUpOutcome }))
        }
        onClose={onClose}
        onSave={onClose}
      />
    );
  } else {
    body = (
      <VisitCompleteScreen level={triage} householdName={household.name} onClose={onClose} />
    );
  }

  return <Screen bottomPadding={28}>{body}</Screen>;
}
