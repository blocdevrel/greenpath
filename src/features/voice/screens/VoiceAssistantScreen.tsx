import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, voiceChatApi } from '@/shared/api';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors, fontFamily } from '@/shared/theme/tokens';

import { playCoachAudio } from '../playCoachAudio';
import {
  cancelPushToTalk,
  startPushToTalk,
  stopPushToTalk,
} from '../recordPushToTalk';

type Turn = { id: string; role: 'user' | 'assistant'; text: string };
type Phase = 'greeting' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';

/** Push-to-talk coach via OpenRouter gpt-audio (tap to talk / tap to send). */
export function VoiceAssistantScreen({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { profile } = useGreenPath();
  const userName = profile.name.split(' ')[0] || profile.name || 'Youth';

  const [turns, setTurns] = useState<Turn[]>([]);
  const [phase, setPhase] = useState<Phase>('greeting');
  const [error, setError] = useState<string | null>(null);
  const playStopRef = useRef<(() => void) | null>(null);
  const greeted = useRef(false);
  const busyRef = useRef(false);
  const recordingRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const phaseRef = useRef<Phase>('greeting');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const stopAudio = useCallback(() => {
    playStopRef.current?.();
    playStopRef.current = null;
  }, []);

  const playReply = useCallback(
    async (res: {
      reply: string;
      audioBase64?: string;
      audioMimeType?: string;
    }) => {
      stopAudio();
      setPhase('speaking');
      const handle = await playCoachAudio(
        {
          reply: res.reply,
          audioBase64: res.audioBase64,
          audioMimeType: res.audioMimeType,
        },
        () => {
          if (phaseRef.current === 'speaking') setPhase('ready');
        },
      );
      playStopRef.current = handle.stop;
    },
    [stopAudio],
  );

  const sendTurn = useCallback(
    async (body: {
      message?: string;
      audioBase64?: string;
      audioFormat?: 'wav' | 'mp3' | 'webm' | 'm4a' | 'ogg' | 'mp4';
      hideUser?: boolean;
    }) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setPhase('thinking');
      setError(null);

      try {
        const res = await voiceChatApi({
          message: body.message,
          audioBase64: body.audioBase64,
          audioFormat: body.audioFormat,
        });

        if (!body.hideUser) {
          const heard = res.userTranscript?.trim();
          if (heard) {
            setTurns((t) => [
              ...t,
              { id: `u-${Date.now()}`, role: 'user', text: heard },
            ]);
          } else if (body.audioBase64) {
            setTurns((t) => [
              ...t,
              { id: `u-${Date.now()}`, role: 'user', text: '(voice message)' },
            ]);
          }
        }

        setTurns((t) => [
          ...t,
          { id: `a-${Date.now()}`, role: 'assistant', text: res.reply },
        ]);
        await playReply(res);
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Voice coach unavailable';
        setError(msg);
        setPhase('error');
      } finally {
        busyRef.current = false;
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      }
    },
    [playReply],
  );

  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    void sendTurn({
      hideUser: true,
      message: `Hi GreenPath AI — my name is ${userName}. Greet me briefly and ask one climate question about Ghana.`,
    });
    return () => {
      stopAudio();
      void cancelPushToTalk();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- greet once
  }, []);

  const startRecording = async () => {
    if (busyRef.current || recordingRef.current) return;
    if (phase === 'thinking' || phase === 'greeting') return;

    stopAudio();
    setError(null);
    recordingRef.current = true;
    setPhase('listening');
    try {
      await startPushToTalk();
    } catch (e) {
      recordingRef.current = false;
      setPhase('error');
      setError(e instanceof Error ? e.message : 'Could not open microphone');
    }
  };

  const stopRecordingAndSend = async () => {
    if (!recordingRef.current) return;
    // Keep recordingRef true until stop finishes so double-taps don't re-enter start.
    setPhase('thinking');
    try {
      const clip = await stopPushToTalk();
      recordingRef.current = false;
      if (!clip) {
        setPhase('ready');
        setError('No speech captured — tap mic, speak for a second, then tap again.');
        return;
      }
      await sendTurn({
        audioBase64: clip.base64,
        audioFormat: clip.format,
      });
    } catch (e) {
      recordingRef.current = false;
      setPhase('error');
      setError(e instanceof Error ? e.message : 'Recording failed');
    }
  };

  /** Tap to talk / tap to send — more reliable than hold on mobile + web. */
  const onMicPress = () => {
    if (phase === 'listening') {
      void stopRecordingAndSend();
      return;
    }
    if (phase === 'speaking') {
      stopAudio();
      setPhase('ready');
      void startRecording();
      return;
    }
    if (phase === 'ready' || phase === 'error') {
      void startRecording();
    }
  };

  const close = () => {
    stopAudio();
    void cancelPushToTalk();
    onClose();
  };

  const micActive = phase === 'listening';
  const micBusy = phase === 'thinking' || phase === 'greeting';
  const micEnabled = !micBusy;

  const statusColor =
    phase === 'error'
      ? colors.danger.DEFAULT
      : phase === 'listening'
        ? colors.primary.DEFAULT
        : phase === 'thinking' || phase === 'greeting'
          ? colors.accent.DEFAULT
          : phase === 'speaking'
            ? colors.success.DEFAULT
            : colors.primary.DEFAULT;

  const statusLabel =
    phase === 'error'
      ? 'Error'
      : phase === 'greeting'
        ? 'Connecting…'
        : phase === 'listening'
          ? 'Listening…'
          : phase === 'thinking'
            ? 'Thinking…'
            : phase === 'speaking'
              ? 'Speaking…'
              : 'Online';

  const hint =
    phase === 'listening'
      ? 'Speak now — tap again when finished (keep talking ~1s+)'
      : phase === 'greeting' || phase === 'thinking'
        ? 'GreenPath AI is responding…'
        : phase === 'speaking'
          ? 'Tap mic to interrupt and talk'
          : 'Tap the mic to speak';

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={close} style={styles.iconBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={colors.ink.DEFAULT} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Coach</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Pressable onPress={close} style={styles.endBtn} accessibilityLabel="End">
          <Ionicons name="call" size={16} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.transcript}
        contentContainerStyle={styles.transcriptContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {turns.length === 0 && (phase === 'greeting' || phase === 'thinking') ? (
          <View style={styles.block}>
            <Text style={styles.speaker}>Note</Text>
            <Text style={styles.body}>GreenPath AI is joining…</Text>
            <ActivityIndicator
              color={colors.ink.DEFAULT}
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
            />
          </View>
        ) : null}

        {turns.map((turn) => (
          <View key={turn.id} style={styles.block}>
            <Text style={styles.speaker}>
              {turn.role === 'assistant' ? 'GreenPath AI' : 'You'}
            </Text>
            <Text style={styles.body}>{turn.text}</Text>
          </View>
        ))}

        {error ? (
          <View style={styles.block}>
            <Text style={styles.speaker}>Note</Text>
            <Text style={[styles.body, styles.errorText]}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.ptt, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Pressable
          onPress={onMicPress}
          disabled={!micEnabled}
          hitSlop={16}
          style={[
            styles.mic,
            micActive && styles.micActive,
            phase === 'speaking' && styles.micSpeaking,
            !micEnabled && styles.micDisabled,
          ]}
          accessibilityLabel={
            phase === 'listening' ? 'Stop and send' : 'Tap to speak'
          }
        >
          {micBusy ? (
            <ActivityIndicator color={colors.ink.DEFAULT} />
          ) : (
            <Ionicons
              name={micActive ? 'stop' : 'mic'}
              size={32}
              color={micActive || phase === 'speaking' ? '#fff' : colors.ink.DEFAULT}
            />
          )}
        </Pressable>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card.DEFAULT,
    borderWidth: 1,
    borderColor: colors.line.DEFAULT,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.ink.DEFAULT,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  status: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
  },
  endBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcript: { flex: 1, backgroundColor: '#FFFFFF' },
  transcriptContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
  block: { marginBottom: 20 },
  speaker: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 18,
    lineHeight: 28,
    color: colors.ink.DEFAULT,
  },
  errorText: { color: colors.danger.DEFAULT },
  ptt: {
    alignItems: 'center',
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line.DEFAULT,
    backgroundColor: '#FFFFFF',
  },
  mic: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.line.DEFAULT,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  micSpeaking: {
    backgroundColor: colors.success.DEFAULT,
    borderColor: colors.success.DEFAULT,
  },
  micDisabled: { opacity: 0.4 },
  hint: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.ink[600],
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
