import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ApiError,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationDto,
} from '@/shared/api';
import { Caption, Label } from '@/shared/components/ui';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import { colors } from '@/shared/theme/tokens';

const kindIcon: Record<string, ComponentProps<typeof Ionicons>['name']> = {
  reminder: 'alarm-outline',
  email: 'mail-outline',
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
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      setItems([]);
      setUnreadCount(0);
      setError(e instanceof ApiError ? e.message : 'Could not load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    void load();
  }, [load, visible]);

  const onMarkAll = async () => {
    try {
      const data = await markAllNotificationsRead();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // keep current list
    }
  };

  const onOpenItem = async (item: NotificationDto) => {
    if (!item.unread) return;
    try {
      const data = await markNotificationRead(item.id);
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // ignore
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center justify-between px-5 pb-4">
          <View className="min-w-0 flex-1 gap-0.5">
            <Label className="font-sans-bold text-heading">Notifications</Label>
            {unreadCount > 0 ? (
              <Caption>{unreadCount} unread</Caption>
            ) : null}
          </View>
          {unreadCount > 0 ? (
            <Pressable onPress={() => void onMarkAll()} className="mr-2 px-2 py-2">
              <Caption className="font-sans-semibold text-primary">Mark all read</Caption>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onClose}
            className="h-11 w-11 items-center justify-center rounded-full border border-line bg-card-raised">
            <Ionicons name="close" size={20} color={colors.ink.DEFAULT} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
            gap: 12,
          }}>
          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={colors.primary.DEFAULT} />
              <Caption className="mt-3">Loading…</Caption>
            </View>
          ) : null}

          {error ? (
            <View className="items-center gap-3 rounded-lg bg-card px-5 py-10" style={{ borderRadius: 8 }}>
              <Caption className="text-center">{error}</Caption>
              <Pressable
                onPress={() => void load()}
                className="rounded-lg bg-primary px-5 py-3"
                style={{ borderRadius: 8 }}>
                <Text className="font-sans-bold text-body text-white">Retry</Text>
              </Pressable>
            </View>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <View className="items-center gap-3 rounded-lg bg-card px-5 py-12" style={{ borderRadius: 8 }}>
              <Ionicons name="notifications-outline" size={36} color={colors.primary.DEFAULT} />
              <Text className="text-center font-sans-semibold text-body text-ink">
                No notifications yet
              </Text>
              <Caption className="text-center">
                Mission completions, badge unlocks, and reminders will appear here.
              </Caption>
            </View>
          ) : null}

          {!loading
            ? items.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => void onOpenItem(n)}
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
                      <Text className="min-w-0 flex-1 font-sans-semibold text-body text-ink">
                        {n.title}
                      </Text>
                      {n.unread ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
                    </View>
                    <Caption>{n.body}</Caption>
                    <Caption>{formatRelativeTime(n.createdAt)}</Caption>
                  </View>
                </Pressable>
              ))
            : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
