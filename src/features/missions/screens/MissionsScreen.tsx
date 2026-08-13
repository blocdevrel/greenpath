import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReportPostCard } from '@/features/missions/components/ReportPostCard';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Caption, Label, Overline } from '@/shared/components/ui';
import type { Mission } from '@/shared/data/greenpathData';
import {
  Droplet,
  Globe,
  Recycle,
  Sprout,
  Trees,
  Zap,
  type LucideIcon,
} from '@/shared/icons/lucide';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

type Tab = 'active' | 'done' | 'reports';

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
    reports,
    reportVotes,
    voteOnReport,
    sessionStatus,
    hydrateFromServer,
  } = useGreenPath();
  const [tab, setTab] = useState<Tab>('reports');

  const open = useMemo(
    () => filteredMissions.filter((m) => !completedMissionIds.includes(m.id)),
    [filteredMissions, completedMissionIds],
  );
  const done = useMemo(
    () => filteredMissions.filter((m) => completedMissionIds.includes(m.id)),
    [filteredMissions, completedMissionIds],
  );
  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: TAB_BAR_SCROLL_PADDING + insets.bottom,
        }}>
        <View className="gap-6 pb-8">
          <View className="gap-3 px-5">
            <View className="gap-2">
              <Overline>Missions</Overline>
              <Text className="font-sans-extrabold text-title text-ink">Real world climate action</Text>
            </View>

            <Pressable
              onPress={onOpenReport}
              accessibilityRole="button"
              accessibilityLabel="Report trash nearby"
              className="flex-row items-center gap-3 rounded-2xl border border-line bg-card-raised px-4 py-3.5">
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#FFF7ED' }}>
                <MaterialCommunityIcons name="map-marker-alert" size={22} color="#EA580C" />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="font-sans-bold text-body text-ink">Report nearby</Text>
                <Caption>Flag trash or a blocked drain</Caption>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </View>

          {sessionStatus === 'error' && filteredMissions.length === 0 ? (
            <View className="mx-5 items-center gap-3 rounded-2xl bg-card px-5 py-10">
              <Caption className="text-center">Could not load missions from the server.</Caption>
              <Pressable onPress={() => void hydrateFromServer()} className="rounded-2xl bg-primary px-5 py-3">
                <Text className="font-sans-bold text-body text-white">Retry</Text>
              </Pressable>
            </View>
          ) : null}

          <View className="px-5">
            <View className="flex-row rounded-full bg-canvas-sunken p-1.5">
              <TabButton label="Reports" active={tab === 'reports'} onPress={() => setTab('reports')} />
              <TabButton label={`Missions (${open.length})`} active={tab === 'active'} onPress={() => setTab('active')} />
              <TabButton label={`Done (${done.length})`} active={tab === 'done'} onPress={() => setTab('done')} />
            </View>
          </View>

          <View className="gap-3 px-5">
            {tab === 'active' ? (
              open.length === 0 ? (
                <EmptyState
                  icon="leaf-outline"
                  title="All missions complete"
                  body="You’ve finished every mission for now. Check Done or come back later."
                />
              ) : (
                open.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onPress={() => onOpenMission(mission)}
                  />
                ))
              )
            ) : null}

            {tab === 'done' ? (
              done.length === 0 ? (
                <EmptyState
                  icon="checkmark-circle-outline"
                  title="No completed missions yet"
                  body="Pick an active mission and submit photo evidence to earn XP."
                />
              ) : (
                done.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    completed
                    onPress={() => onOpenMission(mission)}
                  />
                ))
              )
            ) : null}

            {tab === 'reports' ? (
              reports.length === 0 ? (
                sessionStatus === 'error' ? (
                  <View className="items-center gap-3 rounded-2xl bg-card px-5 py-12">
                    <Ionicons name="cloud-offline-outline" size={36} color={colors.primary.DEFAULT} />
                    <Label className="font-sans-semibold">Could not load reports</Label>
                    <Caption className="text-center">
                      Make sure greenserver is running, then try again.
                    </Caption>
                    <Pressable
                      onPress={() => void hydrateFromServer()}
                      className="mt-2 rounded-2xl bg-primary px-5 py-3">
                      <Text className="font-sans-bold text-body text-white">Retry</Text>
                    </Pressable>
                  </View>
                ) : (
                  <EmptyState
                    icon="camera-outline"
                    title="No reports yet"
                    body="Post a photo of trash or a blocked drain so neighbours can confirm it."
                    actionLabel="Report nearby"
                    onAction={onOpenReport}
                  />
                )
              ) : (
                <View className="gap-8">
                  {reports.map((report) => (
                    <ReportPostCard
                      key={report.id}
                      report={report}
                      vote={reportVotes[report.id] ?? report.myVote}
                      onVote={(vote) => voteOnReport(report.id, vote)}
                    />
                  ))}
                </View>
              )
            ) : null}
          </View>
        </View>
      </ScrollView>
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
      className={`min-h-11 flex-1 items-center justify-center rounded-full ${active ? 'bg-card-raised' : ''}`}>
      <Text className={`font-sans-semibold text-[11px] ${active ? 'text-primary' : 'text-subtle'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center gap-2 rounded-2xl bg-card px-5 py-12">
      <Ionicons name={icon} size={36} color={colors.primary.DEFAULT} />
      <Label className="font-sans-semibold">{title}</Label>
      <Caption className="text-center">{body}</Caption>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="mt-2 rounded-2xl bg-primary px-5 py-3">
          <Text className="font-sans-bold text-body text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function MissionCard({
  mission,
  completed,
  onPress,
}: {
  mission: Mission;
  completed?: boolean;
  onPress: () => void;
}) {
  const diff = difficultyTone(mission.difficulty);

  return (
    <Pressable onPress={onPress} className="bg-card p-4" style={{ borderRadius: 8 }}>
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
          {completed ? (
            <View className="rounded-full bg-success-soft px-2.5 py-1">
              <Text className="font-sans-semibold text-caption text-success">Done</Text>
            </View>
          ) : null}
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
          <Caption className="font-sans-semibold text-primary">{mission.impact}</Caption>
        </View>
      </View>

      <View className="mt-4 flex-row items-center gap-2.5">
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={completed ? `View ${mission.title}` : `Start ${mission.title}`}
          className="min-h-12 flex-1 items-center justify-center bg-primary"
          style={{ borderRadius: 8 }}>
          <Text className="font-sans-bold text-body text-white">
            {completed ? 'View Mission' : 'Start Mission'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={completed ? 'Mission done' : 'Mark ready'}
          className={`h-12 w-12 items-center justify-center ${
            completed ? 'bg-success-soft' : 'bg-canvas-sunken'
          }`}
          style={{ borderRadius: 8 }}>
          <Ionicons
            name="checkmark"
            size={22}
            color={completed ? colors.success.DEFAULT : colors.muted}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}
