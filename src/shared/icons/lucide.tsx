import type { ComponentProps, ComponentType } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export type LucideIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
} & Omit<ComponentProps<typeof Svg>, 'width' | 'height' | 'viewBox' | 'children'>;

export type LucideIcon = ComponentType<LucideIconProps>;

function Base({
  size = 24,
  children,
  ...rest
}: LucideIconProps & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      {children}
    </Svg>
  );
}

function stroke(color: string, strokeWidth: number) {
  return {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

/** Lucide Zap */
export function Zap({ size = 24, color = 'currentColor', strokeWidth = 2, ...rest }: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path
        d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        {...stroke(color, strokeWidth)}
      />
    </Base>
  );
}

/** Lucide Trophy */
export function Trophy({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" {...stroke(color, strokeWidth)} />
      <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" {...stroke(color, strokeWidth)} />
      <Path d="M4 22h16" {...stroke(color, strokeWidth)} />
      <Path
        d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
        {...stroke(color, strokeWidth)}
      />
      <Path
        d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
        {...stroke(color, strokeWidth)}
      />
      <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

/** Lucide Flame */
export function Flame({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
        {...stroke(color, strokeWidth)}
      />
    </Base>
  );
}

/** Lucide Recycle */
export function Recycle({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path
        d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"
        {...stroke(color, strokeWidth)}
      />
      <Path
        d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"
        {...stroke(color, strokeWidth)}
      />
      <Path d="m14 16-3 3 3 3" {...stroke(color, strokeWidth)} />
      <Path d="M8.293 13.596 7.196 9.5 3.1 10.598" {...stroke(color, strokeWidth)} />
      <Path
        d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.829 6.63"
        {...stroke(color, strokeWidth)}
      />
      <Path d="m13.378 9.633 4.096 1.098 1.097-4.096" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

/** Lucide TreePine */
export function TreePine({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path d="m17 14-3-3 3-3" {...stroke(color, strokeWidth)} fill="none" />
      <Path
        d="M10.5 9.5 13 7l2.5 2.5"
        {...stroke(color, strokeWidth)}
        fill="none"
      />
      <Path
        d="M14 22v-5.5l4.5-4.5a2.12 2.12 0 0 0 0-3L14 5l-1.5 1.5L9 3 4.5 7.5a2.12 2.12 0 0 0 0 3L9 15v7"
        {...stroke(color, strokeWidth)}
      />
      <Path d="M7 17h10" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

/** Lucide Trees (simplified) */
export function Trees({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" {...stroke(color, strokeWidth)} />
      <Path d="M7 16v6" {...stroke(color, strokeWidth)} />
      <Path d="M13 19v3" {...stroke(color, strokeWidth)} />
      <Path
        d="M12.5 13.5A3.5 3.5 0 1 0 16 7a3.5 3.5 0 0 0-3.5 6.5Z"
        {...stroke(color, strokeWidth)}
      />
      <Path d="M16 7V4a1 1 0 0 0-1-1h-2" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

/** Lucide Droplet */
export function Droplet({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path
        d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
        {...stroke(color, strokeWidth)}
      />
    </Base>
  );
}

/** Lucide Sprout */
export function Sprout({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path d="M7 20h10" {...stroke(color, strokeWidth)} />
      <Path d="M10 20c5.5-2.5.8-6.4 3-10" {...stroke(color, strokeWidth)} />
      <Path
        d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"
        {...stroke(color, strokeWidth)}
      />
      <Path
        d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"
        {...stroke(color, strokeWidth)}
      />
    </Base>
  );
}

/** Lucide Globe */
export function Globe({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Circle cx="12" cy="12" r="10" {...stroke(color, strokeWidth)} />
      <Path
        d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
        {...stroke(color, strokeWidth)}
      />
      <Path d="M2 12h20" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

/** Lucide Turtle */
export function Turtle({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path
        d="m12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a7 7 0 1 0-14 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4"
        {...stroke(color, strokeWidth)}
      />
      <Path d="M4.82 7.9 8 10" {...stroke(color, strokeWidth)} />
      <Path d="M15.18 7.9 12 10" {...stroke(color, strokeWidth)} />
      <Path d="M16.93 10H20a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1.5" {...stroke(color, strokeWidth)} />
      <Path d="M7.07 10H4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1.5" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

/** Lucide Factory */
export function Factory({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" {...stroke(color, strokeWidth)} />
      <Path d="M17 18h1" {...stroke(color, strokeWidth)} />
      <Path d="M12 18h1" {...stroke(color, strokeWidth)} />
      <Path d="M7 18h1" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

/** Lucide Waves */
export function Waves({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" {...stroke(color, strokeWidth)} />
      <Path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" {...stroke(color, strokeWidth)} />
      <Path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

/** Lucide Trash2 */
export function Trash2({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...rest
}: LucideIconProps) {
  return (
    <Base size={size} {...rest}>
      <Path d="M3 6h18" {...stroke(color, strokeWidth)} />
      <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" {...stroke(color, strokeWidth)} />
      <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" {...stroke(color, strokeWidth)} />
      <Path d="M10 11v6" {...stroke(color, strokeWidth)} />
      <Path d="M14 11v6" {...stroke(color, strokeWidth)} />
    </Base>
  );
}
