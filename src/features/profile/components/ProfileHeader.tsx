import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Avatar, Body, Label, Subheading } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { workerProfile } from '../data/profileData';

export function ProfileHeader() {
  return (
    <View className="flex-row items-center gap-4">
      <Avatar name={workerProfile.name} size="lg" tone="dark" source={workerProfile.avatar} />
      <View className="min-w-0 flex-1 gap-1">
        <Subheading numberOfLines={1}>{workerProfile.name}</Subheading>
        <Body numberOfLines={1}>
          {workerProfile.role} · {workerProfile.zone}
        </Body>
        <View className="mt-1 flex-row items-center gap-1.5 self-start rounded-full bg-card px-2.5 py-1">
          <Ionicons name="cloud-offline-outline" size={13} color={colors.subtle} />
          <Label tone="subtle" className="text-caption">
            Offline · synced {workerProfile.lastSync}
          </Label>
        </View>
      </View>
    </View>
  );
}
