import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import type { BadgeVisual } from '@/shared/api/progress';
import { colors } from '@/shared/theme/tokens';

type IonName = ComponentProps<typeof Ionicons>['name'];

const ICON_MAP: Record<string, IonName> = {
  book: 'book',
  'help-circle': 'help-circle',
  trash: 'trash',
  refresh: 'refresh',
  leaf: 'leaf',
  water: 'water',
  earth: 'earth',
  trophy: 'trophy',
  map: 'map',
  flame: 'flame',
  ribbon: 'ribbon',
};

type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { outer: number; inner: number; icon: number; lock: number }> = {
  sm: { outer: 44, inner: 34, icon: 16, lock: 14 },
  md: { outer: 58, inner: 44, icon: 22, lock: 16 },
  lg: { outer: 76, inner: 58, icon: 28, lock: 18 },
};

/** Duolingo / Khan Academy style: circular gold medal when earned. */
export function BadgeMedal({
  visual,
  unlocked = true,
  size = 'md',
  label,
}: {
  visual: BadgeVisual;
  unlocked?: boolean;
  size?: Size;
  label?: string;
}) {
  const dim = SIZES[size];
  const icon = ICON_MAP[visual.icon] ?? 'ribbon';

  return (
    <View className="items-center" style={label ? { maxWidth: 120, gap: 8 } : undefined}>
      {unlocked ? (
        <LinearGradient
          colors={['#FDE68A', '#F59E0B', '#B45309']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={{
            width: dim.outer,
            height: dim.outer,
            borderRadius: dim.outer / 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <LinearGradient
            colors={['#FEF3C7', '#FBBF24', '#D97706']}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{
              width: dim.inner,
              height: dim.inner,
              borderRadius: dim.inner / 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name={icon} size={dim.icon} color="#7C2D12" />
          </LinearGradient>
        </LinearGradient>
      ) : (
        <View
          style={{
            width: dim.outer,
            height: dim.outer,
            borderRadius: dim.outer / 2,
            backgroundColor: colors.canvas.sunken,
            borderWidth: 2,
            borderColor: colors.line.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name={icon} size={dim.icon} color={colors.muted} />
          <View
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: dim.lock,
              height: dim.lock,
              borderRadius: dim.lock / 2,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: colors.line.DEFAULT,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="lock-closed" size={Math.max(8, dim.lock - 6)} color={colors.muted} />
          </View>
        </View>
      )}
      {label ? (
        <Text
          numberOfLines={2}
          className={`text-center font-sans-semibold text-caption ${
            unlocked ? 'text-ink' : 'text-muted'
          }`}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
