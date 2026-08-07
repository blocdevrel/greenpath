import { Pressable, View } from 'react-native';

import { Body, Caption, Card, Label, Stat, Subheading, TriageBadge } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';
import type { HouseholdVisit } from '@/shared/types/visit';

/** Decorative bars mirroring the Medicalic metric-card chart. */
function MetricBars({ accent = colors.primary.DEFAULT }: { accent?: string }) {
  const heights = [8, 16, 12, 22, 14, 26, 10, 18];

  return (
    <View className="h-14 w-14 flex-row items-end justify-end gap-0.5">
      {heights.map((height, index) => (
        <View
          key={index}
          style={{
            height,
            width: 4,
            borderRadius: 2,
            backgroundColor: accent,
            opacity: 0.3 + (index % 4) * 0.18,
          }}
        />
      ))}
    </View>
  );
}

const triageAccent = {
  refer: colors.refer.DEFAULT,
  treat: colors.treat.DEFAULT,
  watch: colors.watch.DEFAULT,
} as const;

/**
 * Compact full-width visit card — title + link, large readout, detail, bars.
 * Matches the Medicalic glucose/heart-rate card proportions.
 */
export function VisitCard({
  visit,
  eyebrow,
  onPress,
}: {
  visit: HouseholdVisit;
  eyebrow?: string;
  onPress?: () => void;
}) {
  const [distanceValue, distanceUnit = ''] = visit.distance.split(' ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open visit for ${visit.name}`}
      onPress={onPress}>
      <Card className={`flex-row items-center gap-3 p-4 ${visit.completed ? 'opacity-55' : ''}`}>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              {eyebrow ? <Caption>{eyebrow}</Caption> : null}
              <Subheading numberOfLines={1}>{visit.name}</Subheading>
            </View>
            <Label tone="primary" className="shrink-0 pt-0.5">
              {visit.completed ? 'Done' : 'View details'}
            </Label>
          </View>

          <View className="mt-2 flex-row items-baseline gap-1.5">
            <Stat>{distanceValue}</Stat>
            {distanceUnit ? (
              <Label tone="subtle" className="font-sans-semibold">
                {distanceUnit}
              </Label>
            ) : null}
          </View>

          <Body numberOfLines={1} className="mt-1">
            {visit.patientType}
          </Body>

          <View className="mt-2 flex-row items-center gap-2">
            <TriageBadge level={visit.level} />
            <Caption numberOfLines={1}>{visit.dueLabel}</Caption>
          </View>
        </View>

        <MetricBars accent={triageAccent[visit.level]} />
      </Card>
    </Pressable>
  );
}
