import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { Label } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { profileMenu } from '../data/profileData';

export function ProfileMenu({
  onSignOut,
  onOpenHhCode,
}: {
  onSignOut?: () => void;
  onOpenHhCode?: () => void;
}) {
  return (
    <View className="overflow-hidden rounded-md bg-card">
      {profileMenu.map((item, index) => {
        const danger = item.tone === 'danger';
        const onPress =
          item.id === 'signout'
            ? onSignOut
            : item.id === 'ussd'
              ? onOpenHhCode
              : undefined;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={onPress}
            className={`min-h-14 flex-row items-center gap-3 px-4 py-3.5 active:bg-canvas-sunken ${
              index !== profileMenu.length - 1 ? 'border-b border-line' : ''
            }`}>
            <View
              className={`h-10 w-10 items-center justify-center rounded-md ${
                danger ? 'bg-refer-soft' : 'bg-primary-50'
              }`}>
              <Ionicons
                name={item.icon}
                size={20}
                color={danger ? colors.refer.DEFAULT : colors.primary.DEFAULT}
              />
            </View>

            <View className="min-w-0 flex-1">
              <Label className={`font-sans-semibold ${danger ? 'text-refer' : 'text-ink'}`}>
                {item.label}
              </Label>
            </View>

            {item.value ? <Label tone="muted">{item.value}</Label> : null}

            <Ionicons
              name="chevron-forward"
              size={18}
              color={danger ? colors.refer.DEFAULT : colors.muted}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
