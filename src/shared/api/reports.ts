import { apiFetch } from './client';
import type { AwardProgressResponse } from './progress';

export type CommunityReportDto = {
  id: string;
  kind: 'trash' | 'blocked-drain' | 'dumping' | string;
  title: string;
  caption: string;
  location: string;
  latitude: number;
  longitude: number;
  coverKey: string | null;
  hasPhoto: boolean;
  photoUrl: string | null;
  upvotes: number;
  downvotes: number;
  myVote: 'up' | 'down' | null;
  author: string;
  authorAvatarUrl: string | null;
  authorAvatarKey: string | null;
  you: boolean;
  createdAt: string;
  distance: string | null;
};

export type CreateReportBody = {
  kind: 'trash' | 'blocked-drain' | 'dumping' | 'other';
  title: string;
  caption: string;
  location: string;
  latitude: number;
  longitude: number;
  photoBase64: string;
};

export type CreateReportResponse = AwardProgressResponse & {
  report: CommunityReportDto;
};

export function fetchReports(origin?: { lat: number; lng: number }) {
  const q =
    origin != null
      ? `?lat=${encodeURIComponent(String(origin.lat))}&lng=${encodeURIComponent(String(origin.lng))}`
      : '';
  return apiFetch<CommunityReportDto[]>(`/reports${q}`);
}

export function createReport(body: CreateReportBody) {
  return apiFetch<CreateReportResponse>('/reports', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function voteOnReportApi(id: string, vote: 'up' | 'down') {
  return apiFetch<CommunityReportDto>(`/reports/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ vote }),
  });
}
