import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTts } from '@/shared/a11y/useTts';
import { Illustration } from '@/shared/components/Illustration';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Caption, Card, Label, Overline } from '@/shared/components/ui';
import {
  events,
  missions,
  weeklyProgress,
} from '@/shared/data/greenpathData';
import { Flame, Trophy, Zap } from '@/shared/icons/lucide';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

const upcomingEvent = events[0];

export type HomeAction =
  | 'lesson'
  | 'quiz'
  | 'mission'
  | 'voice'
  | 'community'
  | 'notifications'
  | 'rewards';

type IonName = ComponentProps<typeof Ionicons>['name'];
type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const quickActions: {
  id: HomeAction;
  title: string;
  set: 'ion' | 'mci';
  icon: IonName | MciName;
  tint: string;
  soft: string;
}[] = [
  {
    id: 'lesson',
    title: 'Continue\nLesson',
    set: 'ion',
    icon: 'book-outline',
    tint: colors.primary.DEFAULT,
    soft: colors.primary[50],
  },
  {
    id: 'quiz',
    title: "Today's\nQuiz",
    set: 'mci',
    icon: 'clipboard-list-outline',
    tint: colors.accent.DEFAULT,
    soft: colors.accent.soft,
  },
  {
    id: 'mission',
    title: 'Climate\nMission',
    set: 'mci',
    icon: 'bullseye-arrow',
    tint: colors.lime.DEFAULT,
    soft: colors.lime.soft,
  },
  {
    id: 'voice',
    title: 'AI Voice\nHelper',
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

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function HomeScreen({
  onAction,
  onOpenProfile,
}: {
  onAction: (action: HomeAction) => void;
  onOpenProfile?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { profile, filteredMissions } = useGreenPath();
  const { announce, speaking, paused, playPause } = useTts();
  const todayMission = filteredMissions[0] ?? missions[0];
  const displayName = profile.fullName || profile.name;
  const treesEq = Math.round(profile.carbonSavedKg * 0.05 * 10) / 10;
  const [joinedEvent, setJoinedEvent] = useState(false);
  const eventAttendees = upcomingEvent.attendees.slice(0, 3);
  const eventExtra = Math.max(0, upcomingEvent.participants - 3);

  const homeSpeech = `${greeting()} ${displayName}. You have ${profile.xp} XP, level ${profile.level}, streak ${profile.streak} days. You've prevented ${profile.carbonSavedKg} kilograms of CO2 this month. Today's mission: ${todayMission.title}.`;

  useEffect(() => {
    void announce(homeSpeech);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
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
              paddingBottom: 72,
              paddingHorizontal: 20,
              minHeight: 280,
            }}>
            <View className="gap-8">
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
                    className={`h-11 w-11 items-center justify-center rounded-full border ${
                      speaking || paused
                        ? 'border-white/40 bg-white'
                        : 'border-white/25 bg-white/20'
                    }`}>
                    <Ionicons
                      name={speaking ? 'pause' : 'play'}
                      size={20}
                      color={speaking || paused ? colors.primary.DEFAULT : '#FFFFFF'}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => onAction('notifications')}
                    accessibilityLabel="Notifications"
                    className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/20">
                    <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                    <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
                  </Pressable>
                  <Pressable
                    onPress={onOpenProfile}
                    accessibilityLabel="Profile"
                    className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#F59E0B]">
                    {profile.avatar ? (
                      <Image
                        source={profile.avatar}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                      />
                    ) : (
                      <Text className="font-sans-bold text-caption text-white">
                        {initials(displayName)}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>

              <View className="flex-row gap-2.5">
                <BannerStat
                  Icon={Zap}
                  iconColor="#FACC15"
                  value={profile.xp.toLocaleString()}
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
                    Icon={Flame}
                    iconColor="#FB923C"
                    value={`${profile.streak}d`}
                    label="Streak"
                  />
                </Pressable>
              </View>
            </View>
          </LinearGradient>

          {/* Half on gradient, half on white canvas */}
          <View className="z-10 px-5" style={{ marginTop: -36 }}>
            <View className="overflow-hidden rounded-2xl bg-primary">
              {/* Soft seamless wash — large, low-contrast blobs */}
              <View
                pointerEvents="none"
                className="absolute inset-0"
                style={{ opacity: 0.35 }}>
                <View
                  className="absolute rounded-full"
                  style={{
                    width: 160,
                    height: 160,
                    right: -48,
                    top: -56,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                  }}
                />
                <View
                  className="absolute rounded-full"
                  style={{
                    width: 120,
                    height: 120,
                    left: -40,
                    bottom: -48,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  }}
                />
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'transparent', 'rgba(0,0,0,0.06)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                />
              </View>

              <View className="flex-row items-center gap-3 px-4 py-4">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Ionicons name="earth" size={22} color="#FFFFFF" />
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="font-sans-bold text-body text-white">
                    You've prevented {profile.carbonSavedKg} kg of CO₂ this month!
                  </Text>
                  <Text className="font-sans text-caption text-white/85">
                    That's equivalent to planting {treesEq} trees
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-6 px-5 pb-8 pt-5">
          <View className="gap-3">
            <Overline>Today's Mission</Overline>
            <Pressable onPress={() => onAction('mission')}>
              <Card className="flex-row items-center gap-4">
                <Illustration kind={todayMission.illustration} size="sm" />
                <View className="min-w-0 flex-1 gap-1">
                  <Label className="font-sans-semibold">{todayMission.title}</Label>
                  <Caption>
                    {todayMission.xp} XP, {todayMission.minutes} min, {todayMission.impact}
                  </Caption>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Card>
            </Pressable>
          </View>

          <View className="gap-3">
            <Overline>Weekly Progress</Overline>
            <Card className="gap-4">
              <View className="h-28 flex-row items-end justify-between gap-2">
                {weeklyProgress.map((d) => (
                  <View key={d.day} className="flex-1 items-center gap-2">
                    <View
                      className="w-full rounded-md bg-primary-100"
                      style={{ height: Math.max(12, (d.value / 100) * 96) }}>
                      <View
                        className="absolute bottom-0 left-0 right-0 rounded-md bg-primary"
                        style={{ height: `${d.value}%` }}
                      />
                    </View>
                    <Caption>{d.day}</Caption>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          <View className="gap-3">
            <Overline>Quick Actions</Overline>
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => onAction(action.id)}
                  accessibilityRole="button"
                  accessibilityLabel={(action.title ?? '').replace(/\n/g, ' ')}
                  className="items-center gap-2 rounded-2xl border border-line bg-card-raised px-2 py-4 active:opacity-90"
                  style={{ width: '48%' }}>
                  <View
                    className="h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: action.soft }}>
                    {action.set === 'mci' ? (
                      <MaterialCommunityIcons
                        name={action.icon as MciName}
                        size={22}
                        color={action.tint}
                      />
                    ) : (
                      <Ionicons name={action.icon as IonName} size={22} color={action.tint} />
                    )}
                  </View>
                  <Text className="text-center font-sans-semibold text-caption text-ink">
                    {action.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Upcoming Events — separate from Quick Actions */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Overline>Upcoming Events</Overline>
              <Pressable onPress={() => onAction('community')} hitSlop={8}>
                <Caption className="font-sans-semibold text-primary">See all →</Caption>
              </Pressable>
            </View>
            <Card className="gap-4">
              <View className="flex-row gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-lime-soft">
                  <Ionicons name="leaf" size={22} color={colors.lime.DEFAULT} />
                </View>
                <View className="min-w-0 flex-1 gap-1">
                  <Label className="font-sans-bold text-subheading">{upcomingEvent.title}</Label>
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="location-outline" size={14} color={colors.muted} />
                    <Caption numberOfLines={1}>
                      {upcomingEvent.location}, {upcomingEvent.date}
                    </Caption>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-row items-center">
                  {eventAttendees.map((person, index) => (
                    <View
                      key={`${person.name}-${index}`}
                      className="h-8 w-8 overflow-hidden rounded-full border-2 border-card-raised bg-primary-50"
                      style={{ marginLeft: index === 0 ? 0 : -8, zIndex: 10 - index }}>
                      <Image
                        source={person.source}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                      />
                    </View>
                  ))}
                  {eventExtra > 0 ? (
                    <View
                      className="h-8 w-8 items-center justify-center rounded-full border-2 border-card-raised bg-primary"
                      style={{ marginLeft: -8 }}>
                      <Text className="font-sans-bold text-caption text-white">
                        +{eventExtra > 99 ? 99 : eventExtra}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Pressable
                  onPress={() => setJoinedEvent((v) => !v)}
                  className={`rounded-full px-4 py-2.5 ${
                    joinedEvent ? 'bg-primary-50' : 'bg-primary'
                  }`}>
                  <Text
                    className={`font-sans-semibold text-caption ${
                      joinedEvent ? 'text-primary' : 'text-white'
                    }`}>
                    {joinedEvent ? 'Joined' : 'Join Event'}
                  </Text>
                </Pressable>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BannerStat({
  Icon,
  iconColor = '#FFFFFF',
  value,
  label,
}: {
  Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  iconColor?: string;
  value: string;
  label: string;
}) {
  return (
    <View
      className="min-w-0 flex-1 items-center justify-center gap-1.5 border border-white/30 px-2 py-4"
      style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20 }}>
      <Icon size={22} color={iconColor} strokeWidth={2.25} />
      <Text className="font-sans-extrabold text-subheading text-white" numberOfLines={1}>
        {value}
      </Text>
      <Text className="font-sans text-[11px] text-white/85" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
