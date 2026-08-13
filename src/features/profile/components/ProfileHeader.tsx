import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { profileAvatarSource } from '@/shared/api';
import { Avatar, Body, Label, Subheading } from '@/shared/components/ui';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

/** Live profile header (Clerk + Nest `/me`) — replaces the old CHPS demo card. */
export function ProfileHeader() {
  const { profile, sessionStatus } = useGreenPath();
  const displayName = profile.fullName || profile.name || 'GreenPath Youth';
  const subtitle = [profile.region, profile.email].filter(Boolean).join(' · ');

  return (
    <View className="flex-row items-center gap-4">
      <Avatar
        name={displayName}
        size="lg"
        tone="dark"
        source={profileAvatarSource(profile)}
      />
      <View className="min-w-0 flex-1 gap-1">
        <Subheading numberOfLines={1}>{displayName}</Subheading>
        {subtitle ? (
          <Body numberOfLines={1}>{subtitle}</Body>
        ) : (
          <Body numberOfLines={1}>GreenPath Ghana</Body>
        )}
        <View className="mt-1 flex-row items-center gap-1.5 self-start rounded-full bg-card px-2.5 py-1">
          <Ionicons
            name={sessionStatus === 'ready' ? 'cloud-done-outline' : 'cloud-offline-outline'}
            size={13}
            color={colors.subtle}
          />
          <Label tone="subtle" className="text-caption">
            {sessionStatus === 'ready' ? 'Synced' : 'Local profile'}
          </Label>
        </View>
      </View>
    </View>
  );
}
