export { ApiError, apiFetch, joinUrl, setApiTokenGetter } from './client';
export {
  fetchHealth,
  fetchMe,
  fetchPreferences,
  patchInterests,
  patchMe,
  patchPreferences,
} from './me';
export {
  awardProgress,
  fetchActivity,
  fetchBadges,
  fetchCompletions,
  fetchWeeklyProgress,
} from './progress';
export type {
  ActivityItem,
  AwardProgressBody,
  AwardProgressResponse,
  BadgeItem,
  BadgeVisual,
  Completions,
  WeeklyDay,
  WeeklyProgress,
} from './progress';
export { fetchEvent, fetchEvents, joinEvent, leaveEvent } from './events';
export type { CommunityEventDto } from './events';
export { fetchCourse, fetchCourses } from './courses';
export type { CourseDto, CourseInstructorDto, CourseVideoDto } from './courses';
export { completeMissionApi, fetchMission, fetchMissions, verifyMissionApi } from './missions';
export type { MissionDto, MissionVerifyResult } from './missions';
export { createReport, fetchReports, voteOnReportApi } from './reports';
export type { CommunityReportDto, CreateReportBody, CreateReportResponse } from './reports';
export {
  fetchLeaderboard,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './social';
export type {
  LeaderboardEntryDto,
  LeaderboardResponse,
  NotificationDto,
  NotificationsResponse,
} from './social';
export { voiceChatApi } from './voice';
export type { VoiceChatResult } from './voice';
export { learnCoachChatApi } from './learnCoach';
export type { LearnCoachChatResult, LearnCoachHistoryMessage } from './learnCoach';
export { prefsFromServer, prefsToServerPatch, profileFromMe, profileAvatarSource, mergeClerkIdentity, isGeneratedAvatarUrl } from './mappers';
export type { ClientPrefs } from './mappers';
export type {
  MePreferences,
  MeResponse,
  UpdateMeBody,
  UpdatePreferencesBody,
} from './types';
