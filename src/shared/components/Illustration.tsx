import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { View } from 'react-native';

import { images } from '@/shared/media';
import { colors } from '@/shared/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

const presets: Record<
  string,
  { bg: string; icon: IconName; iconColor: string; accent?: string }
> = {
  splash: { bg: 'bg-primary', icon: 'leaf', iconColor: '#FFFFFF', accent: 'bg-lime' },
  learn: { bg: 'bg-primary-50', icon: 'book', iconColor: colors.primary.DEFAULT },
  ai: { bg: 'bg-accent-soft', icon: 'sparkles', iconColor: colors.accent.DEFAULT },
  action: { bg: 'bg-lime-soft', icon: 'earth', iconColor: colors.lime.DEFAULT },
  recycle: { bg: 'bg-primary-50', icon: 'refresh-circle', iconColor: colors.primary.DEFAULT },
  tree: { bg: 'bg-lime-soft', icon: 'leaf', iconColor: colors.secondary.DEFAULT },
  water: { bg: 'bg-accent-soft', icon: 'water', iconColor: colors.accent.DEFAULT },
  energy: { bg: 'bg-gold-soft', icon: 'flash', iconColor: colors.gold.DEFAULT },
  agriculture: { bg: 'bg-lime-soft', icon: 'nutrition', iconColor: colors.lime.DEFAULT },
  climate: { bg: 'bg-primary-50', icon: 'cloudy', iconColor: colors.primary.DEFAULT },
  wildlife: { bg: 'bg-gold-soft', icon: 'paw', iconColor: '#D97706' },
  plastic: { bg: 'bg-accent-soft', icon: 'trash', iconColor: colors.accent.DEFAULT },
  solar: { bg: 'bg-gold-soft', icon: 'sunny', iconColor: colors.gold.DEFAULT },
  mission: { bg: 'bg-primary-50', icon: 'flag', iconColor: colors.primary.DEFAULT },
  camera: { bg: 'bg-canvas-sunken', icon: 'camera', iconColor: colors.ink.DEFAULT },
  voice: { bg: 'bg-accent-soft', icon: 'mic', iconColor: colors.accent.DEFAULT },
  badge: { bg: 'bg-gold-soft', icon: 'ribbon', iconColor: colors.gold.DEFAULT },
  community: { bg: 'bg-primary-50', icon: 'people', iconColor: colors.primary.DEFAULT },
  auth: { bg: 'bg-primary-50', icon: 'globe', iconColor: colors.primary.DEFAULT },
  scan: { bg: 'bg-accent-soft', icon: 'scan', iconColor: colors.accent.DEFAULT },
  trophy: { bg: 'bg-gold-soft', icon: 'trophy', iconColor: colors.gold.DEFAULT },
  chart: { bg: 'bg-primary-50', icon: 'bar-chart', iconColor: colors.primary.DEFAULT },
};

export type IllustrationKind = keyof typeof presets;

/** Full-bleed Uber-style scenes for home mission cards. */
export function missionScene(kind: IllustrationKind): ImageSourcePropType {
  if (kind === 'recycle' || kind === 'plastic' || kind === 'water') {
    return images.illustMissionRecycle;
  }
  if (kind === 'tree' || kind === 'agriculture' || kind === 'wildlife') {
    return images.illustEventPlanting;
  }
  return images.illustMissionAction;
}

/** Full-bleed Uber-style scenes for community event cards. */
export function eventScene(kind: IllustrationKind): ImageSourcePropType {
  if (kind === 'tree') return images.illustEventPlanting;
  if (kind === 'plastic' || kind === 'recycle' || kind === 'water') {
    return images.illustEventCleanup;
  }
  return images.illustEventCommunity;
}

/**
 * Premium vector-style illustration blocks — cohesive shapes + iconography
 * instead of stock photography.
 */
export function Illustration({
  kind,
  size = 'lg',
  className,
}: {
  kind: IllustrationKind;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
}) {
  const preset = presets[kind] ?? presets.learn;
  const dims =
    size === 'sm'
      ? { box: 'h-14 w-14', icon: 24, orb: 10 }
      : size === 'md'
        ? { box: 'h-24 w-24', icon: 40, orb: 14 }
        : size === 'lg'
          ? { box: 'h-36 w-36', icon: 56, orb: 18 }
          : size === 'xl'
            ? { box: 'h-48 w-48', icon: 72, orb: 22 }
            : { box: 'h-56 w-full max-w-xs', icon: 88, orb: 28 };

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`items-center justify-center overflow-hidden rounded-3xl ${preset.bg} ${dims.box} ${className ?? ''}`}>
      <View className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/25" />
      <View className="absolute -bottom-6 -left-4 h-24 w-24 rounded-full bg-white/20" />
      {preset.accent ? (
        <View className={`absolute bottom-4 right-5 h-3 w-3 rounded-full ${preset.accent}`} />
      ) : null}
      <View
        className="items-center justify-center rounded-full bg-white/55"
        style={{ width: dims.icon + 28, height: dims.icon + 28 }}>
        <Ionicons name={preset.icon} size={dims.icon} color={preset.iconColor} />
      </View>
    </View>
  );
}

/** Animated-feel leaf row used on splash / loading. */
export function LeafLoader({
  progress = 0.6,
  size = 'md',
}: {
  progress?: number;
  size?: 'md' | 'lg';
}) {
  const leaves = [0, 1, 2, 3, 4];
  const scale = size === 'lg' ? 1.55 : 1;

  return (
    <View className="flex-row items-end justify-center gap-2" accessibilityLabel="Loading">
      {leaves.map((i) => {
        const active = progress > i / leaves.length;
        return (
          <View
            key={i}
            className={`items-center justify-center rounded-full ${active ? 'bg-primary' : 'bg-primary-100'}`}
            style={{
              width: (18 + i * 2) * scale,
              height: (22 + i * 4) * scale,
            }}>
            <Ionicons
              name="leaf"
              size={(10 + i) * scale}
              color={active ? '#FFFFFF' : colors.primary[300]}
            />
          </View>
        );
      })}
    </View>
  );
}
