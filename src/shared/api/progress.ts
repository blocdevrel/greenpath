import { apiFetch } from './client';
import type { MeResponse } from './types';

export type ActivityItem = {
  id: string;
  title: string;
  xp: number;
  reason: string;
  refId: string | null;
  createdAt: string;
};

export type BadgeVisual = {
  icon: string;
  tint: string;
  soft: string;
  ring: string;
};

export type BadgeItem = {
  key: string;
  name: string;
  description: string;
  hint: string;
  visual: BadgeVisual;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type AwardProgressBody = {
  kind: 'lesson' | 'mission' | 'quiz' | 'report';
  refId: string;
  title: string;
  xp?: number;
  badgeHint?: string;
};

export type WeeklyDay = {
  day: string;
  date: string;
  xp: number;
  actions: number;
  isToday: boolean;
};

export type WeeklyProgress = {
  weekStart: string;
  totalXp: number;
  activeDays: number;
  days: WeeklyDay[];
};

export type Completions = {
  lessons: string[];
  missions: string[];
  quizzes: string[];
  reports: string[];
};

export type AwardProgressResponse = {
  alreadyAwarded: boolean;
  xpAwarded: number;
  me: MeResponse;
  newBadges: string[];
  activity: ActivityItem[];
  badges: BadgeItem[];
  weekly?: WeeklyProgress;
  completions?: Completions;
};

export function fetchActivity() {
  return apiFetch<ActivityItem[]>('/me/activity');
}

export function fetchWeeklyProgress() {
  return apiFetch<WeeklyProgress>('/me/weekly-progress');
}

export function fetchCompletions() {
  return apiFetch<Completions>('/me/completions');
}

export function fetchBadges() {
  return apiFetch<BadgeItem[]>('/me/badges');
}

export function awardProgress(body: AwardProgressBody) {
  return apiFetch<AwardProgressResponse>('/me/progress', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
