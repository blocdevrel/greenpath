import '@stream-io/video-react-sdk/dist/css/styles.css';

import {
  Call,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
  type CallClosedCaption,
} from '@stream-io/video-react-sdk';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontFamily } from '@/shared/theme/tokens';

import type { StreamVoiceCallProps } from './StreamVoiceCall.types';

type AgentStatus = 'idle' | 'connecting' | 'connected' | 'failed';
type PartialCaption = { speaker: 'agent' | 'user'; text: string };

export type { StreamVoiceCallProps };

/**
 * Lingua lesson pattern on web: Stream Video + muted mic + push-to-talk.
 * Vision Agent speaks over the call (not device TTS / OpenRouter).
 */
export function StreamVoiceCall({
  apiKey,
  token,
  userId,
  userName,
  callType,
  callId,
  agentUserId,
  agentConnected,
  agentHint,
  onRetryAgent,
}: StreamVoiceCallProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);
  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<Call | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user: { id: userId, name: userName },
          token,
        });
        const streamCall = streamClient.call(callType, callId);
        await streamCall.join({ create: true });

        try {
          await streamCall.camera.disable();
        } catch {
          /* audio-only */
        }
        try {
          await streamCall.microphone.disable();
          await streamCall.microphone.disableSpeakingWhileMutedNotification();
        } catch {
          /* ok */
        }
        try {
          await streamCall.startClosedCaptions();
        } catch (e) {
          console.warn('[voice] startClosedCaptions failed:', e);
        }

        if (cancelled) {
          await streamCall.leave().catch(() => undefined);
          await streamClient.disconnectUser().catch(() => undefined);
          return;
        }

        clientRef.current = streamClient;
        callRef.current = streamCall;
        setClient(streamClient);
        setCall(streamCall);
        setJoining(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to join Stream call');
          setJoining(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      callRef.current?.leave().catch(() => undefined);
      clientRef.current?.disconnectUser().catch(() => undefined);
      callRef.current = null;
      clientRef.current = null;
    };
  }, [apiKey, token, userId, userName, callType, callId]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (joining || !client || !call) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary.DEFAULT} />
        <Text style={styles.hint}>Joining Stream call…</Text>
      </View>
    );
  }

  const agentStatus: AgentStatus = agentConnected
    ? 'connected'
    : agentHint
      ? 'failed'
      : 'connecting';

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <ActiveCallContent
          call={call}
          agentUserId={agentUserId}
          agentStatus={agentStatus}
          agentHint={agentHint}
          onRetryAgent={onRetryAgent}
        />
      </StreamCall>
    </StreamVideo>
  );
}

function ActiveCallContent({
  call,
  agentUserId,
  agentStatus,
  agentHint,
  onRetryAgent,
}: {
  call: Call;
  agentUserId: string;
  agentStatus: AgentStatus;
  agentHint?: string;
  onRetryAgent: () => void;
}) {
  const { useMicrophoneState, useCallClosedCaptions } = useCallStateHooks();
  const { microphone } = useMicrophoneState();
  const captions = useCallClosedCaptions();
  const [held, setHeld] = useState(false);
  const [partial, setPartial] = useState<PartialCaption | null>(null);
  const partialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    type StreamCustomEvent = {
      custom?: { type?: string; speaker?: 'agent' | 'user'; text?: string };
    };
    const unsubscribe = call.on('custom', (event: StreamCustomEvent) => {
      const data = event?.custom ?? {};
      if (data.type === 'transcript_partial' && data.text) {
        setPartial({ speaker: data.speaker ?? 'agent', text: data.text });
        if (partialTimerRef.current) clearTimeout(partialTimerRef.current);
        partialTimerRef.current = setTimeout(() => setPartial(null), 3000);
      }
    });
    return () => {
      unsubscribe();
      if (partialTimerRef.current) clearTimeout(partialTimerRef.current);
    };
  }, [call]);

  useEffect(() => {
    if (captions.length > 0) {
      setPartial(null);
      if (partialTimerRef.current) clearTimeout(partialTimerRef.current);
    }
  }, [captions]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [partial, captions.length]);

  const isReady = agentStatus === 'connected';

  const onPressIn = () => {
    if (!isReady) return;
    setHeld(true);
    void microphone.enable();
  };

  const onPressOut = () => {
    setHeld(false);
    void microphone.disable();
  };

  return (
    <View style={styles.fill}>
      <ScrollView
        ref={scrollRef}
        style={styles.transcript}
        contentContainerStyle={styles.transcriptContent}
        showsVerticalScrollIndicator={false}>
        {partial ? (
          <View style={styles.block}>
            <Text style={styles.speaker}>
              {partial.speaker === 'agent' ? 'GreenPath AI' : 'You'}
            </Text>
            <Text style={[styles.body, styles.partial]}>{partial.text}</Text>
          </View>
        ) : captions.length > 0 ? (
          captions.map((caption: CallClosedCaption, i: number) => {
            const isAgent = caption.user?.id === agentUserId;
            return (
              <View key={`${caption.start_time}-${i}`} style={styles.block}>
                <Text style={styles.speaker}>
                  {isAgent ? 'GreenPath AI' : caption.user?.name ?? 'You'}
                </Text>
                <Text style={styles.body}>{caption.text}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.block}>
            {agentStatus === 'connecting' ? (
              <>
                <Text style={styles.speaker}>Note</Text>
                <Text style={styles.body}>Vision Agent is joining the Stream call…</Text>
                <ActivityIndicator
                  color={colors.ink.DEFAULT}
                  style={{ alignSelf: 'flex-start', marginTop: 8 }}
                />
              </>
            ) : agentStatus === 'failed' ? (
              <>
                <Text style={styles.speaker}>Note</Text>
                <Text style={styles.body}>
                  {agentHint ||
                    'Vision Agent unavailable. Run vision-agent with OPENAI_API_KEY, then retry.'}
                </Text>
                <Pressable onPress={onRetryAgent} style={styles.retry}>
                  <Text style={styles.retryText}>Retry agent</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.speaker}>GreenPath AI</Text>
                <Text style={styles.body}>
                  Hold the mic and speak — audio goes through Stream to the Vision Agent.
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.ptt}>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={!isReady}
          style={[styles.mic, held && styles.micActive, !isReady && styles.micDisabled]}
          accessibilityLabel="Hold to talk">
          <Ionicons name="mic" size={28} color={held ? '#fff' : colors.ink.DEFAULT} />
        </Pressable>
        <Text style={styles.hint}>
          {held
            ? 'Listening… release when done'
            : isReady
              ? 'Push & hold to speak'
              : 'Waiting for Vision Agent…'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  error: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.danger.DEFAULT,
    textAlign: 'center',
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.muted,
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
  partial: { color: colors.subtle },
  retry: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line.DEFAULT,
    backgroundColor: colors.primary[50],
  },
  retryText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.primary.DEFAULT,
  },
  ptt: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  mic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.line.DEFAULT,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  micDisabled: { opacity: 0.45 },
});
