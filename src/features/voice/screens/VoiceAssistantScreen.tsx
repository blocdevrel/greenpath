import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Illustration } from '@/shared/components/Illustration';
import { Body, Caption, Label } from '@/shared/components/ui';
import { voiceSuggestions } from '@/shared/data/greenpathData';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

type Msg = { id: string; from: 'user' | 'ai'; text: string };

export function VoiceAssistantScreen({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { profile, prefs, filteredLessons } = useGreenPath();
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: '0',
      from: 'ai',
      text: `Hi ${profile.name}. I’m your GreenPath AI. Ask me about lessons, XP, or climate topics.`,
    },
  ]);

  const replyFor = (text: string) => {
    if (text === "Start today’s lesson") {
      const lesson = filteredLessons.find((l) => l.progress < 1) ?? filteredLessons[0];
      return `Opening ${lesson?.title ?? 'your next lesson'}. ${lesson?.minutes ?? 8} minutes. Ready when you are!`;
    }
    if (text === 'What is renewable energy?') {
      return 'Renewable energy comes from sources that replenish naturally, like solar, wind, and hydro common across Ghana.';
    }
    if (text === 'How many XP do I have?') {
      return `You currently have ${profile.xp} XP and you are Level ${profile.level}.`;
    }
    if (text === 'Explain climate change') {
      return 'Climate change is the long-term shift in temperatures and weather patterns, driven largely by greenhouse gases from human activity.';
    }
    return 'I’m here to help you learn and act for the climate.';
  };

  const ask = (text: string) => {
    const reply = replyFor(text);
    setMessages((m) => [
      ...m,
      { id: `${Date.now()}-u`, from: 'user', text },
      { id: `${Date.now()}-a`, from: 'ai', text: reply },
    ]);
    setListening(false);
  };

  const onMic = () => {
    if (!prefs.stt) {
      setMessages((m) => [
        ...m,
        {
          id: `${Date.now()}-a`,
          from: 'ai',
          text: 'Speech-to-Text is off in Settings. Turn it on, or tap a suggestion chip.',
        },
      ]);
      return;
    }
    setListening((v) => {
      const next = !v;
      if (next) {
        // Simulate listening then ask a default climate question
        setTimeout(() => ask('Explain climate change'), 1200);
      }
      return next;
    });
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between px-5">
        <Pressable
          onPress={onClose}
          className="h-11 w-11 items-center justify-center rounded-full border border-line bg-card-raised">
          <Ionicons name="close" size={20} color={colors.ink.DEFAULT} />
        </Pressable>
        <Label className="font-sans-bold">AI Voice Assistant</Label>
        <View className="w-11" />
      </View>

      <View className="items-center gap-3 px-5 pt-6">
        <Illustration kind="voice" size="lg" />
        <View className="flex-row items-end gap-1">
          {[8, 16, 28, 18, 12, 22, 10].map((h, i) => (
            <View
              key={i}
              className={`w-1.5 rounded-full ${listening ? 'bg-accent' : 'bg-primary-200'}`}
              style={{ height: listening ? h + 8 : h }}
            />
          ))}
        </View>
        <Caption>
          {listening
            ? 'Listening…'
            : prefs.stt
              ? 'Tap the mic to speak'
              : 'STT off. Use suggestion chips'}
        </Caption>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ gap: 12, paddingVertical: 16 }}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.from === 'ai' ? 'self-start bg-primary-50' : 'self-end bg-accent-soft'
            }`}>
            <Body className="text-ink">{msg.text}</Body>
          </View>
        ))}
      </ScrollView>

      <View className="gap-3 px-5" style={{ paddingBottom: insets.bottom + 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {voiceSuggestions.map((s) => (
              <Pressable
                key={s}
                onPress={() => ask(s)}
                className="rounded-full border border-line bg-card-raised px-4 py-2">
                <Text className="font-sans-medium text-caption text-ink">{s}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Pressable
          onPress={onMic}
          accessibilityLabel="Microphone"
          className={`mx-auto h-20 w-20 items-center justify-center rounded-full ${
            listening ? 'bg-accent' : 'bg-primary'
          }`}>
          <Ionicons name="mic" size={32} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
