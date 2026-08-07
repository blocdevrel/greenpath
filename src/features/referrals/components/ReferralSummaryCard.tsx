import { View } from 'react-native';

import { Card, Caption, Label, Stat } from '@/shared/components/ui';

import { referralSummary } from '../data/referralsData';

export function ReferralSummaryCard() {
  return (
    <View className="flex-row gap-3">
      <Card tone="dark" className="flex-1 items-start gap-1 p-4">
        <Caption>Open</Caption>
        <Stat>{referralSummary.open}</Stat>
      </Card>
      <Card tone="primary" className="flex-1 items-start gap-1 p-4">
        <Caption>Follow up</Caption>
        <Stat>{referralSummary.followUpDue}</Stat>
      </Card>
      <Card className="flex-1 items-start gap-1 p-4">
        <Caption>Closed</Caption>
        <Label className="font-sans-extrabold text-stat">{referralSummary.closedThisWeek}</Label>
      </Card>
    </View>
  );
}
