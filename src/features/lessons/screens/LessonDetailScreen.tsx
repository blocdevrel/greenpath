import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonVideoPlayer } from '@/features/lessons/components/LessonVideoPlayer';
import { useTts } from '@/shared/a11y/useTts';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { Avatar, Body, Button, Caption, Card, Label } from '@/shared/components/ui';
import { climateGlossary, type Lesson } from '@/shared/data/greenpathData';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

type ModuleId = 'video' | 'reading';
type IonName = ComponentProps<typeof Ionicons>['name'];

export function LessonDetailScreen({
  lesson,
  onBack,
  onTakeQuiz,
  onOpenGlossary,
  onStartSession,
}: {
  lesson: Lesson;
  onBack: () => void;
  onEndLesson: () => void;
  onTakeQuiz: () => void;
  onOpenGlossary?: () => void;
  onStartSession?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { advanceLessonFact, completeLesson, completedLessonIds, lessons } = useGreenPath();
  const { ttsEnabled, readAloud, stop, announce } = useTts();
  const live = lessons.find((l) => l.id === lesson.id) ?? lesson;
  const hasVideo = Boolean(live.video);
  const finished = completedLessonIds.includes(live.id) || live.progress >= 1;

  const [module, setModule] = useState<ModuleId | 'overview'>('overview');
  const [watched, setWatched] = useState(finished || live.progress > 0);
  const [read, setRead] = useState(finished);

  const relatedTerms = useMemo(
    () => climateGlossary.filter((t) => live.glossaryTermIds?.includes(t.id)),
    [live.glossaryTermIds],
  );

  const modulesDone = (hasVideo ? Number(watched) : 0) + Number(read) + Number(finished);
  const modulesTotal = (hasVideo ? 1 : 0) + 2; // video? + reading + quiz
  const progressPct = Math.round((modulesDone / Math.max(1, modulesTotal)) * 100);

  const spokenText = useMemo(() => {
    if (module === 'video' && live.video) {
      return `Video. ${live.video.title}. ${live.video.applyInDailyLife}`;
    }
    if (module === 'reading') {
      return `Key takeaways. ${live.facts.map((fact, i) => `${i + 1}. ${fact}`).join(' ')}`;
    }
    return `${live.title}. Taught by ${live.instructor.name}. ${live.minutes} minutes, ${live.difficulty}. ${live.summary}`;
  }, [live, module]);

  useEffect(() => {
    void announce(`Course opened. ${live.title}.`);
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ttsEnabled) return;
    void readAloud(spokenText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, ttsEnabled]);

  const openModule = (id: ModuleId) => {
    void stop();
    setModule(id);
    if (id === 'reading') advanceLessonFact(live.id, Math.max(0, live.facts.length - 1));
    else if (id === 'video' && live.progress === 0) advanceLessonFact(live.id, 0);
  };

  const markWatched = () => {
    setWatched(true);
    advanceLessonFact(live.id, Math.max(0, Math.floor(live.facts.length / 2) - 1));
    openModule('reading');
  };

  const markRead = () => {
    setRead(true);
    if (!finished) completeLesson(live.id);
    void stop();
    onTakeQuiz();
  };

  const startOrContinue = () => {
    if (onStartSession) {
      void stop();
      onStartSession();
      return;
    }
    if (hasVideo && !watched) {
      openModule('video');
      return;
    }
    if (!read) {
      openModule('reading');
      return;
    }
    void stop();
    onTakeQuiz();
  };

  const primaryLabel = finished
    ? onStartSession
      ? 'Practice session'
      : 'Retake quiz'
    : onStartSession
      ? 'Start interactive lesson'
      : !watched && hasVideo
        ? 'Start course'
        : !read
          ? 'Continue'
          : 'Take quiz';

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 28,
          flexGrow: 1,
        }}>
        {module === 'overview' ? (
          <Overview
            lesson={live}
            insetsTop={insets.top}
            hasVideo={hasVideo}
            watched={watched}
            read={read}
            finished={finished}
            progressPct={progressPct}
            modulesDone={Math.min(modulesDone, modulesTotal)}
            modulesTotal={modulesTotal}
            spokenText={spokenText}
            relatedTerms={relatedTerms}
            onBack={() => {
              void stop();
              onBack();
            }}
            onOpenVideo={() => openModule('video')}
            onOpenReading={() => openModule('reading')}
            onTakeQuiz={() => {
              void stop();
              onTakeQuiz();
            }}
            onOpenGlossary={onOpenGlossary}
            onPrimary={startOrContinue}
            primaryLabel={primaryLabel}
          />
        ) : null}

        {module === 'video' && live.video ? (
          <ModuleShell
            insetsTop={insets.top}
            title="Video lesson"
            onBack={() => {
              void stop();
              setModule('overview');
            }}>
            <LessonVideoPlayer
              youtubeId={live.video.youtubeId}
              title={live.video.title}
              durationMin={live.video.durationMin}
            />
            <Card tone="lime" className="gap-2">
              <Caption>Apply in daily life</Caption>
              <Body className="text-ink">{live.video.applyInDailyLife}</Body>
            </Card>
            <SpeakButton text={spokenText} label="Read video notes aloud" />
            <Button
              label={watched ? 'Continue to takeaways' : 'Mark watched · continue'}
              size="lg"
              trailingGlyph="→"
              onPress={markWatched}
            />
          </ModuleShell>
        ) : null}

        {module === 'reading' ? (
          <ModuleShell
            insetsTop={insets.top}
            title="Key takeaways"
            onBack={() => {
              void stop();
              setModule('overview');
            }}>
            <Caption>
              {live.facts.length} insights from {live.instructor.name}
            </Caption>
            <View className="gap-3">
              {live.facts.map((fact, index) => (
                <View
                  key={fact}
                  className="flex-row gap-3 border border-line bg-card-raised p-4"
                  style={{ borderRadius: 8 }}>
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-50">
                    <Text className="font-sans-bold text-caption text-primary">{index + 1}</Text>
                  </View>
                  <Body className="min-w-0 flex-1 text-ink">{fact}</Body>
                </View>
              ))}
            </View>
            {relatedTerms.length > 0 ? (
              <Card className="gap-3">
                <Label className="font-sans-semibold">Terms to know</Label>
                {relatedTerms.slice(0, 3).map((t) => (
                  <View key={t.id} className="gap-1">
                    <Label className="font-sans-bold">{t.term}</Label>
                    <Body>{t.plainMeaning}</Body>
                  </View>
                ))}
                {onOpenGlossary ? (
                  <Button label="Open full glossary" variant="soft" size="md" onPress={onOpenGlossary} />
                ) : null}
              </Card>
            ) : null}
            <SpeakButton text={spokenText} label="Read takeaways aloud" />
            <Button
              label={finished ? 'Take quiz' : 'Complete & take quiz'}
              size="lg"
              trailingGlyph="→"
              onPress={markRead}
            />
            <Button
              label="Back to course"
              variant="soft"
              size="lg"
              onPress={() => {
                void stop();
                setRead(true);
                if (!finished) completeLesson(live.id);
                setModule('overview');
              }}
            />
          </ModuleShell>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Overview({
  lesson,
  insetsTop,
  hasVideo,
  watched,
  read,
  finished,
  progressPct,
  modulesDone,
  modulesTotal,
  spokenText,
  relatedTerms,
  onBack,
  onOpenVideo,
  onOpenReading,
  onTakeQuiz,
  onOpenGlossary,
  onPrimary,
  primaryLabel,
}: {
  lesson: Lesson;
  insetsTop: number;
  hasVideo: boolean;
  watched: boolean;
  read: boolean;
  finished: boolean;
  progressPct: number;
  modulesDone: number;
  modulesTotal: number;
  spokenText: string;
  relatedTerms: { id: string; term: string; plainMeaning: string }[];
  onBack: () => void;
  onOpenVideo: () => void;
  onOpenReading: () => void;
  onTakeQuiz: () => void;
  onOpenGlossary?: () => void;
  onPrimary: () => void;
  primaryLabel: string;
}) {
  return (
    <>
      <View className="relative w-full overflow-hidden bg-primary-50" style={{ height: 200 }}>
        <Image
          source={lesson.cover}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(13, 59, 18, 0.28)' }} />
        <Pressable
          onPress={onBack}
          accessibilityLabel="Back"
          className="absolute left-5 h-11 w-11 items-center justify-center rounded-full bg-card-raised"
          style={{ top: insetsTop + 8 }}>
          <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
        </Pressable>
      </View>

      <View className="gap-6 px-5 pt-5">
        <View className="gap-3">
          <Text className="font-sans-extrabold text-title text-ink">{lesson.title}</Text>
          <View className="flex-row flex-wrap gap-2">
            <MetaPill icon="time-outline" label={`${lesson.minutes} min`} />
            <MetaPill icon="bar-chart-outline" label={lesson.difficulty} />
            <MetaPill icon="flash-outline" label={`+${lesson.xp} XP`} />
          </View>
          <View className="flex-row items-center gap-3">
            <Avatar name={lesson.instructor.name} size="md" source={lesson.instructor.avatar} />
            <View className="min-w-0 flex-1">
              <Label className="font-sans-semibold">{lesson.instructor.name}</Label>
              <Caption>{lesson.instructor.role}</Caption>
            </View>
          </View>
          <SpeakButton text={spokenText} label="Read course overview aloud" />
        </View>

        <View className="gap-2">
          <View className="flex-row items-end justify-between">
            <Label className="font-sans-semibold">Your progress</Label>
            <Caption>
              {modulesDone}/{modulesTotal} modules · {Math.min(100, progressPct)}%
            </Caption>
          </View>
          <View className="h-2.5 overflow-hidden rounded-full bg-canvas-sunken">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${finished ? 100 : Math.min(100, progressPct)}%` }}
            />
          </View>
        </View>

        <View className="gap-2">
          <Label className="font-sans-semibold">About this course</Label>
          <Body className="text-ink">{lesson.summary}</Body>
        </View>

        <View className="gap-2">
          <Label className="font-sans-semibold">What you’ll learn</Label>
          {lesson.facts.slice(0, 3).map((fact) => (
            <View key={fact} className="flex-row gap-2">
              <Ionicons name="checkmark-circle" size={18} color={colors.primary.DEFAULT} />
              <Caption className="min-w-0 flex-1 text-ink">{shorten(fact, 110)}</Caption>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <Label className="font-sans-semibold">Curriculum</Label>
          {hasVideo && lesson.video ? (
            <CurriculumRow
              index={1}
              title={lesson.video.title}
              meta={`${lesson.video.durationMin} min video`}
              icon="play-circle-outline"
              done={watched}
              onPress={onOpenVideo}
            />
          ) : null}
          <CurriculumRow
            index={hasVideo ? 2 : 1}
            title="Key takeaways"
            meta={`${lesson.facts.length} insights`}
            icon="book-outline"
            done={read}
            onPress={onOpenReading}
          />
          <CurriculumRow
            index={hasVideo ? 3 : 2}
            title="Practice quiz"
            meta="Check what you remember"
            icon="help-circle-outline"
            done={false}
            onPress={onTakeQuiz}
          />
        </View>

        {relatedTerms.length > 0 ? (
          <Card className="gap-2">
            <Caption>Terms in this course</Caption>
            <Label className="font-sans-semibold">
              {relatedTerms
                .slice(0, 3)
                .map((t) => t.term)
                .join(' · ')}
            </Label>
            {onOpenGlossary ? (
              <Button label="Open glossary" variant="ghost" size="sm" onPress={onOpenGlossary} />
            ) : null}
          </Card>
        ) : null}

        <Button label={primaryLabel} size="lg" trailingGlyph="→" onPress={onPrimary} />
      </View>
    </>
  );
}

function ModuleShell({
  insetsTop,
  title,
  onBack,
  children,
}: {
  insetsTop: number;
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-6 px-5" style={{ paddingTop: insetsTop + 12 }}>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onBack}
          accessibilityLabel="Back to course"
          className="h-11 w-11 items-center justify-center rounded-full border border-line bg-card-raised">
          <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
        </Pressable>
        <Text className="min-w-0 flex-1 font-sans-extrabold text-heading text-ink">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function CurriculumRow({
  index,
  title,
  meta,
  icon,
  done,
  onPress,
}: {
  index: number;
  title: string;
  meta: string;
  icon: IonName;
  done: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${meta}`}
      className="flex-row items-center gap-3 border border-line bg-card-raised px-3 py-3.5 active:opacity-90"
      style={{ borderRadius: 8 }}>
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          done ? 'bg-primary' : 'bg-primary-50'
        }`}>
        {done ? (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        ) : (
          <Ionicons name={icon} size={20} color={colors.primary.DEFAULT} />
        )}
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Caption>Module {index}</Caption>
        <Label className="font-sans-semibold" numberOfLines={1}>
          {title}
        </Label>
        <Caption>{meta}</Caption>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

function MetaPill({ icon, label }: { icon: IonName; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-canvas-sunken px-3 py-1.5">
      <Ionicons name={icon} size={14} color={colors.subtle} />
      <Caption>{label}</Caption>
    </View>
  );
}

function shorten(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}
