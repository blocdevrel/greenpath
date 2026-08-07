import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Caption, Label } from '@/shared/components/ui';
import { notifications } from '@/shared/data/greenpathData';
import { colors } from '@/shared/theme/tokens';

const kindIcon: Record<string, ComponentProps<typeof Ionicons>['name']> = {
  reminder: 'alarm-outline',
  mission: 'flag-outline',
  badge: 'ribbon-outline',
  challenge: 'trophy-outline',
  ai: 'sparkles-outline',
};

export function NotificationsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center justify-between px-5 pb-4">
          <Label className="font-sans-bold text-heading">Notifications</Label>
          <Pressable
            onPress={onClose}
            className="h-11 w-11 items-center justify-center rounded-full border border-line bg-card-raised">
            <Ionicons name="close" size={20} color={colors.ink.DEFAULT} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24, gap: 12 }}>
          {notifications.map((n) => (
            <View
              key={n.id}
              className={`flex-row gap-3 rounded-xl border border-line bg-card-raised p-4 ${
                n.unread ? 'border-primary/40' : ''
              }`}>
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
                <Ionicons
                  name={kindIcon[n.kind] ?? 'notifications-outline'}
                  size={20}
                  color={colors.primary.DEFAULT}
                />
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="font-sans-semibold text-body text-ink">{n.title}</Text>
                  {n.unread ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
                </View>
                <Caption>{n.body}</Caption>
                <Caption>{n.time}</Caption>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
