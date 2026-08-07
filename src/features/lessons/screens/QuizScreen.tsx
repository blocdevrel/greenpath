import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTts } from '@/shared/a11y/useTts';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { Body, Button, Caption, Card, Label, Screen } from '@/shared/components/ui';
import { quizQuestions } from '@/shared/data/greenpathData';
import type { QuizInsight } from '@/shared/state/GreenPathContext';

const topicByQuestion: Record<string, { strength?: string; weakness?: string }> = {
  q1: { strength: 'Waste Management', weakness: 'Plastic Recycling' },
  q2: { strength: 'Solar Energy', weakness: 'Renewable Energy' },
  q3: { strength: 'Climate Change', weakness: 'Tree Planting' },
  q4: { strength: 'Water Conservation', weakness: 'Water Habits' },
};

export function QuizScreen({
  onFinish,
}: {
  onFinish: (insight: QuizInsight) => void;
}) {
  const { stop } = useTts();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [hit, setHit] = useState<string[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const [seconds, setSeconds] = useState(45);

  const question = quizQuestions[index];
  const progress = (index + 1) / quizQuestions.length;

  const spokenText = useMemo(() => {
    const choices = question.options
      .map((option, i) => `Option ${i + 1}. ${option}.`)
      .join(' ');
    return `Question ${index + 1} of ${quizQuestions.length}. ${question.prompt}. ${choices}`;
  }, [index, question]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [index]);

  useEffect(() => {
    void stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  const finish = (nextCorrect: number, nextHit: string[], nextMissed: string[]) => {
    const scorePct = Math.round((nextCorrect / quizQuestions.length) * 100);
    const strengths = nextHit.length ? [...new Set(nextHit)].slice(0, 2) : ['Climate Basics'];
    const weaknesses = nextMissed.length
      ? [...new Set(nextMissed)].slice(0, 2)
      : ['Keep practicing for mastery'];
    const recommendation = nextMissed.length
      ? `We recommend reviewing ${weaknesses[0]} before taking another quiz.`
      : 'Excellent work. Try a climate mission to turn knowledge into action.';
    void stop();
    onFinish({ scorePct, strengths, weaknesses, recommendation });
  };

  const goNext = () => {
    if (selected === null) return;
    const isCorrect = selected === question.correctIndex;
    const meta = topicByQuestion[question.id] ?? {};
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextHit = isCorrect && meta.strength ? [...hit, meta.strength] : hit;
    const nextMissed = !isCorrect && meta.weakness ? [...missed, meta.weakness] : missed;

    if (isCorrect) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 800);
    }

    if (index >= quizQuestions.length - 1) {
      finish(nextCorrect, nextHit, nextMissed);
      return;
    }
    setCorrectCount(nextCorrect);
    setHit(nextHit);
    setMissed(nextMissed);
    setIndex((i) => i + 1);
    setSelected(null);
    setSeconds(45);
  };

  return (
    <Screen bottomPadding={28}>
      <View className="flex-row items-center justify-between gap-3">
        <Caption>
          Question {index + 1}/{quizQuestions.length}
        </Caption>
        <View className="rounded-full bg-gold-soft px-3 py-1">
          <Label className="font-sans-semibold text-ink">{seconds}s</Label>
        </View>
      </View>

      <View className="h-2 overflow-hidden rounded-full bg-canvas-sunken">
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </View>

      {celebrate ? (
        <Text className="text-center font-sans-bold text-success">Correct! Knowledge boost</Text>
      ) : null}

      <Card className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <Label className="min-w-0 flex-1 font-sans-bold text-subheading">{question.prompt}</Label>
          <SpeakButton text={spokenText} label="Play audio" size="sm" force />
        </View>
        <Body>Pick one option below</Body>
      </Card>

      <View className="gap-3">
        {question.options.map((option, i) => {
          const on = selected === i;
          return (
            <Pressable
              key={option}
              onPress={() => setSelected(i)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Option ${i + 1}. ${option}`}
              className={`min-h-14 justify-center rounded-xl border px-4 py-3 ${
                on ? 'border-primary bg-primary-50' : 'border-line bg-card-raised'
              }`}>
              <Text className={`font-sans-medium text-body ${on ? 'text-primary' : 'text-ink'}`}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        label={index === quizQuestions.length - 1 ? 'See Results' : 'Next'}
        size="lg"
        disabled={selected === null}
        trailingGlyph="→"
        onPress={goNext}
      />
    </Screen>
  );
}
