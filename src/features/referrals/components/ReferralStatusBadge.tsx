import { Text, View } from 'react-native';

import type { ReferralStatus } from '../types/referral';

const statusStyle: Record<ReferralStatus, { bg: string; fg: string; dot: string; label: string }> =
  {
    follow_up: {
      bg: 'bg-refer-soft',
      fg: 'text-refer',
      dot: 'bg-refer',
      label: 'Follow up',
    },
    awaiting: {
      bg: 'bg-treat-soft',
      fg: 'text-treat',
      dot: 'bg-treat',
      label: 'Awaiting',
    },
    closed: {
      bg: 'bg-watch-soft',
      fg: 'text-watch',
      dot: 'bg-watch',
      label: 'Closed',
    },
  };

/** Referral pipeline state — always label + color, never color alone. */
export function ReferralStatusBadge({
  status,
  className,
}: {
  status: ReferralStatus;
  className?: string;
}) {
  const style = statusStyle[status];

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={style.label}
      className={`h-7 flex-row items-center gap-1.5 self-start rounded-full px-2.5 ${style.bg} ${className ?? ''}`}>
      <View className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <Text className={`font-sans-semibold text-caption ${style.fg}`}>{style.label}</Text>
    </View>
  );
}
