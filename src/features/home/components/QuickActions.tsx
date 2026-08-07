import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { Label, Overline } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { quickActions } from '../data/homeData';
import type { QuickAction } from '../types/home';

export function QuickActions({
  onAction,
}: {
  onAction?: (actionId: QuickAction['id']) => void;
}) {
  return (
    <View className="gap-3">
      <Overline>Quick actions</Overline>
      <View className="flex-row justify-between">
        {quickActions.map((action, index) => (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => onAction?.(action.id)}
            className="w-[23%] items-center gap-2 active:opacity-70">
            <View
              className={`h-14 w-14 items-center justify-center rounded-md ${
                index === 0 ? 'bg-primary' : 'bg-card'
              }`}>
              <Ionicons
                name={action.icon}
                size={23}
                color={index === 0 ? colors.card.raised : colors.ink.DEFAULT}
              />
            </View>
            <Label className="text-center text-caption">{action.label}</Label>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
