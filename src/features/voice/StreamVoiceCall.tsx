import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/shared/theme/tokens';

import type { StreamVoiceCallProps } from './StreamVoiceCall.types';

/**
 * Native Expo Go can't load Stream WebRTC like Lingua's dev client.
 * Same Lingua backend (Stream call + Vision Agent) — open Pronto to join the call.
 * Use Expo web (or a Stream RN / prebuild client) for in-app push-to-talk.
 */
export function StreamVoiceCall({
  joinUrl,
  agentConnected,
  agentHint,
  onRetryAgent,
}: StreamVoiceCallProps) {
  const openPronto = async () => {
    if (!joinUrl) return;
    await WebBrowser.openBrowserAsync(joinUrl, {
      enableBarCollapsing: true,
      showInRecents: true,
    });
  };

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Stream call ready</Text>
      <Text style={styles.body}>
        {agentConnected
          ? 'Vision Agent is on the call. Open Stream Pronto to talk with push-to-talk audio (Lingua transport).'
          : agentHint ||
            'Start vision-agent with OPENAI_API_KEY, then retry. On phone, open Pronto after the agent joins.'}
      </Text>
      {joinUrl ? (
        <Pressable onPress={() => void openPronto()} style={styles.btn}>
          <Ionicons name="open-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Open Stream call</Text>
        </Pressable>
      ) : null}
      {!agentConnected ? (
        <Pressable onPress={onRetryAgent} style={styles.secondary}>
          <Text style={styles.secondaryText}>Retry agent</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    color: colors.ink.DEFAULT,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  btn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  btnText: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: '#fff',
  },
  secondary: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  secondaryText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.primary.DEFAULT,
  },
});
