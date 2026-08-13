import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ComponentType } from 'react';
import { useMemo } from 'react';
import { Image, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CommunityEventView } from '@/features/community/eventModel';
import { EventAttendeeStack } from '@/features/community/components/EventAttendeeStack';
import { IllustratedPromoCard } from '@/features/home/components/IllustratedPromoCard';
import { WeeklyProgressCard } from '@/features/home/components/WeeklyProgressCard';
import { useTts } from '@/shared/a11y/useTts';
import { profileAvatarSource } from '@/shared/api';
import { eventScene, missionScene } from '@/shared/components/Illustration';
import { useShellWidth } from '@/shared/components/MobileShell';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Caption, Card, HorizontalScrollRow } from '@/shared/components/ui';
import type { Mission } from '@/shared/data/greenpathData';
import { Trophy, Zap } from '@/shared/icons/lucide';
import { images } from '@/shared/media';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export type HomeAction =
  | 'lesson'
  | 'quiz'
  | 'mission'
  | 'report'
  | 'voice'
  | 'community'
  | 'notifications'
  | 'rewards'
  | 'leaderboard';

type IonName = ComponentProps<typeof Ionicons>['name'];
type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const quickActions: {
  id: HomeAction;
  title: string;
  hint: string;
  set: 'ion' | 'mci';
  icon: IonName | MciName;
  tint: string;
  soft: string;
}[] = [
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    hint: 'Rank & XP',
    set: 'ion',
    icon: 'trophy-outline',
    tint: colors.gold.DEFAULT,
    soft: colors.gold.soft,
  },
  {
    id: 'report',
    title: 'Report',
    hint: 'Flag trash',
    set: 'mci',
    icon: 'map-marker-alert-outline',
    tint: '#EA580C',
    soft: '#FFF7ED',
  },
  {
    id: 'mission',
    title: 'Missions',
    hint: 'Daily tasks',
    set: 'mci',
    icon: 'bullseye-arrow',
    tint: colors.lime.DEFAULT,
    soft: colors.lime.soft,
  },
  {
    id: 'voice',
    title: 'Voice',
    hint: 'Ask anything',
    set: 'ion',
    icon: 'mic-outline',
    tint: colors.primary[600],
    soft: colors.primary[50],
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen({
  onAction,
  onOpenProfile,
  onOpenEvent,
  onOpenMission,
}: {
  onAction: (action: HomeAction) => void;
  onOpenProfile?: () => void;
  onOpenEvent?: (event: CommunityEventView) => void;
  onOpenMission?: (mission: Mission) => void;
}) {
  const insets = useSafeAreaInsets();
  const shellWidth = useShellWidth();
  const { profile, filteredMissions, weeklyProgress, events } = useGreenPath();
  const { speaking, paused, playPause } = useTts();
  const todayMissions = useMemo(() => {
    const list = filteredMissions.slice(0, 4);
    const sachetIdx = list.findIndex((m) => m.id === 'sachet-sort');
    const inviteIdx = list.findIndex((m) => m.id === 'invite-friend');
    if (sachetIdx > -1 && inviteIdx > -1 && sachetIdx > inviteIdx) {
      const next = [...list];
      [next[inviteIdx], next[sachetIdx]] = [next[sachetIdx], next[inviteIdx]];
      return next;
    }
    return list;
  }, [filteredMissions]);
  const todayMission = todayMissions[0];
  const displayName = profile.fullName || profile.name;
  const avatarSrc = profileAvatarSource(profile);
  const treesEq = Math.round(profile.carbonSavedKg * 0.05 * 10) / 10;
  const upcomingEvents = useMemo(() => events.slice(0, 4), [events]);
  const promoCardWidth = Math.max(240, shellWidth - 72);

  const homeSpeech = `${greeting()} ${displayName}. You have ${profile.totalXp} XP, level ${profile.level}, streak ${profile.streak} days. You've prevented ${profile.carbonSavedKg} kilograms of CO2 this month.${
    todayMission ? ` Today's mission: ${todayMission.title}.` : ''
  }`;

  // Don't auto-speak on open — device TTS sounds generic; users opt in via the play button.
  // Voice coach (OpenRouter) lives on the Voice screen.

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        style={{
          flex: 1,
          ...(Platform.OS === 'web'
            ? ({ overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as const)
            : null),
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_SCROLL_PADDING + insets.bottom,
        }}>
        {/* Gradient header + CO₂ card straddling the seam */}
        <View>
          <LinearGradient
            colors={['#1B5E20', '#2E7D32', '#43A047']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              paddingTop: insets.top + 20,
              paddingBottom: 64,
              paddingHorizontal: 20,
            }}>
            <View className="gap-6">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="min-w-0 flex-1 font-sans-extrabold text-heading text-white" numberOfLines={1}>
                  GreenPath
                </Text>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() => {
                      void playPause(homeSpeech, { force: true });
                    }}
                    accessibilityLabel={
                      speaking ? 'Pause reading' : paused ? 'Resume reading' : 'Play home audio'
                    }
                    accessibilityHint="Plays or pauses the home readout"
                    className={`h-10 w-10 items-center justify-center rounded-full border ${
                      speaking || paused
                        ? 'border-white/40 bg-white'
                        : 'border-white/25 bg-white/20'
                    }`}>
                    <Ionicons
                      name={speaking ? 'pause' : 'play'}
                      size={18}
                      color={speaking || paused ? colors.primary.DEFAULT : '#FFFFFF'}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => onAction('notifications')}
                    accessibilityLabel="Notifications"
                    className="h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/20">
                    <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
                    <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
                  </Pressable>
                  <Pressable
                    onPress={onOpenProfile}
                    accessibilityLabel="Profile"
                    className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-50">
                    <Image
                      source={avatarSrc}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />
                  </Pressable>
                </View>
              </View>

              <View className="flex-row gap-2">
                <BannerStat
                  Icon={Zap}
                  iconColor="#FACC15"
                  value={profile.totalXp.toLocaleString()}
                  label="Total XP"
                />
                <BannerStat
                  Icon={Trophy}
                  iconColor="#FBBF24"
                  value={String(profile.level)}
                  label="Level"
                />
                <Pressable
                  className="min-w-0 flex-1"
                  onPress={() => onAction('rewards')}
                  accessibilityRole="button"
                  accessibilityLabel="Streak">
                  <BannerStat
                    image={images.streakFire}
                    value={`${profile.streak}d`}
                    label="Streak"
                  />
                </Pressable>
              </View>
            </View>
          </LinearGradient>

          {/* Half on gradient, half on white canvas */}
          <View className="z-10 px-5" style={{ marginTop: -32 }}>
            <View className="overflow-hidden bg-primary" style={{ borderRadius: 8 }}>
              <View className="flex-row items-center gap-3 px-3.5 py-3">
                <View style={{ flexShrink: 0 }}>
                  <Image
                    source={images.earth}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                    accessibilityIgnoresInvertColors
                    accessibilityLabel="Earth"
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-bold text-label text-white" numberOfLines={2}>
                    {profile.carbonSavedKg} kg CO₂ prevented this month
                  </Text>
                  <Text className="font-sans text-caption text-white/80" numberOfLines={1}>
                    Equal to {treesEq} trees planted
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-6 pb-8 pt-3">
          <View className="gap-3 px-5">
            <Text className="font-sans-bold text-heading text-ink">Quick actions</Text>
            <View className="flex-row flex-wrap justify-between gap-y-2.5">
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => onAction(action.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${action.title}. ${action.hint}`}
                  className="flex-row items-center gap-3 bg-card px-3 py-3 active:opacity-90"
                  style={{ width: '48.5%', borderRadius: 8 }}>
                  <View
                    className="h-10 w-10 items-center justify-center"
                    style={{ backgroundColor: action.soft, borderRadius: 8 }}>
                    {action.set === 'mci' ? (
                      <MaterialCommunityIcons
                        name={action.icon as MciName}
                        size={20}
                        color={action.tint}
                      />
                    ) : (
                      <Ionicons name={action.icon as IonName} size={20} color={action.tint} />
                    )}
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-sans-bold text-label text-ink" numberOfLines={1}>
                      {action.title}
                    </Text>
                    <Caption numberOfLines={1}>{action.hint}</Caption>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <Text className="px-5 font-sans-bold text-heading text-ink">Today's mission</Text>
            {todayMissions.length > 0 ? (
              <HorizontalScrollRow
                width={shellWidth}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                snapToInterval={promoCardWidth + 12}
                snapToAlignment="start">
                {todayMissions.map((mission) => (
                  <IllustratedPromoCard
                    key={mission.id}
                    image={missionScene(mission.illustration)}
                    title={mission.title}
                    subtitle={mission.impact}
                    width={promoCardWidth}
                    onPress={() =>
                      onOpenMission ? onOpenMission(mission) : onAction('mission')
                    }
                    accessibilityLabel={`${mission.title}. ${mission.impact}`}
                  />
                ))}
              </HorizontalScrollRow>
            ) : (
              <View className="px-5">
                <Card className="items-center gap-2 py-8">
                  <Caption className="text-center">Loading missions…</Caption>
                </Card>
              </View>
            )}
          </View>

          <WeeklyProgressCard weeklyProgress={weeklyProgress} />

          <View className="gap-3">
            <Text className="px-5 font-sans-bold text-heading text-ink">Community events</Text>
            {upcomingEvents.length === 0 ? (
              <View className="mx-5 items-center rounded-lg bg-card px-5 py-8" style={{ borderRadius: 8 }}>
                <Caption className="text-center">No upcoming events right now.</Caption>
              </View>
            ) : (
              <HorizontalScrollRow
                width={shellWidth}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                snapToInterval={promoCardWidth + 12}
                snapToAlignment="start">
                {upcomingEvents.map((event) => (
                  <IllustratedPromoCard
                    key={event.id}
                    image={eventScene(event.illustration)}
                    title={event.title}
                    subtitle={eventSubtitle(event)}
                    width={promoCardWidth}
                    onPress={() => onOpenEvent?.(event)}
                    accessibilityLabel={`View ${event.title}`}
                    footer={
                      <View className="flex-row items-center gap-2">
                        <EventAttendeeStack
                          attendees={event.attendees}
                          total={event.participants}
                          joined={event.joined}
                          youName={profile.name || 'You'}
                          youPhoto={avatarSrc}
                          seed={event.slug ?? event.id}
                          size={28}
                          max={4}
                        />
                        <Caption className="min-w-0 flex-1" numberOfLines={1}>
                          {event.participants} going
                        </Caption>
                      </View>
                    }
                  />
                ))}
              </HorizontalScrollRow>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function eventSubtitle(event: CommunityEventView) {
  const raw = event.description?.trim();
  if (!raw) return event.location;
  const first = raw.split(/[.!?]/)[0]?.trim();
  return first || event.location;
}

function BannerStat({
  Icon,
  iconColor = '#FFFFFF',
  image,
  value,
  label,
}: {
  Icon?: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  iconColor?: string;
  image?: ComponentProps<typeof Image>['source'];
  value: string;
  label: string;
}) {
  return (
    <View
      className="min-w-0 flex-1 items-center justify-center gap-1 px-2 py-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 }}>
      {image ? (
        <Image
          source={image}
          style={{ width: 22, height: 22 }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : Icon ? (
        <Icon size={18} color={iconColor} strokeWidth={2.25} />
      ) : null}
      <Text className="font-sans-extrabold text-body text-white" numberOfLines={1}>
        {value}
      </Text>
      <Text className="font-sans text-[11px] text-white/80" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
