import { Pressable, View } from 'react-native';

import { Button, Card, Label, Subheading, TriageBadge } from '@/shared/components/ui';

import { FlowHeader } from '../components/FlowHeader';
import type { FollowUpOutcome, HouseholdDetail } from '../types';

const outcomes: { id: FollowUpOutcome; title: string }[] = [
  { id: 'arrived', title: 'Arrived · attended' },
  { id: 'left_without_care', title: 'Arrived · left without care' },
  { id: 'did_not_arrive', title: 'Did not arrive' },
  { id: 'counter_referral', title: 'Counter-referral' },
];

export function FollowUpScreen({
  household,
  selected,
  onSelect,
  onClose,
  onSave,
}: {
  household: HouseholdDetail;
  selected: FollowUpOutcome | null;
  onSelect: (outcome: FollowUpOutcome) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <View className="gap-5">
      <FlowHeader title="Close referral" stepLabel="Follow-up" onClose={onClose} />

      <Card className="gap-2 p-4">
        <TriageBadge level="refer" />
        <Subheading>{household.name}</Subheading>
        <Label tone="subtle">{household.patientType}</Label>
      </Card>

      <View className="gap-2">
        {outcomes.map((outcome) => {
          const active = selected === outcome.id;
          return (
            <Pressable key={outcome.id} onPress={() => onSelect(outcome.id)}>
              <Card
                className={`p-4 ${active ? 'border border-primary bg-primary-50' : ''}`}>
                <Subheading>{outcome.title}</Subheading>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Button label="Save" size="lg" disabled={!selected} onPress={onSave} />
    </View>
  );
}
