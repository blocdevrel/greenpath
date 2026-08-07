import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';

import { useTts } from '@/shared/a11y/useTts';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { Body, Button, Caption, Card, Label, Screen } from '@/shared/components/ui';
import type { QuizInsight } from '@/shared/state/GreenPathContext';
import { useGreenPath } from '@/shared/state/GreenPathContext';

export function QuizResultsScreen({
  insight,
  onReview,
  onPractice,
  onContinue,
}: {
  insight: QuizInsight;
  onReview: () => void;
  onPractice: () => void;
  onContinue: () => void;
}) {
  const { lastQuiz } = useGreenPath();
  const { ttsEnabled, readAloud, stop } = useTts();
  const data = lastQuiz ?? insight;

  const spokenText = useMemo(() => {
    return `Quiz complete. Score ${data.scorePct} percent. Strengths: ${data.strengths.join(', ')}. Weaknesses: ${data.weaknesses.join(', ')}. Recommendation: ${data.recommendation}`;
  }, [data]);

  useEffect(() => {
    if (ttsEnabled) void readAloud(spokenText);
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen bottomPadding={28}>
      <View className="items-center gap-4 pt-6">
        <View className="h-40 w-40 items-center justify-center rounded-full border-[10px] border-primary bg-primary-50">
          <Text className="font-sans-extrabold text-display text-primary">{data.scorePct}%</Text>
        </View>
        <Label className="font-sans-bold text-heading">Quiz complete</Label>
        <Body className="text-center">
          GreenPath AI scored your answers and mapped strengths to climate topics.
        </Body>
        <SpeakButton text={spokenText} label="Read results aloud" />
      </View>

      <Card tone="lime" className="gap-2">
        <Caption>Strengths</Caption>
        {data.strengths.map((s) => (
          <Label key={s} className="font-sans-semibold">
            {s}
          </Label>
        ))}
      </Card>

      <Card tone="gold" className="gap-2">
        <Caption>Weaknesses</Caption>
        {data.weaknesses.map((s) => (
          <Label key={s} className="font-sans-semibold">
            {s}
          </Label>
        ))}
      </Card>

      <Card tone="accent" className="gap-2">
        <Caption>AI Recommendation</Caption>
        <Body className="text-ink">{data.recommendation}</Body>
      </Card>

      <Button
        label="Review Lesson"
        size="lg"
        onPress={() => {
          void stop();
          onReview();
        }}
      />
      <Button
        label="Practice Again"
        variant="soft"
        size="lg"
        onPress={() => {
          void stop();
          onPractice();
        }}
      />
      <Button
        label="Continue"
        variant="ghost"
        size="lg"
        onPress={() => {
          void stop();
          onContinue();
        }}
      />
    </Screen>
  );
}
