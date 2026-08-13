import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

import { speak, stopSpeaking } from '@/shared/a11y/speech';

type PlayInput = {
  reply: string;
  audioBase64?: string;
  audioMimeType?: string;
};

type PlayHandle = { stop: () => void };

function safeRemovePlayer(player: AudioPlayer | null) {
  if (!player) return;
  try {
    if (typeof player.pause === 'function') player.pause();
  } catch {
    /* ignore */
  }
  try {
    if (typeof player.remove === 'function') player.remove();
  } catch {
    /* ignore */
  }
}

/**
 * Play OpenRouter coach audio from base64 (device-safe).
 * Falls back to device TTS if audio cannot play.
 */
export async function playCoachAudio(
  input: PlayInput,
  onDone: () => void,
): Promise<PlayHandle> {
  let settled = false;
  let webEl: HTMLAudioElement | null = null;
  let player: AudioPlayer | null = null;
  let objectUrl: string | null = null;
  const timeouts: Array<ReturnType<typeof setTimeout>> = [];
  const intervals: Array<ReturnType<typeof setInterval>> = [];

  const clearTimers = () => {
    for (const t of timeouts) clearTimeout(t);
    for (const t of intervals) clearInterval(t);
  };

  const done = () => {
    if (settled) return;
    settled = true;
    clearTimers();
    onDone();
  };

  const stop = () => {
    settled = true;
    clearTimers();
    try {
      webEl?.pause();
    } catch {
      /* ignore */
    }
    webEl = null;
    safeRemovePlayer(player);
    player = null;
    if (objectUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        /* ignore */
      }
    }
    objectUrl = null;
    void stopSpeaking();
  };

  timeouts.push(setTimeout(done, 60_000));

  const mime = input.audioMimeType || 'audio/wav';
  const b64 = input.audioBase64?.replace(/^data:[^;]+;base64,/, '').trim();

  if (b64) {
    try {
      if (Platform.OS === 'web' && typeof Audio !== 'undefined') {
        const binary =
          typeof atob === 'function'
            ? atob(b64)
            : '';
        if (!binary) throw new Error('atob unavailable');
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mime });
        if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
          throw new Error('createObjectURL unavailable');
        }
        objectUrl = URL.createObjectURL(blob);
        webEl = new Audio(objectUrl);
        webEl.onended = () => done();
        webEl.onerror = () => {
          void speakFallback(input.reply, done);
        };
        try {
          await webEl.play();
        } catch {
          void speakFallback(input.reply, done);
        }
        return { stop };
      }

      player = createAudioPlayer({ uri: `data:${mime};base64,${b64}` });
      if (typeof player.play === 'function') player.play();
      const started = Date.now();
      intervals.push(
        setInterval(() => {
          if (settled || !player) return;
          if (!player.playing && player.currentTime > 0.1) {
            safeRemovePlayer(player);
            player = null;
            done();
          }
        }, 300),
      );
      timeouts.push(
        setTimeout(() => {
          if (settled || !player) return;
          if (!player.playing && player.currentTime < 0.05 && Date.now() - started >= 1800) {
            safeRemovePlayer(player);
            player = null;
            void speakFallback(input.reply, done);
          }
        }, 1800),
      );
      return { stop };
    } catch {
      /* TTS fallback */
    }
  }

  await speakFallback(input.reply, done);
  return { stop };
}

async function speakFallback(text: string, onDone: () => void) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    onDone();
    return;
  }
  try {
    await speak(cleaned, { onDone, onError: onDone });
  } catch {
    onDone();
  }
}
