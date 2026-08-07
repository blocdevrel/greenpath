import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppTab } from '@/navigation/tabs';
import { colors } from '@/shared/theme/tokens';

type IonName = ComponentProps<typeof Ionicons>['name'];
type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const ICON_SIZE = 22;
const ICON_BOX = 24;

const tabs: readonly {
  id: AppTab;
  label: string;
  set: 'ion' | 'mci';
  icon: IonName | MciName;
}[] = [
  { id: 'home', label: 'Home', set: 'ion', icon: 'home-outline' },
  { id: 'lessons', label: 'Learn', set: 'ion', icon: 'book-outline' },
  { id: 'missions', label: 'Missions', set: 'mci', icon: 'bullseye' },
  { id: 'community', label: 'Community', set: 'ion', icon: 'people-outline' },
  { id: 'profile', label: 'Profile', set: 'ion', icon: 'person-outline' },
];

/** Reserve this much scroll padding above the floating tab bar. */
export const TAB_BAR_SCROLL_PADDING = 104;

export function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-50 border-t border-line bg-card-raised pt-2"
      style={{
        paddingBottom: Math.max(insets.bottom, 10),
        paddingHorizontal: 4,
      }}>
      <View className="w-full flex-row items-stretch">
        {tabs.map((tab) => {
          const selected = tab.id === activeTab;
          const color = selected ? colors.primary.DEFAULT : colors.muted;

          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
              onPress={() => onTabChange(tab.id)}
              className="items-center justify-center gap-0.5 rounded-md active:bg-primary-50"
              style={{
                flex: 1,
                minHeight: 56,
                minWidth: 0,
                paddingHorizontal: 2,
              }}>
              <View
                style={{
                  width: ICON_BOX,
                  height: ICON_BOX,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {tab.set === 'mci' ? (
                  <MaterialCommunityIcons
                    name={tab.icon as MciName}
                    size={ICON_SIZE}
                    color={color}
                  />
                ) : (
                  <Ionicons name={tab.icon as IonName} size={ICON_SIZE} color={color} />
                )}
              </View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 11,
                  lineHeight: 14,
                  color,
                  fontFamily: 'PlusJakartaSans_500Medium',
                }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
