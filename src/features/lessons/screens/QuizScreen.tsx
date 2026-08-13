import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { buildLessonQuiz } from '@/features/lessons/buildLessonQuiz';
import { quizQuestions } from '@/features/lessons/quizContent';
import { useTts } from '@/shared/a11y/useTts';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { Body, Button, Caption, Card, Label, Screen } from '@/shared/components/ui';
import type { Lesson } from '@/shared/data/greenpathData';
import type { QuizInsight } from '@/shared/state/GreenPathContext';

const legacyTopicByQuestion: Record<string, { strength?: string; weakness?: string }> = {
  q1: { strength: 'Waste Management', weakness: 'Plastic Recycling' },
  q2: { strength: 'Solar Energy', weakness: 'Renewable Energy' },
  q3: { strength: 'Climate Change', weakness: 'Tree Planting' },
  q4: { strength: 'Water Conservation', weakness: 'Water Habits' },
};

type Phase = 'pick' | 'feedback';

type QuizQ = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explain: string;
  topicTag: string;
};

export function QuizScreen({
  lesson,
  onFinish,
}: {
  /** When set, quiz questions are built from this lesson's facts. */
  lesson?: Lesson;
  onFinish: (insight: QuizInsight) => void;
}) {
  const { stop } = useTts();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('pick');
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [hit, setHit] = useState<string[]>([]);

  const questions = useMemo<QuizQ[]>(() => {
    if (lesson) return buildLessonQuiz(lesson);
    return quizQuestions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explain: '',
      topicTag: legacyTopicByQuestion[q.id]?.strength ?? 'Climate Basics',
    }));
  }, [lesson]);

  const question = questions[index]!;
  const progress = questions.length
    ? (index + (phase === 'feedback' ? 1 : 0)) / questions.length
    : 0;
  const isCorrect = selected !== null && selected === question.correctIndex;

  const spokenText = useMemo(() => {
    const choices = question.options
      .map((option, i) => `Option ${i + 1}. ${option}.`)
      .join(' ');
    return `Question ${index + 1} of ${questions.length}. ${question.prompt}. ${choices}`;
  }, [index, question, questions.length]);

  useEffect(() => {
    void stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  const finishWith = (nextCorrect: number, nextHit: string[], nextMissed: string[]) => {
    const scorePct = Math.round((nextCorrect / questions.length) * 100);
    const strengths = nextHit.length ? [...new Set(nextHit)].slice(0, 2) : [lesson?.topic ?? 'Climate Basics'];
    const weaknesses = nextMissed.length
      ? [...new Set(nextMissed)].slice(0, 2)
      : ['Keep practicing for mastery'];
    const recommendation = lesson
      ? nextMissed.length
        ? `Review "${lesson.title}" and try the interactive lesson again.`
        : `Great work on ${lesson.title}. Try a related mission next.`
      : nextMissed.length
        ? `We recommend reviewing ${weaknesses[0]} before taking another quiz.`
        : 'Excellent work. Try a climate mission to turn knowledge into action.';
    void stop();
    onFinish({ scorePct, strengths, weaknesses, recommendation });
  };

  const check = () => {
    if (selected === null) return;
    setPhase('feedback');
  };

  const goNext = () => {
    if (selected === null) return;
    const ok = selected === question.correctIndex;
    const nextCorrect = correctCount + (ok ? 1 : 0);
    const nextHit = ok ? [...hit, question.topicTag] : hit;
    const nextMissed = !ok ? [...missed, question.topicTag] : missed;

    if (index >= questions.length - 1) {
      finishWith(nextCorrect, nextHit, nextMissed);
      return;
    }

    setCorrectCount(nextCorrect);
    setHit(nextHit);
    setMissed(nextMissed);
    setIndex((i) => i + 1);
    setSelected(null);
    setPhase('pick');
  };

  if (!questions.length) {
    return (
      <Screen bottomPadding={28}>
        <Body>No quiz questions for this lesson yet.</Body>
      </Screen>
    );
  }

  return (
    <Screen bottomPadding={28}>
      <View className="flex-row items-center justify-between gap-3">
        <Caption>
          Question {index + 1}/{questions.length}
          {lesson ? ` · ${lesson.title}` : ''}
        </Caption>
        <View className="rounded-full bg-primary-50 px-3 py-1">
          <Label className="font-sans-semibold text-primary">
            {lesson ? 'Lesson quiz' : 'Quick check'}
          </Label>
        </View>
      </View>

      <View className="h-2 overflow-hidden rounded-full bg-canvas-sunken">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.round(Math.min(1, progress) * 100)}%` }}
        />
      </View>

      <Card className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <Label className="min-w-0 flex-1 font-sans-bold text-subheading">{question.prompt}</Label>
          <SpeakButton text={spokenText} label="Play audio" size="sm" force />
        </View>
        <Body>Tap an answer, then Check for instant feedback</Body>
      </Card>

      <View className="gap-3">
        {question.options.map((option, i) => {
          const on = selected === i;
          let border = on ? 'border-primary bg-primary-50' : 'border-line bg-card-raised';
          let text = on ? 'text-primary' : 'text-ink';
          if (phase === 'feedback') {
            if (i === question.correctIndex) {
              border = 'border-success bg-success-soft';
              text = 'text-success';
            } else if (on && i !== question.correctIndex) {
              border = 'border-danger bg-danger-soft';
              text = 'text-danger';
            }
          }
          return (
            <Pressable
              key={`${question.id}-${i}`}
              onPress={() => phase === 'pick' && setSelected(i)}
              disabled={phase === 'feedback'}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Option ${i + 1}. ${option}`}
              className={`min-h-14 justify-center rounded-xl border-2 px-4 py-3 ${border}`}>
              <Text className={`font-sans-medium text-body ${text}`}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

      {phase === 'feedback' ? (
        <View
          className={`gap-1 rounded-2xl px-4 py-3 ${
            isCorrect ? 'bg-success-soft' : 'bg-danger-soft'
          }`}>
          <Text
            className={`font-sans-extrabold text-subheading ${
              isCorrect ? 'text-success' : 'text-danger'
            }`}>
            {isCorrect ? 'Correct!' : 'Not quite'}
          </Text>
          <Body className="text-ink">
            {isCorrect
              ? question.explain || 'Knowledge boost — keep going.'
              : question.explain ||
                `Right answer: ${question.options[question.correctIndex]}`}
          </Body>
        </View>
      ) : null}

      <Button
        label={
          phase === 'pick'
            ? 'Check'
            : index === questions.length - 1
              ? 'See Results'
              : 'Continue'
        }
        size="lg"
        disabled={phase === 'pick' && selected === null}
        trailingGlyph="→"
        onPress={phase === 'pick' ? check : goNext}
      />
    </Screen>
  );
}
