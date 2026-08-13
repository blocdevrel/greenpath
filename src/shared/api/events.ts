import { apiFetch } from './client';

export type CommunityEventDto = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  location: string;
  startsAt: string;
  date: string;
  time: string;
  participants: number;
  capacity: number;
  illustration: string;
  joined: boolean;
  /** Always true from API — join triggers confirmation + ongoing reminder emails. */
  emailReminders?: boolean;
  /** Present on POST /events/:id/join when a confirmation email was sent. */
  emailSent?: boolean;
  attendees: { name: string; avatarUrl: string | null }[];
};

export function fetchEvents() {
  return apiFetch<CommunityEventDto[]>('/events');
}

export function fetchEvent(eventId: string) {
  return apiFetch<CommunityEventDto>(`/events/${eventId}`);
}

export function joinEvent(eventId: string) {
  return apiFetch<CommunityEventDto>(`/events/${eventId}/join`, {
    method: 'POST',
  });
}

export function leaveEvent(eventId: string) {
  return apiFetch<CommunityEventDto>(`/events/${eventId}/join`, {
    method: 'DELETE',
  });
}
