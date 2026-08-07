import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTts } from '@/shared/a11y/useTts';
import { Illustration } from '@/shared/components/Illustration';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Body, Caption, Card, Heading, Label, Overline, Stat } from '@/shared/components/ui';
import {
  events,
  missions,
  weeklyProgress,
} from '@/shared/data/greenpathData';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

const communityPreview = events[0];
const communityAttendees = communityPreview.attendees.slice(0, 4);
const communityExtra = Math.max(0, communityPreview.participants - communityAttendees.length);

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
  label: string;
  hint: string;
  set: 'ion' | 'mci';
  icon: IonName | MciName;
  tint: string;
}[] = [
  {
    id: 'lesson',
    label: 'Continue Lesson',
    hint: 'Pick up where you left off',
    set: 'ion',
    icon: 'book-outline',
    tint: colors.primary.DEFAULT,
  },
  {
    id: 'quiz',
    label: "Today's Quiz",
    hint: 'Test what you learned today',
    set: 'mci',
    icon: 'clipboard-list-outline',
    tint: colors.accent.DEFAULT,
  },
  {
    id: 'mission',
    label: 'Climate Mission',
    hint: 'Take action and earn XP',
    set: 'mci',
    icon: 'bullseye-arrow',
    tint: colors.lime.DEFAULT,
  },
  {
    id: 'voice',
    label: 'Voice Assistant',
    hint: 'Ask climate questions aloud',
    set: 'ion',
    icon: 'mic-outline',
    tint: colors.accent.DEFAULT,
  },
  {
    id: 'community',
    label: 'Community Events',
    hint: `${communityPreview.participants} joined nearby`,
    set: 'mci',
    icon: 'account-group-outline',
    tint: colors.primary[600],
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
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
  const { announce } = useTts();
  const todayMission = filteredMissions[0] ?? missions[0];
  const xpPct = profile.xp / profile.xpToNext;

  const homeSpeech = `${greeting()} ${profile.name}. You have ${profile.xp} XP, level ${profile.level}, streak ${profile.streak} days. You’ve prevented ${profile.carbonSavedKg} kilograms of CO2 this month. Today’s mission: ${todayMission.title}.`;

  useEffect(() => {
    void announce(homeSpeech);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <View className="gap-1">
              <Overline>GreenPath Ghana</Overline>
              <Heading>
                {greeting()} {profile.name}
              </Heading>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => onAction('notifications')}
                accessibilityLabel="Notifications"
                className="h-12 w-12 items-center justify-center rounded-full border border-line bg-card-raised">
                <Ionicons name="notifications-outline" size={22} color={colors.ink.DEFAULT} />
              </Pressable>
              <Pressable
                onPress={onOpenProfile}
                accessibilityLabel="Profile"
                className="h-12 w-12 overflow-hidden rounded-full bg-primary-50">
                <Image
                  source={profile.avatar}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              </Pressable>
            </View>
          </View>

          <SpeakButton text={homeSpeech} label="Read home aloud" />

          <Card tone="primary" className="gap-2 overflow-hidden">
            <View className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15" />
            <View className="absolute -bottom-8 left-10 h-24 w-24 rounded-full bg-lime/30" />
            <Label tone="inverse" className="opacity-90">
              Climate impact
            </Label>
            <Text className="font-sans-bold text-subheading text-white">
              You’ve prevented {profile.carbonSavedKg}kg of CO₂ this month.
            </Text>
          </Card>

          <View className="flex-row gap-2">
            <View className="min-h-[108px] min-w-0 flex-1 items-center justify-between rounded-md bg-card px-2 py-3">
              <Caption>XP</Caption>
              <Stat className="text-heading">{profile.xp}</Stat>
              <View className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-sunken">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round(xpPct * 100)}%` }}
                />
              </View>
            </View>
            <View className="min-h-[108px] min-w-0 flex-1 items-center justify-between rounded-md bg-card px-2 py-3">
              <Caption>Level</Caption>
              <Stat className="text-heading">{profile.level}</Stat>
              <Label tone="primary" numberOfLines={1} className="text-center text-caption">
                Eco Explorer
              </Label>
            </View>
            <Pressable
              onPress={() => onAction('rewards')}
              className="min-w-0 flex-1"
              accessibilityRole="button"
              accessibilityLabel="Streak and rewards">
              <View className="min-h-[108px] flex-1 items-center justify-between rounded-md bg-card px-2 py-3">
                <Caption>Streak</Caption>
                <Stat className="text-heading">{profile.streak}</Stat>
                <Label tone="subtle" numberOfLines={1} className="text-center text-caption">
                  🔥 days
                </Label>
              </View>
            </Pressable>
          </View>

          <View className="gap-3">
            <Overline>Today’s Mission</Overline>
            <Pressable onPress={() => onAction('mission')}>
              <Card className="flex-row items-center gap-4">
                <Illustration kind={todayMission.illustration} size="sm" />
                <View className="min-w-0 flex-1 gap-1">
                  <Label className="font-sans-semibold">{todayMission.title}</Label>
                  <Caption>
                    +{todayMission.xp} XP, {todayMission.minutes} min, {todayMission.impact}
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
            <View className="gap-3">
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => onAction(action.id)}
                  className="flex-row items-center gap-4 rounded-md border border-line bg-card-raised p-4 active:opacity-90">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${action.tint}18` }}>
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
                  <View className="min-w-0 flex-1 gap-1.5">
                    <Body className="font-sans-semibold text-ink">{action.label}</Body>
                    {action.id === 'community' ? (
                      <View className="flex-row items-center gap-2">
                        <View className="flex-row items-center">
                          {communityAttendees.map((person, index) => (
                            <View
                              key={`home-community-${person.name}-${index}`}
                              className="h-8 w-8 overflow-hidden rounded-full border-2 border-card-raised bg-primary-50"
                              style={{
                                marginLeft: index === 0 ? 0 : -10,
                                zIndex: 10 - index,
                              }}>
                              <Image
                                source={person.source}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                                accessibilityIgnoresInvertColors
                              />
                            </View>
                          ))}
                          {communityExtra > 0 ? (
                            <View
                              className="h-8 w-8 items-center justify-center rounded-full border-2 border-card-raised bg-primary"
                              style={{ marginLeft: -10 }}>
                              <Text className="font-sans-bold text-caption text-white">
                                +{communityExtra > 99 ? 99 : communityExtra}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Caption numberOfLines={1} className="flex-1">
                          {action.hint}
                        </Caption>
                      </View>
                    ) : (
                      <Caption numberOfLines={1}>{action.hint}</Caption>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
