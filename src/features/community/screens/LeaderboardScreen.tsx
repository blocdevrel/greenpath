import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Caption, Label } from '@/shared/components/ui';
import { leaderboard } from '@/shared/data/greenpathData';
import { Trophy } from '@/shared/icons/lucide';
import { colors } from '@/shared/theme/tokens';

type Period = 'week' | 'all';

const podiumOrder = [1, 0, 2] as const; // visual order: 2nd, 1st, 3rd
const podiumMeta = [
  { barH: 132, barBg: '#FEF3C7', medal: '#F59E0B', place: 1 },
  { barH: 104, barBg: '#E2E8F0', medal: '#94A3B8', place: 2 },
  { barH: 88, barBg: '#FFEDD5', medal: '#D97706', place: 3 },
] as const;

function formatXpShort(xp: number) {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(xp);
}

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');

  const rows = useMemo(() => {
    // Demo: all-time slightly boosts XP so the toggle feels alive
    if (period === 'all') {
      return leaderboard.map((r) => ({ ...r, xp: Math.round(r.xp * 1.35) }));
    }
    return [...leaderboard];
  }, [period]);

  const top3 = rows.slice(0, 3);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        {/* Blue header */}
        <View
          className="overflow-hidden bg-primary px-5 pb-8"
          style={{ paddingTop: insets.top + 8 }}>
          <View className="absolute -right-6 -top-2 opacity-20">
            <Trophy size={120} color="#FFFFFF" strokeWidth={1.5} />
          </View>

          <Pressable
            onPress={onBack}
            accessibilityLabel="Back"
            className="mb-5 h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>

          <Text className="font-sans-extrabold text-title text-white">Leaderboard</Text>
          <Text className="mt-1 font-sans text-body text-white/85">
            Top climate action heroes in Ghana.
          </Text>
        </View>

        <View className="gap-6 px-5 pt-2" style={{ marginTop: -16 }}>
          {/* Period tabs */}
          <View className="flex-row rounded-full bg-canvas-sunken p-1.5">
            <PeriodTab
              active={period === 'week'}
              label="This Week"
              icon="calendar-outline"
              onPress={() => setPeriod('week')}
            />
            <PeriodTab
              active={period === 'all'}
              label="All Time"
              icon="star"
              onPress={() => setPeriod('all')}
            />
          </View>

          {/* Podium */}
          <View className="flex-row items-end justify-between gap-2 px-1 pt-8">
            {podiumOrder.map((dataIndex) => {
              const person = top3[dataIndex];
              const meta = podiumMeta[person.rank - 1];
              const isFirst = person.rank === 1;
              return (
                <View key={person.rank} className="min-w-0 flex-1 items-center">
                  <View className="mb-2 items-center">
                    {isFirst ? (
                      <Text className="mb-1 text-[16px]" accessibilityLabel="Crown">
                        👑
                      </Text>
                    ) : (
                      <View className="mb-1 h-5" />
                    )}
                    <View
                      className="h-12 w-12 overflow-hidden rounded-full"
                      style={{ backgroundColor: person.avatarColor }}>
                      <Image
                        source={person.avatar}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                      />
                    </View>
                    <Text
                      className="mt-1.5 font-sans-bold text-caption text-ink"
                      numberOfLines={1}>
                      {person.shortName}
                    </Text>
                  </View>

                  <View
                    className="w-full items-center rounded-t-3xl pt-3"
                    style={{ height: meta.barH, backgroundColor: meta.barBg }}>
                    <View
                      className="mb-1 h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: meta.medal }}>
                      <Text className="font-sans-extrabold text-caption text-white">
                        {person.rank}
                      </Text>
                    </View>
                    <Text className="font-sans-extrabold text-subheading text-ink">
                      {formatXpShort(person.xp)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Ranked list */}
          <View className="gap-2.5">
            {rows.map((row) => (
              <View
                key={`${row.rank}-${row.name}`}
                className={`flex-row items-center gap-3 rounded-2xl px-3.5 py-3.5 ${
                  row.you ? 'bg-primary-50' : 'bg-card'
                }`}>
                <RankBadge rank={row.rank} />
                <View
                  className="h-11 w-11 overflow-hidden rounded-full"
                  style={{ backgroundColor: row.avatarColor }}>
                  <Image
                    source={row.avatar}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Label className="font-sans-bold" numberOfLines={1}>
                    {row.name}
                    {row.you ? ' (You)' : ''}
                  </Label>
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[13px]">{row.flag}</Text>
                    <Caption>
                      {row.xp.toLocaleString()} XP
                    </Caption>
                  </View>
                </View>
                <Delta value={row.delta} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PeriodTab({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full px-3 ${
        active ? 'bg-white' : ''
      }`}
      style={active ? { backgroundColor: '#FFFFFF' } : undefined}>
      <Ionicons
        name={icon}
        size={16}
        color={active ? colors.primary.DEFAULT : colors.muted}
      />
      <Text
        className={`font-sans-semibold text-caption ${
          active ? 'text-primary' : 'text-subtle'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const bg = rank === 1 ? '#F59E0B' : rank === 2 ? '#94A3B8' : '#D97706';
    return (
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: bg }}>
        <Text className="font-sans-extrabold text-caption text-white">{rank}</Text>
      </View>
    );
  }
  return (
    <View className="h-8 w-8 items-center justify-center rounded-full bg-canvas-sunken">
      <Text className="font-sans-bold text-caption text-subtle">{rank}</Text>
    </View>
  );
}

function Delta({ value }: { value: number }) {
  if (value === 0) {
    return <Text className="font-sans-semibold text-caption text-muted">—</Text>;
  }
  const up = value > 0;
  return (
    <Text
      className={`font-sans-bold text-caption ${up ? 'text-primary' : 'text-danger'}`}>
      {up ? `+${value}` : value}
    </Text>
  );
}
