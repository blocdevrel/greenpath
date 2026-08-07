import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Caption, Card, Heading, Label, Overline, Stat } from '@/shared/components/ui';
import { badges } from '@/shared/data/greenpathData';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function ProfileScreen({
  onSignOut,
  onOpenSettings,
  onOpenAnalytics,
  onOpenRewards,
}: {
  onSignOut: () => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onOpenRewards: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { profile, unlockedBadgeIds } = useGreenPath();
  const unlocked = badges.filter((b) => unlockedBadgeIds.includes(b.id));

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: TAB_BAR_SCROLL_PADDING + insets.bottom,
        }}>
        <View className="gap-6 px-5 pb-8">
          <View className="flex-row items-center justify-between">
            <Overline>Profile</Overline>
            <Pressable
              onPress={onOpenSettings}
              accessibilityLabel="Settings"
              className="h-11 w-11 items-center justify-center rounded-full border border-line bg-card-raised">
              <Ionicons name="settings-outline" size={20} color={colors.ink.DEFAULT} />
            </Pressable>
          </View>

          <View className="items-center gap-3">
            <View className="h-28 w-28 overflow-hidden rounded-full bg-primary-50">
              <Image
                source={profile.avatar}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                accessibilityLabel={`${profile.fullName} profile photo`}
              />
            </View>
            <Heading>{profile.fullName}</Heading>
            <Caption>{profile.email}</Caption>
          </View>

          <View className="flex-row gap-3">
            <StatCard label="Total XP" value={String(profile.xp)} />
            <StatCard label="Lessons" value={String(profile.lessonsCompleted)} />
            <StatCard label="Missions" value={String(profile.missionsCompleted)} />
          </View>

          <Card className="flex-row items-center justify-between">
            <View>
              <Caption>Current streak</Caption>
              <Label className="font-sans-bold text-heading">{profile.streak} days</Label>
            </View>
            <Label tone="primary">Level {profile.level}</Label>
          </Card>

          <Card tone="primary" className="gap-1">
            <Caption className="text-white/80">Climate impact</Caption>
            <Text className="font-sans-bold text-subheading text-white">
              {profile.carbonSavedKg} kg CO₂ saved this month
            </Text>
          </Card>

          <View className="gap-3">
            <Label className="font-sans-semibold">Achievements</Label>
            <Pressable onPress={onOpenRewards}>
              <Card className="flex-row flex-wrap gap-2">
                {unlocked
                  .map((b) => (
                    <View key={b.id} className="rounded-full bg-gold-soft px-3 py-2">
                      <Text className="font-sans-medium text-caption text-ink">{b.name}</Text>
                    </View>
                  ))}
              </Card>
            </Pressable>
          </View>

          <MenuRow
            icon="bar-chart-outline"
            label="Analytics"
            onPress={onOpenAnalytics}
          />
          <MenuRow icon="ribbon-outline" label="Rewards & Badges" onPress={onOpenRewards} />
          <MenuRow icon="settings-outline" label="Settings" onPress={onOpenSettings} />
          <MenuRow icon="log-out-outline" label="Sign out" danger onPress={onSignOut} />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex-1 items-center gap-1 py-4">
      <Stat className="text-heading">{value}</Stat>
      <Caption>{label}</Caption>
    </Card>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 flex-row items-center gap-3 rounded-xl border border-line bg-card-raised px-4">
      <Ionicons
        name={icon}
        size={20}
        color={danger ? colors.danger.DEFAULT : colors.ink.DEFAULT}
      />
      <Text
        className={`flex-1 font-sans-semibold text-body ${danger ? 'text-danger' : 'text-ink'}`}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}
