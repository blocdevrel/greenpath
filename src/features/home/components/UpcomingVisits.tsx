import { Pressable, View } from 'react-native';

import { Label, Overline } from '@/shared/components/ui';

import { VisitCard } from './VisitCard';

import type { HouseholdVisit } from '../types/home';

export function UpcomingVisits({
  visits,
  onSeeFullRound,
  onVisitPress,
}: {
  visits: HouseholdVisit[];
  onSeeFullRound?: () => void;
  onVisitPress?: (visitId: string) => void;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Overline>Up next</Overline>
        <Pressable accessibilityRole="button" hitSlop={10} onPress={onSeeFullRound}>
          <Label tone="primary">See full round</Label>
        </Pressable>
      </View>

      <View className="gap-3">
        {visits.map((visit) => (
          <VisitCard key={visit.id} visit={visit} onPress={() => onVisitPress?.(visit.id)} />
        ))}
      </View>
    </View>
  );
}
