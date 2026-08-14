import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthFlow } from '@/features/auth/AuthFlow';
import { InterestsScreen } from '@/features/auth/screens/InterestsScreen';
import type { CommunityEventView } from '@/features/community/eventModel';
import { CommunityScreen } from '@/features/community/screens/CommunityScreen';
import { EventDetailScreen } from '@/features/community/screens/EventDetailScreen';
import { LeaderboardScreen } from '@/features/community/screens/LeaderboardScreen';
import { HomeScreen, type HomeAction } from '@/features/home/screens/HomeScreen';
import { NotificationsSheet } from '@/features/home/screens/NotificationsScreen';
import { LearnCoachFab } from '@/features/lessons/components/LearnCoachFab';
import { LessonDetailScreen } from '@/features/lessons/screens/LessonDetailScreen';
import { LessonSessionScreen } from '@/features/lessons/screens/LessonSessionScreen';
import { LessonsScreen } from '@/features/lessons/screens/LessonsScreen';
import { QuizResultsScreen } from '@/features/lessons/screens/QuizResultsScreen';
import { QuizScreen } from '@/features/lessons/screens/QuizScreen';
import { MissionDetailScreen } from '@/features/missions/screens/MissionDetailScreen';
import { MissionsScreen } from '@/features/missions/screens/MissionsScreen';
import { ReportNearbyScreen } from '@/features/missions/screens/ReportNearbyScreen';
import { AnalyticsScreen } from '@/features/profile/screens/AnalyticsScreen';
import { EditProfileScreen } from '@/features/profile/screens/EditProfileScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { SettingsScreen } from '@/features/profile/screens/SettingsScreen';
import { RewardsScreen } from '@/features/rewards/screens/RewardsScreen';
import { VoiceAssistantScreen } from '@/features/voice/screens/VoiceAssistantScreen';
import type { AppTab } from '@/navigation/tabs';
import { setApiTokenGetter } from '@/shared/api';
import { CelebrationOverlay } from '@/shared/components/CelebrationOverlay';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { MobileShell } from '@/shared/components/MobileShell';
import { SystemBars } from '@/shared/components/SystemBars';
import { TabBar } from '@/shared/components/TabBar';
import { env } from '@/shared/config/env';
import type { Lesson, Mission } from '@/shared/data/greenpathData';
import { useAppFonts } from '@/shared/hooks/useAppFonts';
import {
  GreenPathProvider,
  type QuizInsight,
  useGreenPath,
} from '@/shared/state/GreenPathContext';
import { captureInviteFromLaunch } from '@/shared/storage/inviteReferral';
import { colors } from '@/shared/theme/tokens';

type Overlay =
  | { type: 'lesson'; lesson: Lesson }
  | { type: 'lessonSession'; lesson: Lesson }
  | { type: 'quiz'; lesson?: Lesson }
  | { type: 'quizResults'; insight: QuizInsight; lesson?: Lesson }
  | { type: 'mission'; mission: Mission }
  | { type: 'report' }
  | { type: 'voice' }
  | { type: 'rewards' }
  | { type: 'leaderboard' }
  | { type: 'event'; event: CommunityEventView }
  | { type: 'analytics' }
  | { type: 'settings' }
  | { type: 'editProfile' }
  | null;

