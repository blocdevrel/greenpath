import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Illustration } from '@/shared/components/Illustration';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Caption, Card, Heading, Label, Overline } from '@/shared/components/ui';
import type { Mission } from '@/shared/data/greenpathData';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function MissionsScreen({ onOpenMission }: { onOpenMission: (mission: Mission) => void }) {
  const insets = useSafeAreaInsets();
  const { filteredMissions, completedMissionIds } = useGreenPath();
  const open = filteredMissions.filter((m) => !completedMissionIds.includes(m.id));
  const done = filteredMissions.filter((m) => completedMissionIds.includes(m.id));

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: TAB_BAR_SCROLL_PADDING + insets.bottom,
        }}>
        <View className="gap-6 px-5 pb-8">
          <View className="gap-2">
            <Overline>Take Action</Overline>
            <Heading>Daily Climate Missions</Heading>
            <Caption>Finish a mission, add a photo, earn XP.</Caption>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Overline>Available</Overline>
              <Caption className="font-sans-semibold text-primary">{open.length}</Caption>
            </View>

            {open.length === 0 ? (
              <Card className="items-center gap-2 py-10">
                <Illustration kind="trophy" size="md" />
                <Label className="font-sans-semibold">All missions done today</Label>
                <Caption>Come back tomorrow to grow your streak.</Caption>
              </Card>
            ) : (
              <View className="gap-3">
                {open.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onPress={() => onOpenMission(mission)}
                  />
                ))}
              </View>
            )}
          </View>

          {done.length ? (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Overline>Completed</Overline>
                <Caption className="font-sans-semibold text-primary">{done.length}</Caption>
              </View>
              <View className="gap-3">
                {done.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    completed
                    onPress={() => onOpenMission(mission)}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function MissionCard({
  mission,
  onPress,
  completed,
}: {
  mission: Mission;
  onPress: () => void;
  completed?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={mission.title}
      style={{ opacity: completed ? 0.72 : 1 }}>
      <Card className="gap-3">
        <View className="flex-row items-start gap-3">
          <View className="min-w-0 flex-1 gap-1.5">
            <View className="flex-row items-start justify-between gap-3">
              <Label className="min-w-0 flex-1 font-sans-bold text-subheading">
                {mission.title}
              </Label>
              <Label className="font-sans-bold text-primary">{mission.xp} XP</Label>
            </View>

            <Caption numberOfLines={2}>{mission.description}</Caption>

            <View className="flex-row flex-wrap items-center gap-2">
              <Label className="font-sans-bold text-ink">{mission.difficulty}</Label>
              <Caption className="font-sans-semibold">
                {mission.minutes} min
              </Caption>
              <Caption className="font-sans-semibold">{mission.impact}</Caption>
            </View>
          </View>

          <Ionicons
            name={completed ? 'checkmark-circle' : 'chevron-forward'}
            size={20}
            color={completed ? colors.primary.DEFAULT : colors.muted}
          />
        </View>
      </Card>
    </Pressable>
  );
}
