import { TextInput, View } from 'react-native';

import { Button, Card, Label, Overline, Subheading, TriageBadge } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { FlowHeader } from '../components/FlowHeader';
import type { FacilityOption, HouseholdDetail } from '../types';

export function ReferralSlipScreen({
  household,
  facility,
  companion,
  onCompanionChange,
  onBack,
  onClose,
  onPrintAndDepart,
}: {
  household: HouseholdDetail;
  facility: FacilityOption;
  companion: string;
  onCompanionChange: (value: string) => void;
  onBack: () => void;
  onClose: () => void;
  onPrintAndDepart: () => void;
}) {
  return (
    <View className="gap-5">
      <FlowHeader title="Referral slip" stepLabel="Depart" onBack={onBack} onClose={onClose} />

      <TriageBadge level="refer" />

      <Card tone="raised" className="gap-3 border border-line p-5">
        <Subheading>{household.name}</Subheading>
        <Label tone="subtle">{household.patientType}</Label>
        <Overline>To</Overline>
        <Subheading>
          {facility.name} · {facility.distance}
        </Subheading>
        <Label tone="subtle">{facility.routeNote}</Label>
        <Overline>From</Overline>
        <Label>Ama Mensah · Kumbungu CHPS</Label>
      </Card>

      <Label>Companion</Label>
      <View className="h-14 justify-center rounded-md border border-line bg-card-raised px-4">
        <TextInput
          value={companion}
          onChangeText={onCompanionChange}
          placeholder="Who accompanies?"
          placeholderTextColor={colors.muted}
          className="font-sans text-body text-ink"
        />
      </View>

      <Button label="Print slip & depart" size="lg" onPress={onPrintAndDepart} />
    </View>
  );
}
