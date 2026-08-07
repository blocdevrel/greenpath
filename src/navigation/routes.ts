/**
 * Central route names for GreenPath Ghana.
 */
export const routes = {
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  SIGN_IN: 'SignIn',
  SIGN_UP: 'SignUp',
  INTERESTS: 'Interests',
  HOME: 'Home',
  LESSONS: 'Lessons',
  LESSON_DETAIL: 'LessonDetail',
  QUIZ: 'Quiz',
  QUIZ_RESULTS: 'QuizResults',
  MISSIONS: 'Missions',
  MISSION_DETAIL: 'MissionDetail',
  VERIFY: 'AiVerification',
  VOICE: 'VoiceAssistant',
  REWARDS: 'Rewards',
  LEADERBOARD: 'Leaderboard',
  COMMUNITY: 'Community',
  PROFILE: 'Profile',
  NOTIFICATIONS: 'Notifications',
  ANALYTICS: 'Analytics',
  SETTINGS: 'Settings',
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
