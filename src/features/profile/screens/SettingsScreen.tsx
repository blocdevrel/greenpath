import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Switch, Text, View } from 'react-native';

import { Caption, Card, Label, Screen } from '@/shared/components/ui';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { prefs, updatePrefs } = useGreenPath();

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <Text className="font-sans-extrabold text-title text-ink">Settings</Text>
      <Caption>Theme, accessibility, voice, language & privacy</Caption>

      <Section title="Theme">
        <ToggleRow
          label="Dark Mode"
          value={prefs.darkMode}
          onChange={(v) => updatePrefs({ darkMode: v })}
        />
        <Row label="Theme" value={prefs.highContrast ? 'High Contrast' : 'Nature Green'} />
      </Section>

      <Section title="Accessibility">
        <ToggleRow
          label="Large fonts"
          value={prefs.largeFonts}
          onChange={(v) => updatePrefs({ largeFonts: v })}
        />
        <ToggleRow
          label="High contrast mode"
          value={prefs.highContrast}
          onChange={(v) => updatePrefs({ highContrast: v })}
        />
        <ToggleRow
          label="Voice navigation"
          value={prefs.voiceNav}
          onChange={(v) => updatePrefs({ voiceNav: v })}
        />
        <Caption className="pt-1">
          Large touch targets and screen-reader labels are always on. Large fonts and contrast
          apply across the app.
        </Caption>
      </Section>

      <Section title="Voice Settings">
        <ToggleRow
          label="Text-to-Speech"
          value={prefs.tts}
          onChange={(v) => updatePrefs({ tts: v })}
        />
        <ToggleRow
          label="Speech-to-Text"
          value={prefs.stt}
          onChange={(v) => updatePrefs({ stt: v })}
        />
        <Caption className="pt-1">
          Text-to-Speech reads lessons, quizzes, missions, and home updates aloud for visually
          impaired users. Turn on Voice navigation to auto-announce screens when you open them.
        </Caption>
      </Section>

      <Section title="Preferences">
        <Row label="Language" value="English (Ghana)" />
        <ToggleRow
          label="Notifications"
          value={prefs.notifications}
          onChange={(v) => updatePrefs({ notifications: v })}
        />
        <Row label="Privacy" value="Manage" />
      </Section>
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
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="h-12 flex-row items-center justify-between">
      <Text className="font-sans text-body text-ink">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.line.DEFAULT, true: colors.primary[300] }}
        thumbColor={value ? colors.primary.DEFAULT : '#f4f4f5'}
        accessibilityLabel={label}
      />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="h-12 flex-row items-center justify-between">
      <Text className="font-sans text-body text-ink">{label}</Text>
      <Text className="font-sans-medium text-label text-subtle">{value}</Text>
    </View>
  );
}
