import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import {
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

import { DAILY_XP_GOAL } from '@/features/lessons/buildLessonSession';
import { StreakFireIcon } from '@/shared/components/GameArt';
import { MOBILE_MAX_WIDTH, useShellWidth } from '@/shared/components/MobileShell';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Body, Caption, Label, Overline } from '@/shared/components/ui';
import type { Lesson } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

type NodeState = 'done' | 'current' | 'locked';

export function LessonsScreen({
  onOpenLesson,
  onStartSession,
}: {
  onOpenLesson: (lesson: Lesson) => void;
  onStartSession: (lesson: Lesson) => void;
}) {
  const insets = useSafeAreaInsets();
  const {
    filteredLessons,
    interests,
    completedLessonIds,
    profile,
    weeklyProgress,
    sessionStatus,
    hydrateFromServer,
  } = useGreenPath();
  const [topic, setTopic] = useState('all');
  const [topicOpen, setTopicOpen] = useState(false);

  const topicOptions = useMemo(() => {
    const seen: string[] = [];
    for (const lesson of filteredLessons) {
      if (!seen.includes(lesson.topic)) seen.push(lesson.topic);
    }
    return [
      { id: 'all', label: 'All units' },
      ...seen.map((id) => ({ id, label: id })),
    ];
  }, [filteredLessons]);

  const selectedTopicLabel =
    topicOptions.find((opt) => opt.id === topic)?.label ?? 'All units';

  const pathLessons = useMemo(
    () =>
      topic === 'all' ? filteredLessons : filteredLessons.filter((l) => l.topic === topic),
    [filteredLessons, topic],
  );

  const doneIds = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);

  const currentIndex = useMemo(() => {
    const idx = pathLessons.findIndex((l) => !doneIds.has(l.id));
    return idx < 0 ? Math.max(0, pathLessons.length - 1) : idx;
  }, [pathLessons, doneIds]);

  const currentLesson = pathLessons[currentIndex] ?? null;
  const doneCount = pathLessons.filter((l) => doneIds.has(l.id)).length;
  const todayXp = weeklyProgress.days.find((d) => d.isToday)?.xp ?? 0;
  const goalPct = Math.min(100, Math.round((todayXp / DAILY_XP_GOAL) * 100));
  const goalMet = todayXp >= DAILY_XP_GOAL;

  const units = useMemo(() => {
    const map = new Map<
      string,
      { unitId: string; subtitle: string; lessons: Lesson[]; minOrder: number }
    >();
    for (const lesson of pathLessons) {
      const key = lesson.unitId ?? lesson.topic;
      const existing = map.get(key);
      if (existing) {
        existing.lessons.push(lesson);
      } else {
        map.set(key, {
          unitId: key,
          subtitle: lesson.topic,
          lessons: [lesson],
          minOrder: lesson.sortOrder ?? lesson.curriculumNo ?? 0,
        });
      }
    }
    return [...map.values()]
      .sort((a, b) => a.minOrder - b.minOrder)
      .map((unit, unitIndex) => ({
        id: unit.unitId,
        title: `Unit ${unitIndex + 1}`,
        subtitle: unit.subtitle,
        lessons: [...unit.lessons].sort(
          (a, b) =>
            (a.lessonOrder ?? a.sortOrder ?? 0) - (b.lessonOrder ?? b.sortOrder ?? 0),
        ),
      }));
  }, [pathLessons]);

  const listSpeech = `Climate path. ${pathLessons.length} lessons. ${doneCount} completed. Streak ${profile.streak} days. Daily goal ${todayXp} of ${DAILY_XP_GOAL} XP.`;

  return (
    <View
      className="flex-1 bg-canvas"
      style={{ minHeight: 0, flex: 1, ...(Platform.OS !== 'web' ? { overflow: 'hidden' } : {}) }}>
      <ScrollView
        style={{
          flex: 1,
          ...(Platform.OS === 'web'
            ? ({ overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as const)
            : null),
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: TAB_BAR_SCROLL_PADDING + insets.bottom + 64,
        }}>
        <View className="gap-5 pb-8">
          <View className="gap-4 px-5">
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 gap-1">
                <Overline>Learn</Overline>
                <Text className="font-sans-extrabold text-title text-ink">Your climate path</Text>
                {pathLessons.length > 0 ? (
                  <Caption className="font-sans-semibold text-muted">
                    {pathLessons.length} lessons · {units.length} units
                  </Caption>
                ) : null}
              </View>
              <SpeakButton text={listSpeech} label="Read path aloud" />
            </View>

            <View className="flex-row items-stretch gap-1.5">
              <StatPill
                icon={<StreakFireIcon size={15} />}
                label={`${profile.streak}`}
                hint="streak"
              />
              <StatPill
                icon={<Ionicons name="flash" size={13} color="#D97706" />}
                label={`${profile.totalXp.toLocaleString()}`}
                hint="XP"
              />
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5 rounded-2xl border border-line bg-card-raised px-2 py-1.5">
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50">
                  <Text
                    className="font-sans-extrabold text-[9px] text-primary"
                    numberOfLines={1}>
                    {goalPct}%
                  </Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-bold text-[11px] text-ink" numberOfLines={1}>
                    {goalMet ? 'Goal done' : 'Daily goal'}
                  </Text>
                  {!goalMet ? (
                    <Text className="font-sans text-[10px] text-muted" numberOfLines={1}>
                      {todayXp}/{DAILY_XP_GOAL} XP
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => setTopicOpen(true)}
              accessibilityRole="button"
              accessibilityState={{ expanded: topicOpen }}
              accessibilityLabel={`Filter by topic. ${selectedTopicLabel}`}
              className={`h-11 flex-row items-center justify-between gap-2 border bg-card-raised px-3.5 ${
                topicOpen ? 'border-primary' : 'border-line'
              }`}
              style={{ borderRadius: 12 }}>
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Ionicons name="filter-outline" size={16} color={colors.primary.DEFAULT} />
                <Text
                  className="min-w-0 flex-1 font-sans-semibold text-caption text-ink"
                  numberOfLines={1}>
                  {selectedTopicLabel}
                </Text>
              </View>
              <Ionicons
                name={topicOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={topicOpen ? colors.primary.DEFAULT : colors.muted}
              />
            </Pressable>

            {currentLesson ? (
              <Pressable
                onPress={() => onStartSession(currentLesson)}
                accessibilityRole="button"
                accessibilityLabel={`Start ${currentLesson.title}`}
                className="flex-row items-center gap-3 rounded-3xl bg-primary px-4 py-3.5">
                <Image
                  source={images.mascotWelcome}
                  style={{ width: 72, height: 72 }}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
                <View className="min-w-0 flex-1 gap-0.5">
                  <Caption className="font-sans-bold text-white/85">
                    {doneIds.has(currentLesson.id) ? 'PRACTICE' : 'START'}
                  </Caption>
                  <Text
                    className="font-sans-extrabold text-subheading text-white"
                    numberOfLines={2}>
                    {currentLesson.title}
                  </Text>
                </View>
                <View className="h-12 min-w-12 items-center justify-center rounded-full bg-white px-4">
                  <Text className="font-sans-extrabold text-label text-primary">GO</Text>
                </View>
              </Pressable>
            ) : null}
          </View>

          {pathLessons.length === 0 ? (
            <View className="mx-5 items-center gap-3 rounded-3xl bg-card px-5 py-10">
              <Label className="font-sans-semibold">
                {sessionStatus === 'loading' ? 'Loading path…' : 'No lessons here yet'}
              </Label>
              <Body className="text-center">
                {sessionStatus === 'error'
                  ? 'Connect once to download the academy. It stays on this device after that.'
                  : 'Pick another topic or update your interests.'}
              </Body>
              {sessionStatus === 'error' ? (
                <Pressable
                  onPress={() => void hydrateFromServer()}
                  className="rounded-full bg-primary px-4 py-2">
                  <Text className="font-sans-semibold text-caption text-white">Retry</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <View className="gap-6 px-5">
              {units.map((unit) => {
                const unitDone = unit.lessons.filter((l) => doneIds.has(l.id)).length;
                const unitPct = Math.round(
                  (unitDone / Math.max(1, unit.lessons.length)) * 100,
                );
                return (
                  <View key={unit.id} className="gap-3">
                    <View className="gap-2">
                      <View className="flex-row items-center justify-between gap-3">
                        <View className="min-w-0 flex-1 gap-0.5">
                          <Text className="font-sans-bold text-[11px] uppercase tracking-wide text-primary">
                            {unit.title}
                          </Text>
                          <Text className="font-sans-extrabold text-heading text-ink">
                            {unit.subtitle}
                          </Text>
                        </View>
                        <View className="items-end gap-0.5">
                          <Text className="font-sans-extrabold text-caption text-ink">
                            {unitDone}/{unit.lessons.length}
                          </Text>
                          <Caption>done</Caption>
                        </View>
                      </View>
                      <View className="h-1.5 overflow-hidden rounded-full bg-canvas-sunken">
                        <View
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${unitPct}%` }}
                        />
                      </View>
                    </View>

                    <View className="gap-2.5">
                      {unit.lessons.map((lesson) => {
                        const globalIndex = pathLessons.findIndex((l) => l.id === lesson.id);
                        const state: NodeState = doneIds.has(lesson.id)
                          ? 'done'
                          : globalIndex === currentIndex
                            ? 'current'
                            : globalIndex < currentIndex
                              ? 'done'
                              : 'locked';

                        return (
                          <LessonRowCard
                            key={lesson.id}
                            lesson={lesson}
                            state={state}
                            onPress={() => {
                              if (state === 'locked') return;
                              onStartSession(lesson);
                            }}
                            onInfo={() => onOpenLesson(lesson)}
                          />
                        );
                      })}
                    </View>
                  </View>
                );
              })}

              {interests.length ? (
                <Caption className="text-center">
                  Path personalized with {interests.length} interest
                  {interests.length === 1 ? '' : 's'}
                </Caption>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      <TopicFilterModal
        visible={topicOpen}
        options={topicOptions}
        selectedId={topic}
        onSelect={(id) => {
          setTopic(id);
          setTopicOpen(false);
        }}
        onClose={() => setTopicOpen(false)}
      />
    </View>
  );
}

function TopicFilterModal({
  visible,
  options,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  options: { id: string; label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const shellWidth = useShellWidth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const panelWidth =
    Platform.OS === 'web'
      ? Math.min(shellWidth, MOBILE_MAX_WIDTH, windowWidth)
      : windowWidth;
  const panelMaxH = Math.min(320, Math.max(180, windowHeight - insets.top - 160));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 bg-black/35"
        style={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: insets.top + 120,
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
          }}>
          <View className="border-b border-line px-4 py-3">
            <Label className="font-sans-semibold">Filter by topic</Label>
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

function StatPill({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <View className="shrink-0 flex-row items-center gap-1 rounded-2xl border border-line bg-card-raised px-2 py-1.5">
      {icon}
      <View className="min-w-0">
        <Text
          className="font-sans-extrabold text-[12px] text-ink"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}>
          {label}
        </Text>
        <Text className="font-sans text-[9px] text-muted">{hint}</Text>
      </View>
    </View>
  );
}

function LessonRowCard({
  lesson,
  state,
  onPress,
  onInfo,
}: {
  lesson: Lesson;
  state: NodeState;
  onPress: () => void;
  onInfo: () => void;
}) {
  const locked = state === 'locked';
  const done = state === 'done';
  const current = state === 'current';

  const statusLabel = done ? 'Done' : current ? 'Up next' : locked ? 'Locked' : 'Ready';
  const statusTone = done
    ? { bg: colors.success.soft, text: colors.success.DEFAULT }
    : current
      ? { bg: colors.primary[50], text: colors.primary.DEFAULT }
      : { bg: colors.canvas.sunken, text: colors.muted };

  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityLabel={`${lesson.title}. ${statusLabel}. ${lesson.minutes} minutes. ${lesson.xp} XP`}
      className={`overflow-hidden bg-card-raised active:opacity-95 ${
        current ? 'border-2 border-primary' : 'border border-line'
      }`}
      style={{
        borderRadius: 16,
        opacity: locked ? 0.72 : 1,
      }}>
      <View className="flex-row">
        <View className="relative overflow-hidden" style={{ width: 96, minHeight: 96 }}>
          <Image
            source={lesson.cover}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          {done ? (
            <View className="absolute inset-0 items-center justify-center bg-primary/45">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                <Ionicons name="checkmark" size={18} color={colors.primary.DEFAULT} />
              </View>
            </View>
          ) : null}
          {locked ? (
            <View className="absolute inset-0 items-center justify-center bg-ink/35">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-white/95">
                <Ionicons name="lock-closed" size={14} color={colors.muted} />
              </View>
            </View>
          ) : null}
        </View>

        <View className="min-w-0 flex-1 justify-between gap-2 px-3.5 py-3">
          <View className="flex-row items-start gap-2">
            <View className="min-w-0 flex-1 gap-1.5">
              <View
                className="self-start rounded-full px-2 py-0.5"
                style={{ backgroundColor: statusTone.bg }}>
                <Text
                  className="font-sans-bold text-[10px] uppercase tracking-wide"
                  style={{ color: statusTone.text }}>
                  {statusLabel}
                </Text>
              </View>
              <Text className="font-sans-bold text-body text-ink" numberOfLines={2}>
                {lesson.title}
              </Text>
            </View>
            <Pressable
              onPress={onInfo}
              hitSlop={10}
              accessibilityLabel={`About ${lesson.title}`}
              className="h-8 w-8 items-center justify-center rounded-full bg-canvas-sunken">
              <Ionicons name="ellipsis-horizontal" size={14} color={colors.subtle} />
            </Pressable>
          </View>

          <View className="flex-row flex-wrap items-center gap-1.5">
            <View className="flex-row items-center gap-1 rounded-full bg-canvas-sunken px-2 py-1">
              <Ionicons name="time-outline" size={12} color={colors.subtle} />
              <Text className="font-sans-semibold text-[11px] text-subtle">{lesson.minutes} min</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-gold-soft px-2 py-1">
              <Ionicons name="flash" size={12} color="#D97706" />
              <Text className="font-sans-bold text-[11px]" style={{ color: '#B45309' }}>
                +{lesson.xp} XP
              </Text>
            </View>
            {!locked ? (
              <View className="ml-auto h-8 w-8 items-center justify-center rounded-full bg-primary-50">
                <Ionicons name="play" size={14} color={colors.primary.DEFAULT} />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
