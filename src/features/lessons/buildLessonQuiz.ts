import type { Lesson } from '@/shared/data/greenpathData';

export type LessonQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explain: string;
  topicTag: string;
};

function truncate(text: string, max = 100) {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function twistClaim(fact: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/1\.1°C/gi, '0.1°C'],
    [/about 1°C/gi, 'about 5°C'],
    [/550 km/gi, '55 km'],
    [/3,000\+/g, '30'],
    [/under 4%/gi, 'over 90%'],
    [/\bhave risen\b/gi, 'have fallen'],
    [/\bhas risen\b/gi, 'has fallen'],
    [/\bincrease\b/gi, 'decrease'],
    [/\breduces\b/gi, 'increases'],
    [/\bprotects\b/gi, 'harms'],
    [/\bhelps\b/gi, 'blocks'],
  ];
  let twisted = fact;
  for (const [pattern, value] of replacements) {
    if (pattern.test(twisted)) {
      twisted = twisted.replace(pattern, value);
      break;
    }
  }
  if (twisted === fact) {
    twisted = `It is false that ${fact.charAt(0).toLowerCase()}${fact.slice(1)}`;
  }
  return truncate(twisted, 110);
}

function takeaway(fact: string) {
  return truncate(fact.split(/[.;]/)[0]?.trim() || fact, 96);
}

/** 5–6 lesson-specific quiz questions built from seeded facts + summary. */
export function buildLessonQuiz(lesson: Lesson): LessonQuizQuestion[] {
  const facts = lesson.facts.filter(Boolean);
  const questions: LessonQuizQuestion[] = [];
  const tag = lesson.topic;

  facts.slice(0, 4).forEach((fact, index) => {
    const correct = takeaway(fact);
    const wrongs = shuffle(
      facts
        .filter((f) => f !== fact)
        .slice(0, 2)
        .map(twistClaim),
    );
    while (wrongs.length < 2) {
      wrongs.push(
        index % 2 === 0
          ? 'Climate change does not affect Ghana.'
          : 'This topic is not relevant to daily life in Ghana.',
      );
    }
    const options = shuffle([correct, ...wrongs.slice(0, 3)]);
    questions.push({
      id: `${lesson.id}-q${index + 1}`,
      prompt: `About ${lesson.title}: which statement is correct?`,
      options,
      correctIndex: Math.max(0, options.indexOf(correct)),
      explain: `Correct: ${correct}`,
      topicTag: tag,
    });
  });

  if (facts[0]) {
    const trueStatement = truncate(facts[0], 120);
    const falseStatement = twistClaim(facts[0]);
    const tfCorrect = trueStatement;
    const tfOptions = shuffle([trueStatement, falseStatement]);
    questions.push({
      id: `${lesson.id}-tf`,
      prompt: `True or false?`,
      options: tfOptions,
      correctIndex: Math.max(0, tfOptions.indexOf(tfCorrect)),
      explain: `The lesson taught: ${takeaway(facts[0])}`,
      topicTag: tag,
    });
  }

  const apply =
    lesson.applyInDailyLife ?? lesson.video?.applyInDailyLife ?? '';
  if (apply) {
    const applyCorrect = truncate(apply, 100);
    const applyOptions = shuffle([
      applyCorrect,
      'Ignore the topic until next year.',
      'Wait for the government to act before you do anything.',
      twistClaim(facts[0] ?? lesson.summary),
    ]);
    questions.push({
      id: `${lesson.id}-apply`,
      prompt: `What is a good way to apply "${lesson.title}" this week?`,
      options: applyOptions,
      correctIndex: Math.max(0, applyOptions.indexOf(applyCorrect)),
      explain: applyCorrect,
      topicTag: tag,
    });
  }

  const recapCorrect = truncate(lesson.summary, 100);
  const recapOptions = shuffle([
    recapCorrect,
    'This lesson is only about other countries, not Ghana.',
    'There is nothing useful to learn from this topic.',
    twistClaim(facts[1] ?? facts[0] ?? lesson.summary),
  ]);
  questions.push({
    id: `${lesson.id}-recap`,
    prompt: `What is "${lesson.title}" mainly about?`,
    options: recapOptions,
    correctIndex: Math.max(0, recapOptions.indexOf(recapCorrect)),
    explain: recapCorrect,
    topicTag: tag,
  });

  return questions.slice(0, 6);
}
