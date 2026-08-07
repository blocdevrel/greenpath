import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { Avatar, IconButton, Label, SearchField, Title } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { workerProfile } from '@/features/profile/data/profileData';

export function HomeHeader({
  searchOpen,
  searchQuery,
  onSearchQueryChange,
  onToggleSearch,
  onOpenNotifications,
  onOpenProfile,
  unreadCount = 0,
}: {
  searchOpen: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onToggleSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
}) {
  return (
    <View className="gap-4">
      <View className="min-h-11 flex-row items-center gap-2 overflow-visible">
        {searchOpen ? (
          <>
            <SearchField
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              placeholder="Search households…"
              autoFocus
              className="min-w-0 flex-1"
            />
            <IconButton
              icon="close-outline"
              label="Close search"
              size="sm"
              onPress={onToggleSearch}
            />
          </>
        ) : (
          <>
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-md bg-primary">
                <Ionicons name="pulse" size={23} color={colors.card.raised} />
              </View>
              <Title className="text-heading">Reach</Title>
            </View>

            <IconButton icon="search-outline" label="Search" size="sm" onPress={onToggleSearch} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              onPress={onOpenNotifications}
              className="h-11 w-11 items-center justify-center rounded-full border border-line bg-card-raised active:opacity-70">
              <Ionicons name="notifications-outline" size={20} color={colors.ink.DEFAULT} />
              {unreadCount > 0 ? (
                <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-refer px-1.5">
                  <Text className="font-sans-bold text-[11px] leading-[13px] text-white">
                    {unreadCount > 9 ? '9+' : String(unreadCount)}
                  </Text>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile"
              onPress={onOpenProfile}
              hitSlop={6}>
              <Avatar
                name={workerProfile.name}
                size="sm"
                tone="dark"
                source={workerProfile.avatar}
              />
            </Pressable>
          </>
        )}
      </View>

      {!searchOpen ? (
        <View className="flex-row items-center gap-2 self-start rounded-full bg-card px-3 py-2">
          <Ionicons name="cloud-offline-outline" size={15} color={colors.subtle} />
          <Label tone="subtle" className="text-caption">
            Working offline · synced 07:12
          </Label>
        </View>
      ) : null}
    </View>
  );
}
