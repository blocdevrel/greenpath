import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ImageSourcePropType } from 'react-native';

import {
  prefsFromServer,
  prefsToServerPatch,
  profileFromMe,
  profileAvatarSource,
  mergeClerkIdentity,
  patchInterests,
  patchMe,
  patchPreferences,
  fetchMe,
  fetchActivity,
  fetchBadges,
  fetchCompletions,
  fetchCourses,
  fetchMissions,
  fetchReports,
  fetchWeeklyProgress,
  awardProgress,
  completeMissionApi,
  createReport,
  voteOnReportApi,
  fetchEvents,
  joinEvent as joinEventApi,
  leaveEvent as leaveEventApi,
  type ActivityItem,
  type BadgeItem,
  type CommunityEventDto,
  type CommunityReportDto,
  type Completions,
  type CourseDto,
  type MeResponse,
  type MissionDto,
  type UpdateMeBody,
  type WeeklyProgress,
} from '@/shared/api';
import { lessonFromDto } from '@/features/lessons/lessonModel';
import {
  eventFromDto,
  eventsFromDtos,
  type CommunityEventView,
} from '@/features/community/eventModel';
import { missionFromDto } from '@/features/missions/missionModel';
import { reportFromDto, reportsFromDtos } from '@/features/missions/reportModel';
import {
  clearSessionCache,
  MIN_EXPECTED_COURSES,
  readCatalogCache,
  readSessionCache,
  writeCatalogCache,
  writeSessionCache,
  type CachedCatalog,
  type CachedSessionStats,
} from '@/shared/storage/offlineCache';
import {
  clearPendingSignupInterests,
  readPendingSignupInterests,
  readPendingSignupInterestsSync,
} from '@/shared/storage/authOnboarding';
import {
  bumpStreakForActivity,
  dayKeyFromIso,
} from '@/shared/gamification/streak';
import {
  userProfile as seedProfile,
  type CommunityReport,
  type CommunityReportKind,
  type Lesson,
  type Mission,
  type UserProfile,
} from '@/shared/data/greenpathData';

export type QuizInsight = {
  scorePct: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
};

export type AccessibilityPrefs = {
  largeFonts: boolean;
  highContrast: boolean;
  darkMode: boolean;
  tts: boolean;
  stt: boolean;
  voiceNav: boolean;
  notifications: boolean;
  /** Push / in-app daily mission reminders */
  dailyReminders: boolean;
  /** Maps to server `emailDigest` */
  emailNotifications: boolean;
  /** Local until Nest column */
  emailLeaderboard: boolean;
};

export type ReportVote = 'up' | 'down';

export type NewCommunityReportInput = {
  kind: CommunityReportKind;
  title: string;
  caption: string;
  location: string;
  latitude: number;
  longitude: number;
  photo?: ImageSourcePropType;
  photoBase64?: string;
};

export type SessionStatus = 'idle' | 'loading' | 'ready' | 'error';

type GreenPathState = {
  profile: typeof seedProfile;
  interests: string[];
  /** True only for brand-new signups that still need the interests picker. */
  needsInterestOnboarding: boolean;
  lessons: Lesson[];
  missions: Mission[];
  completedMissionIds: string[];
  completedLessonIds: string[];
  unlockedBadgeIds: string[];
  activity: ActivityItem[];
  weeklyProgress: WeeklyProgress;
  badges: BadgeItem[];
  evidenceUri: ImageSourcePropType | null;
  reports: CommunityReport[];
  reportVotes: Record<string, ReportVote>;
  events: CommunityEventView[];
  lastQuiz: QuizInsight | null;
  celebration: { title: string; subtitle: string; xp: number } | null;
  prefs: AccessibilityPrefs;
  sessionStatus: SessionStatus;
  sessionError: string | null;
  /** Load /me after Clerk sign-in */
  hydrateFromServer: () => Promise<void>;
  /** Merge Clerk name / email / photo into local profile */
  syncClerkIdentity: (identity: {
    fullName?: string | null;
    email?: string | null;
    imageUrl?: string | null;
    hasImage?: boolean | null;
  }) => void;
  /** Clear local session state on sign-out */
  resetSession: () => void;
  setInterests: (ids: string[]) => Promise<void>;
  updateProfile: (patch: UpdateMeBody) => Promise<void>;
  completeLesson: (lessonId: string) => number;
  advanceLessonFact: (lessonId: string, factIndex: number) => void;
  submitQuiz: (insight: QuizInsight, xpReward?: number) => void;
  setEvidence: (source: ImageSourcePropType | null, base64?: string | null) => void;
  getEvidenceBase64: () => string | null;
  completeMission: (mission: Mission, badgeName?: string) => void;
  submitCommunityReport: (input: NewCommunityReportInput) => Promise<void>;
  voteOnReport: (reportId: string, vote: ReportVote) => void;
  toggleEventRsvp: (eventId: string) => CommunityEventView | null;
  clearCelebration: () => void;
  updatePrefs: (patch: Partial<AccessibilityPrefs>) => Promise<void>;
  filteredLessons: Lesson[];
  filteredMissions: Mission[];
};

const GreenPathContext = createContext<GreenPathState | null>(null);

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function emptyCompletions(): Completions {
  return { lessons: [], missions: [], quizzes: [], reports: [] };
}

