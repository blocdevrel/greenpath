import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type RecordedClip = {
  base64: string;
  format: 'webm' | 'wav' | 'm4a' | 'mp4';
};

type WebRecorderState = {
  mediaRecorder: MediaRecorder;
  chunks: Blob[];
  stream: MediaStream;
};

let webState: WebRecorderState | null = null;
let nativeRecorder: {
  stop: () => Promise<void>;
  uri: string | null;
  isRecording: boolean;
} | null = null;

/** Resolves when startPushToTalk has finished opening the mic. */
let startGate: Promise<void> | null = null;
let startedAt = 0;

const B64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;
    out += B64[(triple >> 18) & 63];
    out += B64[(triple >> 12) & 63];
    out += i + 1 < bytes.length ? B64[(triple >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? B64[triple & 63] : '=';
  }
  return out;
}

async function blobToBase64(blob: Blob): Promise<string> {
  if (typeof blob.arrayBuffer === 'function') {
    const buf = await blob.arrayBuffer();
    return bytesToBase64(new Uint8Array(buf));
  }
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read audio'));
      reader.onloadend = () => {
        const result = String(reader.result || '');
        const comma = result.indexOf(',');
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.readAsDataURL(blob);
    });
  }
  throw new Error('Cannot encode audio on this device');
}

async function waitForStartGate() {
  if (startGate) {
    try {
      await startGate;
    } catch {
      /* start failed — stop will return null */
    }
  }
}

async function ensureMinMs(minMs: number) {
  const elapsed = Date.now() - startedAt;
  if (elapsed < minMs) {
    await new Promise((r) => setTimeout(r, minMs - elapsed));
  }
}

/**
 * Start mic capture for Lingua-style push-to-talk.
 */
export async function startPushToTalk(): Promise<void> {
  const run = (async () => {
    if (Platform.OS === 'web') {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone is not available in this browser.');
      }
      // Tear down any previous session.
      if (webState) {
        try {
          webState.mediaRecorder.stop();
        } catch {
          /* ignore */
        }
        webState.stream.getTracks().forEach((t) => t.stop());
        webState = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';
      const mediaRecorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      webState = { mediaRecorder, chunks, stream };
      // Timeslice so we always get chunks even on short taps.
      mediaRecorder.start(250);
      startedAt = Date.now();
      return;
    }

    const audio = await import('expo-audio');
    const AudioModule = audio.AudioModule;
    if (!AudioModule?.AudioRecorder) {
      throw new Error('Recording is not available in this build.');
    }

    const permission = await audio.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Microphone permission is required to talk.');
    }

    await audio.setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    if (nativeRecorder) {
      try {
        await nativeRecorder.stop();
      } catch {
        /* ignore */
      }
      nativeRecorder = null;
    }

    const recorder = new AudioModule.AudioRecorder(audio.RecordingPresets.HIGH_QUALITY);
    await recorder.prepareToRecordAsync();
    recorder.record();
    nativeRecorder = recorder;
    startedAt = Date.now();
  })();

  startGate = run;
  try {
    await run;
  } finally {
    if (startGate === run) startGate = null;
  }
}

/** Stop capture and return base64 + format for OpenRouter. */
export async function stopPushToTalk(): Promise<RecordedClip | null> {
  await waitForStartGate();
  // Give the recorder a moment so short taps still produce bytes.
  await ensureMinMs(600);

  if (Platform.OS === 'web') {
    const state = webState;
    webState = null;
    if (!state) return null;

    const blob = await new Promise<Blob>((resolve, reject) => {
      const finish = () => {
        resolve(
          new Blob(state.chunks, {
            type: state.mediaRecorder.mimeType || 'audio/webm',
          }),
        );
      };
      state.mediaRecorder.onstop = () => finish();
      state.mediaRecorder.onerror = () => reject(new Error('Recording failed'));
      try {
        if (state.mediaRecorder.state === 'recording') {
          try {
            state.mediaRecorder.requestData();
          } catch {
            /* some browsers */ 
          }
          state.mediaRecorder.stop();
        } else {
          finish();
        }
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Recording failed'));
      }
    });

    state.stream.getTracks().forEach((t) => t.stop());
    if (blob.size < 64) return null;
    const base64 = await blobToBase64(blob);
    const mime = (state.mediaRecorder.mimeType || '').toLowerCase();
    const format: RecordedClip['format'] = mime.includes('mp4') ? 'mp4' : 'webm';
    return { base64, format };
  }

  const recorder = nativeRecorder;
  nativeRecorder = null;
  if (!recorder) return null;

  try {
    await recorder.stop();
  } catch {
    /* still try to read uri */
  }

  // Native uri can lag one tick after stop().
  let uri = recorder.uri;
  for (let i = 0; i < 10 && !uri; i++) {
    await new Promise((r) => setTimeout(r, 60));
    uri = recorder.uri;
  }
  if (!uri) return null;

  // Reliable on Android/iOS — fetch(fileUri) often returns empty clips in Expo Go.
  const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
  if (!base64 || base64.length < 64) return null;

  const lower = uri.toLowerCase();
  const format: RecordedClip['format'] = lower.endsWith('.wav')
    ? 'wav'
    : lower.endsWith('.m4a')
      ? 'm4a'
      : lower.endsWith('.mp4')
        ? 'mp4'
        : 'm4a';
  return { base64, format };
}

export async function cancelPushToTalk(): Promise<void> {
  await waitForStartGate();
  if (Platform.OS === 'web') {
    const state = webState;
    webState = null;
    if (!state) return;
    try {
      if (state.mediaRecorder.state !== 'inactive') state.mediaRecorder.stop();
    } catch {
      /* ignore */
    }
    state.stream.getTracks().forEach((t) => t.stop());
    return;
  }

  const recorder = nativeRecorder;
  nativeRecorder = null;
  if (!recorder) return;
  try {
    await recorder.stop();
  } catch {
    /* ignore */
  }
}

/** True once the mic session is live. */
export function isPushToTalkArmed(): boolean {
  return Boolean(webState || nativeRecorder);
}
