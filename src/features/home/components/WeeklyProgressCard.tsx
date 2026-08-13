import { memo, useMemo } from 'react';
import { View } from 'react-native';

import type { WeeklyDay, WeeklyProgress } from '@/shared/api';
import { Caption, Card, Overline } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

const BAR_MAX_H = 104;
const BAR_MIN_H = 8;
const TRACK_H = BAR_MAX_H;

/**
 * Weekly XP chart — fixed pixel bars (percentage heights distort on RN Web).
 * Layout inspired by modern habit / fitness weekly activity strips.
 */
export const WeeklyProgressCard = memo(function WeeklyProgressCard({
  weeklyProgress,
}: {
  weeklyProgress: WeeklyProgress;
}) {
  const maxXp = useMemo(
    () => Math.max(40, ...weeklyProgress.days.map((d) => d.xp), 1),
    [weeklyProgress.days],
  );

  return (
    <View className="gap-3 px-5">
      <View className="flex-row items-end justify-between gap-3">
        <Overline>Weekly Progress</Overline>
        <Caption className="shrink-0">
          {weeklyProgress.activeDays}/7 active
        </Caption>
      </View>

      <Card className="gap-4 py-4">
        <View className="flex-row items-end justify-between px-1">
          {weeklyProgress.days.map((day) => (
            <WeekBar key={day.date} day={day} maxXp={maxXp} />
          ))}
        </View>
      </Card>
    </View>
  );
});

function WeekBar({ day, maxXp }: { day: WeeklyDay; maxXp: number }) {
  const hasXp = day.xp > 0;
  const fillH = hasXp
    ? Math.max(BAR_MIN_H, Math.round((day.xp / maxXp) * BAR_MAX_H))
    : BAR_MIN_H;

  const fillColor = !hasXp
    ? colors.canvas.sunken
    : day.isToday
      ? colors.accent.DEFAULT
      : colors.primary.DEFAULT;

  return (
    <View className="min-w-0 flex-1 items-center gap-2">
      <View
        className="w-full items-center justify-end overflow-hidden rounded-full bg-canvas-sunken"
        style={{ height: TRACK_H, maxWidth: 28 }}>
        <View
          className="w-full rounded-full"
          style={{
            height: fillH,
            backgroundColor: fillColor,
            maxWidth: 28,
          }}
        />
      </View>

      <View className="items-center gap-0.5">
        <Caption
          className={day.isToday ? 'font-sans-bold text-primary' : undefined}
          numberOfLines={1}>
          {day.day}
        </Caption>
        {day.isToday ? (
          <View className="h-1 w-1 rounded-full bg-primary" />
        ) : (
          <View className="h-1 w-1" />
        )}
      </View>
    </View>
  );
}
