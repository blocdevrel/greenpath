import { Pressable, Text, View } from 'react-native';

import { Body, Caption, Label } from '@/shared/components/ui';
import { triage } from '@/shared/theme/tokens';

import type { RoundVisit } from '../types/round';

const shortTriage = {
  refer: 'Refer',
  treat: 'Treat',
  watch: 'Watch',
} as const;

const triageFg = {
  refer: 'text-refer',
  treat: 'text-treat',
  watch: 'text-watch',
} as const;

const triageBg = {
  refer: 'bg-refer-soft',
  treat: 'bg-treat-soft',
  watch: 'bg-watch-soft',
} as const;

function ColHeader({
  label,
  className,
  align = 'left',
}: {
  label: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}) {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <View className={className}>
      <Label
        tone="muted"
        className={`font-sans-semibold text-overline uppercase ${alignClass}`}>
        {label}
      </Label>
    </View>
  );
}

function RoundTableRow({
  visit,
  isNext,
  isLast,
  onPress,
}: {
  visit: RoundVisit;
  isNext?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Rank ${visit.rank}. ${visit.name}. ${visit.why}. ${triage[visit.level].label}`}
      onPress={onPress}
      className={`min-h-[64px] flex-row items-center px-3 py-3 ${
        isNext ? 'bg-primary-50' : 'bg-card-raised'
      } ${isLast ? '' : 'border-b border-line'} ${visit.completed ? 'opacity-45' : ''}`}>
      <View className="w-9 items-center">
        <Label className="font-sans-extrabold text-body">
          {visit.completed ? '✓' : visit.rank}
        </Label>
      </View>

      <View className="min-w-0 flex-1 px-2">
        <Body className="font-sans-semibold text-ink" numberOfLines={1}>
          {visit.name}
        </Body>
        <Caption numberOfLines={1}>{visit.why}</Caption>
      </View>

      <View className="w-[72px] items-start">
        <View className={`rounded-full px-2.5 py-1 ${triageBg[visit.level]}`}>
          <Text className={`font-sans-semibold text-caption ${triageFg[visit.level]}`}>
            {shortTriage[visit.level]}
          </Text>
        </View>
      </View>

      <View className="w-12 items-end">
        <Label className="font-sans-semibold text-caption text-ink">
          {visit.distance.replace(' km', '')}
        </Label>
        <Caption>km</Caption>
      </View>
    </Pressable>
  );
}

export function RoundTable({
  visits,
  nextId,
  onVisitPress,
}: {
  visits: RoundVisit[];
  nextId?: string;
  onVisitPress?: (visitId: string) => void;
}) {
  if (visits.length === 0) {
    return (
      <View className="items-center rounded-md bg-card px-4 py-10">
        <Caption>No households match</Caption>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-md bg-card">
      <View className="flex-row items-center bg-canvas-sunken px-3 py-3">
        <ColHeader label="#" className="w-9" align="center" />
        <ColHeader label="Household" className="min-w-0 flex-1 px-2" />
        <ColHeader label="Risk" className="w-[72px]" />
        <ColHeader label="Dist" className="w-12" align="right" />
      </View>

      {visits.map((visit, index) => (
        <RoundTableRow
          key={visit.id}
          visit={visit}
          isNext={visit.id === nextId}
          isLast={index === visits.length - 1}
          onPress={visit.completed ? undefined : () => onVisitPress?.(visit.id)}
        />
      ))}
    </View>
  );
}
