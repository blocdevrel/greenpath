import { createContext, useContext } from 'react';
import { Text, type TextProps, View } from 'react-native';

/** Lets dark and primary surfaces flip their descendant text to inverse. */
const InverseContext = createContext(false);

export const InverseSurface = ({
  inverse,
  children,
}: {
  inverse: boolean;
  children: React.ReactNode;
}) => <InverseContext.Provider value={inverse}>{children}</InverseContext.Provider>;

export type Tone = 'default' | 'subtle' | 'muted' | 'primary' | 'inverse';

type BaseProps = TextProps & {
  tone?: Tone;
  className?: string;
  children?: React.ReactNode;
};

const toneClass: Record<Tone, string> = {
  default: 'text-ink',
  subtle: 'text-subtle',
  muted: 'text-muted',
  primary: 'text-primary',
  inverse: 'text-white',
};

const inverseToneClass: Record<Tone, string> = {
  default: 'text-white',
  subtle: 'text-white/70',
  muted: 'text-white/55',
  primary: 'text-primary-200',
  inverse: 'text-white',
};

function useToneClass(tone: Tone) {
  const inverse = useContext(InverseContext);
  return inverse ? inverseToneClass[tone] : toneClass[tone];
}

function make(base: string, defaultTone: Tone = 'default') {
  return function Typography({ tone = defaultTone, className, ...rest }: BaseProps) {
    return <Text className={`${base} ${useToneClass(tone)} ${className ?? ''}`} {...rest} />;
  };
}

export const Title = make('font-sans-bold text-title');
export const Heading = make('font-sans-bold text-heading');
export const Subheading = make('font-sans-semibold text-subheading');
export const BodyLg = make('font-sans text-body-lg', 'subtle');
export const Body = make('font-sans text-body', 'subtle');
export const Label = make('font-sans-medium text-label');
export const Caption = make('font-sans text-caption', 'muted');
export const Stat = make('font-sans-extrabold text-stat');

/** Small uppercase eyebrow that sits above a section or card. */
export const Overline = ({ className, ...rest }: BaseProps) => (
  <Label
    tone="muted"
    className={`font-sans-semibold text-overline uppercase ${className ?? ''}`}
    {...rest}
  />
);

/**
 * Two-line stacked screen heading: light first line over a bold second line.
 * Pass only `lead` for a single-line display.
 */
export const Display = ({
  lead,
  trail,
  xl = false,
  className,
}: {
  lead: string;
  trail?: string;
  xl?: boolean;
  className?: string;
}) => {
  const size = xl ? 'text-display-xl' : 'text-display';
  const tone = useToneClass('default');

  return (
    <View className={className}>
      <Text className={`font-sans-light ${size} ${tone}`}>{lead}</Text>
      {trail ? <Text className={`font-sans-extrabold ${size} ${tone}`}>{trail}</Text> : null}
    </View>
  );
};
