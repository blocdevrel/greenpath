import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, fetchLeaderboard, type LeaderboardEntryDto } from '@/shared/api';
import { MOBILE_MAX_WIDTH, useShellWidth } from '@/shared/components/MobileShell';
import { Caption, Label } from '@/shared/components/ui';
import { GHANA_REGIONS, type GhanaRegion, type LeaderboardEntry } from '@/shared/data/greenpathData';
import { Trophy } from '@/shared/icons/lucide';
import { images } from '@/shared/media';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import {
  leaderboardCacheKey,
  readLeaderboardCache,
  writeLeaderboardCache,
} from '@/shared/storage/leaderboardCache';
import { colors } from '@/shared/theme/tokens';

type Scope = 'overall' | 'region';
type Period = 'week' | 'all';

type FilterPreset = {
  id: string;
  label: string;
  scope: Scope;
  period: Period;
};

const FILTER_PRESETS: FilterPreset[] = [
  { id: 'overall-week', label: 'Overall · This Week', scope: 'overall', period: 'week' },
  { id: 'overall-all', label: 'Overall · All Time', scope: 'overall', period: 'all' },
  { id: 'region-week', label: 'By Region · This Week', scope: 'region', period: 'week' },
  { id: 'region-all', label: 'By Region · All Time', scope: 'region', period: 'all' },
];

const podiumOrder = [1, 0, 2] as const;
const podiumMeta = [
  { barH: 132, barBg: '#FEF3C7', medal: '#F59E0B', place: 1 },
  { barH: 104, barBg: '#E2E8F0', medal: '#94A3B8', place: 2 },
  { barH: 88, barBg: '#FFEDD5', medal: '#D97706', place: 3 },
] as const;

const AVATAR_COLORS = ['#F97316', '#3B82F6', '#EF4444', '#8B5CF6', '#0D9488', '#CA8A04', '#2E7D32'];

function formatXpShort(xp: number) {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(xp);
}

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

