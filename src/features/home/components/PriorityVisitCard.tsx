import { VisitCard } from './VisitCard';

import type { HouseholdVisit } from '../types/home';

export function PriorityVisitCard({
  visit,
  onPress,
}: {
  visit: HouseholdVisit;
  onPress?: () => void;
}) {
  return <VisitCard visit={visit} eyebrow="Next priority visit" onPress={onPress} />;
}
