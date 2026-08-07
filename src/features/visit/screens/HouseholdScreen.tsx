import { Pressable, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  Label,
  Overline,
  Subheading,
  TriageBadge,
} from '@/shared/components/ui';

import { FlowHeader } from '../components/FlowHeader';
import type { HouseholdDetail } from '../types';

export function HouseholdScreen({
  household,
  onClose,
  onStart,
}: {
  household: HouseholdDetail;
  onClose: () => void;
  onStart: () => void;
}) {
  return (
    <View className="gap-5">
      <FlowHeader title={household.name} stepLabel="Household" onClose={onClose} />

      <Card className="gap-3 p-5">
        <View className="flex-row items-center justify-between">
          <Subheading>{household.patientType}</Subheading>
          <TriageBadge level={household.level} />
        </View>
        <Label tone="subtle">{household.reason}</Label>
        <View className="flex-row flex-wrap gap-2">
          <Badge label={household.distance} />
          <Badge label={household.dueLabel} />
        </View>
      </Card>

      <View className="gap-2">
        <Overline>Place</Overline>
        <Card className="gap-1 p-4">
          <Label>{household.landmark}</Label>
          <Label tone="subtle">{household.caregiver}</Label>
        </Card>
      </View>

      <View className="gap-2">
        <Overline>Members</Overline>
        {household.members.map((member) => (
          <Card key={member.name} className="flex-row items-center justify-between p-4">
            <Subheading numberOfLines={1}>{member.name}</Subheading>
            <Label tone="subtle">{member.role}</Label>
          </Card>
        ))}
      </View>

      <View className="flex-row flex-wrap gap-2">
        {household.openFlags.map((flag) => (
          <Badge key={flag} label={flag} />
        ))}
      </View>

      <Button label="Start visit" size="lg" trailingGlyph="→" onPress={onStart} />
      <Pressable onPress={onClose}>
        <Label tone="subtle" className="text-center">
          Not now
        </Label>
      </Pressable>
    </View>
  );
}
