/** Accra calendar helpers — keep in sync with greenserver gamification.service. */

const ACCRA = 'Africa/Accra';

export function accraDateKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ACCRA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function addDaysKey(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + days)).toISOString().slice(0, 10);
}

/** Bump streak only when this is the first qualifying action on a new Accra day. */
export function bumpStreakForActivity(
  streak: number,
  lastStreakDay: string | null | undefined,
  now = new Date(),
): { streak: number; lastStreakDay: string } {
  const today = accraDateKey(now);
  if (lastStreakDay === today) {
    return { streak: Math.max(streak, 0), lastStreakDay: today };
  }
  if (lastStreakDay === addDaysKey(today, -1)) {
    return { streak: Math.max(streak, 0) + 1, lastStreakDay: today };
  }
  return { streak: 1, lastStreakDay: today };
}

export function dayKeyFromIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return accraDateKey(d);
}
