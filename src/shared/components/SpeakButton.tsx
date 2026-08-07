import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { Caption } from '@/shared/components/ui';
import { useTts } from '@/shared/a11y/useTts';
import { colors } from '@/shared/theme/tokens';

/**
 * Loud-read control for visually impaired users.
 * Hidden when Text-to-Speech is off in Settings (unless `force` is true).
 */
export function SpeakButton({
  text,
  label = 'Read aloud',
  size = 'md',
  force = false,
}: {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
  /** Show even if Settings TTS is off (e.g. quiz local readout toggle). */
  force?: boolean;
}) {
  const { ttsEnabled, speaking, toggle, stop } = useTts();

  if ((!ttsEnabled && !force) || !text.trim()) return null;

  const box = size === 'sm' ? 'h-10 w-10' : 'h-11 w-11';
  const icon = size === 'sm' ? 18 : 20;

  const onPress = async () => {
    if (speaking) {
      await stop();
      return;
    }
    await toggle(text, force ? { force: true } : undefined);
  };

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={speaking ? 'Stop reading' : label}
        accessibilityHint="Reads this content out loud"
        onPress={() => {
          void onPress();
        }}
        className={`${box} items-center justify-center rounded-full border border-line ${
          speaking ? 'bg-primary' : 'bg-card-raised'
        } active:opacity-80`}>
        <Ionicons
          name={speaking ? 'stop' : 'volume-high'}
          size={icon}
          color={speaking ? '#FFFFFF' : colors.primary.DEFAULT}
        />
      </Pressable>
      {size === 'md' ? (
        <Caption className={speaking ? 'text-primary' : undefined}>
          {speaking ? 'Reading… tap to stop' : label}
        </Caption>
      ) : null}
    </View>
  );
}
