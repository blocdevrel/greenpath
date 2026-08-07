import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { Body, Caption, Card, Label, Stat, Subheading } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { ReferralStatusBadge } from './ReferralStatusBadge';

import type { Referral } from '../types/referral';

const actionLabel = (referral: Referral) => {
  if (referral.status === 'closed') return 'Done';
  if (referral.status === 'follow_up') return 'Confirm';
  return referral.slipPrinted ? 'Slip' : 'Print';
};

export function ReferralCard({
  referral,
  onPress,
}: {
  referral: Referral;
  onPress?: () => void;
}) {
  const [distanceValue, distanceUnit = ''] = referral.facilityDistance.split(' ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${actionLabel(referral)} referral for ${referral.name}`}
      onPress={onPress}>
      <Card
        className={`flex-row items-center gap-3 p-4 ${
          referral.status === 'closed' ? 'opacity-55' : ''
        }`}>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Subheading numberOfLines={1}>{referral.name}</Subheading>
            </View>
            <Label
              tone={referral.status === 'follow_up' ? 'default' : 'primary'}
              className={`shrink-0 pt-0.5 ${referral.status === 'follow_up' ? 'text-refer' : ''}`}>
              {actionLabel(referral)}
            </Label>
          </View>

          <View className="mt-2 flex-row items-baseline gap-1.5">
            <Stat>{distanceValue}</Stat>
            {distanceUnit ? (
              <Label tone="subtle" className="font-sans-semibold">
                {distanceUnit}
              </Label>
            ) : null}
          </View>

          <Body numberOfLines={1} className="mt-1">
            {referral.facility}
          </Body>

          <View className="mt-2 flex-row items-center gap-2">
            <ReferralStatusBadge status={referral.status} />
            <Caption numberOfLines={1}>{referral.dueLabel}</Caption>
          </View>
        </View>

        <View className="h-14 w-14 items-center justify-center rounded-md bg-primary-50">
          <Ionicons
            name={referral.slipPrinted ? 'document-text' : 'print-outline'}
            size={26}
            color={referral.status === 'follow_up' ? colors.refer.DEFAULT : colors.primary.DEFAULT}
          />
        </View>
      </Card>
    </Pressable>
  );
}
