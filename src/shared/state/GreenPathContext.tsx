import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ImageSourcePropType } from 'react-native';

import { images } from '@/shared/media';
import {
  badges as seedBadges,
  lessons as seedLessons,
  missions as seedMissions,
  userProfile as seedProfile,
  type Lesson,
  type Mission,
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
};

type GreenPathState = {
  profile: typeof seedProfile;
  interests: string[];
  lessons: Lesson[];
  missions: Mission[];
  completedMissionIds: string[];
  unlockedBadgeIds: string[];
  evidenceUri: ImageSourcePropType | null;
  lastQuiz: QuizInsight | null;
  celebration: { title: string; subtitle: string; xp: number } | null;
  prefs: AccessibilityPrefs;
  setInterests: (ids: string[]) => void;
  completeLesson: (lessonId: string) => void;
  advanceLessonFact: (lessonId: string, factIndex: number) => void;
  submitQuiz: (insight: QuizInsight, xpReward?: number) => void;
  setEvidence: (source: ImageSourcePropType | null) => void;
  completeMission: (mission: Mission, badgeName?: string) => void;
  clearCelebration: () => void;
  updatePrefs: (patch: Partial<AccessibilityPrefs>) => void;
  filteredLessons: Lesson[];
  filteredMissions: Mission[];
};

const GreenPathContext = createContext<GreenPathState | null>(null);

const interestToTopics: Record<string, string[]> = {
  recycling: ['Waste Management', 'Plastic Pollution'],
  trees: ['Climate Change', 'Sustainable Agriculture'],
  water: ['Water Conservation'],
  energy: ['Solar Energy'],
  agriculture: ['Sustainable Agriculture'],
  climate: ['Climate Change'],
  wildlife: ['Climate Change', 'Plastic Pollution'],
  air: ['Climate Change', 'Solar Energy'],
  ocean: ['Water Conservation', 'Plastic Pollution'],
  waste: ['Waste Management', 'Plastic Pollution'],
};