function AppShell() {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useAuth();
  const { user } = useUser();
  const {
    filteredLessons,
    filteredMissions,
    completedLessonIds,
    celebration,
    clearCelebration,
    submitQuiz,
    setInterests,
    needsInterestOnboarding,
    sessionStatus,
    sessionError,
    hydrateFromServer,
    syncClerkIdentity,
    resetSession,
  } = useGreenPath();
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const hydratedForSession = useRef(false);
  const syncedClerkId = useRef<string | null>(null);

  const learnCoachLesson = useMemo(() => {
    const doneIds = new Set(completedLessonIds);
    const idx = filteredLessons.findIndex((l) => !doneIds.has(l.id));
    const i = idx < 0 ? Math.max(0, filteredLessons.length - 1) : idx;
    return filteredLessons[i] ?? null;
  }, [filteredLessons, completedLessonIds]);

  // Capture /join/CODE or ?ref= so invite links open the app with the code remembered.
  useEffect(() => {
    void captureInviteFromLaunch();
  }, []);

  // Register Clerk JWT, then hydrate — one effect so /me never races without a token.
  useEffect(() => {
    if (!isSignedIn) {
      setApiTokenGetter(null);
      hydratedForSession.current = false;
      syncedClerkId.current = null;
      return;
    }
    setApiTokenGetter(() => getToken());
    if (!hydratedForSession.current) {
      hydratedForSession.current = true;
      void hydrateFromServer();
    }
  }, [getToken, hydrateFromServer, isSignedIn]);

  // Push Clerk name / email into the profile shell immediately.
  // Only use Clerk photo when the user uploaded one (skip generated color initials).
  useEffect(() => {
    if (!isSignedIn || !user) return;
    if (syncedClerkId.current === user.id) return;
    syncedClerkId.current = user.id;
    syncClerkIdentity({
      fullName: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' '),
      email: user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress,
      imageUrl: user.hasImage ? user.imageUrl : null,
      hasImage: user.hasImage,
    });
  }, [isSignedIn, syncClerkIdentity, user]);

  const signOut = async () => {
    setOverlay(null);
    setShowNotifications(false);
    setActiveTab('home');
    setApiTokenGetter(null);
    resetSession();
    await clerkSignOut();
  };

  const handleHomeAction = (action: HomeAction) => {
    if (action === 'lesson') {
      const lesson = filteredLessons[0];
      if (lesson) setOverlay({ type: 'lessonSession', lesson });
      return;
    }
    if (action === 'leaderboard') {
      setOverlay({ type: 'leaderboard' });
      return;
    }
    if (action === 'quiz') {
      setOverlay({ type: 'quiz' });
      return;
    }
    if (action === 'mission') {
      setActiveTab('missions');
      const mission = filteredMissions[0];
      if (mission) setOverlay({ type: 'mission', mission });
      return;
    }
    if (action === 'report') {
      setActiveTab('missions');
      setOverlay({ type: 'report' });
      return;
    }
    if (action === 'voice') {
      setOverlay({ type: 'voice' });
      return;
    }
    if (action === 'community') {
      setActiveTab('community');
      return;
    }
    if (action === 'rewards') {
      setOverlay({ type: 'rewards' });
      return;
    }
    if (action === 'notifications') {
      setShowNotifications(true);
    }
  };

  const renderOverlay = () => {
    if (!overlay) return null;
    if (overlay.type === 'lesson') {
      return (
        <LessonDetailScreen
          lesson={overlay.lesson}
          onBack={() => setOverlay(null)}
          onEndLesson={() => setOverlay(null)}
          onTakeQuiz={() => setOverlay({ type: 'quiz', lesson: overlay.lesson })}
          onStartSession={() =>
            setOverlay({ type: 'lessonSession', lesson: overlay.lesson })
          }
        />
      );
    }
    if (overlay.type === 'lessonSession') {
      return (
        <LessonSessionScreen
          lesson={overlay.lesson}
          onBack={() => setOverlay(null)}
          onFinished={() => setOverlay(null)}
        />
      );
    }
    if (overlay.type === 'quiz') {
      return (
        <QuizScreen
          lesson={overlay.lesson}
          onFinish={(insight) => {
            submitQuiz(insight);
            setOverlay({ type: 'quizResults', insight, lesson: overlay.lesson });
          }}
        />
      );
    }
    if (overlay.type === 'quizResults') {
      return (
        <QuizResultsScreen
          insight={overlay.insight}
          onReview={() => setOverlay({ type: 'quiz', lesson: overlay.lesson })}
          onPractice={() => setOverlay({ type: 'quiz', lesson: overlay.lesson })}
          onContinue={() => setOverlay(null)}
        />
      );
    }
    if (overlay.type === 'mission') {
      return (
        <MissionDetailScreen
          mission={overlay.mission}
          onBack={() => setOverlay(null)}
        />
      );
    }
    if (overlay.type === 'report') {
      return <ReportNearbyScreen onBack={() => setOverlay(null)} />;
    }
    if (overlay.type === 'voice') {
      return <VoiceAssistantScreen onClose={() => setOverlay(null)} />;
    }
    if (overlay.type === 'rewards') {
      return <RewardsScreen onBack={() => setOverlay(null)} />;
    }
    if (overlay.type === 'leaderboard') {
      return <LeaderboardScreen onBack={() => setOverlay(null)} />;
    }
    if (overlay.type === 'event') {
      return (
        <EventDetailScreen
          event={overlay.event}
          onBack={() => setOverlay(null)}
          onUpdated={(event) => setOverlay({ type: 'event', event })}
        />
      );
    }
    if (overlay.type === 'analytics') {
      return <AnalyticsScreen onBack={() => setOverlay(null)} />;
    }
    if (overlay.type === 'settings') {
      return <SettingsScreen onBack={() => setOverlay(null)} />;
    }
    if (overlay.type === 'editProfile') {
      return <EditProfileScreen onBack={() => setOverlay(null)} />;
    }
    return null;
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <AuthFlow />;
  }

  if (sessionStatus === 'idle' || sessionStatus === 'loading') {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-canvas px-8">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text className="font-sans text-body text-subtle">Loading your GreenPath…</Text>
      </View>
    );
  }

  // API down should not trap the user — continue to interests (signup only) / dashboard.
  if (sessionStatus === 'error' && needsInterestOnboarding) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-canvas px-8">
        <Text className="text-center font-sans-bold text-heading text-ink">
          Can’t reach the API
        </Text>
        <Text className="text-center font-sans text-body text-subtle">
          {sessionError ?? 'Check that greenserver is running and EXPO_PUBLIC_API_URL is set.'}
        </Text>
        {__DEV__ ? (
          <Text className="text-center font-sans text-caption text-muted">
            API: {env.apiUrl || '(not set)'}
          </Text>
        ) : null}
        <Pressable
          onPress={() => {
            hydratedForSession.current = false;
            void hydrateFromServer();
          }}
          className="h-12 items-center justify-center rounded-2xl bg-primary px-6">
          <Text className="font-sans-semibold text-body text-white">Retry</Text>
        </Pressable>
        {__DEV__ ? (
          <Pressable
            onPress={() => {
              // Local-only path: finish signup interests without server sync first.
              void setInterests(['climate']);
            }}
            className="h-12 items-center justify-center rounded-2xl border border-line bg-card-raised px-6">
            <Text className="font-sans-semibold text-body text-ink">Continue offline</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => void signOut()} className="h-11 items-center justify-center px-4">
          <Text className="font-sans-semibold text-body text-danger">Sign out</Text>
        </Pressable>
      </View>
    );
  }

  // Interests picker is signup-only — never re-show after a completed onboarding / sign-in.
  if (needsInterestOnboarding) {
    return (
      <InterestsScreen
        onContinue={(ids) => {
          void setInterests(ids);
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      {sessionStatus === 'error' && sessionError ? (
        <Pressable
          onPress={() => {
            hydratedForSession.current = false;
            void hydrateFromServer();
          }}
          className="border-b border-line bg-gold-soft px-4 py-2">
          <Text className="font-sans text-caption text-ink" numberOfLines={2}>
            Offline / API error — tap to retry. {sessionError}
          </Text>
        </Pressable>
      ) : null}
      {overlay ? (
        renderOverlay()
      ) : (
        <>
          {activeTab === 'home' ? (
            <HomeScreen
              onAction={handleHomeAction}
              onOpenProfile={() => setActiveTab('profile')}
              onOpenEvent={(event) => setOverlay({ type: 'event', event })}
              onOpenMission={(mission) => {
                setActiveTab('missions');
                setOverlay({ type: 'mission', mission });
              }}
            />
          ) : null}
          {activeTab === 'lessons' ? (
            <LessonsScreen
              onOpenLesson={(lesson) => setOverlay({ type: 'lesson', lesson })}
              onStartSession={(lesson) => setOverlay({ type: 'lessonSession', lesson })}
            />
          ) : null}
          {activeTab === 'missions' ? (
            <MissionsScreen
              onOpenMission={(mission) => setOverlay({ type: 'mission', mission })}
              onOpenReport={() => setOverlay({ type: 'report' })}
            />
          ) : null}
          {activeTab === 'community' ? (
            <CommunityScreen
              onOpenLeaderboard={() => setOverlay({ type: 'leaderboard' })}
              onOpenEvent={(event) => setOverlay({ type: 'event', event })}
            />
          ) : null}
          {activeTab === 'profile' ? (
            <ProfileScreen
              onSignOut={() => {
                void signOut();
              }}
              onOpenSettings={() => setOverlay({ type: 'settings' })}
              onOpenEditProfile={() => setOverlay({ type: 'editProfile' })}
              onOpenAnalytics={() => setOverlay({ type: 'analytics' })}
              onOpenRewards={() => setOverlay({ type: 'rewards' })}
              onOpenLeaderboard={() => setOverlay({ type: 'leaderboard' })}
            />
          ) : null}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'lessons' ? (
            <ErrorBoundary fallback={null}>
              <LearnCoachFab lesson={learnCoachLesson} />
            </ErrorBoundary>
          ) : null}

          <NotificationsSheet
            visible={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </>
      )}

      {celebration ? (
        <CelebrationOverlay
          title={celebration.title}
          subtitle={celebration.subtitle}
          xp={celebration.xp}
          onDone={clearCelebration}
        />
      ) : null}
    </View>
  );
}

/**
 * GreenPath Ghana — Learn → Improve → Act → Earn → Help the Planet.
 */
export function App() {
  const fontsReady = useAppFonts();
  const publishableKey = env.clerkPublishableKey;

  if (!fontsReady) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (!publishableKey) {
    throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file');
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SystemBars style={{ statusBar: 'dark', navigationBar: 'dark' }} />
        <GreenPathProvider>
          <MobileShell>
            <AppShell />
          </MobileShell>
        </GreenPathProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
