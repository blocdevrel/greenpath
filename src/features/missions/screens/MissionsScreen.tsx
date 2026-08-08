import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Caption, Label } from '@/shared/components/ui';
import type { Mission } from '@/shared/data/greenpathData';
import {
  Droplet,
  Flame,
  Recycle,
  Sprout,
  Trees,
  Zap,
  type LucideIcon,
} from '@/shared/icons/lucide';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

type Tab = 'active' | 'completed';

const missionVisual: Record<
  string,
  { Icon: LucideIcon; tint: string; soft: string }
> = {
  recycle: { Icon: Recycle, tint: '#2E7D32', soft: '#E8F5E9' },
  plastic: { Icon: Recycle, tint: '#2E7D32', soft: '#E8F5E9' },
  water: { Icon: Droplet, tint: '#0284C7', soft: '#E0F2FE' },
  tree: { Icon: Trees, tint: '#15803D', soft: '#ECFDF3' },
  agriculture: { Icon: Sprout, tint: '#65A30D', soft: '#F7FEE7' },
  energy: { Icon: Zap, tint: '#CA8A04', soft: '#FEF9C3' },
  solar: { Icon: Zap, tint: '#CA8A04', soft: '#FEF9C3' },
  community: { Icon: Sprout, tint: '#0D9488', soft: '#CCFBF1' },
};

function difficultyTone(level: Mission['difficulty']) {
  if (level === 'Easy') return { text: '#2E7D32', soft: '#E8F5E9' };
  if (level === 'Hard') return { text: '#DC2626', soft: '#FEE2E2' };
  return { text: '#EA580C', soft: '#FFF7ED' };
}

export function MissionsScreen({ onOpenMission }: { onOpenMission: (mission: Mission) => void }) {
  const insets = useSafeAreaInsets();
  const { filteredMissions, completedMissionIds, profile } = useGreenPath();
  const [tab, setTab] = useState<Tab>('active');

  const open = useMemo(
    () => filteredMissions.filter((m) => !completedMissionIds.includes(m.id)),
    [filteredMissions, completedMissionIds],
  );
  const done = useMemo(
    () => filteredMissions.filter((m) => completedMissionIds.includes(m.id)),
    [filteredMissions, completedMissionIds],
  );
  const list = tab === 'active' ? open : done;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_SCROLL_PADDING + insets.bottom,
        }}>
        {/* Header */}
        <View
          className="bg-primary px-5 pb-6"
          style={{ paddingTop: insets.top + 14 }}>
          <Text className="font-sans-extrabold text-title text-white">Missions</Text>
          <Text className="mt-1 font-sans text-body text-white/85">
            Complete real-world climate challenges.
          </Text>

          <View className="mt-5 flex-row gap-2.5">
            <StatPill
              icon={<MaterialCommunityIcons name="bullseye-arrow" size={16} color="#FFFFFF" />}
              value={String(open.length)}
              label="Active"
            />
            <StatPill
              icon={<Flame size={16} color="#FDBA74" strokeWidth={2.25} />}
              value={String(profile.streak)}
              label="Streak"
            />
            <StatPill
              icon={<Ionicons name="checkmark-circle" size={16} color="#A7F3D0" />}
              value={String(done.length)}
              label="Done"
            />
          </View>
        </View>

        <View className="gap-5 px-5 pb-8 pt-4">
          {/* Tabs */}
          <View className="flex-row rounded-full bg-canvas-sunken p-1.5">
            <TabButton
              label="Active"
              active={tab === 'active'}
              onPress={() => setTab('active')}
            />
            <TabButton
              label="Completed"
              active={tab === 'completed'}
              onPress={() => setTab('completed')}
            />
          </View>

          {list.length === 0 ? (
            <View className="items-center gap-2 rounded-2xl bg-card px-5 py-12">
              <Ionicons
                name={tab === 'active' ? 'leaf-outline' : 'trophy-outline'}
                size={36}
                color={colors.primary.DEFAULT}
              />
              <Label className="font-sans-semibold">
                {tab === 'active' ? 'No active missions' : 'No completed missions yet'}
              </Label>
              <Caption className="text-center">
                {tab === 'active'
                  ? 'You’re all caught up. Check back soon.'
                  : 'Finish a mission to see it here.'}
              </Caption>
            </View>
          ) : (
            <View className="gap-3">
              {list.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  completed={tab === 'completed'}
                  onPress={() => onOpenMission(mission)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View
      className="min-w-0 flex-1 items-center gap-1 rounded-2xl px-2 py-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
      {icon}
      <Text className="font-sans-extrabold text-subheading text-white">{value}</Text>
      <Text className="font-sans text-[11px] text-white/80">{label}</Text>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-h-11 flex-1 items-center justify-center rounded-full ${
        active ? 'bg-card-raised' : ''
      }`}>
      <Text
        className={`font-sans-semibold text-caption ${
          active ? 'text-primary' : 'text-subtle'
        }`}>
        {label}
      </Text>
    </Pressable>
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
  const visual = missionVisual[mission.illustration] ?? missionVisual.recycle;
  const Icon = visual.Icon;
  const diff = difficultyTone(mission.difficulty);

  return (
    <View
      className="gap-4 rounded-2xl bg-card p-4"
      style={{ opacity: completed ? 0.85 : 1 }}>
      <View className="flex-row items-start gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: visual.soft }}>
          <Icon size={22} color={visual.tint} strokeWidth={2.25} />
        </View>

        <View className="min-w-0 flex-1 gap-1.5">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="min-w-0 flex-shrink font-sans-bold text-subheading text-ink">
              {mission.title}
            </Text>
            <View className="rounded-full bg-gold-soft px-2.5 py-1">
              <Text className="font-sans-bold text-caption" style={{ color: '#D97706' }}>
                {mission.xp} XP
              </Text>
            </View>
          </View>

          <Caption numberOfLines={2}>{mission.description}</Caption>

          <View className="mt-0.5 flex-row flex-wrap items-center gap-2">
            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: diff.soft }}>
              <Text className="font-sans-bold text-caption" style={{ color: diff.text }}>
                {mission.difficulty}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-canvas-sunken px-2.5 py-1">
              <Ionicons name="timer-outline" size={13} color={colors.muted} />
              <Caption className="font-sans-semibold">{mission.minutes} min</Caption>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={completed ? `View ${mission.title}` : `Start ${mission.title}`}
          className={`min-h-12 flex-1 items-center justify-center rounded-2xl ${
            completed ? 'bg-primary-50' : 'bg-primary'
          }`}>
          <Text
            className={`font-sans-bold text-body ${
              completed ? 'text-primary' : 'text-white'
            }`}>
            {completed ? 'View Mission' : 'Start Mission'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPress}
          accessibilityLabel={completed ? 'Completed' : 'Mark ready'}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-canvas-sunken">
          <Ionicons
            name={completed ? 'checkmark-circle' : 'checkmark'}
            size={22}
            color={completed ? colors.primary.DEFAULT : colors.muted}
          />
        </Pressable>
      </View>
    </View>
  );
}
