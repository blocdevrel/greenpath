import type { ImageSourcePropType } from 'react-native';

import type { CourseDto } from '@/shared/api';
import type { IllustrationKind } from '@/shared/components/Illustration';
import type { Lesson } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';

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
];

const COVER_BY_KEY: Record<string, ImageSourcePropType> = {
  climate: images.lessonClimate,
  waste: images.lessonWaste,
  solar: images.lessonSolar,
  plastic: images.lessonPlastic,
  water: images.lessonWater,
  agri: images.lessonAgri,
  trees: images.eventUgBotanical,
  air: images.lessonClimate,
  ocean: images.lessonPlastic,
  wildlife: images.eventUgBotanical,
  floods: images.lessonWaste,
  cooking: images.lessonSolar,
};

const INSTRUCTOR_AVATAR: Record<string, ImageSourcePropType> = {
  yaw: images.instructorYaw,
  kwame: images.instructorKwame,
  ama: images.instructorAma,
  abena: images.instructorAbena,
  efua: images.instructorEfua,
  kofi: images.instructorKofi,
};

export function lessonCover(coverKey: string): ImageSourcePropType {
  return COVER_BY_KEY[coverKey] ?? images.lessonClimate;
}

export function instructorAvatar(key: string): ImageSourcePropType {
  return INSTRUCTOR_AVATAR[key] ?? images.instructorYaw;
}

export function toLessonIllustration(kind: string): IllustrationKind {
  return (ILLUSTRATIONS.includes(kind as IllustrationKind) ? kind : 'learn') as IllustrationKind;
}

export function lessonFromDto(dto: CourseDto): Lesson {
  const difficulty =
    dto.difficulty === 'Intermediate' || dto.difficulty === 'Advanced'
      ? dto.difficulty
      : 'Beginner';

  return {
    id: dto.id,
    title: dto.title,
    topic: dto.topic,
    minutes: dto.minutes,
    difficulty,
    progress: dto.completed ? 1 : dto.progress ?? 0,
    xp: dto.xp,
    learners: dto.learners,
    instructor: {
      name: dto.instructor.name,
      role: dto.instructor.role,
      avatar: instructorAvatar(dto.instructor.key),
    },
    illustration: toLessonIllustration(dto.illustration),
    cover: lessonCover(dto.coverKey),
    facts: dto.facts ?? [],
    summary: dto.summary,
    applyInDailyLife: dto.video?.applyInDailyLife ?? undefined,
    glossaryTermIds: dto.glossaryTermIds,
    unitId: dto.unitId,
    lessonOrder: dto.lessonOrder,
    curriculumNo: dto.curriculumNo,
    interestTags: dto.interestTags,
    sortOrder: dto.sortOrder,
    video: dto.video
      ? {
          title: dto.video.title,
          youtubeId: dto.video.youtubeId,
          durationMin: dto.video.durationMin,
          applyInDailyLife: dto.video.applyInDailyLife,
        }
      : undefined,
  };
}