export function emptyWeeklyProgress(now = new Date()): WeeklyProgress {
  const accra = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Accra',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Accra',
    weekday: 'short',
  }).format(now);
  const idx = WEEKDAYS.indexOf(wd as (typeof WEEKDAYS)[number]);
  const offset = idx >= 0 ? idx : 0;
  const [y, m, d] = accra.split('-').map(Number);
  const monday = new Date(Date.UTC(y!, m! - 1, d! - offset));
  const days = WEEKDAYS.map((day, i) => {
    const date = new Date(monday.getTime() + i * 86400000).toISOString().slice(0, 10);
    return { day, date, xp: 0, actions: 0, isToday: date === accra };
  });
  return { weekStart: days[0]!.date, totalXp: 0, activeDays: 0, days };
}

const defaultPrefs: AccessibilityPrefs = {
  largeFonts: false,
  highContrast: false,
  darkMode: false,
  tts: true,
  stt: true,
  voiceNav: true,
  notifications: true,
  dailyReminders: true,
  emailNotifications: true,
  emailLeaderboard: false,
};

const interestToTopics: Record<string, string[]> = {
  recycling: ['Waste Management', 'Plastic Pollution'],
  trees: ['Trees & Forests', 'Climate Change', 'Sustainable Agriculture'],
  water: ['Water Conservation', 'Flooding & Drains'],
  energy: ['Solar Energy', 'Clean Cooking'],
  agriculture: ['Sustainable Agriculture', 'Trees & Forests'],
  climate: ['Climate Change', 'Air Pollution'],
  wildlife: ['Wildlife', 'Climate Change', 'Ocean Health'],
  air: ['Air Pollution', 'Clean Cooking', 'Climate Change'],
  ocean: ['Ocean Health', 'Plastic Pollution', 'Water Conservation'],
  waste: ['Waste Management', 'Plastic Pollution', 'Flooding & Drains'],
};

