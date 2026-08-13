import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { WeeklyDay } from '@/shared/api';
import { StreakFireIcon } from '@/shared/components/GameArt';
import { Caption, Card, Label, Screen, Stat } from '@/shared/components/ui';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const { profile, weeklyProgress, lessons, completedMissionIds } = useGreenPath();
  const lessonPct = lessons.length
    ? Math.round((profile.lessonsCompleted / lessons.length) * 100)
    : 0;
  const missionPct = Math.min(100, Math.round((completedMissionIds.length / 8) * 100));
  const xpPct = Math.round((profile.xp / Math.max(1, profile.xpToNext)) * 100);
  const maxXp = Math.max(80, ...weeklyProgress.days.map((d) => d.xp));

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <Text className="font-sans-extrabold text-title text-ink">Analytics</Text>
      <Caption>Track lessons, quizzes, missions, and XP growth</Caption>

      <View className="flex-row flex-wrap gap-3">
        <Metric label="Lessons" value={String(profile.lessonsCompleted)} />
        <Metric label="Missions" value={String(profile.missionsCompleted)} />
        <Metric
          label="Streak"
          value={`${profile.streak}d`}
          accessory={<StreakFireIcon size={28} />}
        />
        <Metric label="XP this week" value={`+${weeklyProgress.totalXp}`} />
      </View>

      <Card className="gap-4">
        <View className="flex-row items-center justify-between">
          <Label className="font-sans-semibold">Weekly activity</Label>
          <Caption>
            {weeklyProgress.activeDays}/7 days · {weeklyProgress.totalXp} XP
          </Caption>
        </View>
        <View className="h-36 flex-row items-end justify-between gap-2">
          {weeklyProgress.days.map((d) => (
            <WeekBar key={d.date} day={d} maxXp={maxXp} tall />
          ))}
        </View>
      </Card>

      <Card className="gap-4">
        <Label className="font-sans-semibold">Learning progress</Label>
        <ProgressRow label="Lessons completed" pct={Math.min(100, lessonPct)} />
        <ProgressRow label="Mission completion" pct={missionPct} />
        <ProgressRow label="XP toward next level" pct={Math.min(100, xpPct)} />
      </Card>
    </Screen>
  );
}

function WeekBar({ day, maxXp, tall }: { day: WeeklyDay; maxXp: number; tall?: boolean }) {
  const track = tall ? 120 : 96;
  const pct = day.xp <= 0 ? 0 : Math.max(12, Math.round((day.xp / maxXp) * 100));
  return (
    <View className="min-w-0 flex-1 items-center gap-2">
      <View className="w-full justify-end" style={{ height: track }}>
        <View
          className={`w-full rounded-md ${
            day.xp > 0 ? (day.isToday ? 'bg-accent' : 'bg-primary') : 'bg-canvas-sunken'
          }`}
          style={{ height: day.xp > 0 ? `${pct}%` : 12, opacity: day.xp > 0 ? 0.9 : 1 }}
        />
      </View>
      <Caption className={day.isToday ? 'font-sans-bold text-primary' : undefined}>{day.day}</Caption>
    </View>
  );
}

function Metric({
  label,
  value,
  accessory,
}: {
  label: string;
  value: string;
  accessory?: ReactNode;
}) {
  return (
    <Card className="w-[47%] gap-1 py-4">
      <View className="flex-row items-center gap-2">
        {accessory}
        <Stat className="text-heading">{value}</Stat>
      </View>
      <Caption>{label}</Caption>
    </Card>
  );
}

function ProgressRow({ label, pct }: { label: string; pct: number }) {
  return (
    <View className="gap-2">
      <View className="flex-row justify-between">
        <Caption>{label}</Caption>
        <Caption>{pct}%</Caption>
      </View>
      <View className="h-2.5 overflow-hidden rounded-full bg-canvas-sunken">
        <View className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}
