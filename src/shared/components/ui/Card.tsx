import { View, type ViewProps } from 'react-native';

import { InverseSurface } from './Typography';

export type CardTone = 'light' | 'raised' | 'dark' | 'primary' | 'lime' | 'accent' | 'gold';

/** Flat fills only — separation comes from the tint, never a drop shadow. */
const toneClass: Record<CardTone, string> = {
  light: 'bg-card',
  raised: 'bg-card-raised border border-line',
  dark: 'bg-ink-800',
  primary: 'bg-primary',
  lime: 'bg-lime-soft',
  accent: 'bg-accent-soft',
  gold: 'bg-gold-soft',
};

type CardProps = ViewProps & {
  tone?: CardTone;
  className?: string;
  children?: React.ReactNode;
};

export const Card = ({ tone = 'light', className, children, ...rest }: CardProps) => (
  <View className={`rounded-md p-5 ${toneClass[tone]} ${className ?? ''}`} {...rest}>
    <InverseSurface inverse={tone === 'dark' || tone === 'primary'}>{children}</InverseSurface>
  </View>
);
