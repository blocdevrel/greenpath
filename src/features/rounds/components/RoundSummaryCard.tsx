import { View } from 'react-native';

import { Card, Caption, Label, Stat } from '@/shared/components/ui';

import { roundSummary } from '../data/roundsData';

export function RoundSummaryCard() {
  return (
    <View className="flex-row gap-3">
      <Card tone="dark" className="flex-1 items-start gap-1 p-4">
        <Caption>At risk</Caption>
        <Stat>{roundSummary.atRisk}</Stat>
      </Card>
      <Card tone="primary" className="flex-1 items-start gap-1 p-4">
        <Caption>Overdue</Caption>
        <Stat>{roundSummary.overdue}</Stat>
      </Card>
      <Card className="flex-1 items-start gap-1 p-4">
        <Caption>Left today</Caption>
        <Label className="font-sans-extrabold text-stat">{roundSummary.remaining}</Label>
      </Card>
    </View>
  );
}
