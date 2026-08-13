import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  CommunityEventDto,
  CommunityReportDto,
  CourseDto,
  MissionDto,
  WeeklyProgress,
} from '@/shared/api';

const CATALOG_KEY = 'greenpath.catalog.v3';
const SESSION_KEY = 'greenpath.session.v1';
/** Bump when course catalog shape/size changes (GreenReS 120-topic curriculum). */
export const MIN_EXPECTED_COURSES = 100;

export type CachedCatalog = {
  courses: CourseDto[];
  missions: MissionDto[];
  reports: CommunityReportDto[];
  events: CommunityEventDto[];
};

export type CachedSessionStats = {
  xp: number;
  totalXp: number;
  level: number;
  xpToNext: number;
  streak: number;
  carbonSavedKg: number;
  lessonsCompleted: number;
  missionsCompleted: number;
  badgesUnlocked: number;
  /** Accra YYYY-MM-DD of last streak-qualifying action */
  lastStreakDay?: string | null;
};

export type CachedSession = {
  interests: string[];
  /** ISO timestamp — once set, interests picker is signup-only and must not reappear on sign-in. */
  onboardingCompletedAt?: string | null;
  completedMissionIds?: string[];
  completedLessonIds?: string[];
  stats?: CachedSessionStats;
  weeklyProgress?: WeeklyProgress;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isCourseDto(value: unknown): value is CourseDto {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.topic === 'string' &&
    isRecord(value.instructor) &&
    typeof value.instructor.name === 'string'
  );
}

function isMissionDto(value: unknown): value is MissionDto {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.title === 'string';
}

function isReportDto(value: unknown): value is CommunityReportDto {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.kind === 'string' &&
    typeof value.caption === 'string'
  );
}

function isEventDto(value: unknown): value is CommunityEventDto {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.location === 'string' &&
    typeof value.date === 'string' &&
    typeof value.time === 'string'
  );
}

function stripCourse(course: CourseDto): CourseDto {
  return { ...course, completed: false, progress: 0 };
}

function stripMission(mission: MissionDto): MissionDto {
  return { ...mission, completed: false };
}

function stripReport(report: CommunityReportDto): CommunityReportDto {
  return { ...report, myVote: null, you: false };
}

function stripEvent(event: CommunityEventDto): CommunityEventDto {
  return { ...event, joined: false };
}

export async function readCatalogCache(): Promise<CachedCatalog> {
  try {
    const raw = await AsyncStorage.getItem(CATALOG_KEY);
    if (!raw) return { courses: [], missions: [], reports: [], events: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return { courses: [], missions: [], reports: [], events: [] };
    const courses = Array.isArray(parsed.courses) ? parsed.courses.filter(isCourseDto).map(stripCourse) : [];
    const missions = Array.isArray(parsed.missions)
      ? parsed.missions.filter(isMissionDto).map(stripMission)
      : [];
    const reports = Array.isArray(parsed.reports) ? parsed.reports.filter(isReportDto).map(stripReport) : [];
    const events = Array.isArray(parsed.events) ? parsed.events.filter(isEventDto).map(stripEvent) : [];
    return { courses, missions, reports, events };
  } catch {
    return { courses: [], missions: [], reports: [], events: [] };
  }
}

export async function writeCatalogCache(catalog: CachedCatalog): Promise<void> {
  try {
    const payload: CachedCatalog = {
      courses: catalog.courses.filter(isCourseDto).map(stripCourse),
      missions: catalog.missions.filter(isMissionDto).map(stripMission),
      reports: catalog.reports.filter(isReportDto).map(stripReport),
      events: catalog.events.filter(isEventDto).map(stripEvent),
    };
    if (
      !payload.courses.length &&
      !payload.missions.length &&
      !payload.reports.length &&
      !payload.events.length
    )
      return;
    await AsyncStorage.setItem(CATALOG_KEY, JSON.stringify(payload));
  } catch {
    // Private mode / storage full — live catalog still works online.
  }
}

function normalizeSessionStats(value: unknown): CachedSessionStats | undefined {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.xp !== 'number' ||
    typeof value.level !== 'number' ||
    typeof value.xpToNext !== 'number'
  ) {
    return undefined;
  }
  return {
    xp: value.xp,
    totalXp: typeof value.totalXp === 'number' ? value.totalXp : value.xp,
    level: value.level,
    xpToNext: value.xpToNext,
    streak: typeof value.streak === 'number' ? value.streak : 0,
    carbonSavedKg: typeof value.carbonSavedKg === 'number' ? value.carbonSavedKg : 0,
    lessonsCompleted: typeof value.lessonsCompleted === 'number' ? value.lessonsCompleted : 0,
    missionsCompleted: typeof value.missionsCompleted === 'number' ? value.missionsCompleted : 0,
    badgesUnlocked: typeof value.badgesUnlocked === 'number' ? value.badgesUnlocked : 0,
    lastStreakDay:
      typeof value.lastStreakDay === 'string' ? value.lastStreakDay : null,
  };
}

function isWeeklyProgress(value: unknown): value is WeeklyProgress {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.days)) return false;
  return value.days.every(
    (day) =>
      isRecord(day) &&
      typeof day.day === 'string' &&
      typeof day.date === 'string' &&
      typeof day.xp === 'number' &&
      typeof day.actions === 'number' &&
      typeof day.isToday === 'boolean',
  );
}

export async function readSessionCache(): Promise<CachedSession> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return { interests: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return { interests: [] };
    const interests = Array.isArray(parsed.interests)
      ? parsed.interests.filter((id): id is string => typeof id === 'string')
      : [];
    const completedMissionIds = Array.isArray(parsed.completedMissionIds)
      ? parsed.completedMissionIds.filter((id): id is string => typeof id === 'string')
      : undefined;
    const completedLessonIds = Array.isArray(parsed.completedLessonIds)
      ? parsed.completedLessonIds.filter((id): id is string => typeof id === 'string')
      : undefined;
    const onboardingCompletedAt =
      typeof parsed.onboardingCompletedAt === 'string'
        ? parsed.onboardingCompletedAt
        : parsed.onboardingCompletedAt === null
          ? null
          : undefined;
    return {
      interests,
      onboardingCompletedAt,
      completedMissionIds,
      completedLessonIds,
      stats: normalizeSessionStats(parsed.stats),
      weeklyProgress: isWeeklyProgress(parsed.weeklyProgress)
        ? parsed.weeklyProgress
        : undefined,
    };
  } catch {
    return { interests: [] };
  }
}

export async function writeSessionCache(patch: Partial<CachedSession>): Promise<void> {
  try {
    const prev = await readSessionCache();
    const next: CachedSession = {
      interests: patch.interests ?? prev.interests,
      onboardingCompletedAt:
        patch.onboardingCompletedAt !== undefined
          ? patch.onboardingCompletedAt
          : prev.onboardingCompletedAt,
      completedMissionIds: patch.completedMissionIds ?? prev.completedMissionIds,
      completedLessonIds: patch.completedLessonIds ?? prev.completedLessonIds,
      stats: patch.stats ?? prev.stats,
      weeklyProgress: patch.weeklyProgress ?? prev.weeklyProgress,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export async function clearCatalogCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CATALOG_KEY);
  } catch {
    // ignore
  }
}

export async function clearSessionCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