function mapEntry(row: LeaderboardEntryDto): LeaderboardEntry {
  const region = (GHANA_REGIONS.includes(row.region as GhanaRegion)
    ? row.region
    : 'Greater Accra') as GhanaRegion;
  return {
    rank: row.rank,
    name: row.name,
    shortName: row.shortName,
    initials: row.initials,
    xp: row.xp,
    country: 'Ghana',
    flag: '🇬🇭',
    region,
    delta: row.delta,
    avatarColor: AVATAR_COLORS[hashName(row.name) % AVATAR_COLORS.length]!,
    avatar: row.avatarUrl ? { uri: row.avatarUrl } : images.avatarIsaac,
    you: row.you,
  };
}

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { profile } = useGreenPath();
  const myRegion = (profile.region ?? 'Greater Accra') as GhanaRegion;

  const [presetId, setPresetId] = useState('overall-week');
  const [region, setRegion] = useState<GhanaRegion>(myRegion);
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);

  const preset = FILTER_PRESETS.find((p) => p.id === presetId) ?? FILTER_PRESETS[0]!;
  const scope = preset.scope;
  const period = preset.period;
  const cacheKey = leaderboardCacheKey(scope, period, scope === 'region' ? region : null);

  const load = useCallback(async () => {
    setError(null);

    const cached = await readLeaderboardCache(cacheKey);
    if (cached) {
      setRows(cached.response.entries.map(mapEntry));
      setLoading(false);
      setRefreshing(true);
    } else {
      setLoading(true);
      setRefreshing(false);
    }

    try {
      const data = await fetchLeaderboard({
        scope,
        period,
        region: scope === 'region' ? region : undefined,
      });
      setRows(data.entries.map(mapEntry));
      void writeLeaderboardCache(cacheKey, data);
    } catch (e) {
      if (!cached) {
        setRows([]);
        setError(e instanceof ApiError ? e.message : 'Could not load leaderboard');
      }
      // Keep cached rows on refresh failure.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cacheKey, period, region, scope]);

  useEffect(() => {
    void load();
  }, [load]);

  const top3 = useMemo(() => rows.slice(0, 3), [rows]);
  const canPodium = top3.length >= 3;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
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
            Rankings across GreenPath Ghana
          </Text>
        </View>

        <View className="gap-4 px-5 pt-2" style={{ marginTop: -16 }}>
          <View className="flex-row gap-2">
            <FilterSelect
              label={preset.label}
              open={filterOpen}
              onPress={() => {
                setRegionOpen(false);
                setFilterOpen((o) => !o);
              }}
              className="min-w-0 flex-1"
            />
            {scope === 'region' ? (
              <FilterSelect
                label={region}
                open={regionOpen}
                onPress={() => {
                  setFilterOpen(false);
                  setRegionOpen((o) => !o);
                }}
                className="max-w-[46%]"
              />
            ) : null}
          </View>

          {loading && rows.length === 0 ? (
            <View className="items-center py-10">
              <ActivityIndicator color={colors.primary.DEFAULT} />
              <Caption className="mt-3">Loading rankings…</Caption>
            </View>
          ) : null}

          {refreshing && rows.length > 0 ? (
            <View className="flex-row items-center justify-center gap-2 py-1">
              <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              <Caption>Updating rankings…</Caption>
            </View>
          ) : null}

          {error && rows.length === 0 ? (
            <View
              className="items-center gap-3 rounded-lg bg-card px-4 py-8"
              style={{ borderRadius: 8 }}>
              <Caption className="text-center">{error}</Caption>
              <Pressable
                onPress={() => void load()}
                className="rounded-lg bg-primary px-5 py-3"
                style={{ borderRadius: 8 }}>
                <Text className="font-sans-bold text-body text-white">Retry</Text>
              </Pressable>
            </View>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <View
              className="rounded-lg border border-line bg-card px-4 py-10"
              style={{ borderRadius: 8 }}>
              <Caption className="text-center">
                No rankings yet. Complete a mission or lesson to earn XP and appear here.
              </Caption>
            </View>
          ) : null}

          {canPodium ? (
            <View className="flex-row items-end justify-between gap-2 px-1 pt-4">
              {podiumOrder.map((dataIndex) => {
                const person = top3[dataIndex]!;
                const meta = podiumMeta[person.rank - 1] ?? podiumMeta[2];
                const isFirst = person.rank === 1;
                return (
                  <View key={`${person.rank}-${person.name}`} className="min-w-0 flex-1 items-center">
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
          ) : null}

          {rows.length > 0 ? (
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
                      <Caption numberOfLines={1}>
                        {row.region} · {row.xp.toLocaleString()} XP
                      </Caption>
                    </View>
                  </View>
                  <Delta value={row.delta} />
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <FilterMenuModal
        visible={filterOpen}
        title="Rankings filter"
        options={FILTER_PRESETS.map((p) => ({ id: p.id, label: p.label }))}
        selectedId={presetId}
        onSelect={(id) => {
          setPresetId(id);
          setFilterOpen(false);
        }}
        onClose={() => setFilterOpen(false)}
      />

      <FilterMenuModal
        visible={regionOpen && scope === 'region'}
        title="Choose region"
        options={GHANA_REGIONS.map((r) => ({
          id: r,
          label: r === myRegion ? `${r} · You` : r,
        }))}
        selectedId={region}
        onSelect={(id) => {
          setRegion(id as GhanaRegion);
          setRegionOpen(false);
        }}
        onClose={() => setRegionOpen(false)}
        maxHeight={320}
      />
    </View>
  );
}

function FilterSelect({
  label,
  open,
  onPress,
  className,
}: {
  label: string;
  open: boolean;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      className={`h-12 flex-row items-center justify-between gap-2 border bg-card px-3.5 ${
        open ? 'border-primary' : 'border-line'
      } ${className ?? ''}`}
      style={{ borderRadius: 10 }}>
      <Text className="min-w-0 flex-1 font-sans-semibold text-caption text-ink" numberOfLines={1}>
        {label}
      </Text>
      <Ionicons
        name={open ? 'chevron-up' : 'chevron-down'}
        size={16}
        color={open ? colors.primary.DEFAULT : colors.muted}
      />
    </Pressable>
  );
}

/** Overlay menu — constrained to the phone shell so it doesn’t spill on desktop web. */
function FilterMenuModal({
  visible,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
  maxHeight = 280,
}: {
  visible: boolean;
  title: string;
  options: { id: string; label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  maxHeight?: number;
}) {
  const insets = useSafeAreaInsets();
  const shellWidth = useShellWidth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const panelWidth =
    Platform.OS === 'web'
      ? Math.min(shellWidth, MOBILE_MAX_WIDTH, windowWidth)
      : windowWidth;
  const panelMaxH = Math.min(maxHeight, Math.max(180, windowHeight - insets.top - 160));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 bg-black/35"
        style={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: insets.top + 108,
        }}>
        <Pressable
          accessibilityLabel="Dismiss"
          onPress={onClose}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <View
          className="overflow-hidden border border-line bg-card"
          style={{
            width: panelWidth - 40,
            maxWidth: MOBILE_MAX_WIDTH - 40,
            borderRadius: 14,
            maxHeight: panelMaxH,
            shadowColor: '#0F172A',
            shadowOpacity: 0.18,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 10,
          }}>
          <View className="border-b border-line px-4 py-3">
            <Label className="font-sans-semibold">{title}</Label>
          </View>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: panelMaxH - 52 }}>
            {options.map((opt, index) => {
              const selected = opt.id === selectedId;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => onSelect(opt.id)}
                  className={`flex-row items-center justify-between px-4 py-3.5 ${
                    index > 0 ? 'border-t border-line' : ''
                  } ${selected ? 'bg-primary-50' : 'bg-card'}`}>
                  <Text
                    className={`min-w-0 flex-1 font-sans-semibold text-body ${
                      selected ? 'text-primary' : 'text-ink'
                    }`}
                    numberOfLines={1}>
                    {opt.label}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary.DEFAULT} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const bg = rank === 1 ? '#EAB308' : rank === 2 ? '#94A3B8' : '#D97706';
    return (
      <View
        className="h-7 w-7 items-center justify-center"
        style={{ backgroundColor: bg, borderRadius: 8 }}>
        <Text className="font-sans-extrabold text-caption text-white">{rank}</Text>
      </View>
    );
  }
  return (
    <View
      className="h-7 w-7 items-center justify-center bg-canvas-sunken"
      style={{ borderRadius: 8 }}>
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
    <Text className={`font-sans-bold text-caption ${up ? 'text-primary' : 'text-danger'}`}>
      {up ? `+${value}` : value}
    </Text>
  );
}
