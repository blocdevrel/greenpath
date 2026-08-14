import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  SESSION_HEARTS,
  buildLessonSession,
  type SessionStep,
} from '@/features/lessons/buildLessonSession';
import { useTts } from '@/shared/a11y/useTts';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { Body, Button, Caption, Label } from '@/shared/components/ui';
import type { Lesson } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

type Phase = 'play' | 'feedback' | 'done';

function speechForStep(step: SessionStep, lessonTitle: string): string {
  if (step.type === 'teach') {
    return `${step.headline}. ${step.text}. ${step.tip ?? ''}`;
  }
  if (step.type === 'trueFalse') {
    return `${step.prompt}. ${step.statement}. Choose true or false.`;
  }
  const choices = step.options
    .map((option, i) => `Option ${i + 1}. ${option}.`)
    .join(' ');
  return `${lessonTitle}. ${step.prompt}. ${choices}`;
}

export function LessonSessionScreen({
  lesson,
  onBack,
  onFinished,
}: {
  lesson: Lesson;
  onBack: () => void;
  onFinished: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { completeLesson, completedLessonIds } = useGreenPath();
  const { readAloud, stop, announce } = useTts();
  // Rebuild when catalog content for this lesson updates (same id, richer facts).
  const factKey = lesson.facts.join('\n');
  const steps = useMemo(
    () => buildLessonSession(lesson),
    [lesson, lesson.id, lesson.summary, factKey],
  );
  // Only banked completions block XP — not partial progress on the lesson card.
  const alreadyBankedRef = useRef(completedLessonIds.includes(lesson.id));

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('play');
  const [hearts, setHearts] = useState(SESSION_HEARTS);
  const [selected, setSelected] = useState<number | boolean | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [explain, setExplain] = useState('');
  const [correctChecks, setCorrectChecks] = useState(0);
  const [checkTotal, setCheckTotal] = useState(0);
  const [combo, setCombo] = useState(0);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);

  const step = steps[index];
  const progress = steps.length ? (index + (phase === 'done' ? 1 : 0)) / steps.length : 0;
  const spoken = step ? speechForStep(step, lesson.title) : '';
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(Math.round(progress * 100), {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, progressWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  useEffect(() => {
    alreadyBankedRef.current = completedLessonIds.includes(lesson.id);
    setIndex(0);
    setPhase('play');
    setHearts(SESSION_HEARTS);
    setSelected(null);
    setWasCorrect(false);
    setExplain('');
    setCorrectChecks(0);
    setCheckTotal(0);
    setCombo(0);
    setEarnedXp(null);
    void announce(`Starting ${lesson.title}.`);
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  // Auto-read each lesson screen.
  useEffect(() => {
    if (phase !== 'play' || !spoken.trim()) return;
    void readAloud(spoken, { force: true });
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase, lesson.id]);

  useEffect(() => {
    if (phase !== 'feedback') return;
    // Speak one verdict + tip once (tips no longer repeat "Correct"/"Not true").
    const line = wasCorrect
      ? combo > 1
        ? `Correct! ${combo} in a row. ${explain}`
        : `Correct! ${explain}`
      : `Not quite. ${explain}`;
    void readAloud(line, { force: true });
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, wasCorrect, explain, combo]);

  if (!step && phase !== 'done') {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-5">
        <Label>No session content for this course.</Label>
        <Button label="Back" onPress={onBack} />
      </View>
    );
  }

  const checkAnswer = () => {
    if (!step || step.type === 'teach' || selected === null) return;

    let ok = false;
    let tip = '';
    if (step.type === 'trueFalse') {
      ok = selected === step.correct;
      tip = step.explain;
    } else {
      ok = selected === step.correctIndex;
      tip = step.explain;
      if (!ok) {
        tip = `Correct answer: ${step.options[step.correctIndex]}`;
      }
    }

    setWasCorrect(ok);
    setExplain(tip);
    setCheckTotal((n) => n + 1);
    if (ok) {
      setCorrectChecks((n) => n + 1);
      setCombo((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setCombo(0);
    }
    setPhase('feedback');
  };

  const advance = () => {
    void stop();
    if (index >= steps.length - 1) {
      // completeLesson is the only XP source of truth (returns 0 on retake).
      const xp = completeLesson(lesson.id);
      setEarnedXp(xp);
      setPhase('done');
      void readAloud(
        xp > 0
          ? `${lesson.title} complete. You earned ${xp} XP.`
          : `${lesson.title} practice complete. XP was already earned.`,
        { force: true },
      );
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setWasCorrect(false);
    setExplain('');
    setPhase('play');
  };

  const close = () => {
    void stop();
    onBack();
  };

  if (phase === 'done') {
    const accuracy =
      checkTotal > 0 ? Math.round((correctChecks / checkTotal) * 100) : 100;
    const xpShown = earnedXp ?? 0;
    const isPractice = alreadyBankedRef.current || xpShown <= 0;
    return (
      <View
        className="flex-1 bg-canvas px-5"
        style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}>
          <StoryMascot size={120} />
          <Text
            className="font-sans-extrabold text-title text-ink"
            style={{ textAlign: 'center', width: '100%', maxWidth: 340 }}>
            {lesson.title} complete!
          </Text>
          <Body
            className="text-ink"
            style={{ textAlign: 'center', width: '100%', maxWidth: 340 }}>
            {correctChecks}/{checkTotal || 0} checks correct · {accuracy}% · climate knowledge
            unlocked
          </Body>
          <View
            className="rounded-2xl bg-gold-soft px-5 py-3"
            style={{ alignItems: 'center', alignSelf: 'center' }}>
            <Text className="font-sans-extrabold text-heading text-ink">
              {xpShown > 0 ? `+${xpShown} XP` : 'XP already earned'}
            </Text>
            {isPractice && xpShown <= 0 ? (
              <Caption className="mt-1" style={{ textAlign: 'center' }}>
                Practice run — no new XP this time
              </Caption>
            ) : null}
          </View>
          <SpeakButton
            text={`${lesson.title} complete. ${correctChecks} of ${checkTotal} checks correct.`}
            label="Hear results"
            force
          />
        </View>
        <Button
          label="Back to path"
          size="lg"
          trailingGlyph="→"
          onPress={() => {
            void stop();
            onFinished();
          }}
        />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-canvas"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}>
      <View className="gap-3 px-5">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={close}
            accessibilityLabel="Close lesson"
            className="h-10 w-10 items-center justify-center rounded-full bg-canvas-sunken">
            <Ionicons name="close" size={20} color={colors.ink.DEFAULT} />
          </Pressable>
          <View className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-canvas-sunken">
            <Animated.View className="h-full rounded-full bg-primary" style={progressStyle} />
          </View>
          {combo > 1 ? (
            <Animated.View
              key={`combo-${combo}`}
              entering={ZoomIn.springify().damping(14)}
              className="rounded-full bg-gold-soft px-2.5 py-1">
              <Caption className="font-sans-bold text-ink">{combo}×</Caption>
            </Animated.View>
          ) : null}
          <View className="flex-row items-center gap-1">
            <Ionicons name="heart" size={16} color={colors.danger.DEFAULT} />
            <Label className="font-sans-bold">{hearts}</Label>
          </View>
          <SpeakButton text={spoken} label="Read this screen" size="sm" force />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View
          key={step.id}
          entering={FadeInDown.duration(340).easing(Easing.out(Easing.cubic))}>
          {step.type === 'teach' ? <TeachCard step={step} cover={lesson.cover} topic={lesson.topic} /> : null}

          {step.type === 'trueFalse' ? (
            <CheckShell prompt={step.prompt} body={step.statement} mascot>
              <View className="flex-row gap-3">
                {[true, false].map((value) => {
                  const on = selected === value;
                  let border = on ? 'border-primary bg-primary-50' : 'border-line bg-card-raised';
                  if (phase === 'feedback') {
                    if (value === step.correct) border = 'border-success bg-success-soft';
                    else if (on) border = 'border-danger bg-danger-soft';
                  }
                  return (
                    <Pressable
                      key={String(value)}
                      disabled={phase === 'feedback'}
                      onPress={() => setSelected(value)}
                      className={`min-h-16 flex-1 items-center justify-center rounded-2xl border-2 ${border}`}>
                      <Text className="font-sans-extrabold text-subheading text-ink">
                        {value ? 'True' : 'False'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </CheckShell>
          ) : null}

          {step.type === 'mcq' ? (
            <CheckShell prompt={step.prompt} mascot>
              <View className="gap-3">
                {step.options.map((option, i) => {
                  const on = selected === i;
                  let border = on ? 'border-primary bg-primary-50' : 'border-line bg-card-raised';
                  let text = on ? 'text-primary' : 'text-ink';
                  if (phase === 'feedback') {
                    if (i === step.correctIndex) {
                      border = 'border-success bg-success-soft';
                      text = 'text-success';
                    } else if (on) {
                      border = 'border-danger bg-danger-soft';
                      text = 'text-danger';
                    }
                  }
                  return (
                    <Pressable
                      key={`${step.id}-${i}`}
                      disabled={phase === 'feedback'}
                      onPress={() => setSelected(i)}
                      className={`min-h-14 justify-center rounded-2xl border-2 px-4 py-3 ${border}`}>
                      <Text className={`font-sans-medium text-body ${text}`}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </CheckShell>
          ) : null}
        </Animated.View>

        {phase === 'feedback' ? (
          <Animated.View
            entering={ZoomIn.duration(260).springify().damping(16)}
            className={`gap-2 rounded-2xl px-4 py-3 ${
              wasCorrect ? 'bg-success-soft' : 'bg-danger-soft'
            }`}>
            <Text
              className={`font-sans-extrabold text-subheading ${
                wasCorrect ? 'text-success' : 'text-danger'
              }`}>
              {wasCorrect ? (combo > 1 ? `Correct! ×${combo}` : 'Correct!') : 'Not quite'}
            </Text>
            <Body className="text-ink">{explain}</Body>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View className="gap-3 px-5">
        {step.type === 'teach' ? (
          <Button label="Continue" size="lg" trailingGlyph="→" onPress={advance} />
        ) : phase === 'feedback' ? (
          <Button
            label={index >= steps.length - 1 ? 'Finish lesson' : 'Continue'}
            size="lg"
            trailingGlyph="→"
            onPress={advance}
          />
        ) : (
          <Button
            label="Check"
            size="lg"
            disabled={selected === null || hearts <= 0}
            onPress={checkAnswer}
          />
        )}

        {hearts <= 0 && phase === 'play' && step.type !== 'teach' ? (
          <Pressable onPress={close} className="min-h-11 items-center justify-center">
            <Label className="text-danger">Out of hearts — practice again later</Label>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** Fox mascot — pops in, then gently bobs so the story feels alive. */
function StoryMascot({ size }: { size: number }) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [bob]);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(11).stiffness(140)}
      style={{ width: size, height: size, alignSelf: 'center' }}>
      <Animated.View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, bobStyle]}>
        <Image
          source={images.mascotWelcome}
          style={{ width: size, height: size }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel="Climate coach"
        />
      </Animated.View>
    </Animated.View>
  );
}

function TeachCard({
  step,
  cover,
  topic,
}: {
  step: Extract<SessionStep, { type: 'teach' }>;
  cover: Lesson['cover'];
  topic: string;
}) {
  const isIntro = step.id.endsWith('-intro');
  const isApply = step.id.endsWith('-apply');

  // Intro: cover image separate from copy (not one combined card).
  if (isIntro) {
    return (
      <View className="gap-4">
        <View
          className="w-full overflow-hidden bg-canvas-sunken"
          style={{ height: 176, borderRadius: 8 }}>
          <Image
            source={cover}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>
        <View className="gap-3 px-1">
          <View className="self-start rounded-full bg-primary-50 px-3 py-1">
            <Caption className="font-sans-bold text-primary">{step.headline}</Caption>
          </View>
          <Text className="font-sans-bold text-heading text-ink">{step.text}</Text>
          {step.tip ? <Caption>{step.tip}</Caption> : null}
        </View>
      </View>
    );
  }

  return (
    <View className="gap-4 overflow-hidden rounded-3xl bg-card">
      <View className="gap-4 px-5 pb-6 pt-5">
        <View className="flex-row items-center gap-2">
          <View className="rounded-full bg-primary-50 px-3 py-1">
            <Caption className="font-sans-bold text-primary">{step.headline}</Caption>
          </View>
          {isApply ? (
            <View className="rounded-full bg-gold-soft px-3 py-1">
              <Caption className="font-sans-bold text-ink">Action</Caption>
            </View>
          ) : null}
        </View>
        <View className="flex-row items-center gap-3">
          <StoryMascot size={72} />
          <Caption className="flex-1">
            {isApply ? 'Try this in real life' : `Climate coach · ${topic}`}
          </Caption>
        </View>
        <Text className="font-sans-bold text-heading text-ink">{step.text}</Text>
        {step.tip ? <Caption>{step.tip}</Caption> : null}
      </View>
    </View>
  );
}

function CheckShell({
  prompt,
  body,
  children,
  mascot,
}: {
  prompt: string;
  body?: string;
  children: React.ReactNode;
  mascot?: boolean;
}) {
  return (
    <View className="gap-5">
      {mascot ? (
        <View className="flex-row items-center gap-3">
          <StoryMascot size={64} />
          <Caption className="font-sans-semibold text-primary">Your turn</Caption>
        </View>
      ) : null}
      <View className="gap-2">
        <Text className="font-sans-extrabold text-heading text-ink">{prompt}</Text>
        {body ? (
          <View className="rounded-2xl border border-line bg-card-raised px-4 py-3">
            <Body className="text-ink">{body}</Body>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}