export function GreenPathProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(seedProfile);
  const [interests, setInterestsState] = useState<string[]>([]);
  const [onboardingCompletedAt, setOnboardingCompletedAt] = useState<string | null>(null);
  /** Signup-only gate for InterestsScreen — false after any Sign in. */
  const [pendingSignupInterests, setPendingSignupInterests] = useState(
    () => readPendingSignupInterestsSync(),
  );
  const pendingSignupInterestsRef = useRef(pendingSignupInterests);
  pendingSignupInterestsRef.current = pendingSignupInterests;

  useEffect(() => {
    void readPendingSignupInterests().then((pending) => {
      setPendingSignupInterests(pending);
      pendingSignupInterestsRef.current = pending;
    });
  }, []);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>(emptyWeeklyProgress);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [evidenceUri, setEvidenceUri] = useState<ImageSourcePropType | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [reportVotes, setReportVotes] = useState<Record<string, ReportVote>>({});
  const [events, setEvents] = useState<CommunityEventView[]>([]);
  const [lastQuiz, setLastQuiz] = useState<QuizInsight | null>(null);
  const [celebration, setCelebration] = useState<GreenPathState['celebration']>(null);
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(defaultPrefs);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [sessionError, setSessionError] = useState<string | null>(null);
  const hydrating = useRef(false);
  /** True after a live GET /courses or /missions — don't let a stale cache overwrite it. */
  const catalogLive = useRef(false);
  const evidenceBase64Ref = useRef<string | null>(null);
  const cachedReportsRef = useRef<CommunityReportDto[]>([]);
  const cachedEventsRef = useRef<CommunityEventDto[]>([]);
  const lastStreakDayRef = useRef<string | null>(null);

  const statsFromProfile = useCallback(
    (p: UserProfile): CachedSessionStats => ({
      xp: p.xp,
      totalXp: p.totalXp,
      level: p.level,
      xpToNext: p.xpToNext,
      streak: p.streak,
      carbonSavedKg: p.carbonSavedKg,
      lessonsCompleted: p.lessonsCompleted,
      missionsCompleted: p.missionsCompleted,
      badgesUnlocked: p.badgesUnlocked,
      lastStreakDay: lastStreakDayRef.current,
    }),
    [],
  );

  const persistProfileStats = useCallback(
    (p: UserProfile) => {
      void writeSessionCache({ stats: statsFromProfile(p) });
    },
    [statsFromProfile],
  );

  const applySessionStats = useCallback((stats: CachedSessionStats) => {
    if (typeof stats.lastStreakDay === 'string') {
      lastStreakDayRef.current = stats.lastStreakDay;
    }
    setProfile((prev) => ({
      ...prev,
      xp: stats.xp,
      totalXp: stats.totalXp,
      level: stats.level,
      xpToNext: stats.xpToNext,
      streak: stats.streak,
      carbonSavedKg: stats.carbonSavedKg,
      lessonsCompleted: stats.lessonsCompleted,
      missionsCompleted: stats.missionsCompleted,
      badgesUnlocked: stats.badgesUnlocked,
    }));
  }, []);

  const persistCatalogCache = useCallback(() => {
    void readCatalogCache().then((cached) =>
      writeCatalogCache({
        courses: cached.courses,
        missions: cached.missions,
        reports: cachedReportsRef.current,
        events: cachedEventsRef.current,
      }),
    );
  }, []);

  const applyCachedCatalog = useCallback((cached: CachedCatalog) => {
    if (catalogLive.current) return;
    if (cached.courses.length) setLessons(cached.courses.map(lessonFromDto));
    if (cached.missions.length) setMissions(cached.missions.map(missionFromDto));
    if (cached.reports.length) {
      cachedReportsRef.current = cached.reports;
      setReports(reportsFromDtos(cached.reports));
    }
    if (cached.events.length) {
      cachedEventsRef.current = cached.events;
      setEvents(eventsFromDtos(cached.events));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [cached, session, liveCourses] = await Promise.all([
        readCatalogCache(),
        readSessionCache(),
        fetchCourses().catch(() => null as CourseDto[] | null),
      ]);
      if (cancelled) return;

      const cacheStale =
        cached.courses.length > 0 && cached.courses.length < MIN_EXPECTED_COURSES;
      const liveCatalog =
        liveCourses && liveCourses.length >= MIN_EXPECTED_COURSES
          ? liveCourses
          : liveCourses && liveCourses.length > cached.courses.length
            ? liveCourses
            : null;

      if (liveCatalog?.length) {
        catalogLive.current = true;
        setLessons(liveCatalog.map(lessonFromDto));
        void writeCatalogCache({
          courses: liveCatalog,
          missions: cached.missions,
          reports: cached.reports,
          events: cached.events,
        });
      } else if (!cacheStale) {
        applyCachedCatalog(cached);
      }

      if (session.interests.length) setInterestsState(session.interests);
      if (session.onboardingCompletedAt) {
        setOnboardingCompletedAt(session.onboardingCompletedAt);
      }
      if (session.completedMissionIds?.length) {
        setCompletedMissionIds(session.completedMissionIds);
        setMissions((list) =>
          list.map((m) =>
            session.completedMissionIds!.includes(m.id) ? { ...m, completed: true } : m,
          ),
        );
      }
      if (session.completedLessonIds?.length) {
        setCompletedLessonIds(session.completedLessonIds);
      }
      if (session.stats) {
        applySessionStats(session.stats);
      }
      if (session.weeklyProgress) setWeeklyProgress(session.weeklyProgress);
      if (
        liveCatalog?.length ||
        cached.courses.length ||
        cached.missions.length ||
        cached.reports.length ||
        cached.events.length ||
        session.interests.length ||
        session.onboardingCompletedAt ||
        session.completedMissionIds?.length ||
        session.stats ||
        session.weeklyProgress
      ) {
        setSessionStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyCachedCatalog, applySessionStats]);

  const applyMeResponse = useCallback((me: MeResponse) => {
    const day = dayKeyFromIso(me.lastStreakAt);
    if (day) lastStreakDayRef.current = day;
    else if (me.streak <= 0) lastStreakDayRef.current = null;

    // Returning users with activity / interests should never be forced through the
    // signup interests picker again — even if onboardingCompletedAt was never set.
    const hasProgress =
      (me.totalXp ?? me.xp ?? 0) > 0 ||
      (me.lessonsCompleted ?? 0) > 0 ||
      (me.missionsCompleted ?? 0) > 0 ||
      me.interests.length > 0;
    // Interests UI is signup-only. Prefer the live sync flag (cleared on Sign in).
    const awaitingSignupInterests = readPendingSignupInterestsSync();
    pendingSignupInterestsRef.current = awaitingSignupInterests;
    setPendingSignupInterests(awaitingSignupInterests);
    const completedAt =
      me.onboardingCompletedAt ??
      (hasProgress || !awaitingSignupInterests
        ? me.updatedAt || me.createdAt || new Date().toISOString()
        : null);

    if (completedAt) setOnboardingCompletedAt(completedAt);
    else setOnboardingCompletedAt(null);

    // Persist skip for sign-in users who never got onboardingCompletedAt on the server.
    if (!me.onboardingCompletedAt && !awaitingSignupInterests) {
      void patchMe({ onboardingCompleted: true }).catch(() => undefined);
      void clearPendingSignupInterests();
      setPendingSignupInterests(false);
      pendingSignupInterestsRef.current = false;
    }

    setProfile((prev) => {
      const mapped = profileFromMe(me, prev);
      // Keep richer Clerk name/photo when Nest only has a placeholder local-part
      const nestIsPlaceholder =
        !me.displayName?.trim() ||
        me.displayName.trim() === (me.email?.split('@')[0] ?? '');
      const keepClerkName =
        nestIsPlaceholder &&
        prev.fullName &&
        prev.fullName !== seedProfile.fullName &&
        !prev.fullName.includes('@');

      const next: UserProfile = {
        ...mapped,
        fullName: keepClerkName ? prev.fullName : mapped.fullName,
        name: keepClerkName ? prev.name : mapped.name,
        email: mapped.email || prev.email,
        avatarUrl: mapped.avatarUrl || prev.avatarUrl,
        avatar:
          mapped.avatarUrl || prev.avatarUrl ? undefined : mapped.avatar ?? prev.avatar,
        bio: mapped.bio || prev.bio,
      };
      void writeSessionCache({
        interests: me.interests,
        onboardingCompletedAt: completedAt,
        stats: {
          xp: next.xp,
          totalXp: next.totalXp,
          level: next.level,
          xpToNext: next.xpToNext,
          streak: next.streak,
          carbonSavedKg: next.carbonSavedKg,
          lessonsCompleted: next.lessonsCompleted,
          missionsCompleted: next.missionsCompleted,
          badgesUnlocked: next.badgesUnlocked,
          lastStreakDay: lastStreakDayRef.current,
        },
      });
      return next;
    });
    setInterestsState(me.interests);
    setPrefs((prev) => prefsFromServer(me.preferences, prev));

    // Persist the flag server-side when we inferred completion for a returning user.
    if (!me.onboardingCompletedAt && hasProgress) {
      void patchMe({ onboardingCompleted: true }).catch(() => undefined);
    }
  }, []);

  const applyCompletions = useCallback((done: Completions) => {
    setCompletedLessonIds(done.lessons);
    setCompletedMissionIds(done.missions);
    setLessons((list) =>
      list.map((lesson) =>
        done.lessons.includes(lesson.id) ? { ...lesson, progress: 1 } : lesson,
      ),
    );
    setMissions((list) =>
      list.map((mission) =>
        done.missions.includes(mission.id) ? { ...mission, completed: true } : mission,
      ),
    );
    void writeSessionCache({
      completedMissionIds: done.missions,
      completedLessonIds: done.lessons,
    });
  }, []);

  const applyProgressSnapshot = useCallback(
    (snap: {
      me?: MeResponse;
      activity?: ActivityItem[];
      badges?: BadgeItem[];
      newBadges?: string[];
      weekly?: WeeklyProgress;
      completions?: Completions;
    }) => {
      if (snap.me) applyMeResponse(snap.me);
      if (snap.activity) setActivity(snap.activity);
      if (snap.weekly) {
        setWeeklyProgress(snap.weekly);
        void writeSessionCache({ weeklyProgress: snap.weekly });
      }
      if (snap.completions) applyCompletions(snap.completions);
      if (snap.badges) {
        setBadges(snap.badges);
        setUnlockedBadgeIds(snap.badges.filter((b) => b.unlocked).map((b) => b.key));
      }
    },
    [applyCompletions, applyMeResponse],
  );

  const hydrateFromServer = useCallback(async () => {
    if (hydrating.current) return;
    hydrating.current = true;
    setSessionStatus((prev) => (prev === 'ready' ? prev : 'loading'));
    setSessionError(null);

    const pending = await readPendingSignupInterests();
    pendingSignupInterestsRef.current = pending;
    setPendingSignupInterests(pending);

    const [cached, session] = await Promise.all([readCatalogCache(), readSessionCache()]);
    applyCachedCatalog(cached);
    if (session.stats) applySessionStats(session.stats);
    if (session.weeklyProgress) setWeeklyProgress(session.weeklyProgress);
    if (session.completedMissionIds?.length) {
      setCompletedMissionIds(session.completedMissionIds);
    }
    if (session.completedLessonIds?.length) {
      setCompletedLessonIds(session.completedLessonIds);
    }
    if (session.interests.length) setInterestsState(session.interests);
    if (session.onboardingCompletedAt) {
      setOnboardingCompletedAt(session.onboardingCompletedAt);
    }
    if (session.stats || session.weeklyProgress) {
      setSessionStatus('ready');
    }

    const weeklyPromise = fetchWeeklyProgress().catch(() => null as WeeklyProgress | null);
    void weeklyPromise.then((weekly) => {
      if (!weekly) return;
      setWeeklyProgress(weekly);
      void writeSessionCache({ weeklyProgress: weekly });
    });

    try {
      // Create/link the user before fan-out — avoids parallel ensureUser races on first sign-in.
      const me = await fetchMe().catch(() => null as MeResponse | null);

      const [feed, badgeList, weekly, completions, catalog, missionCatalog, reportFeed, eventFeed] =
        await Promise.all([
          fetchActivity().catch(() => [] as ActivityItem[]),
          fetchBadges().catch(() => [] as BadgeItem[]),
          weeklyPromise,
          fetchCompletions().catch(() => null as Completions | null),
          fetchCourses().catch(() => null as CourseDto[] | null),
          fetchMissions().catch(() => null as MissionDto[] | null),
          fetchReports().catch(() => null as CommunityReportDto[] | null),
          fetchEvents().catch(() => null as CommunityEventDto[] | null),
        ]);

      if (catalog?.length) {
        catalogLive.current = true;
        setLessons(catalog.map(lessonFromDto));
      } else if (cached.courses.length >= MIN_EXPECTED_COURSES) {
        setLessons(cached.courses.map(lessonFromDto));
      }
      if (missionCatalog?.length) {
        catalogLive.current = true;
        setMissions(missionCatalog.map(missionFromDto));
        const doneFromCatalog = missionCatalog.filter((m) => m.completed).map((m) => m.id);
        if (doneFromCatalog.length) {
          setCompletedMissionIds((prev) => [...new Set([...prev, ...doneFromCatalog])]);
        }
      } else if (missionCatalog !== null && missionCatalog.length === 0) {
        setMissions([]);
      }
      if (reportFeed !== null) {
        cachedReportsRef.current = reportFeed;
        setReports(reportsFromDtos(reportFeed));
        const votes: Record<string, ReportVote> = {};
        for (const row of reportFeed) {
          if (row.myVote) votes[row.id] = row.myVote;
        }
        setReportVotes(votes);
      }
      if (eventFeed !== null) {
        cachedEventsRef.current = eventFeed;
        setEvents(eventsFromDtos(eventFeed));
      }
      if (catalog?.length || missionCatalog?.length || reportFeed !== null || eventFeed !== null) {
        void writeCatalogCache({
          courses: catalog?.length ? catalog : cached.courses,
          missions: missionCatalog?.length ? missionCatalog : cached.missions,
          reports: reportFeed !== null ? reportFeed : cached.reports,
          events: eventFeed !== null ? eventFeed : cached.events,
        });
      }

      const hasCatalog =
        Boolean(catalog?.length) ||
        Boolean(missionCatalog?.length) ||
        reportFeed !== null ||
        Boolean(eventFeed?.length) ||
        cached.courses.length > 0 ||
        cached.missions.length > 0 ||
        cached.reports.length > 0 ||
        cached.events.length > 0;

      if (!me) {
        setSessionError('Could not sync your profile. Catalog may still be available.');
        const hasCache =
          hasCatalog || Boolean(session.stats) || Boolean(session.weeklyProgress);
        setSessionStatus(hasCache ? 'ready' : 'error');
        return;
      }

      applyMeResponse(me);
      setActivity(feed);
      if (weekly) {
        setWeeklyProgress(weekly);
        void writeSessionCache({ weeklyProgress: weekly });
      }
      setBadges(badgeList);
      setUnlockedBadgeIds(badgeList.filter((b) => b.unlocked).map((b) => b.key));
      if (completions) {
        const catalogMissions =
          missionCatalog?.filter((m) => m.completed).map((m) => m.id) ?? [];
        applyCompletions({
          ...completions,
          missions: [...new Set([...completions.missions, ...catalogMissions])],
        });
      }
      setSessionError(null);
      setSessionStatus('ready');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not reach GreenPath API';
      setSessionError(message);
      const hasCache =
        cached.courses.length > 0 ||
        cached.missions.length > 0 ||
        cached.reports.length > 0 ||
        cached.events.length > 0 ||
        Boolean(session.stats);
      setSessionStatus(hasCache ? 'ready' : 'error');
    } finally {
      hydrating.current = false;
    }
  }, [applyCachedCatalog, applyCompletions, applyMeResponse, applySessionStats]);

  const syncClerkIdentity = useCallback(
    (identity: {
      fullName?: string | null;
      email?: string | null;
      imageUrl?: string | null;
      hasImage?: boolean | null;
    }) => {
      setProfile((prev) => mergeClerkIdentity(prev, identity));
    },
    [],
  );

  const resetSession = useCallback(() => {
    catalogLive.current = false;
    lastStreakDayRef.current = null;
    void clearSessionCache();
    // Do not clear pendingSignupInterests here — incomplete signup may resume.
    // Sign-in always clears it explicitly.
    setProfile(seedProfile);
    setInterestsState([]);
    setOnboardingCompletedAt(null);
    setCompletedMissionIds([]);
    setCompletedLessonIds([]);
    setUnlockedBadgeIds([]);
    setActivity([]);
    setWeeklyProgress(emptyWeeklyProgress());
    setBadges([]);
    setEvidenceUri(null);
    evidenceBase64Ref.current = null;
    setReports([]);
    setReportVotes({});
    setEvents([]);
    setLastQuiz(null);
    setCelebration(null);
    setPrefs(defaultPrefs);
    setSessionStatus('idle');
    setSessionError(null);
    void readCatalogCache().then((cached) => {
      if (catalogLive.current) return;
      if (cached.courses.length) setLessons(cached.courses.map(lessonFromDto));
      else setLessons([]);
      if (cached.missions.length) setMissions(cached.missions.map(missionFromDto));
      else setMissions([]);
      if (cached.reports.length) {
        cachedReportsRef.current = cached.reports;
        setReports(reportsFromDtos(cached.reports));
      } else setReports([]);
      if (cached.events.length) {
        cachedEventsRef.current = cached.events;
        setEvents(eventsFromDtos(cached.events));
      } else setEvents([]);
    });
  }, []);

  const bumpTodayXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setWeeklyProgress((prev) => {
      const days = prev.days.map((d) =>
        d.isToday ? { ...d, xp: d.xp + amount, actions: d.actions + 1 } : d,
      );
      const next = {
        ...prev,
        days,
        totalXp: days.reduce((s, d) => s + d.xp, 0),
        activeDays: days.filter((d) => d.actions > 0).length,
      };
      void writeSessionCache({ weeklyProgress: next });
      return next;
    });
  }, []);

  const addXpLocal = useCallback((amount: number) => {
    bumpTodayXp(amount);
    setProfile((p) => {
      let xp = p.xp + amount;
      let level = p.level;
      let xpToNext = p.xpToNext;
      while (xp >= xpToNext) {
        xp -= xpToNext;
        level += 1;
        xpToNext = Math.round(xpToNext * 1.15);
      }
      const next: UserProfile = {
        ...p,
        xp,
        totalXp: p.totalXp + amount,
        level,
        xpToNext,
        carbonSavedKg: Number((p.carbonSavedKg + amount * 0.004).toFixed(1)),
      };
      persistProfileStats(next);
      return next;
    });
  }, [bumpTodayXp, persistProfileStats]);

  const setInterests = useCallback(
    async (ids: string[]) => {
      setInterestsState(ids);
      const completedAt = new Date().toISOString();
      setOnboardingCompletedAt(completedAt);
      void clearPendingSignupInterests();
      setPendingSignupInterests(false);
      pendingSignupInterestsRef.current = false;
      void writeSessionCache({ interests: ids, onboardingCompletedAt: completedAt });
      try {
        let me = await patchInterests(ids);
        if (!me.onboardingCompletedAt) {
          me = await patchMe({ onboardingCompleted: true });
        }
        applyMeResponse(me);
      } catch (e) {
        setSessionError(e instanceof Error ? e.message : 'Failed to save interests');
      }
    },
    [applyMeResponse],
  );

  const updateProfile = useCallback(
    async (patch: UpdateMeBody) => {
      const me = await patchMe(patch);
      applyMeResponse(me);
    },
    [applyMeResponse],
  );

  const completeLesson = useCallback(
    (lessonId: string) => {
      const lesson = lessons.find((l) => l.id === lessonId);
      const reward = Math.max(0, lesson?.xp ?? 40);
      const title = lesson ? `Completed ${lesson.title} lesson` : 'Completed a lesson';

      setLessons((list) =>
        list.map((l) => (l.id === lessonId ? { ...l, progress: 1 } : l)),
      );

      if (completedLessonIds.includes(lessonId)) {
        // Practice / retake — XP already banked. Do not show a +0 celebration.
        return 0;
      }

      setCompletedLessonIds((ids) => {
        const next = ids.includes(lessonId) ? ids : [...ids, lessonId];
        void writeSessionCache({ completedLessonIds: next });
        return next;
      });
      setProfile((p) => {
        const bumped = bumpStreakForActivity(p.streak, lastStreakDayRef.current);
        lastStreakDayRef.current = bumped.lastStreakDay;
        const next: UserProfile = {
          ...p,
          lessonsCompleted: p.lessonsCompleted + 1,
          streak: bumped.streak,
        };
        persistProfileStats(next);
        return next;
      });
      addXpLocal(reward);
      setCelebration({
        title: 'Lesson complete!',
        subtitle: 'You earned XP and grew your climate knowledge.',
        xp: reward,
      });

      void awardProgress({
        kind: 'lesson',
        refId: lessonId,
        title,
        xp: reward,
      })
        .then(applyProgressSnapshot)
        .catch(() => undefined);

      return reward;
    },
    [addXpLocal, applyProgressSnapshot, completedLessonIds, lessons, persistProfileStats],
  );

  const advanceLessonFact = useCallback((lessonId: string, factIndex: number) => {
    setLessons((list) =>
      list.map((l) => {
        if (l.id !== lessonId) return l;
        const next = Math.min(1, (factIndex + 1) / Math.max(l.facts.length, 1));
        return { ...l, progress: Math.max(l.progress, next) };
      }),
    );
  }, []);

  const submitQuiz = useCallback(
    (insight: QuizInsight, xpReward?: number) => {
      const reward = xpReward ?? (insight.scorePct >= 70 ? 80 : 40);
      const refId = `quiz-${insight.scorePct}-${Date.now()}`;
      setLastQuiz(insight);
      addXpLocal(reward);
      setCelebration({
        title: `Quiz scored ${insight.scorePct}%`,
        subtitle: insight.recommendation,
        xp: reward,
      });
      void awardProgress({
        kind: 'quiz',
        refId,
        title: `Completed Climate Quiz (${insight.scorePct}%)`,
        xp: reward,
      })
        .then(applyProgressSnapshot)
        .catch(() => undefined);
    },
    [addXpLocal, applyProgressSnapshot],
  );

  const setEvidence = useCallback((source: ImageSourcePropType | null, base64?: string | null) => {
    setEvidenceUri(source);
    evidenceBase64Ref.current = source ? (base64 ?? evidenceBase64Ref.current) : null;
  }, []);

  const getEvidenceBase64 = useCallback(() => evidenceBase64Ref.current, []);

  const completeMission = useCallback(
    (mission: Mission, badgeName = 'Climate Hero') => {
      if (completedMissionIds.includes(mission.id)) {
        setCelebration({
          title: 'Mission already verified',
          subtitle: 'XP was already awarded for this mission.',
          xp: 0,
        });
        return;
      }
      const photoBase64 = evidenceBase64Ref.current ?? undefined;
      const nextIds = completedMissionIds.includes(mission.id)
        ? completedMissionIds
        : [...completedMissionIds, mission.id];
      setCompletedMissionIds(nextIds);
      void writeSessionCache({ completedMissionIds: nextIds });
      setMissions((list) =>
        list.map((m) => (m.id === mission.id ? { ...m, completed: true } : m)),
      );
      setProfile((p) => {
        const bumped = bumpStreakForActivity(p.streak, lastStreakDayRef.current);
        lastStreakDayRef.current = bumped.lastStreakDay;
        const next: UserProfile = {
          ...p,
          missionsCompleted: p.missionsCompleted + 1,
          streak: bumped.streak,
          badgesUnlocked: p.badgesUnlocked + 1,
        };
        persistProfileStats(next);
        return next;
      });
      addXpLocal(mission.xp);
      setCelebration({
        title: 'Mission Verified!',
        subtitle: `${mission.title}, New progress unlocked`,
        xp: mission.xp,
      });
      setEvidenceUri(null);
      evidenceBase64Ref.current = null;

      const persist = async () => {
        try {
          const snap = await completeMissionApi(mission.id, {
            photoBase64,
            badgeHint: badgeName,
          });
          applyProgressSnapshot(snap);
        } catch (firstError) {
          // Large / invalid photos often fail validation — still save the completion.
          if (photoBase64) {
            try {
              const snap = await completeMissionApi(mission.id, { badgeHint: badgeName });
              applyProgressSnapshot(snap);
              return;
            } catch {
              // fall through
            }
          }
          setSessionError(
            firstError instanceof Error
              ? firstError.message
              : 'Could not sync mission completion. Progress is saved on this device.',
          );
        }
      };
      void persist();
    },
    [addXpLocal, applyProgressSnapshot, completedMissionIds, persistProfileStats],
  );

  const submitCommunityReport = useCallback(
    async (input: NewCommunityReportInput) => {
      if (!input.photoBase64) {
        setSessionError('Add a photo before posting a report.');
        return;
      }
      const optimistic: CommunityReport = {
        id: `local-${Date.now()}`,
        kind: input.kind,
        title: input.title,
        caption: input.caption,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        distance: 'Nearby',
        timeAgo: 'Just now',
        upvotes: 1,
        downvotes: 0,
        author: profile.fullName,
        authorAvatar: profileAvatarSource(profile),
        photo: input.photo ?? { uri: input.photoBase64 },
        you: true,
        myVote: 'up',
      };
      setReports((list) => [optimistic, ...list]);
      setReportVotes((votes) => ({ ...votes, [optimistic.id]: 'up' }));
      setProfile((p) => {
        const bumped = bumpStreakForActivity(p.streak, lastStreakDayRef.current);
        lastStreakDayRef.current = bumped.lastStreakDay;
        const next: UserProfile = { ...p, streak: bumped.streak };
        persistProfileStats(next);
        return next;
      });
      addXpLocal(110);
      setCelebration({
        title: 'Report posted!',
        subtitle: 'Neighbours can upvote or downvote this spot.',
        xp: 110,
      });
      setEvidenceUri(null);
      evidenceBase64Ref.current = null;

      try {
        const result = await createReport({
          kind: input.kind,
          title: input.title,
          caption: input.caption,
          location: input.location,
          latitude: input.latitude,
          longitude: input.longitude,
          photoBase64: input.photoBase64,
        });
        const live = reportFromDto(result.report);
        if (live) {
          setReports((list) => [live, ...list.filter((r) => r.id !== optimistic.id)]);
          setReportVotes((votes) => {
            const { [optimistic.id]: _, ...rest } = votes;
            return { ...rest, [live.id]: live.myVote ?? 'up' };
          });
        }
        applyProgressSnapshot(result);
        cachedReportsRef.current = [
          result.report,
          ...cachedReportsRef.current.filter((r) => r.id !== result.report.id),
        ];
        persistCatalogCache();
      } catch (e) {
        setReports((list) => list.filter((r) => r.id !== optimistic.id));
        setSessionError(e instanceof Error ? e.message : 'Could not post report');
      }
    },
    [addXpLocal, applyProgressSnapshot, profile, persistCatalogCache, persistProfileStats],
  );

  const toggleEventRsvp = useCallback(
    (eventId: string): CommunityEventView | null => {
      const current = events.find((e) => e.id === eventId);
      if (!current) return null;

      const spotsLeft = Math.max(0, current.capacity - current.participants);
      if (!current.joined && spotsLeft === 0) return null;

      const optimistic: CommunityEventView = {
        ...current,
        joined: !current.joined,
        participants: current.participants + (current.joined ? -1 : 1),
        emailSent: !current.joined ? Boolean(profile.email?.includes('@')) : undefined,
      };
      setEvents((list) => list.map((e) => (e.id === eventId ? optimistic : e)));

      // Sync in background — UI already flipped.
      void (async () => {
        try {
          const dto = current.joined
            ? await leaveEventApi(eventId)
            : await joinEventApi(eventId);
          const view = eventFromDto(dto);
          setEvents((list) =>
            list.map((e) =>
              e.id === eventId
                ? {
                    ...view,
                    // Keep optimistic email hint if API omits it
                    emailSent: view.emailSent ?? optimistic.emailSent,
                  }
                : e,
            ),
          );
          cachedEventsRef.current = cachedEventsRef.current.map((e) =>
            e.id === eventId ? dto : e,
          );
          persistCatalogCache();
        } catch {
          setEvents((list) => list.map((e) => (e.id === eventId ? current : e)));
          setSessionError('Could not update event RSVP. Try again.');
        }
      })();

      return optimistic;
    },
    [events, persistCatalogCache, profile.email],
  );

  const voteOnReport = useCallback((reportId: string, vote: ReportVote) => {
    setReportVotes((votes) => {
      const previous = votes[reportId];
      const nextVote = previous === vote ? undefined : vote;

      setReports((list) =>
        list.map((r) => {
          if (r.id !== reportId) return r;
          let upvotes = r.upvotes;
          let downvotes = r.downvotes;

          if (previous === 'up') upvotes = Math.max(0, upvotes - 1);
          if (previous === 'down') downvotes = Math.max(0, downvotes - 1);
          if (nextVote === 'up') upvotes += 1;
          if (nextVote === 'down') downvotes += 1;

          return { ...r, upvotes, downvotes, myVote: nextVote };
        }),
      );

      if (!nextVote) {
        const { [reportId]: _, ...rest } = votes;
        return rest;
      }
      return { ...votes, [reportId]: nextVote };
    });

    void voteOnReportApi(reportId, vote)
      .then((dto) => {
        const live = reportFromDto(dto);
        if (!live) return;
        setReports((list) => list.map((r) => (r.id === reportId ? live : r)));
        setReportVotes((current) => {
          if (!live.myVote) {
            const { [reportId]: _, ...rest } = current;
            return rest;
          }
          return { ...current, [reportId]: live.myVote };
        });
      })
      .catch(() => undefined);
  }, []);

  const clearCelebration = useCallback(() => setCelebration(null), []);

  const updatePrefs = useCallback(async (patch: Partial<AccessibilityPrefs>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    const body = prefsToServerPatch(patch);
    if (Object.keys(body).length === 0) return;
    try {
      const server = await patchPreferences(body);
      setPrefs((prev) => prefsFromServer(server, { ...prev, ...patch }));
    } catch (e) {
      setSessionError(e instanceof Error ? e.message : 'Failed to save preferences');
    }
  }, []);

  const filteredLessons = useMemo(() => {
    if (!interests.length) return lessons;
    const interestSet = new Set(interests);
    const score = (lesson: Lesson) => {
      let s = 0;
      for (const tag of lesson.interestTags ?? []) {
        if (interestSet.has(tag)) s += 10;
      }
      const legacyTopics = new Set(interests.flatMap((id) => interestToTopics[id] ?? []));
      if (legacyTopics.has(lesson.topic)) s += 3;
      return s;
    };
    return [...lessons].sort((a, b) => {
      const diff = score(b) - score(a);
      if (diff !== 0) return diff;
      return (a.sortOrder ?? a.curriculumNo ?? 0) - (b.sortOrder ?? b.curriculumNo ?? 0);
    });
  }, [interests, lessons]);

  const filteredMissions = useMemo(() => {
    if (!interests.length) return missions;
    const score = (m: Mission) => {
      let s = 0;
      if (
        interests.includes('recycling') &&
        (m.illustration === 'recycle' || m.illustration === 'plastic')
      )
        s += 2;
      if (
        interests.includes('waste') &&
        (m.illustration === 'recycle' || m.illustration === 'plastic')
      )
        s += 2;
      if (interests.includes('trees') && m.illustration === 'tree') s += 2;
      if (interests.includes('water') && m.illustration === 'water') s += 2;
      if (interests.includes('ocean') && m.illustration === 'water') s += 2;
      if (interests.includes('energy') && m.illustration === 'energy') s += 2;
      if (interests.includes('agriculture') && m.illustration === 'agriculture') s += 2;
      if (interests.includes('climate') || interests.includes('air')) s += 1;
      if (completedMissionIds.includes(m.id)) s -= 5;
      return s;
    };
    return [...missions].sort((a, b) => score(b) - score(a));
  }, [interests, missions, completedMissionIds]);

  const needsInterestOnboarding =
    pendingSignupInterests && !onboardingCompletedAt && interests.length === 0;

  const value = useMemo(
    () => ({
      profile,
      interests,
      needsInterestOnboarding,
      lessons,
      missions,
      completedMissionIds,
      completedLessonIds,
      unlockedBadgeIds,
      activity,
      weeklyProgress,
      badges,
      evidenceUri,
      reports,
      reportVotes,
      events,
      lastQuiz,
      celebration,
      prefs,
      sessionStatus,
      sessionError,
      hydrateFromServer,
      syncClerkIdentity,
      resetSession,
      setInterests,
      updateProfile,
      completeLesson,
      advanceLessonFact,
      submitQuiz,
      setEvidence,
      getEvidenceBase64,
      completeMission,
      submitCommunityReport,
      voteOnReport,
      toggleEventRsvp,
      clearCelebration,
      updatePrefs,
      filteredLessons,
      filteredMissions,
    }),
    [
      profile,
      interests,
      needsInterestOnboarding,
      lessons,
      missions,
      completedMissionIds,
      completedLessonIds,
      unlockedBadgeIds,
      activity,
      weeklyProgress,
      badges,
      evidenceUri,
      reports,
      reportVotes,
      events,
      lastQuiz,
      celebration,
      prefs,
      sessionStatus,
      sessionError,
      hydrateFromServer,
      syncClerkIdentity,
      resetSession,
      setInterests,
      updateProfile,
      completeLesson,
      advanceLessonFact,
      submitQuiz,
      setEvidence,
      getEvidenceBase64,
      completeMission,
      submitCommunityReport,
      voteOnReport,
      toggleEventRsvp,
      clearCelebration,
      updatePrefs,
      filteredLessons,
      filteredMissions,
    ],
  );

  return (
    <GreenPathContext.Provider value={value}>{children}</GreenPathContext.Provider>
  );
}

export function useGreenPath() {
  const ctx = useContext(GreenPathContext);
  if (!ctx) throw new Error('useGreenPath must be used within GreenPathProvider');
  return ctx;
}
