import { Text, View } from 'react-native';

import { triage, type TriageLevel } from '../../theme/tokens';

const levelClass: Record<TriageLevel, { bg: string; fg: string; dot: string }> = {
  refer: { bg: 'bg-refer-soft', fg: 'text-refer', dot: 'bg-refer' },
  treat: { bg: 'bg-treat-soft', fg: 'text-treat', dot: 'bg-treat' },
  watch: { bg: 'bg-watch-soft', fg: 'text-watch', dot: 'bg-watch' },
};

/**
 * Clinical state indicator. Colour is always paired with the canonical label so
 * it never carries meaning on its own.
 */
export const TriageBadge = ({ level, className }: { level: TriageLevel; className?: string }) => {
  const style = levelClass[level];

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={triage[level].label}
      className={`h-8 flex-row items-center gap-2 self-start rounded-full px-3 ${style.bg} ${className ?? ''}`}>
      <View className={`h-2 w-2 rounded-full ${style.dot}`} />
      <Text className={`font-sans-semibold text-label ${style.fg}`}>{triage[level].label}</Text>
    </View>
  );
};

/** Neutral metadata pill: distance, overdue count, sync state. */
export const Badge = ({ label, className }: { label: string; className?: string }) => (
  <View className={`h-7 justify-center rounded-full bg-canvas-sunken px-3 ${className ?? ''}`}>
    <Text className="font-sans-medium text-caption text-subtle">{label}</Text>
  </View>
);
