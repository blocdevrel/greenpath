import { Pressable, type PressableProps, Text, View } from 'react-native';

export type ButtonVariant = 'primary' | 'dark' | 'soft' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

const container: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  dark: 'bg-ink-800',
  soft: 'bg-primary-50',
  ghost: 'bg-transparent border border-line',
  danger: 'bg-danger',
  accent: 'bg-accent',
};

const labelTone: Record<ButtonVariant, string> = {
  primary: 'text-white',
  dark: 'text-white',
  soft: 'text-primary',
  ghost: 'text-ink',
  danger: 'text-white',
  accent: 'text-white',
};

const sizing: Record<ButtonSize, string> = {
  sm: 'h-12 px-4',
  md: 'h-[52px] px-5',
  lg: 'h-14 px-6',
};

const labelSize: Record<ButtonSize, string> = {
  sm: 'text-label',
  md: 'text-body',
  lg: 'text-body-lg',
};

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  trailingGlyph?: string;
  fullWidth?: boolean;
  className?: string;
};

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  trailingGlyph,
  fullWidth = true,
  disabled,
  className,
  style,
  ...rest
}: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled: !!disabled }}
    disabled={disabled}
    className={`flex-row items-center justify-center gap-2 rounded-full ${container[variant]} ${sizing[size]} ${fullWidth ? 'w-full' : 'self-start'} ${disabled ? 'opacity-40' : 'active:opacity-80'} ${className ?? ''}`}
    style={(state) => [
      { maxWidth: '100%', alignSelf: fullWidth ? 'stretch' : 'flex-start' },
      typeof style === 'function' ? style(state) : style,
    ]}
    {...rest}>
    <Text className={`font-sans-semibold ${labelSize[size]} ${labelTone[variant]}`}>{label}</Text>
    {trailingGlyph ? (
      <View className="h-6 w-6 items-center justify-center rounded-full bg-white/20">
        <Text className={`font-sans-semibold text-caption ${labelTone[variant]}`}>
          {trailingGlyph}
        </Text>
      </View>
    ) : null}
  </Pressable>
);

export const RoundButton = ({
  glyph,
  tone = 'light',
  className,
  ...rest
}: Omit<PressableProps, 'children'> & {
  glyph: string;
  tone?: 'light' | 'dark' | 'primary';
  className?: string;
}) => {
  const bg = tone === 'dark' ? 'bg-ink-800' : tone === 'primary' ? 'bg-primary' : 'bg-card';
  const fg = tone === 'light' ? 'text-ink' : 'text-white';

  return (
    <Pressable
      accessibilityRole="button"
      className={`h-12 w-12 items-center justify-center rounded-full active:opacity-80 ${bg} ${tone === 'light' ? 'border border-line-subtle' : ''} ${className ?? ''}`}
      {...rest}>
      <Text className={`font-sans-semibold text-body ${fg}`}>{glyph}</Text>
    </Pressable>
  );
};
