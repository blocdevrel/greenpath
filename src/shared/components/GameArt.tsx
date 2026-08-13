import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import { images } from '@/shared/media';

/** Compact streak flame art for stats, banners, and profile. */
export function StreakFireIcon({
  size = 28,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image
        source={images.streakFire}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessibilityLabel="Streak"
      />
    </View>
  );
}
