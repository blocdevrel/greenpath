import {
  GHANA_REGIONS,
  userProfile as seedProfile,
  type GhanaRegion,
  type UserProfile,
} from '@/shared/data/greenpathData';
import { images } from '@/shared/media';

import type { MePreferences, MeResponse } from './types';

/** Pref shape used by the UI (subset mirrored to Nest). */
export type ClientPrefs = {
  largeFonts: boolean;
  highContrast: boolean;
  darkMode: boolean;
  tts: boolean;
  stt: boolean;
  voiceNav: boolean;
  notifications: boolean;
  dailyReminders: boolean;
  emailNotifications: boolean;
  emailLeaderboard: boolean;
};

export function prefsFromServer(
  server: MePreferences | null | undefined,
  fallback: ClientPrefs,
): ClientPrefs {
  if (!server) return fallback;
  return {
    largeFonts: server.largeFonts,
    highContrast: server.highContrast,
    darkMode: server.darkMode,
    tts: server.tts,
    stt: server.stt,
    voiceNav: server.voiceNav,
    notifications: server.notificationsEnabled,
    emailNotifications: server.emailDigest,
    dailyReminders: fallback.dailyReminders,
    emailLeaderboard: fallback.emailLeaderboard,
  };
}

export function prefsToServerPatch(
  patch: Partial<ClientPrefs>,
): Record<string, boolean | string> {
  const body: Record<string, boolean | string> = {};
  if (patch.largeFonts !== undefined) body.largeFonts = patch.largeFonts;
  if (patch.highContrast !== undefined) body.highContrast = patch.highContrast;
  if (patch.darkMode !== undefined) body.darkMode = patch.darkMode;
  if (patch.tts !== undefined) body.tts = patch.tts;
  if (patch.stt !== undefined) body.stt = patch.stt;
  if (patch.voiceNav !== undefined) body.voiceNav = patch.voiceNav;
  if (patch.notifications !== undefined) {
    body.notificationsEnabled = patch.notifications;
  }
  if (patch.emailNotifications !== undefined) {
    body.emailDigest = patch.emailNotifications;
  }
  return body;
}

function regionFromCity(city: string | null | undefined): GhanaRegion | undefined {
  if (!city) return undefined;
  return GHANA_REGIONS.find((r) => r.toLowerCase() === city.trim().toLowerCase());
}

function looksLikeSeedProfile(profile: UserProfile) {
  return (
    profile.email === seedProfile.email ||
    profile.fullName === seedProfile.fullName ||
    profile.referralCode === seedProfile.referralCode
  );
}

function referralFromMe(me: MeResponse): string {
  const raw = (me.id || me.clerkId || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  const tail = (raw.slice(-6) || 'GREEN').padStart(6, '0');
  return `GP${tail}`;
}

/** True for auto color-initial / placeholder avatars — prefer a real photo instead. */
export function isGeneratedAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  const u = url.toLowerCase();
  // Do NOT treat img.clerk.com as generated — real uploaded photos also live there.
  // Callers should pass hasImage=false from Clerk when the user has no custom photo.
  return (
    u.includes('ui-avatars.com') ||
    u.includes('dicebear.com') ||
    (u.includes('gravatar.com/avatar') && u.includes('d=identicon'))
  );
}

/** Image source for profile / home avatar (real photo → bundled default). */
export function profileAvatarSource(profile: Pick<UserProfile, 'avatar' | 'avatarUrl'>) {
  if (profile.avatarUrl && !isGeneratedAvatarUrl(profile.avatarUrl)) {
    return { uri: profile.avatarUrl };
  }
  if (profile.avatar != null) return profile.avatar;
  return images.avatarIsaac;
}

export function profileFromMe(
  me: MeResponse,
  previous: UserProfile = seedProfile,
): UserProfile {
  const fromSeed = looksLikeSeedProfile(previous);
  const display =
    me.displayName?.trim() ||
    (!fromSeed ? previous.fullName.trim() : '') ||
    me.email?.split('@')[0] ||
    'GreenPath Youth';
  const first = display.split(/\s+/).filter(Boolean)[0] || 'Youth';
  const region = regionFromCity(me.city) ?? (fromSeed ? undefined : previous.region);
  const nestUrl = me.avatarUrl?.trim() || null;
  const avatarUrl =
    nestUrl && !isGeneratedAvatarUrl(nestUrl)
      ? nestUrl
      : !fromSeed && previous.avatarUrl && !isGeneratedAvatarUrl(previous.avatarUrl)
        ? previous.avatarUrl
        : null;

  return {
    ...previous,
    name: first,
    fullName: display,
    email: me.email ?? (!fromSeed ? previous.email : '') ?? '',
    bio: me.bio ?? (!fromSeed ? previous.bio : '') ?? '',
    avatarUrl,
    avatar: avatarUrl ? undefined : previous.avatar ?? images.avatarIsaac,
    xp: me.xp,
    totalXp: me.totalXp ?? previous.totalXp ?? me.xp,
    level: me.level,
    xpToNext: me.xpToNext,
    streak: me.streak,
    carbonSavedKg: me.carbonSavedKg,
    region: region ?? previous.region,
    referralCode: referralFromMe(me) || previous.referralCode,
    lessonsCompleted: me.lessonsCompleted ?? (fromSeed ? 0 : previous.lessonsCompleted),
    missionsCompleted:
      me.missionsCompleted ?? (fromSeed ? 0 : previous.missionsCompleted),
    badgesUnlocked: me.badgesUnlocked ?? (fromSeed ? 0 : previous.badgesUnlocked),
    showOnLeaderboard: me.showOnLeaderboard,
  };
}

/** Merge Clerk session identity into the local profile (before/after /me). */
export function mergeClerkIdentity(
  previous: UserProfile,
  identity: {
    fullName?: string | null;
    email?: string | null;
    imageUrl?: string | null;
    /** When false, Clerk imageUrl is initials-only art — ignore it. */
    hasImage?: boolean | null;
  },
): UserProfile {
  const fromSeed = looksLikeSeedProfile(previous);
  const clerkName = identity.fullName?.trim() || '';
  const display =
    clerkName ||
    (!fromSeed ? previous.fullName : '') ||
    identity.email?.split('@')[0] ||
    previous.fullName ||
    'GreenPath Youth';
  const first = display.split(/\s+/).filter(Boolean)[0] || previous.name;
  const rawImage = identity.imageUrl?.trim() || null;
  const clerkPhotoOk = identity.hasImage !== false && rawImage && !isGeneratedAvatarUrl(rawImage);
  const avatarUrl = clerkPhotoOk
    ? rawImage
    : previous.avatarUrl && !isGeneratedAvatarUrl(previous.avatarUrl)
      ? previous.avatarUrl
      : null;

  return {
    ...previous,
    name: first,
    fullName: display,
    email: identity.email?.trim() || previous.email,
    avatarUrl,
    avatar: avatarUrl ? undefined : previous.avatar ?? images.avatarIsaac,
    ...(fromSeed
      ? {
          lessonsCompleted: 0,
          missionsCompleted: 0,
          badgesUnlocked: 0,
          xp: previous.email === seedProfile.email ? 0 : previous.xp,
          totalXp: previous.email === seedProfile.email ? 0 : previous.totalXp,
          level: previous.email === seedProfile.email ? 1 : previous.level,
          xpToNext: previous.email === seedProfile.email ? 100 : previous.xpToNext,
          streak: previous.email === seedProfile.email ? 0 : previous.streak,
          carbonSavedKg:
            previous.email === seedProfile.email ? 0 : previous.carbonSavedKg,
        }
      : {}),
  };
}
