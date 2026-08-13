import type { Lesson } from '@/shared/data/greenpathData';

export type SessionStep =
  | {
      type: 'teach';
      id: string;
      headline: string;
      text: string;
      tip?: string;
    }
  | {
      type: 'trueFalse';
      id: string;
      prompt: string;
      statement: string;
      correct: boolean;
      explain: string;
    }
  | {
      type: 'mcq';
      id: string;
      prompt: string;
      options: string[];
      correctIndex: number;
      explain: string;
    };

function truncate(text: string, max = 110) {
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

/** Flip numbers / verbs so the false option still feels about THIS lesson. */
function twistClaim(fact: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/about 1°C/gi, 'about 5°C'],
    [/0\.21°C/gi, '2°C'],
    [/3,000\+/g, '30'],
    [/one million/gi, 'one thousand'],
    [/2–9%/g, '90%'],
    [/about 86%/gi, 'about 5%'],
    [/8%/g, '80%'],
    [/8 billion/gi, '8 thousand'],
    [/250,000/g, '250'],
    [/\bhave risen\b/gi, 'have fallen'],
    [/\bhas risen\b/gi, 'has fallen'],
    [/\brisen\b/gi, 'fallen'],
    [/\bthreaten\b/gi, 'do not affect'],
    [/\bworsens\b/gi, 'prevents'],
    [/\bclogging\b/gi, 'clearing'],
    [/\bunreliable\b/gi, 'perfectly reliable'],
    [/\bmajor\b/gi, 'tiny'],
    [/\blarge share\b/gi, 'tiny share'],
    [/\bmatters\b/gi, 'does not matter'],
    [/\bhelp\b/gi, 'harm'],
    [/\bprotecting\b/gi, 'cutting down'],
    [/\bcutting waste\b/gi, 'creating more waste'],
  ];

  let twisted = fact;
  for (const [pattern, value] of replacements) {
    if (pattern.test(twisted)) {
      twisted = twisted.replace(pattern, value);
      break;
    }
  }

  if (twisted === fact) {
    twisted = `It is NOT true that ${fact.charAt(0).toLowerCase()}${fact.slice(1)}`;
  }
  return truncate(twisted, 130);
}

function shortTakeaway(fact: string) {
  const first = fact.split(/[.;]/)[0]?.trim() || fact;
  return truncate(first, 96);
}

function falseTakeaways(fact: string, siblingFacts: string[]): string[] {
  const twisted = twistClaim(fact);
  const siblingTwists = siblingFacts
    .filter((f) => f !== fact)
    .slice(0, 2)
    .map((f) => twistClaim(f));
  const extras = [
    'Climate change only affects Europe, not Ghana.',
    'Youth action cannot change anything about climate.',
    'Burning plastic indoors is the safest disposal method.',
  ];
  return shuffle([twisted, ...siblingTwists, ...extras]).slice(0, 2);
}

/**
 * Duolingo-style climate session:
 * intro → (teach fact → check that fact) × N → apply in Ghana life → wrap-up.
 * Every check is built from THIS lesson’s facts only.
 */
export function buildLessonSession(lesson: Lesson): SessionStep[] {
  const steps: SessionStep[] = [];
  const facts = lesson.facts.filter(Boolean);

  steps.push({
    type: 'teach',
    id: `${lesson.id}-intro`,
    headline: lesson.title,
    text: lesson.summary,
    tip: `You will read ${facts.length} key ideas, check your understanding after each one, then apply it in Ghana.`,
  });

  facts.forEach((fact, index) => {
    steps.push({
      type: 'teach',
      id: `${lesson.id}-learn-${index}`,
      headline: `Key idea ${index + 1} of ${facts.length}`,
      text: fact,
    });

    if (index % 2 === 0) {
      const askTrue = index % 4 === 0;
      const statement = askTrue ? truncate(fact, 140) : twistClaim(fact);
      steps.push({
        type: 'trueFalse',
        id: `${lesson.id}-check-tf-${index}`,
        prompt: `From ${lesson.title}: is this true?`,
        statement,
        correct: askTrue,
        explain: askTrue
          ? `That matches what you just learned about ${lesson.topic.toLowerCase()}.`
          : `The lesson said: ${shortTakeaway(fact)}`,
      });
    } else {
      const correct = shortTakeaway(fact);
      const wrongs = falseTakeaways(fact, facts).map((w) => truncate(w, 96));
      const options = shuffle([correct, ...wrongs]);
      steps.push({
        type: 'mcq',
        id: `${lesson.id}-check-mcq-${index}`,
        prompt: `What did you just learn about ${lesson.topic.toLowerCase()}?`,
        options,
        correctIndex: Math.max(0, options.indexOf(correct)),
        explain: `Yes — key takeaway: ${correct}`,
      });
    }
  });

  const applyText =
    lesson.applyInDailyLife ??
    lesson.video?.applyInDailyLife ??
    `Name one climate-friendly action you can take this week related to ${lesson.title.toLowerCase()}.`;

  steps.push({
    type: 'teach',
    id: `${lesson.id}-apply`,
    headline: 'Apply in Ghana',
    text: applyText,
    tip: 'Climate learning sticks when you act — even a small step counts.',
  });

  const applyCorrect = truncate(applyText, 100);
  const applyQuizOptions = shuffle([
    applyCorrect,
    'Do nothing until someone else leads.',
    'Only discuss online — no action needed.',
    twistClaim(facts[0] ?? lesson.summary),
  ]);
  steps.push({
    type: 'mcq',
    id: `${lesson.id}-apply-quiz`,
    prompt: `Checklist: what should you do after "${lesson.title}"?`,
    options: applyQuizOptions,
    correctIndex: Math.max(0, applyQuizOptions.indexOf(applyCorrect)),
    explain: `Yes — try this: ${applyCorrect}`,
  });

  const correctRecap = truncate(lesson.summary, 90);
  const finaleOptions = shuffle([
    correctRecap,
    'Ignoring weather changes because Ghana is not affected',
    'Why youth should avoid climate topics',
    twistClaim(facts[0] ?? lesson.summary),
  ]);

  steps.push({
    type: 'mcq',
    id: `${lesson.id}-finale`,
    prompt: `Quick recap: what is ${lesson.title} mainly about?`,
    options: finaleOptions,
    correctIndex: Math.max(0, finaleOptions.indexOf(correctRecap)),
    explain: `Great work finishing ${lesson.title}.`,
  });

  return steps;
}

export const DAILY_XP_GOAL = 50;
export const SESSION_HEARTS = 5;
