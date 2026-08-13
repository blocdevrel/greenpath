import { apiFetch } from './client';

export type CourseInstructorDto = {
  name: string;
  role: string;
  key: string;
};

export type CourseVideoDto = {
  title: string;
  youtubeId: string;
  durationMin: number;
  applyInDailyLife: string;
};

export type CourseDto = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  summary: string;
  minutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  xp: number;
  learners: number;
  illustration: string;
  coverKey: string;
  instructor: CourseInstructorDto;
  video: CourseVideoDto | null;
  facts: string[];
  glossaryTermIds: string[];
  completed: boolean;
  progress: number;
  sortOrder?: number;
  unitId?: string | null;
  lessonOrder?: number;
  curriculumNo?: number | null;
  interestTags?: string[];
  targetGroups?: string[];
  contentFormat?: string;
  assessmentType?: string;
};

export type LearningPathUnitDto = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  sortOrder: number;
  doneCount: number;
  totalCount: number;
  lessonIds: string[];
};

export type LearningPathDto = {
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  units: LearningPathUnitDto[];
  recommendedLessonIds: string[];
  interestTags: string[];
};

export function fetchCourses() {
  return apiFetch<CourseDto[]>('/courses');
}

export function fetchLearningPath() {
  return apiFetch<LearningPathDto>('/courses/learning-path');
}

export function fetchCourse(id: string) {
  return apiFetch<CourseDto>(`/courses/${id}`);
}
