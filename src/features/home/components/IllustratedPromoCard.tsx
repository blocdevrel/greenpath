import type { ReactNode } from 'react';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

/** Source illustrations are ~3:2. Card frame is 16:9, cropped from the bottom so heads stay in view. */
export const PROMO_FRAME_ASPECT = 16 / 9;
export const PROMO_SOURCE_ASPECT = 1182 / 788;

export function promoImageHeights(width: number) {
  return {
    frameHeight: Math.round(width / PROMO_FRAME_ASPECT),
    imageHeight: Math.round(width / PROMO_SOURCE_ASPECT),
  };
}

/** Uber-style promo tile: wide illustration, 8px corners, title + one subtitle. */
export function IllustratedPromoCard({
  image,
  title,
  subtitle,
  width,
  onPress,
  accessibilityLabel,
  footer,
}: {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  width: number;
  onPress: () => void;
  accessibilityLabel: string;
  footer?: ReactNode;
}) {
  const { frameHeight, imageHeight } = promoImageHeights(width);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="active:opacity-95"
      style={{ width, maxWidth: width, flexGrow: 0, flexShrink: 0, marginRight: 12 }}>
      <View
        className="bg-primary-50"
        style={{
          width,
          height: frameHeight,
          borderRadius: 8,
          overflow: 'hidden',
          justifyContent: 'flex-start',
        }}>
        <Image
          source={image}
          style={{ width, height: imageHeight, maxWidth: width }}
          resizeMode="stretch"
          accessibilityIgnoresInvertColors
        />
      </View>
      <View className="gap-0.5 pt-2.5" style={{ width, maxWidth: width }}>
        <Text className="font-sans-bold text-body text-ink" numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-sans text-caption text-subtle" numberOfLines={1}>
          {subtitle}
        </Text>
        {footer ? <View className="pt-2">{footer}</View> : null}
      </View>
    </Pressable>
  );
}
