import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, type PressableProps } from 'react-native';

import { colors } from '../../theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type IconButtonProps = Omit<PressableProps, 'children'> & {
  icon: IconName;
  label: string;
  tone?: 'light' | 'dark' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
};

export function IconButton({
  icon,
  label,
  tone = 'light',
  size = 'md',
  className,
  ...rest
}: IconButtonProps) {
  const background =
    tone === 'primary'
      ? 'bg-primary'
      : tone === 'dark'
        ? 'bg-ink-800'
        : 'border border-line bg-card-raised';
  const color = tone === 'light' ? colors.ink.DEFAULT : colors.card.raised;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className={`${size === 'sm' ? 'h-11 w-11' : 'h-12 w-12'} items-center justify-center rounded-full ${background} active:opacity-70 ${className ?? ''}`}
      {...rest}>
      <Ionicons name={icon} size={size === 'sm' ? 20 : 22} color={color} />
    </Pressable>
  );
}
