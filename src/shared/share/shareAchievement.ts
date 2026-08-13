import { Platform, Share } from 'react-native';

import { env } from '@/shared/config/env';

const APP_TAG = 'GreenPath Ghana';
const WEB_URL = env.webUrl;

export type SharePayload = {
  title: string;
  message: string;
  url?: string;
};

export function inviteLinkForCode(code: string): string {
  const clean = code.trim().toUpperCase();
  // Path form works with Vercel SPA rewrite; ?ref= is also accepted on open.
  return `${WEB_URL}/join/${encodeURIComponent(clean)}`;
}

export function buildXpShare(xp: number, level: number): SharePayload {
  return {
    title: `${APP_TAG} — XP`,
    message: `I’ve earned ${xp.toLocaleString()} XP on ${APP_TAG} (Level ${level}). Learn → Act → Help the Planet.\n${WEB_URL}`,
    url: WEB_URL,
  };
}

export function buildStreakShare(streak: number): SharePayload {
  return {
    title: `${APP_TAG} — Streak`,
    message: `🔥 ${streak}-day climate action streak on ${APP_TAG}. Join me!\n${WEB_URL}`,
    url: WEB_URL,
  };
}

export function buildBadgeShare(badgeName: string): SharePayload {
  return {
    title: `${APP_TAG} — Badge`,
    message: `I unlocked the “${badgeName}” badge on ${APP_TAG}. Youth climate action in Ghana.\n${WEB_URL}`,
    url: WEB_URL,
  };
}

export function buildCelebrationShare(title: string, xp: number): SharePayload {
  return {
    title: `${APP_TAG} — ${title}`,
    message: `${title} (+${xp} XP) on ${APP_TAG}. Come climb the Ghana regional leaderboard with me!\n${WEB_URL}`,
    url: WEB_URL,
  };
}

export function buildReferralShare(code: string, _missionTitle?: string): SharePayload {
  const link = inviteLinkForCode(code);
  return {
    title: `${APP_TAG} — Invite a friend`,
    message: link,
    url: link,
  };
}

/** Opens the native share sheet (WhatsApp, etc.) or web share when available. */
export async function shareAchievement(payload: SharePayload): Promise<boolean> {
  try {
    const url = payload.url ?? WEB_URL;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: payload.title,
        text: payload.message,
        url,
      });
      return true;
    }

    const result = await Share.share(
      Platform.OS === 'ios'
        ? { title: payload.title, message: payload.message, url }
        : { message: `${payload.title}\n\n${payload.message}`, title: payload.title },
    );

    return result.action !== Share.dismissedAction;
  } catch {
    return false;
  }
}
