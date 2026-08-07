import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { Caption, Heading, Label } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

export function FlowHeader({
  title,
  stepLabel,
  onBack,
  onClose,
}: {
  title: string;
  stepLabel?: string;
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={onBack}
            className="h-12 w-12 items-center justify-center rounded-full border border-line bg-card-raised">
            <Ionicons name="chevron-back" size={22} color={colors.ink.DEFAULT} />
          </Pressable>
        ) : (
          <View className="h-12 w-12" />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close visit"
          hitSlop={12}
          onPress={onClose}
          className="h-12 w-12 items-center justify-center rounded-full border border-line bg-card-raised">
          <Ionicons name="close" size={22} color={colors.ink.DEFAULT} />
        </Pressable>
      </View>
      {stepLabel ? <Caption>{stepLabel}</Caption> : null}
      <Heading>{title}</Heading>
      {stepLabel ? null : <Label tone="subtle"> </Label>}
    </View>
  );
}
