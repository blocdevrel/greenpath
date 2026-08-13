import { apiFetch } from './client';
import type {
  MePreferences,
  MeResponse,
  UpdateMeBody,
  UpdatePreferencesBody,
} from './types';

export function fetchMe() {
  return apiFetch<MeResponse>('/me');
}

export function patchMe(body: UpdateMeBody) {
  return apiFetch<MeResponse>('/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function patchInterests(topics: string[]) {
  return apiFetch<MeResponse>('/me/interests', {
    method: 'PATCH',
    body: JSON.stringify({ topics }),
  });
}

export function fetchPreferences() {
  return apiFetch<MePreferences>('/me/preferences');
}

export function patchPreferences(body: UpdatePreferencesBody) {
  return apiFetch<MePreferences>('/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function fetchHealth() {
  return apiFetch<{
    status: string;
    service: string;
    database: string;
  }>('/health');
}
