/** Shapes returned by greenserver `/api/v1/me*`. */

export type MePreferences = {
  largeFonts: boolean;
  highContrast: boolean;
  darkMode: boolean;
  tts: boolean;
  stt: boolean;
  voiceNav: boolean;
  notificationsEnabled: boolean;
  emailDigest: boolean;
  language: string;
  updatedAt: string;
};

export type MeResponse = {
  id: string;
  clerkId: string;
  email: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
  xp: number;
  /** Lifetime XP earned. `xp` is only the amount toward the next level. */
  totalXp?: number;
  level: number;
  xpToNext: number;
  streak: number;
  /** ISO timestamp of last streak-qualifying action (lesson / mission / report). */
  lastStreakAt?: string | null;
  carbonSavedKg: number;
  city: string | null;
  showOnLeaderboard: boolean;
  onboardingCompletedAt: string | null;
  interests: string[];
  preferences: MePreferences | null;
  lessonsCompleted?: number;
  missionsCompleted?: number;
  badgesUnlocked?: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateMeBody = {
  displayName?: string;
  bio?: string;
  city?: string;
  avatarUrl?: string;
  showOnLeaderboard?: boolean;
  onboardingCompleted?: boolean;
};

export type UpdatePreferencesBody = {
  largeFonts?: boolean;
  highContrast?: boolean;
  darkMode?: boolean;
  tts?: boolean;
  stt?: boolean;
  voiceNav?: boolean;
  notificationsEnabled?: boolean;
  emailDigest?: boolean;
  language?: string;
};
