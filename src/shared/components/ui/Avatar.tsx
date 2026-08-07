import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, type ImageSourcePropType, View } from 'react-native';

import { colors } from '../../theme/tokens';

const sizing = {
  sm: { box: 'h-9 w-9', icon: 18 },
  md: { box: 'h-12 w-12', icon: 24 },
  lg: { box: 'h-16 w-16', icon: 32 },
} as const;

export type AvatarSize = keyof typeof sizing;

export const Avatar = ({
  name,
  size = 'md',
  tone = 'soft',
  source,
  className,
}: {
  name: string;
  size?: AvatarSize;
  tone?: 'soft' | 'primary' | 'dark';
  /** Real photo — when set, replaces the icon fallback. */
  source?: ImageSourcePropType;
  className?: string;
}) => {
  const bg = tone === 'primary' ? 'bg-primary' : tone === 'dark' ? 'bg-ink-800' : 'bg-primary-50';
  const iconColor = tone === 'soft' ? colors.primary.DEFAULT : colors.card.raised;

  return (
    <View
      accessibilityLabel={name}
      className={`overflow-hidden items-center justify-center rounded-full ${bg} ${sizing[size].box} ${className ?? ''}`}>
      {source ? (
        <Image
          source={source}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Ionicons name="person" size={sizing[size].icon} color={iconColor} />
      )}
    </View>
  );
};

export const AvatarStack = ({
  names,
  size = 'md',
  sources,
}: {
  names: string[];
  size?: AvatarSize;
  sources?: ImageSourcePropType[];
}) => (
  <View className="flex-row">
    {names.map((name, index) => (
      <Avatar
        key={name}
        name={name}
        size={size}
        source={sources?.[index]}
        className={index === 0 ? 'border-2 border-canvas' : '-ml-3 border-2 border-canvas'}
      />
    ))}
  </View>
);
