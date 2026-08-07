import { View } from 'react-native';

import { Button, Card, Label, Title, TriageBadge } from '@/shared/components/ui';
import type { TriageLevel } from '@/shared/theme/tokens';

import { FlowHeader } from '../components/FlowHeader';

const titles: Record<TriageLevel, string> = {
  refer: 'Referral opened',
  treat: 'Home care recorded',
  watch: 'Visit complete',
};

export function VisitCompleteScreen({
  level,
  householdName,
  onClose,
}: {
  level: TriageLevel;
  householdName: string;
  onClose: () => void;
}) {
  return (
    <View className="gap-5">
      <FlowHeader title="Done" stepLabel="Leave" onClose={onClose} />

      <Card className="gap-3 p-5">
        <TriageBadge level={level} />
        <Title>{titles[level]}</Title>
        <Label tone="subtle">{householdName}</Label>
      </Card>

      <Button label="Back to rounds" size="lg" onPress={onClose} />
    </View>
  );
}
