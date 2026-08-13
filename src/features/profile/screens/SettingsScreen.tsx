import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { useTts } from '@/shared/a11y/useTts';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { Body, Caption, Card, Label, Screen } from '@/shared/components/ui';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { prefs, updatePrefs } = useGreenPath();
  const { announce, stop } = useTts();

  useEffect(() => {
    void announce(
      'Settings. Voice and notification preferences.',
    );
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={() => {
          void stop();
          onBack();
        }}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <Text className="font-sans-extrabold text-title text-ink">Settings</Text>
      <Caption>Voice and notification preferences</Caption>
      <SpeakButton
        text="Settings. Text to speech reads lessons and missions aloud. Voice navigation announces screens when you open them."
        label="Read settings aloud"
      />

      <Section title="Voice">
        <ToggleRow
          label="Text to speech"
          hint="Read aloud buttons on lessons, quizzes, and missions"
          value={prefs.tts}
          onChange={(v) => {
            void updatePrefs({ tts: v, voiceNav: v ? prefs.voiceNav : false });
          }}
        />
        <ToggleRow
          label="Voice navigation"
          hint="Auto-announce screens when you open them (needs text to speech)"
          value={prefs.voiceNav && prefs.tts}
          onChange={(v) => {
            void updatePrefs({
              voiceNav: v,
              tts: v ? true : prefs.tts,
            });
          }}
        />
        <Caption className="pt-1">
          For spoken Q&amp;A, open the Voice assistant from Home.
        </Caption>
      </Section>

      <Section title="Reminders & email">
        <ToggleRow
          label="In-app notifications"
          hint="Mission and event alerts inside GreenPath"
          value={prefs.notifications}
          onChange={(v) => {
            void updatePrefs({ notifications: v });
          }}
        />
        <ToggleRow
          label="Email digests"
          hint="Streak and weekly climate updates to your signup email"
          value={prefs.emailNotifications}
          onChange={(v) => {
            void updatePrefs({ emailNotifications: v });
          }}
        />
      </Section>

      <Card className="gap-2">
        <Label className="font-sans-semibold">Coming later</Label>
        <Body>
          Dark mode, large fonts, and high contrast themes will use the GreenPath design system —
          not a separate CSS override.
        </Body>
      </Card>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Label className="font-sans-semibold">{title}</Label>
      <Card className="gap-1 py-2">{children}</Card>
    </View>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="min-h-12 flex-row items-center justify-between gap-3 py-2">
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans text-body text-ink">{label}</Text>
        {hint ? <Caption numberOfLines={2}>{hint}</Caption> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.line.DEFAULT, true: colors.primary[300] }}
        thumbColor={value ? colors.primary.DEFAULT : '#f4f4f5'}
        accessibilityLabel={label}
        accessibilityHint={hint}
      />
    </View>
  );
}
