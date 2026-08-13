import type { ImageSourcePropType } from 'react-native';

import type { MissionDto } from '@/shared/api';
import type { IllustrationKind } from '@/shared/components/Illustration';
import type { Mission } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';
import { lessonCover } from '@/features/lessons/lessonModel';

const ILLUSTRATIONS: IllustrationKind[] = [
  'climate',
  'recycle',
  'solar',
  'plastic',
  'water',
  'agriculture',
  'tree',
  'wildlife',
  'energy',
  'learn',
  'community',
];

const COVER_BY_KEY: Record<string, ImageSourcePropType> = {
  community: images.eventUgLegon,
  ...Object.fromEntries(
    ['climate', 'waste', 'solar', 'plastic', 'water', 'agri', 'trees', 'floods', 'cooking'].map(
      (k) => [k, lessonCover(k)],
    ),
  ),
};

const EVIDENCE_BY_KEY: Record<string, ImageSourcePropType> = {
  action: images.onboardingAction,
  learn: images.onboardingLearn,
  splash: images.onboardingSplash,
  ai: images.onboardingAi,
  hero: images.landingHero,
};

export function missionCover(coverKey: string): ImageSourcePropType {
  return COVER_BY_KEY[coverKey] ?? images.eventUgLegon;
}

export function missionEvidence(evidenceKey: string): ImageSourcePropType {
  return EVIDENCE_BY_KEY[evidenceKey] ?? images.onboardingAction;
}

function toIllustration(kind: string): IllustrationKind {
  return (ILLUSTRATIONS.includes(kind as IllustrationKind) ? kind : 'community') as IllustrationKind;
}

export function missionFromDto(dto: MissionDto): Mission {
  const difficulty =
    dto.difficulty === 'Easy' || dto.difficulty === 'Medium' || dto.difficulty === 'Hard'
      ? dto.difficulty
      : 'Easy';

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    xp: dto.xp,
    difficulty,
    minutes: dto.minutes,
    impact: dto.impact,
    illustration: toIllustration(dto.illustration),
    cover: missionCover(dto.coverKey),
    evidenceImage: missionEvidence(dto.evidenceKey),
    checklist: dto.checklist ?? [],
    completed: dto.completed,
  };
}
