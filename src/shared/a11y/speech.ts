import { Platform } from 'react-native';

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  language?: string;
  onDone?: () => void;
  onError?: () => void;
  onPaused?: () => void;
  onResumed?: () => void;
};

let webUtterance: SpeechSynthesisUtterance | null = null;
let lastText = '';
let lastOptions: SpeakOptions = {};
/** Soft-paused (Android / stop-based pause): speech stopped but can resume same text. */
let softPaused = false;

function speakWeb(text: string, options: SpeakOptions = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    options.onError?.();
    return;
  }

  window.speechSynthesis.cancel();
  softPaused = false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1;
  utterance.lang = options.language ?? 'en-GH';
  utterance.onend = () => {
    webUtterance = null;
    softPaused = false;
    options.onDone?.();
  };
  utterance.onerror = () => {
    webUtterance = null;
    softPaused = false;
    options.onError?.();
  };
  webUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopWeb() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  webUtterance = null;
}

/**
 * Cross-platform text-to-speech for accessibility.
 * Web uses SpeechSynthesis; native uses expo-speech when available.
 */
export async function speak(text: string, options: SpeakOptions = {}) {
  const cleaned = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return;

  lastText = cleaned;
  lastOptions = options;
  softPaused = false;

  if (Platform.OS === 'web') {
    speakWeb(cleaned, options);
    return;
  }

  try {
    const Speech = await import('expo-speech');
    await Speech.stop();
    Speech.speak(cleaned, {
      language: options.language ?? 'en-GH',
      rate: options.rate ?? 0.95,
      pitch: options.pitch ?? 1,
      onDone: () => {
        softPaused = false;
        options.onDone?.();
      },
      onError: () => {
        softPaused = false;
        options.onError?.();
      },
      onStopped: () => {
        // stop during soft-pause is intentional — don't treat as error
      },
    });
  } catch {
    speakWeb(cleaned, options);
  }
}

export async function stopSpeaking() {
  softPaused = false;
  if (Platform.OS === 'web') {
    stopWeb();
    return;
  }

  try {
    const Speech = await import('expo-speech');
    await Speech.stop();
  } catch {
    stopWeb();
  }
}

/** Pause current speech. On Android, stops and keeps text ready to resume. */
export async function pauseSpeaking() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      softPaused = true;
      lastOptions.onPaused?.();
    }
    return;
  }

  try {
    const Speech = await import('expo-speech');
    const speaking = await Speech.isSpeakingAsync();
    if (!speaking) return;

    // Native pause works on iOS / web; Android has no pause API.
    if (Platform.OS === 'ios') {
      await Speech.pause();
      softPaused = true;
      lastOptions.onPaused?.();
      return;
    }

    softPaused = true;
    await Speech.stop();
    lastOptions.onPaused?.();
  } catch {
    if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      softPaused = true;
      lastOptions.onPaused?.();
    }
  }
}

/** Resume paused speech, or replay the last text if soft-paused (Android). */
export async function resumeSpeaking() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      softPaused = false;
      lastOptions.onResumed?.();
      return;
    }
    if (softPaused && lastText) {
      await speak(lastText, lastOptions);
      lastOptions.onResumed?.();
    }
    return;
  }

  try {
    const Speech = await import('expo-speech');
    if (Platform.OS === 'ios') {
      await Speech.resume();
      softPaused = false;
      lastOptions.onResumed?.();
      return;
    }

    // Android: replay last utterance
    if (softPaused && lastText) {
      softPaused = false;
      lastOptions.onResumed?.();
      await speak(lastText, lastOptions);
    }
  } catch {
    if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      softPaused = false;
      lastOptions.onResumed?.();
    } else if (softPaused && lastText) {
      await speak(lastText, lastOptions);
    }
  }
}

export async function isSpeaking(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && !!window.speechSynthesis?.speaking;
  }

  try {
    const Speech = await import('expo-speech');
    return Speech.isSpeakingAsync();
  } catch {
    return typeof window !== 'undefined' && !!window.speechSynthesis?.speaking;
  }
}

export async function isPaused(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return (
      softPaused ||
      (typeof window !== 'undefined' && !!window.speechSynthesis?.paused)
    );
  }
  return softPaused;
}

/** True when speech is active or soft-paused (toggle target). */
export async function isActive(): Promise<boolean> {
  return (await isSpeaking()) || (await isPaused());
}
