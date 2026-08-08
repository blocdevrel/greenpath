import { useCallback, useEffect, useState } from 'react';

import {
  isPaused,
  isSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  speak,
  stopSpeaking,
} from '@/shared/a11y/speech';
import { useGreenPath } from '@/shared/state/GreenPathContext';

/**
 * Text-to-speech helper that respects Settings → Text-to-Speech.
 * When Voice navigation is on, call `announce` on screen open for key pages.
 */
export function useTts() {
  const { prefs } = useGreenPath();
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  const refresh = useCallback(async () => {
    const [nowSpeaking, nowPaused] = await Promise.all([isSpeaking(), isPaused()]);
    setSpeaking(nowSpeaking);
    setPaused(nowPaused && !nowSpeaking);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      void refresh();
    }, 400);
    return () => {
      clearInterval(id);
    };
  }, [refresh]);

  const readAloud = useCallback(
    async (text: string, opts?: { force?: boolean }) => {
      if (!prefs.tts && !opts?.force) return;
      setPaused(false);
      setSpeaking(true);
      await speak(text, {
        onDone: () => {
          setSpeaking(false);
          setPaused(false);
        },
        onError: () => {
          setSpeaking(false);
          setPaused(false);
        },
        onPaused: () => {
          setSpeaking(false);
          setPaused(true);
        },
        onResumed: () => {
          setPaused(false);
          setSpeaking(true);
        },
      });
    },
    [prefs.tts],
  );

  const stop = useCallback(async () => {
    await stopSpeaking();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const pause = useCallback(async () => {
    await pauseSpeaking();
    setSpeaking(false);
    setPaused(true);
  }, []);

  const resume = useCallback(async () => {
    setPaused(false);
    setSpeaking(true);
    await resumeSpeaking();
  }, []);

  /** Play when idle, pause when speaking, resume when paused. */
  const playPause = useCallback(
    async (text: string, opts?: { force?: boolean }) => {
      if (!prefs.tts && !opts?.force) return;

      if (await isSpeaking()) {
        await pause();
        return;
      }
      if (await isPaused()) {
        await resume();
        return;
      }
      await readAloud(text, opts);
    },
    [prefs.tts, pause, readAloud, resume],
  );

  const toggle = useCallback(
    async (text: string, opts?: { force?: boolean }) => {
      await playPause(text, opts);
    },
    [playPause],
  );

  /** Auto-announce when Voice navigation is enabled (and TTS is on). */
  const announce = useCallback(
    async (text: string) => {
      if (!prefs.tts || !prefs.voiceNav) return;
      await readAloud(text);
    },
    [prefs.tts, prefs.voiceNav, readAloud],
  );

  return {
    ttsEnabled: prefs.tts,
    voiceNavEnabled: prefs.voiceNav,
    speaking,
    paused,
    readAloud,
    stop,
    pause,
    resume,
    playPause,
    toggle,
    announce,
  };
}
