import { Platform } from 'react-native';

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  language?: string;
  onDone?: () => void;
  onError?: () => void;
};

let webUtterance: SpeechSynthesisUtterance | null = null;

function speakWeb(text: string, options: SpeakOptions = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    options.onError?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1;
  utterance.lang = options.language ?? 'en-GH';
  utterance.onend = () => {
    webUtterance = null;
    options.onDone?.();
  };
  utterance.onerror = () => {
    webUtterance = null;
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
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return;

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
      onDone: options.onDone,
      onError: options.onError,
    });
  } catch {
    // Fallback if native module missing (e.g. web export edge cases)
    speakWeb(cleaned, options);
  }
}

export async function stopSpeaking() {
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

export async function isSpeaking(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && !!window.speechSynthesis?.speaking;
  }

  try {
    const Speech = await import('expo-speech');
    return Speech.isSpeakingAsync();
  } catch {
    return false;
  }
}
