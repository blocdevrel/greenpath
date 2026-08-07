import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTts } from '@/shared/a11y/useTts';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { Body, Button, Caption, Card, Label } from '@/shared/components/ui';
import type { Lesson } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function LessonDetailScreen({
  lesson,
  onBack,
  onEndLesson,
  onTakeQuiz,
}: {
  lesson: Lesson;
  onBack: () => void;
  onEndLesson: () => void;
  onTakeQuiz: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { advanceLessonFact, completeLesson, lessons } = useGreenPath();
  const { ttsEnabled, readAloud, stop, announce } = useTts();
  const live = lessons.find((l) => l.id === lesson.id) ?? lesson;
  const [step, setStep] = useState(0); // 0 = intro, 1..n = facts, n+1 = done
  const totalSteps = live.facts.length + 1;
  const progress = Math.min(1, (step + 1) / totalSteps);
  const onFact = step >= 1 && step <= live.facts.length;
  const onDoneStep = step > live.facts.length;

  const spokenText = useMemo(() => {
    if (step === 0) {
      return `${live.title}. ${live.difficulty} lesson, ${live.minutes} minutes, topic ${live.topic}. ${live.summary}. Read each climate fact, then take the quiz to lock in what you learned.`;
    }
    if (onFact) {
      return `Fact ${step} of ${live.facts.length}. Key insight. ${live.facts[step - 1]}`;
    }
    return `You’re ready for the quiz. You’ve finished the interactive facts for ${live.title}.`;
  }, [live, onFact, step]);

  useEffect(() => {
    void announce(`Lesson opened. ${live.title}.`);
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ttsEnabled) return;
    void readAloud(spokenText);
    // Auto-read each step for visually impaired users when TTS is on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, ttsEnabled]);

  const goNext = () => {
    void stop();
    if (step === 0) {
      setStep(1);
      advanceLessonFact(live.id, 0);
      return;
    }
    if (step < live.facts.length) {
      const next = step + 1;
      setStep(next);
      advanceLessonFact(live.id, next - 1);
      return;
    }
    if (!onDoneStep) {
      setStep(live.facts.length + 1);
      completeLesson(live.id);
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 28,
          flexGrow: 1,
        }}>
        <View className="relative w-full overflow-hidden bg-primary-50" style={{ height: 220 }}>
          <Image
            source={images.landingHero}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          <View
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(13, 59, 18, 0.28)' }}
          />
          <Pressable
            onPress={() => {
              void stop();
              onBack();
            }}
            accessibilityLabel="Back"
            className="absolute left-5 h-11 w-11 items-center justify-center rounded-full bg-card-raised"
            style={{ top: insets.top + 8 }}>
            <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
          </Pressable>
        </View>

        <View className="gap-6 px-5 pt-5">
          <View className="gap-3">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1 gap-2">
                <Text className="font-sans-extrabold text-title text-ink">{live.title}</Text>
                <Caption>
                  {live.minutes} min, {live.difficulty}, {live.topic}
                </Caption>
              </View>
            </View>
            <SpeakButton text={spokenText} label="Read lesson aloud" />
          </View>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Label>Lesson progress</Label>
              <Caption>
                Step {Math.min(step + 1, totalSteps)}/{totalSteps}
              </Caption>
            </View>
            <View className="h-3 overflow-hidden rounded-full bg-canvas-sunken">
              <View
                className="h-full rounded-full bg-lime"
                style={{ width: `${Math.max(8, Math.round(progress * 100))}%` }}
              />
            </View>
          </View>

          {step === 0 ? (
            <Card className="gap-2">
              <Caption>How this lesson works</Caption>
              <Body className="text-ink">{live.summary}</Body>
              <Body>
                Read each climate fact, then take the quiz to lock in what you learned.
              </Body>
            </Card>
          ) : null}

          {onFact ? (
            <Card
              tone={(step - 1) % 3 === 0 ? 'lime' : (step - 1) % 3 === 1 ? 'accent' : 'gold'}
              className="gap-2">
              <Caption>
                Fact {step} of {live.facts.length}
              </Caption>
              <Label className="font-sans-bold text-subheading">Key insight</Label>
              <Body className="text-ink">{live.facts[step - 1]}</Body>
            </Card>
          ) : null}

          {onDoneStep ? (
            <Card tone="primary" className="gap-2">
              <Label className="font-sans-bold text-heading">You’re ready for the quiz</Label>
              <Body>
                You’ve finished the interactive facts. Test yourself or return home. Your XP
                already updated.
              </Body>
            </Card>
          ) : null}

          {!onDoneStep ? (
            <Button
              label={step === 0 ? 'Start interactive lesson' : 'Next fact'}
              size="lg"
              trailingGlyph="→"
              onPress={goNext}
            />
          ) : (
            <>
              <Button
                label="Take Quiz"
                size="lg"
                trailingGlyph="→"
                onPress={() => {
                  void stop();
                  onTakeQuiz();
                }}
              />
              <Button
                label="Back to Home"
                variant="soft"
                size="lg"
                onPress={() => {
                  void stop();
                  onEndLesson();
                }}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
