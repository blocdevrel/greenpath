import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { colors } from '@/shared/theme/tokens';

import { GoogleLogo } from './BrandLogos';

type SocialAuthButtonsProps = {
  disabled?: boolean;
  busy?: boolean;
  onGoogle: () => void;
  /** Side-by-side buttons to save vertical space on mobile */
  layout?: 'stack' | 'row';
};

export function SocialAuthButtons({
  disabled,
  busy,
  onGoogle,
  layout = 'row',
}: SocialAuthButtonsProps) {
  return (
    <View className="gap-2">
      <View className={layout === 'row' ? 'flex-row gap-2.5' : 'gap-2.5'}>
        <Pressable
          onPress={onGoogle}
          disabled={disabled || busy}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          className={`h-12 flex-row items-center justify-center gap-2 rounded-xl border border-line bg-white active:opacity-85 disabled:opacity-50 ${
            layout === 'row' ? 'min-w-0 flex-1' : ''
          }`}>
          <View className="h-5 w-5 items-center justify-center">
            <GoogleLogo size={18} />
          </View>
          <Text className="font-sans-semibold text-caption text-ink" numberOfLines={1}>
            {layout === 'row' ? 'Google' : 'Continue with Google'}
          </Text>
        </Pressable>
      </View>
      {busy ? (
        <View className="items-center">
          <ActivityIndicator color={colors.primary.DEFAULT} />
        </View>
      ) : null}
    </View>
  );
}

export function OrDivider({ label = 'or email' }: { label?: string }) {
  return (
    <View className="flex-row items-center gap-2.5 py-0.5">
      <View className="h-px flex-1 bg-line" />
      <Text className="font-sans text-caption text-muted">{label}</Text>
      <View className="h-px flex-1 bg-line" />
    </View>
  );
}
