import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, learnCoachChatApi } from '@/shared/api';
import { useShellWidth } from '@/shared/components/MobileShell';
import { tabBarTotalHeight } from '@/shared/components/TabBar';
import type { Lesson } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';
import { colors } from '@/shared/theme/tokens';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const SUGGESTIONS = [
  'Break it down for me',
  'What does this mean for Ghana?',
  'Give me an example',
] as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Fox mascot head for the lesson helper button. */
function CoachMascotHead({ size }: { size: number }) {
  const imageScale = 1.55;
  const imageSize = size * imageScale;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
      <Image
        source={images.mascotWelcome}
        style={{
          width: imageSize,
          height: imageSize,
          marginTop: size * 0.06,
        }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessibilityLabel="Fox helper"
      />
    </View>
  );
}

/** Floating lesson helper on Learn. */
export function LearnCoachFab({ lesson }: { lesson: Lesson | null }) {
  const insets = useSafeAreaInsets();
  const shellWidth = useShellWidth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const idRef = useRef(0);

  const fabSize = clamp(Math.round(shellWidth * 0.14), 52, 62);
  const tabBarH = tabBarTotalHeight(insets);
  const fabBottom = tabBarH + 12;
  const fabRight = 16;
  const panelInset = clamp(Math.round(shellWidth * 0.032), 12, 18);
  const panelHeight = clamp(Math.round(windowHeight * 0.52), 300, 460);
  const panelBottom = fabBottom + fabSize + 12;
  const coachZ = 40;

  const nextId = () => {
    idRef.current += 1;
    return `msg-${idRef.current}`;
  };

  const toggle = useCallback(() => {
    setOpen((v) => !v);
    setError(null);
  }, []);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [open, messages, thinking]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || thinking) return;

      setError(null);
      setInput('');
      Keyboard.dismiss();

      const userMsg: ChatMessage = { id: nextId(), role: 'user', text: trimmed };
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }));

      setMessages((prev) => [...prev, userMsg]);
      setThinking(true);

      try {
        const res = await learnCoachChatApi({
          message: trimmed,
          lessonId: lesson?.id,
          history: history.slice(0, -1),
        });
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', text: res.reply },
        ]);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : 'Could not connect. Check your network.';
        setError(msg);
      } finally {
        setThinking(false);
      }
    },
    [lesson?.id, messages, thinking],
  );

  const submitIfReady = useCallback(() => {
    if (input.trim() && !thinking) void send(input);
  }, [input, thinking, send]);

  const lessonLabel = lesson?.title ?? 'this lesson';

  return (
    <>
      {open ? (
        <Pressable
          accessibilityLabel="Close lesson help"
          onPress={() => setOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.28)',
            zIndex: coachZ,
          }}
        />
      ) : null}

      {open ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            position: 'absolute',
            left: panelInset,
            right: panelInset,
            bottom: panelBottom,
            maxHeight: panelHeight,
            maxWidth: windowWidth,
            alignSelf: 'center',
            zIndex: coachZ + 1,
          }}>
          <View
            className="overflow-hidden border border-line bg-card"
            style={{
              borderRadius: 24,
              maxHeight: panelHeight,
              ...(Platform.OS === 'web'
                ? { boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)' }
                : {
                    shadowColor: '#0F172A',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.12,
                    shadowRadius: 24,
                    elevation: 12,
                  }),
            }}>
            <View className="flex-row items-center gap-3 border-b border-line px-4 py-3">
              <View
                style={{
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: colors.primary[50],
                }}>
                <CoachMascotHead size={40} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="font-sans-extrabold text-body text-ink">Need help?</Text>
                <Text className="font-sans text-[11px] text-muted" numberOfLines={1}>
                  {lessonLabel}
                </Text>
              </View>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={8}
                accessibilityLabel="Close chat"
                className="h-8 w-8 items-center justify-center rounded-full bg-canvas-sunken">
                <Ionicons name="close" size={18} color={colors.subtle} />
              </Pressable>
            </View>

            <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: panelHeight - 148 }}
              contentContainerStyle={{ padding: 14, gap: 10 }}>
              {messages.length === 0 ? (
                <View className="gap-3 py-1">
                  <Text className="font-sans text-caption text-muted">
                    Stuck on something? Tap a prompt or type below.
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => void send(s)}
                        className="rounded-full border border-primary/25 bg-primary-50 px-3 py-1.5">
                        <Text className="font-sans-semibold text-[11px] text-primary">
                          {s}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              {messages.map((m) =>
                m.role === 'assistant' ? (
                  <View key={m.id} className="max-w-[94%] flex-row gap-2 self-start">
                    <CoachMascotHead size={28} />
                    <View className="min-w-0 flex-1 rounded-2xl border border-line bg-canvas-sunken px-3.5 py-2.5">
                      <Text className="font-sans text-caption leading-5 text-ink">
                        {m.text}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View
                    key={m.id}
                    className="max-w-[92%] self-end rounded-2xl bg-primary px-3.5 py-2.5">
                    <Text className="font-sans text-caption leading-5 text-white">
                      {m.text}
                    </Text>
                  </View>
                ),
              )}

              {thinking ? (
                <View className="max-w-[94%] flex-row items-center gap-2 self-start">
                  <CoachMascotHead size={28} />
                  <View className="flex-row items-center gap-2 rounded-2xl bg-canvas-sunken px-3 py-2">
                    <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                    <Text className="font-sans text-[11px] text-muted">One moment</Text>
                  </View>
                </View>
              ) : null}

              {error ? (
                <Text className="font-sans text-[11px] text-danger">{error}</Text>
              ) : null}
            </ScrollView>

            <View className="flex-row items-end gap-2 border-t border-line px-3 py-2.5">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Your question"
                placeholderTextColor={colors.muted}
                multiline={Platform.OS !== 'web'}
                maxLength={500}
                editable={!thinking}
                returnKeyType="send"
                enterKeyHint="send"
                submitBehavior="submit"
                enablesReturnKeyAutomatically
                onSubmitEditing={submitIfReady}
                onKeyPress={
                  Platform.OS === 'web'
                    ? (e) => {
                        if (e.nativeEvent.key === 'Enter') {
                          submitIfReady();
                        }
                      }
                    : undefined
                }
                className="max-h-24 min-h-10 flex-1 rounded-2xl border border-line bg-canvas-sunken px-3 py-2 font-sans text-caption text-ink"
                style={{ textAlignVertical: 'center' }}
              />
              <Pressable
                onPress={() => void send(input)}
                disabled={!input.trim() || thinking}
                accessibilityLabel="Send message"
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  input.trim() && !thinking ? 'bg-primary' : 'bg-canvas-sunken'
                }`}>
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={input.trim() && !thinking ? '#fff' : colors.muted}
                />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : null}

      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Close lesson help' : 'Open lesson help'}
        accessibilityState={{ expanded: open }}
        className="active:opacity-90"
        style={{
          position: 'absolute',
          right: fabRight,
          bottom: fabBottom,
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          borderWidth: 2.5,
          borderColor: open ? colors.muted : colors.primary.DEFAULT,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: coachZ + 2,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0 4px 10px rgba(46, 125, 50, 0.32)' }
            : {
                shadowColor: colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: open ? 0.15 : 0.32,
                shadowRadius: 10,
                elevation: 8,
              }),
        }}>
        <CoachMascotHead size={fabSize - 6} />
        {open ? (
          <View
            className="absolute items-center justify-center bg-ink/80"
            style={{
              top: -2,
              right: -2,
              width: 20,
              height: 20,
              borderRadius: 10,
            }}>
            <Ionicons name="close" size={12} color="#fff" />
          </View>
        ) : null}
      </Pressable>
    </>
  );
}
