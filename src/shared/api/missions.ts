import { apiFetch } from './client';
import type { AwardProgressResponse } from './progress';

export type MissionDto = {
  id: string;
  slug: string;
  title: string;
  description: string;
  impact: string;
  minutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  xp: number;
  illustration: string;
  coverKey: string;
  evidenceKey: string;
  checklist: string[];
  completed: boolean;
};

export function fetchMissions() {
  return apiFetch<MissionDto[]>('/missions');
}

export function fetchMission(id: string) {
  return apiFetch<MissionDto>(`/missions/${id}`);
}

export function completeMissionApi(
  id: string,
  body: { photoBase64?: string; badgeHint?: string },
) {
  return apiFetch<AwardProgressResponse>(`/missions/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type MissionVerifyResult = {
  verified: boolean;
  confidence: number;
  reason: string;
  checklistMatched: string[];
  model: string;
};

export function verifyMissionApi(id: string, body: { photoBase64: string }) {
  return apiFetch<MissionVerifyResult>(`/missions/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
