import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BadgeMedal } from '@/features/rewards/components/BadgeMedal';
import { InviteFriendsCard } from '@/features/profile/components/InviteFriendsCard';
import { profileAvatarSource } from '@/shared/api';
import { StreakFireIcon } from '@/shared/components/GameArt';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Caption, Card, Heading, Label, Overline, Stat } from '@/shared/components/ui';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

type IonName = ComponentProps<typeof Ionicons>['name'];

const RECENT_PREVIEW = 2;

const reasonVisual: Record<string, { icon: IonName; tint: string; soft: string }> = {
  lesson: { icon: 'book-outline', tint: colors.gold.DEFAULT, soft: colors.gold.soft },
  mission: { icon: 'flag-outline', tint: colors.primary.DEFAULT, soft: colors.primary[50] },
  quiz: { icon: 'help-circle-outline', tint: colors.accent.DEFAULT, soft: colors.accent.soft },
  report: { icon: 'map-outline', tint: '#EA580C', soft: '#FFF7ED' },
  badge: { icon: 'ribbon-outline', tint: '#F97316', soft: '#FFF7ED' },
};

export function ProfileScreen({
  onSignOut,
  onOpenSettings,
  onOpenEditProfile,
  onOpenAnalytics,
  onOpenRewards,
  onOpenLeaderboard,
}: {
  onSignOut: () => void;
  onOpenSettings: () => void;
  onOpenEditProfile: () => void;
  onOpenAnalytics: () => void;
  onOpenRewards: () => void;
  onOpenLeaderboard: () => void;
}) {
  const insets = useSafeAreaInsets();
  const {
    profile,
    activity,
    badges,
    completedLessonIds,
    completedMissionIds,
    sessionStatus,
  } = useGreenPath();
  const [activityExpanded, setActivityExpanded] = useState(false);

  const unlocked = badges.filter((b) => b.unlocked);
  const previewBadges = unlocked.slice(0, 4);
  const badgeCount = Math.max(unlocked.length, profile.badgesUnlocked || 0);
  const moreBadges = Math.max(0, badgeCount - previewBadges.length);
  const lessonsDone = Math.max(completedLessonIds.length, profile.lessonsCompleted);
  const missionsDone = Math.max(completedMissionIds.length, profile.missionsCompleted);
  const avatar = profileAvatarSource(profile);
  const displayName = profile.fullName || profile.name || 'GreenPath Youth';
  const feedAll = activity.slice(0, 20);
  const feed = activityExpanded ? feedAll : feedAll.slice(0, RECENT_PREVIEW);
  const hiddenCount = Math.max(0, feedAll.length - RECENT_PREVIEW);

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
            <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-primary-50">
              <Image
                source={avatar}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                accessibilityLabel={`${displayName} profile photo`}
              />
            </View>
            <Heading>{displayName}</Heading>
            <Pressable
              onPress={onOpenEditProfile}
              className="flex-row items-center gap-1.5 rounded-full border border-line bg-card-raised px-3.5 py-2">
              <Ionicons name="create-outline" size={16} color={colors.primary.DEFAULT} />
              <Caption className="font-sans-semibold text-primary">Edit profile</Caption>
            </Pressable>
            {profile.email ? <Caption>{profile.email}</Caption> : null}
            {profile.region ? (
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="location-outline" size={14} color={colors.subtle} />
                <Caption>{profile.region}</Caption>
              </View>
            ) : null}
            {profile.bio ? (
              <Caption className="max-w-sm text-center">{profile.bio}</Caption>
            ) : null}
            {sessionStatus === 'error' ? (
              <Caption className="text-center text-gold">Showing local profile · API offline</Caption>
            ) : null}
          </View>

          <View className="flex-row gap-3">
            <StatCard label="Total XP" value={profile.totalXp.toLocaleString()} />
            <StatCard label="Lessons" value={String(lessonsDone)} />
            <StatCard label="Missions" value={String(missionsDone)} />
          </View>

          <Card className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <StreakFireIcon size={40} />
              <View>
                <Caption>Current streak</Caption>
                <Label className="font-sans-bold text-heading">{profile.streak} days</Label>
              </View>
            </View>
            <Label tone="primary">Level {profile.level}</Label>
          </Card>

          <Card tone="primary" className="gap-1">
            <Caption className="text-white/80">Climate impact</Caption>
            <Text className="font-sans-bold text-subheading text-white">
              {profile.carbonSavedKg} kg CO₂ saved this month
            </Text>
          </Card>

          <InviteFriendsCard referralCode={profile.referralCode} />

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Label className="font-sans-semibold">Recent Activity</Label>
              {hiddenCount > 0 ? (
                <Pressable
                  onPress={() => setActivityExpanded((v) => !v)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    activityExpanded ? 'Show less activity' : 'Show all recent activity'
                  }
                  className="flex-row items-center gap-1">
                  <Caption className="font-sans-semibold text-primary">
                    {activityExpanded ? 'Show less' : `Show all (${feedAll.length})`}
                  </Caption>
                  <Ionicons
                    name={activityExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.primary.DEFAULT}
                  />
                </Pressable>
              ) : null}
            </View>
            {feedAll.length === 0 ? (
              <Card className="gap-1 py-4">
                <Label className="font-sans-semibold">No activity yet</Label>
                <Caption>
                  Finish a lesson, quiz, or mission — your XP and badges will show up here.
                </Caption>
              </Card>
            ) : (
              <View className="gap-2.5">
                {feed.map((item) => {
                  const visual = reasonVisual[item.reason] ?? reasonVisual.lesson;
                  return (
                    <View
                      key={item.id}
                      className="flex-row items-center gap-3 rounded-2xl border border-line bg-card-raised px-3.5 py-3.5">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-full"
                        style={{ backgroundColor: visual.soft }}>
                        <Ionicons name={visual.icon} size={20} color={visual.tint} />
                      </View>
                      <View className="min-w-0 flex-1 gap-0.5">
                        <Label numberOfLines={2} className="font-sans-semibold">
                          {item.title}
                        </Label>
                        <Caption>{formatRelativeTime(item.createdAt)}</Caption>
                      </View>
                      <Text
                        className="font-sans-bold text-caption"
                        style={{ color: colors.accent.DEFAULT }}>
                        +{item.xp} XP
                      </Text>
                    </View>
                  );
                })}
                {!activityExpanded && hiddenCount > 0 ? (
                  <Pressable
                    onPress={() => setActivityExpanded(true)}
                    className="items-center rounded-2xl border border-line bg-card-raised py-3">
                    <Caption className="font-sans-semibold text-primary">
                      +{hiddenCount} more · Expand
                    </Caption>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Label className="font-sans-semibold">Badges Earned</Label>
              <Pressable onPress={onOpenRewards} hitSlop={8}>
                <Caption className="font-sans-semibold text-primary">See all →</Caption>
              </Pressable>
            </View>
            {previewBadges.length === 0 ? (
              <Caption>Complete lessons and missions to unlock your first badge.</Caption>
            ) : (
              <View className="flex-row items-center gap-3">
                {previewBadges.map((badge) => (
                  <BadgeMedal key={badge.key} visual={badge.visual} size="sm" unlocked />
                ))}
                {moreBadges > 0 ? (
                  <Pressable
                    onPress={onOpenRewards}
                    className="h-10 w-10 items-center justify-center bg-canvas-sunken"
                    style={{ borderRadius: 8 }}>
                    <Text className="font-sans-bold text-caption text-subtle">+{moreBadges}</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>

          <View className="overflow-hidden rounded-2xl border border-line bg-card-raised">
            <MenuRow
              icon="person-outline"
              iconTint={colors.primary.DEFAULT}
              iconSoft={colors.primary[50]}
              label="Edit profile"
              onPress={onOpenEditProfile}
            />
            <View className="mx-4 h-px bg-line" />
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
    <Card className="min-w-0 flex-1 items-center gap-1 px-1.5 py-4">
      <Stat
        className="w-full text-center text-heading"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.55}>
        {value}
      </Stat>
      <Caption numberOfLines={1}>{label}</Caption>
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
