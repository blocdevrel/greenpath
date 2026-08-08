import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Caption, Card, Heading, Label, Overline, Stat } from '@/shared/components/ui';
import { badges } from '@/shared/data/greenpathData';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

type IonName = ComponentProps<typeof Ionicons>['name'];

const recentActivity: {
  id: string;
  title: string;
  time: string;
  xp: number;
  icon: IonName;
  tint: string;
  soft: string;
}[] = [
  {
    id: 'a1',
    title: 'Completed Solar Energy lesson',
    time: '2h ago',
    xp: 150,
    icon: 'sunny-outline',
    tint: colors.gold.DEFAULT,
    soft: colors.gold.soft,
  },
  {
    id: 'a2',
    title: 'Finished Plastic Bottle Mission',
    time: '5h ago',
    xp: 100,
    icon: 'leaf-outline',
    tint: colors.primary.DEFAULT,
    soft: colors.primary[50],
  },
  {
    id: 'a3',
    title: 'Earned Recycling Champion badge',
    time: 'Yesterday',
    xp: 50,
    icon: 'ribbon-outline',
    tint: '#F97316',
    soft: '#FFF7ED',
  },
  {
    id: 'a4',
    title: 'Completed Climate Quiz',
    time: '2d ago',
    xp: 80,
    icon: 'help-circle-outline',
    tint: colors.accent.DEFAULT,
    soft: colors.accent.soft,
  },
];

const badgeVisual: Record<string, { icon: IonName; tint: string; soft: string }> = {
  waste: { icon: 'leaf', tint: colors.primary.DEFAULT, soft: colors.primary[50] },
  hero: { icon: 'earth', tint: colors.primary[600], soft: colors.primary[50] },
  recycle: { icon: 'refresh', tint: colors.secondary.DEFAULT, soft: colors.primary[50] },
  water: { icon: 'water', tint: colors.accent.DEFAULT, soft: colors.accent.soft },
  eco: { icon: 'trophy', tint: colors.gold.DEFAULT, soft: colors.gold.soft },
  tree: { icon: 'leaf', tint: colors.lime.DEFAULT, soft: colors.lime.soft },
};

export function ProfileScreen({
  onSignOut,
  onOpenSettings,
  onOpenAnalytics,
  onOpenRewards,
  onOpenLeaderboard,
}: {
  onSignOut: () => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onOpenRewards: () => void;
  onOpenLeaderboard: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { profile, unlockedBadgeIds } = useGreenPath();
  const unlocked = badges.filter((b) => unlockedBadgeIds.includes(b.id) || b.unlocked);
  const previewBadges = unlocked.slice(0, 4);
  const moreBadges = Math.max(0, (profile.badgesUnlocked || unlocked.length) - previewBadges.length);

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

          {/* Added: Recent Activity */}
          <View className="gap-3">
            <Label className="font-sans-semibold">Recent Activity</Label>
            <View className="gap-2.5">
              {recentActivity.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center gap-3 rounded-2xl border border-line bg-card-raised px-3.5 py-3.5">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-full"
                    style={{ backgroundColor: item.soft }}>
                    <Ionicons name={item.icon} size={20} color={item.tint} />
                  </View>
                  <View className="min-w-0 flex-1 gap-0.5">
                    <Label numberOfLines={1} className="font-sans-semibold">
                      {item.title}
                    </Label>
                    <Caption>{item.time}</Caption>
                  </View>
                  <Text
                    className="font-sans-bold text-caption"
                    style={{ color: colors.accent.DEFAULT }}>
                    +{item.xp} XP
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Added: Badges Earned row */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Label className="font-sans-semibold">Badges Earned</Label>
              <Pressable onPress={onOpenRewards} hitSlop={8}>
                <Caption className="font-sans-semibold text-primary">See all →</Caption>
              </Pressable>
            </View>
            <View className="flex-row items-center gap-3">
              {previewBadges.map((badge) => {
                const visual = badgeVisual[badge.id] ?? badgeVisual.hero;
                return (
                  <View
                    key={badge.id}
                    className="h-14 w-14 items-center justify-center rounded-full border border-line"
                    style={{ backgroundColor: visual.soft }}>
                    <Ionicons name={visual.icon} size={22} color={visual.tint} />
                  </View>
                );
              })}
              {moreBadges > 0 ? (
                <Pressable
                  onPress={onOpenRewards}
                  className="h-14 w-14 items-center justify-center rounded-full bg-canvas-sunken">
                  <Text className="font-sans-bold text-caption text-subtle">+{moreBadges}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Menu group — matches profile flow card */}
          <View className="overflow-hidden rounded-2xl border border-line bg-card-raised">
            <MenuRow
              icon="stats-chart-outline"
              iconTint={colors.accent.DEFAULT}
              iconSoft={colors.accent.soft}
              label="View Analytics"
              onPress={onOpenAnalytics}
            />
            <View className="mx-4 h-px bg-line" />
            <MenuRow
              icon="trophy"
              iconTint={colors.gold.DEFAULT}
              iconSoft={colors.gold.soft}
              label="Leaderboard"
              onPress={onOpenLeaderboard}
            />
            <View className="mx-4 h-px bg-line" />
            <MenuRow
              icon="settings-outline"
              iconTint={colors.ink.DEFAULT}
              iconSoft={colors.canvas.sunken}
              label="Settings"
              onPress={onOpenSettings}
            />
          </View>

          <Pressable
            onPress={onSignOut}
            className="h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-line bg-card-raised px-4">
            <Ionicons name="log-out-outline" size={20} color={colors.danger.DEFAULT} />
            <Text className="font-sans-semibold text-body text-danger">Sign out</Text>
          </Pressable>
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
  iconTint,
  iconSoft,
  label,
  onPress,
}: {
  icon: IonName;
  iconTint: string;
  iconSoft: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="min-h-[56px] flex-row items-center gap-3 px-4 py-3.5">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconSoft }}>
        <Ionicons name={icon} size={20} color={iconTint} />
      </View>
      <Text className="flex-1 font-sans-semibold text-body text-ink">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}
