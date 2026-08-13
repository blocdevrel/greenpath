import type { ImageSourcePropType } from 'react-native';

import type { CommunityEventDto } from '@/shared/api';
import type { IllustrationKind } from '@/shared/components/Illustration';
import { images } from '@/shared/media';

export type EventAttendee = {
  name: string;
  avatarUrl: string | null;
  photo?: ImageSourcePropType;
};

export type CommunityEventView = {
  id: string;
  slug?: string;
  title: string;
  description: string | null;
  location: string;
  date: string;
  time: string;
  startsAt?: string;
  participants: number;
  capacity: number;
  illustration: IllustrationKind;
  cover: ImageSourcePropType;
  joined: boolean;
  emailSent?: boolean;
  attendees: EventAttendee[];
};

const ILLUSTRATIONS: IllustrationKind[] = [
  'plastic',
  'community',
  'tree',
  'recycle',
  'water',
  'learn',
  'action',
];

export function toEventIllustration(kind: string): IllustrationKind {
  return (ILLUSTRATIONS.includes(kind as IllustrationKind) ? kind : 'community') as IllustrationKind;
}

const COVER_BY_KEY: Record<string, ImageSourcePropType> = {
  'ug-legon-campus-cleanup': images.eventUgLegon,
  'knust-visual-pollution-cleanup': images.eventKnust,
  'ug-botanical-tree-care': images.eventUgBotanical,
  'ashesi-zero-waste-audit': images.landingHero,
  'accra-night-market-drain-clear': images.eventUgHall,
  plastic: images.eventUgLegon,
  community: images.eventKnust,
  tree: images.eventUgBotanical,
  recycle: images.landingHero,
  water: images.eventUgHall,
};

export function eventCover(keys: Array<string | undefined | null>): ImageSourcePropType {
  for (const key of keys) {
    if (key && COVER_BY_KEY[key]) return COVER_BY_KEY[key];
  }
  return images.eventUgLegon;
}

export function eventFromDto(dto: CommunityEventDto): CommunityEventView {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: dto.description,
    location: dto.location,
    date: dto.date,
    time: dto.time,
    startsAt: dto.startsAt,
    participants: dto.participants,
    capacity: dto.capacity,
    illustration: toEventIllustration(dto.illustration),
    cover: eventCover([dto.slug, dto.id, dto.illustration]),
    joined: dto.joined,
    emailSent: dto.emailSent,
    attendees: dto.attendees.map((a) => ({
      name: a.name,
      avatarUrl: a.avatarUrl,
    })),
  };
}

export function eventsFromDtos(rows: CommunityEventDto[]): CommunityEventView[] {
  return rows.map(eventFromDto);
}

export function eventToDto(view: CommunityEventView): CommunityEventDto {
  return {
    id: view.id,
    slug: view.slug ?? view.id,
    title: view.title,
    description: view.description,
    location: view.location,
    startsAt: view.startsAt ?? '',
    date: view.date,
    time: view.time,
    participants: view.participants,
    capacity: view.capacity,
    illustration: view.illustration,
    joined: view.joined,
    attendees: view.attendees.map((a) => ({
      name: a.name,
      avatarUrl: a.avatarUrl ?? null,
    })),
  };
}
