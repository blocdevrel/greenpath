import { apiFetch } from './client';

export type LeaderboardEntryDto = {
  rank: number;
  userId: string;
  name: string;
  shortName: string;
  initials: string;
  xp: number;
  region: string;
  avatarUrl: string | null;
  you: boolean;
  delta: number;
};

export type LeaderboardResponse = {
  scope: 'overall' | 'region';
  period: 'week' | 'all';
  region: string | null;
  entries: LeaderboardEntryDto[];
};

export type NotificationDto = {
  id: string;
  kind: string;
  title: string;
  body: string;
  refId: string | null;
  unread: boolean;
  createdAt: string;
};

export type NotificationsResponse = {
  unreadCount: number;
  items: NotificationDto[];
};

export function fetchLeaderboard(params?: {
  scope?: 'overall' | 'region';
  region?: string;
  period?: 'week' | 'all';
}) {
  const q = new URLSearchParams();
  if (params?.scope) q.set('scope', params.scope);
  if (params?.region) q.set('region', params.region);
  if (params?.period) q.set('period', params.period);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return apiFetch<LeaderboardResponse>(`/leaderboard${suffix}`);
}

export function fetchNotifications() {
  return apiFetch<NotificationsResponse>('/me/notifications');
}

export function markNotificationRead(id: string) {
  return apiFetch<NotificationsResponse>(`/me/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return apiFetch<NotificationsResponse>('/me/notifications/read-all', {
    method: 'POST',
  });
}
