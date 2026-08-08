import { useState } from 'react';
import { View } from 'react-native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthFlow } from '@/features/auth/AuthFlow';
import { CommunityScreen } from '@/features/community/screens/CommunityScreen';
import { LeaderboardScreen } from '@/features/community/screens/LeaderboardScreen';
import { HomeScreen, type HomeAction } from '@/features/home/screens/HomeScreen';
import { NotificationsSheet } from '@/features/home/screens/NotificationsScreen';
import { LessonDetailScreen } from '@/features/lessons/screens/LessonDetailScreen';
import { LessonsScreen } from '@/features/lessons/screens/LessonsScreen';
import { QuizResultsScreen } from '@/features/lessons/screens/QuizResultsScreen';
import { QuizScreen } from '@/features/lessons/screens/QuizScreen';
import { AiVerificationScreen } from '@/features/missions/screens/AiVerificationScreen';
import { MissionDetailScreen } from '@/features/missions/screens/MissionDetailScreen';
import { MissionsScreen } from '@/features/missions/screens/MissionsScreen';
import { AnalyticsScreen } from '@/features/profile/screens/AnalyticsScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { SettingsScreen } from '@/features/profile/screens/SettingsScreen';
import { RewardsScreen } from '@/features/rewards/screens/RewardsScreen';
import { VoiceAssistantScreen } from '@/features/voice/screens/VoiceAssistantScreen';
import type { AppTab } from '@/navigation/tabs';
import { CelebrationOverlay } from '@/shared/components/CelebrationOverlay';
import { MobileShell } from '@/shared/components/MobileShell';
import { SystemBars } from '@/shared/components/SystemBars';
import { TabBar } from '@/shared/components/TabBar';
import type { Lesson, Mission } from '@/shared/data/greenpathData';
import { missions } from '@/shared/data/greenpathData';
import { useAppFonts } from '@/shared/hooks/useAppFonts';
import {
  GreenPathProvider,
  type QuizInsight,
  useGreenPath,
} from '@/shared/state/GreenPathContext';

type Overlay =
  | { type: 'lesson'; lesson: Lesson }
  | { type: 'quiz' }
  | { type: 'quizResults'; insight: QuizInsight }
  | { type: 'mission'; mission: Mission }
  | { type: 'verify'; mission: Mission }
  | { type: 'voice' }
  | { type: 'rewards' }
  | { type: 'leaderboard' }
  | { type: 'analytics' }
  | { type: 'settings' }
  | null;

function AppShell() {
  const {
    filteredLessons,
    filteredMissions,
    celebration,
    clearCelebration,
    submitQuiz,
    prefs,
  } = useGreenPath();
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const signOut = () => {
    setOverlay(null);
    setShowNotifications(false);
    setActiveTab('home');
    setAuthenticated(false);
  };

  const handleHomeAction = (action: HomeAction) => {
    if (action === 'lesson') {
      setOverlay({ type: 'lesson', lesson: filteredLessons[0] });
      return;
    }
    if (action === 'quiz') {
      setOverlay({ type: 'quiz' });
      return;
    }
    if (action === 'mission') {
      setActiveTab('missions');
      setOverlay({ type: 'mission', mission: filteredMissions[0] });
      return;
    }
    if (action === 'report') {
      const reportMission =
        filteredMissions.find((m) => m.id === 'report-nearby') ??
        missions.find((m) => m.id === 'report-nearby') ??
        filteredMissions[0];
      setActiveTab('missions');
      if (reportMission) {
        setOverlay({ type: 'mission', mission: reportMission });
      }
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
    if (action === 'notifications') {
      setShowNotifications(true);
      return;
    }
    if (action === 'rewards') {
      setOverlay({ type: 'rewards' });
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
          onTakeQuiz={() => setOverlay({ type: 'quiz' })}
        />
      );
    }
    if (overlay.type === 'quiz') {
      return (
        <QuizScreen
          onFinish={(insight) => {
            submitQuiz(insight, insight.scorePct >= 70 ? 80 : 40);
            setOverlay({ type: 'quizResults', insight });
          }}
        />
      );
    }
    if (overlay.type === 'quizResults') {
      const reviewLesson =
        filteredLessons.find((l) => l.topic.includes('Plastic')) ??
        filteredLessons.find((l) => l.id === 'plastic') ??
        filteredLessons[0];
      return (
        <QuizResultsScreen
          insight={overlay.insight}
          onReview={() => setOverlay({ type: 'lesson', lesson: reviewLesson })}
          onPractice={() => setOverlay({ type: 'quiz' })}
          onContinue={() => setOverlay(null)}
        />
      );
    }
    if (overlay.type === 'mission') {
      return (
        <MissionDetailScreen
          mission={overlay.mission}
          onBack={() => setOverlay(null)}
          onSubmitEvidence={() =>
            setOverlay({ type: 'verify', mission: overlay.mission })
          }
        />
      );
    }
    if (overlay.type === 'verify') {
      return (
        <AiVerificationScreen
          mission={overlay.mission}
          onContinue={() => setOverlay({ type: 'rewards' })}
        />
      );
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
    if (overlay.type === 'analytics') {
      return <AnalyticsScreen onBack={() => setOverlay(null)} />;
    }
    if (overlay.type === 'settings') {
      return <SettingsScreen onBack={() => setOverlay(null)} />;
    }
    return null;
  };

  return (
    <View
      className={`flex-1 ${prefs.highContrast ? 'bg-white' : 'bg-canvas'}`}
      style={prefs.largeFonts ? { transform: [{ scale: 1.04 }] } : undefined}>
      {!authenticated ? (
        <AuthFlow onAuthenticated={() => setAuthenticated(true)} />
      ) : overlay ? (
        renderOverlay()
      ) : (
        <>
          {activeTab === 'home' ? (
            <HomeScreen
              onAction={handleHomeAction}
              onOpenProfile={() => setActiveTab('profile')}
            />
          ) : null}
          {activeTab === 'lessons' ? (
            <LessonsScreen
              onOpenLesson={(lesson) => setOverlay({ type: 'lesson', lesson })}
            />
          ) : null}
          {activeTab === 'missions' ? (
            <MissionsScreen
              onOpenMission={(mission) => setOverlay({ type: 'mission', mission })}
            />
          ) : null}
          {activeTab === 'community' ? (
            <CommunityScreen
              onOpenLeaderboard={() => setOverlay({ type: 'leaderboard' })}
            />
          ) : null}
          {activeTab === 'profile' ? (
            <ProfileScreen
              onSignOut={signOut}
              onOpenSettings={() => setOverlay({ type: 'settings' })}
              onOpenAnalytics={() => setOverlay({ type: 'analytics' })}
              onOpenRewards={() => setOverlay({ type: 'rewards' })}
              onOpenLeaderboard={() => setOverlay({ type: 'leaderboard' })}
            />
          ) : null}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

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
  if (!fontsReady) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SystemBars style={{ statusBar: 'dark', navigationBar: 'dark' }} />
      <GreenPathProvider>
        <MobileShell>
          <AppShell />
        </MobileShell>
      </GreenPathProvider>
    </SafeAreaProvider>
  );
}
