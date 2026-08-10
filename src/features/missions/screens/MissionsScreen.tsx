import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReportPostCard } from '@/features/missions/components/ReportPostCard';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Caption, Label } from '@/shared/components/ui';
import type { Mission } from '@/shared/data/greenpathData';
import {
  Droplet,
  Flame,
  Globe,
  Recycle,
  Sprout,
  Trees,
  Zap,
  type LucideIcon,
} from '@/shared/icons/lucide';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

type Tab = 'active' | 'reports';

const missionVisual: Record<
  string,
  { Icon: LucideIcon; tint: string; soft: string }
> = {
  recycle: { Icon: Recycle, tint: '#2E7D32', soft: '#E8F5E9' },
  plastic: { Icon: Recycle, tint: '#0D9488', soft: '#CCFBF1' },
  water: { Icon: Droplet, tint: '#0284C7', soft: '#E0F2FE' },
  tree: { Icon: Trees, tint: '#15803D', soft: '#ECFDF3' },
  agriculture: { Icon: Sprout, tint: '#65A30D', soft: '#F7FEE7' },
  energy: { Icon: Zap, tint: '#CA8A04', soft: '#FEF9C3' },
  solar: { Icon: Zap, tint: '#CA8A04', soft: '#FEF9C3' },
  community: { Icon: Sprout, tint: '#0D9488', soft: '#CCFBF1' },
  learn: { Icon: Globe, tint: '#2563EB', soft: '#DBEAFE' },
};

function difficultyTone(level: Mission['difficulty']) {
  if (level === 'Easy') return { text: '#2E7D32', soft: '#E8F5E9' };
  if (level === 'Hard') return { text: '#DC2626', soft: '#FEE2E2' };
  return { text: '#EA580C', soft: '#FFF7ED' };
}

export function MissionsScreen({
  onOpenMission,
  onOpenReport,
}: {
  onOpenMission: (mission: Mission) => void;
  onOpenReport: () => void;
}) {
  const insets = useSafeAreaInsets();
  const {
    filteredMissions,
    completedMissionIds,
    profile,
    reports,
    reportVotes,
    voteOnReport,
  } = useGreenPath();
  const [tab, setTab] = useState<Tab>('active');

  const open = useMemo(
    () => filteredMissions.filter((m) => !completedMissionIds.includes(m.id)),
    [filteredMissions, completedMissionIds],
  );
  const doneCount = useMemo(
    () => filteredMissions.filter((m) => completedMissionIds.includes(m.id)).length,
    [filteredMissions, completedMissionIds],
  );

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_SCROLL_PADDING + insets.bottom,
        }}>
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
              icon={<Ionicons name="megaphone-outline" size={16} color="#A7F3D0" />}
              value={String(reports.length)}
              label="Reports"
            />
          </View>

          <Pressable
            onPress={onOpenReport}
            accessibilityRole="button"
            accessibilityLabel="Report trash nearby"
            className="mt-4 flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3.5">
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: '#FFF7ED' }}>
              <MaterialCommunityIcons name="map-marker-alert" size={22} color="#EA580C" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-sans-bold text-body text-ink">Report Nearby</Text>
              <Text className="font-sans text-caption text-subtle">
                Flag trash or a blocked drain around you
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View className="gap-5 px-5 pb-8 pt-4">
          <View className="flex-row rounded-full bg-canvas-sunken p-1.5">
            <TabButton
              label="Active"
              active={tab === 'active'}
              onPress={() => setTab('active')}
            />
            <TabButton
              label="Reports"
              active={tab === 'reports'}
              onPress={() => setTab('reports')}
            />
          </View>

          {tab === 'active' ? (
            open.length === 0 ? (
              <View className="items-center gap-2 rounded-2xl bg-card px-5 py-12">
                <Ionicons name="leaf-outline" size={36} color={colors.primary.DEFAULT} />
                <Label className="font-sans-semibold">No active missions</Label>
                <Caption className="text-center">
                  You’re all caught up. Check back soon.
                </Caption>
                {doneCount > 0 ? (
                  <Caption className="text-center">
                    {doneCount} other mission{doneCount === 1 ? '' : 's'} finished earlier.
                  </Caption>
                ) : null}
              </View>
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
            )
          ) : reports.length === 0 ? (
            <View className="items-center gap-2 rounded-2xl bg-card px-5 py-12">
              <Ionicons name="camera-outline" size={36} color={colors.primary.DEFAULT} />
              <Label className="font-sans-semibold">No reports yet</Label>
              <Caption className="text-center">
                Post a photo of trash or a blocked drain so neighbours can confirm it.
              </Caption>
              <Pressable
                onPress={onOpenReport}
                className="mt-2 rounded-2xl bg-primary px-5 py-3">
                <Text className="font-sans-bold text-body text-white">Report Nearby</Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-8">
              {reports.map((report) => (
                <ReportPostCard
                  key={report.id}
                  report={report}
                  vote={reportVotes[report.id]}
                  onVote={(vote) => voteOnReport(report.id, vote)}
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
}: {
  mission: Mission;
  onPress: () => void;
}) {
  const visual = missionVisual[mission.illustration] ?? missionVisual.recycle;
  const Icon = visual.Icon;
  const diff = difficultyTone(mission.difficulty);

  return (
    <View className="gap-4 rounded-2xl bg-card p-4">
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
          accessibilityLabel={`Start ${mission.title}`}
          className="min-h-12 flex-1 items-center justify-center rounded-2xl bg-primary">
          <Text className="font-sans-bold text-body text-white">Start Mission</Text>
        </Pressable>

        <Pressable
          onPress={onPress}
          accessibilityLabel="Mark ready"
          className="h-12 w-12 items-center justify-center rounded-2xl bg-canvas-sunken">
          <Ionicons name="checkmark" size={22} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}
