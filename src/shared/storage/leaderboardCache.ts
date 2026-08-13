import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LeaderboardEntryDto, LeaderboardResponse } from '@/shared/api';

const STORAGE_KEY = 'greenpath.leaderboard.v1';
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes — still serve stale while refreshing

type CacheKey = string;

type Bucket = {
  savedAt: number;
  response: LeaderboardResponse;
};

type Store = Record<CacheKey, Bucket>;

const memory: Store = {};

export function leaderboardCacheKey(
  scope: string,
  period: string,
  region?: string | null,
): CacheKey {
  return `${scope}|${period}|${region?.trim() || ''}`;
}

function isEntry(value: unknown): value is LeaderboardEntryDto {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.rank === 'number' &&
    typeof row.userId === 'string' &&
    typeof row.name === 'string' &&
    typeof row.xp === 'number'
  );
}

function isResponse(value: unknown): value is LeaderboardResponse {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return Array.isArray(row.entries) && row.entries.every(isEntry);
}

async function readStore(): Promise<Store> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...memory };
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return { ...memory };
    const next: Store = { ...memory };
    for (const [key, bucket] of Object.entries(parsed as Store)) {
      if (
        bucket &&
        typeof bucket.savedAt === 'number' &&
        isResponse(bucket.response)
      ) {
        next[key] = bucket;
        memory[key] = bucket;
      }
    }
    return next;
  } catch {
    return { ...memory };
  }
}

async function writeStore(store: Store): Promise<void> {
  Object.assign(memory, store);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* private mode / full */
  }
}

export async function readLeaderboardCache(
  key: CacheKey,
): Promise<{ response: LeaderboardResponse; stale: boolean } | null> {
  if (memory[key]) {
    const age = Date.now() - memory[key]!.savedAt;
    return { response: memory[key]!.response, stale: age > MAX_AGE_MS };
  }
  const store = await readStore();
  const bucket = store[key];
  if (!bucket) return null;
  const age = Date.now() - bucket.savedAt;
  return { response: bucket.response, stale: age > MAX_AGE_MS };
}

export async function writeLeaderboardCache(
  key: CacheKey,
  response: LeaderboardResponse,
): Promise<void> {
  const store = await readStore();
  store[key] = { savedAt: Date.now(), response };
  // Keep the map small — last 12 filter combos
  const keys = Object.keys(store).sort(
    (a, b) => (store[b]?.savedAt ?? 0) - (store[a]?.savedAt ?? 0),
  );
  for (const extra of keys.slice(12)) delete store[extra];
  await writeStore(store);
}
