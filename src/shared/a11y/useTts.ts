import { useCallback, useEffect, useState } from 'react';

import { isSpeaking, speak, stopSpeaking } from '@/shared/a11y/speech';
import { useGreenPath } from '@/shared/state/GreenPathContext';

/**
 * Text-to-speech helper that respects Settings → Text-to-Speech.
 * When Voice navigation is on, call `announce` on screen open for key pages.
 */
export function useTts() {
  const { prefs } = useGreenPath();
  const [speaking, setSpeaking] = useState(false);

  const refresh = useCallback(async () => {
    setSpeaking(await isSpeaking());
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      void refresh();
    }, 400);
    return () => {
      clearInterval(id);
      void stopSpeaking();
    };
  }, [refresh]);

  const readAloud = useCallback(
    async (text: string, opts?: { force?: boolean }) => {
      if (!prefs.tts && !opts?.force) return;
      setSpeaking(true);
      await speak(text, {
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    },
    [prefs.tts],
  );

  const stop = useCallback(async () => {
    await stopSpeaking();
    setSpeaking(false);
  }, []);

  const toggle = useCallback(
    async (text: string, opts?: { force?: boolean }) => {
      if (!prefs.tts && !opts?.force) return;
      if (await isSpeaking()) {
        await stop();
        return;
      }
      await readAloud(text, opts);
    },
    [prefs.tts, readAloud, stop],
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
    readAloud,
    stop,
    toggle,
    announce,
  };
}
