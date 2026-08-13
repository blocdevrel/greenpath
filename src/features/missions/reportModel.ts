import type { ImageSourcePropType } from 'react-native';

import { lessonCover } from '@/features/lessons/lessonModel';
import type { CommunityReportDto } from '@/shared/api';
import { isGeneratedAvatarUrl, joinUrl } from '@/shared/api';
import { env } from '@/shared/config/env';
import type { CommunityReport, CommunityReportKind } from '@/shared/data/greenpathData';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import { images } from '@/shared/media';

const KINDS: CommunityReportKind[] = ['trash', 'blocked-drain', 'dumping', 'other'];

const AVATAR_BY_KEY: Record<string, ImageSourcePropType> = {
  avatar1: images.avatar1,
  avatar2: images.avatar2,
  avatar3: images.avatar3,
  avatar4: images.avatar4,
  isaac: images.avatarIsaac,
};

export function reportCover(coverKey: string | null | undefined): ImageSourcePropType {
  if (!coverKey) return images.lessonWaste;
  return lessonCover(coverKey);
}

export function reportAvatar(key: string | null | undefined): ImageSourcePropType {
  if (!key) return images.avatarIsaac;
  return AVATAR_BY_KEY[key] ?? images.avatarIsaac;
}

export function reportPhotoUri(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  if (!env.apiUrl) return null;
  return joinUrl(env.apiUrl, photoUrl);
}

export function reportFromDto(dto: CommunityReportDto): CommunityReport {
  const kind = KINDS.includes(dto.kind as CommunityReportKind)
    ? (dto.kind as CommunityReportKind)
    : 'trash';
  const remotePhoto = dto.hasPhoto ? reportPhotoUri(dto.photoUrl) : null;
  // Real Clerk uploads live on img.clerk.com — only skip generated placeholders.
  const remoteAvatar =
    dto.authorAvatarUrl && !isGeneratedAvatarUrl(dto.authorAvatarUrl)
      ? dto.authorAvatarUrl
      : null;

  return {
    id: dto.id,
    kind,
    title: dto.title,
    caption: dto.caption,
    location: dto.location,
    latitude: dto.latitude,
    longitude: dto.longitude,
    distance: dto.distance ?? '',
    timeAgo: formatRelativeTime(dto.createdAt),
    upvotes: dto.upvotes,
    downvotes: dto.downvotes,
    author: dto.author,
    authorAvatar: remoteAvatar ? { uri: remoteAvatar } : reportAvatar(dto.authorAvatarKey),
    photo: remotePhoto ? { uri: remotePhoto } : reportCover(dto.coverKey),
    you: dto.you,
    myVote: dto.myVote ?? undefined,
    createdAt: dto.createdAt,
  };
}

export function reportsFromDtos(dtos: CommunityReportDto[]): CommunityReport[] {
  return dtos.map(reportFromDto);
}