export function GreenPathProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(seedProfile);
  const [interests, setInterestsState] = useState<string[]>([
    'climate',
    'recycling',
    'trees',
  ]);
  const [lessons, setLessons] = useState(seedLessons);
  const [missions] = useState(seedMissions);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState(
    seedBadges.filter((b) => b.unlocked).map((b) => b.id),
  );
  const [evidenceUri, setEvidenceUri] = useState<ImageSourcePropType | null>(null);
  const [lastQuiz, setLastQuiz] = useState<QuizInsight | null>(null);
  const [celebration, setCelebration] = useState<GreenPathState['celebration']>(null);
  const [prefs, setPrefs] = useState<AccessibilityPrefs>({
    largeFonts: false,
    highContrast: false,
    darkMode: false,
    tts: true,
    stt: true,
    voiceNav: true,
    notifications: true,
  });

  const addXp = useCallback((amount: number) => {
    setProfile((p) => {
      let xp = p.xp + amount;
      let level = p.level;
      let xpToNext = p.xpToNext;
      while (xp >= xpToNext) {
        xp -= xpToNext;
        level += 1;
        xpToNext = Math.round(xpToNext * 1.15);
      }
      return {
        ...p,
        xp,
        level,
        xpToNext,
        carbonSavedKg: Number((p.carbonSavedKg + amount * 0.004).toFixed(1)),
      };
    });
  }, []);

  const setInterests = useCallback((ids: string[]) => {
    setInterestsState(ids);
  }, []);

  const completeLesson = useCallback(
    (lessonId: string) => {
      setLessons((list) =>
        list.map((l) => (l.id === lessonId ? { ...l, progress: 1 } : l)),
      );
      setProfile((p) => ({
        ...p,
        lessonsCompleted: p.lessonsCompleted + 1,
        streak: p.streak + (p.streak > 0 ? 0 : 1),
      }));
      addXp(40);
      setCelebration({
        title: 'Lesson complete!',
        subtitle: 'You earned XP and grew your climate knowledge.',
        xp: 40,
      });
    },
    [addXp],
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
    (insight: QuizInsight, xpReward = 60) => {
      setLastQuiz(insight);
      addXp(xpReward);
      setCelebration({
        title: `Quiz scored ${insight.scorePct}%`,
        subtitle: insight.recommendation,
        xp: xpReward,
      });
    },
    [addXp],
  );

  const setEvidence = useCallback((source: ImageSourcePropType | null) => {
    setEvidenceUri(source);
  }, []);

  const completeMission = useCallback(
    (mission: Mission, badgeName = 'Climate Hero') => {
      setCompletedMissionIds((ids) =>
        ids.includes(mission.id) ? ids : [...ids, mission.id],
      );
      setProfile((p) => ({
        ...p,
        missionsCompleted: p.missionsCompleted + 1,
        streak: p.streak + 1,
        badgesUnlocked: p.badgesUnlocked + 1,
      }));
      addXp(mission.xp);
      if (badgeName === 'Tree Guardian') {
        setUnlockedBadgeIds((ids) => (ids.includes('tree') ? ids : [...ids, 'tree']));
      } else if (badgeName === 'Eco Leader') {
        setUnlockedBadgeIds((ids) => (ids.includes('eco') ? ids : [...ids, 'eco']));
      }
      setCelebration({
        title: 'Mission Verified!',
        subtitle: `${mission.title}, New progress unlocked`,
        xp: mission.xp,
      });
      setEvidenceUri(null);
    },
    [addXp],
  );

  const clearCelebration = useCallback(() => setCelebration(null), []);

  const updatePrefs = useCallback((patch: Partial<AccessibilityPrefs>) => {
    setPrefs((p) => ({ ...p, ...patch }));
  }, []);

  const filteredLessons = useMemo(() => {
    if (!interests.length) return lessons;
    const topics = new Set(
      interests.flatMap((id) => interestToTopics[id] ?? []),
    );
    const preferred = lessons.filter((l) => topics.has(l.topic));
    const rest = lessons.filter((l) => !topics.has(l.topic));
    return preferred.length ? [...preferred, ...rest] : lessons;
  }, [interests, lessons]);

  const filteredMissions = useMemo(() => {
    if (!interests.length) return missions;
    // Soft preference: recycling interests surface recycle/cleanup first
    const score = (m: Mission) => {
      let s = 0;
      if (interests.includes('recycling') && m.illustration === 'recycle') s += 2;
      if (interests.includes('waste') && m.illustration === 'recycle') s += 2;
      if (interests.includes('trees') && m.illustration === 'tree') s += 2;
      if (interests.includes('water') && m.illustration === 'water') s += 2;
      if (interests.includes('ocean') && m.illustration === 'water') s += 2;
      if (interests.includes('energy') && m.illustration === 'energy') s += 2;
      if (interests.includes('climate') || interests.includes('air')) s += 1;
      if (completedMissionIds.includes(m.id)) s -= 5;
      return s;
    };
    return [...missions].sort((a, b) => score(b) - score(a));
  }, [interests, missions, completedMissionIds]);

  const value = useMemo(
    () => ({
      profile,
      interests,
      lessons,
      missions,
      completedMissionIds,
      unlockedBadgeIds,
      evidenceUri,
      lastQuiz,
      celebration,
      prefs,
      setInterests,
      completeLesson,
      advanceLessonFact,
      submitQuiz,
      setEvidence,
      completeMission,
      clearCelebration,
      updatePrefs,
      filteredLessons,
      filteredMissions,
    }),
    [
      profile,
      interests,
      lessons,
      missions,
      completedMissionIds,
      unlockedBadgeIds,
      evidenceUri,
      lastQuiz,
      celebration,
      prefs,
      setInterests,
      completeLesson,
      advanceLessonFact,
      submitQuiz,
      setEvidence,
      completeMission,
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

/** Demo evidence photo used when user taps Take Photo / Upload (no device camera required). */
export const demoEvidenceByMission: Record<string, ImageSourcePropType> = {
  bottles: images.onboardingAction,
  'water-save': images.onboardingLearn,
  plant: images.landingHero,
  cleanup: images.onboardingAction,
  lights: images.onboardingAi,
};
