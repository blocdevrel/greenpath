import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { useTts } from '@/shared/a11y/useTts';
import { Caption } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

/**
 * Loud-read control for visually impaired users.
 * Play / pause / resume. Hidden when TTS is off (unless `force`).
 */
export function SpeakButton({
  text,
  label = 'Read aloud',
  size = 'sm',
  force = false,
  tone = 'light',
}: {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
  /** Show even if Settings TTS is off (e.g. quiz local readout toggle). */
  force?: boolean;
  /** `dark` for use on green/gradient headers. */
  tone?: 'light' | 'dark';
}) {
  const { ttsEnabled, speaking, paused, playPause } = useTts();

  if ((!ttsEnabled && !force) || !text.trim()) return null;

  const box = size === 'sm' ? 'h-10 w-10' : 'h-11 w-11';
  const icon = size === 'sm' ? 18 : 20;
  const active = speaking || paused;

  const onPress = () => {
    void playPause(text, force ? { force: true } : undefined);
  };

  const a11y = speaking ? 'Pause reading' : paused ? 'Resume reading' : label;
  const iconName = speaking ? 'pause' : 'play';
  const onDark = tone === 'dark';

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11y}
        accessibilityHint="Plays or pauses home readout"
        onPress={onPress}
        className={`${box} items-center justify-center rounded-full border active:opacity-80 ${
          onDark
            ? active
              ? 'border-white/40 bg-white'
              : 'border-white/25 bg-white/20'
            : speaking
              ? 'border-primary bg-primary'
              : 'border-line bg-card-raised'
        }`}>
        <Ionicons
          name={iconName}
          size={icon}
          color={
            onDark
              ? active
                ? colors.primary.DEFAULT
                : '#FFFFFF'
              : speaking
                ? '#FFFFFF'
                : colors.primary.DEFAULT
          }
        />
      </Pressable>
      {size === 'md' ? (
        <Caption className={speaking || paused ? 'text-primary' : undefined}>
          {speaking ? 'Reading… tap to pause' : paused ? 'Paused… tap to play' : label}
        </Caption>
      ) : null}
    </View>
  );
}
