import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_ONBOARDING_KEY = 'greenpath.authOnboarding.v1';
const PENDING_SIGNUP_INTERESTS_KEY = 'greenpath.pendingSignupInterests.v1';

/** In-memory mirror — survives AuthFlow remounts before AsyncStorage write finishes. */
let seenMemory = false;
/** True only after Create account / signup verify — never after Sign in. */
let pendingSignupInterestsMemory = false;

/** True after the user finishes or skips the pre-auth onboarding carousel once. */
export async function readAuthOnboardingSeen(): Promise<boolean> {
  if (seenMemory) return true;
  try {
    const raw = await AsyncStorage.getItem(AUTH_ONBOARDING_KEY);
    seenMemory = raw === '1';
    return seenMemory;
  } catch {
    return false;
  }
}

export async function writeAuthOnboardingSeen(): Promise<void> {
  seenMemory = true;
  try {
    await AsyncStorage.setItem(AUTH_ONBOARDING_KEY, '1');
  } catch {
    // ignore — memory flag still prevents repeat in this session
  }
}

/** Splash finished this session but carousel not yet completed (Clerk remount guard). */
let splashFinishedMemory = false;

export function readSplashFinishedThisSession(): boolean {
  return splashFinishedMemory;
}

export function markSplashFinishedThisSession(): void {
  splashFinishedMemory = true;
}

/** Call right before a successful signup session becomes active. */
export async function markPendingSignupInterests(): Promise<void> {
  pendingSignupInterestsMemory = true;
  try {
    await AsyncStorage.setItem(PENDING_SIGNUP_INTERESTS_KEY, '1');
  } catch {
    // memory flag is enough for this session
  }
}

/** Call on every successful sign-in so interests never appear for returning users. */
export async function clearPendingSignupInterests(): Promise<void> {
  pendingSignupInterestsMemory = false;
  try {
    await AsyncStorage.removeItem(PENDING_SIGNUP_INTERESTS_KEY);
  } catch {
    // ignore
  }
}

export async function readPendingSignupInterests(): Promise<boolean> {
  if (pendingSignupInterestsMemory) return true;
  try {
    const raw = await AsyncStorage.getItem(PENDING_SIGNUP_INTERESTS_KEY);
    pendingSignupInterestsMemory = raw === '1';
    return pendingSignupInterestsMemory;
  } catch {
    return false;
  }
}

export function readPendingSignupInterestsSync(): boolean {
  return pendingSignupInterestsMemory;
}
