import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Chip, ChipRow, Display, Screen } from '@/shared/components/ui';

import { ReferralCard } from '../components/ReferralCard';
import { ReferralSummaryCard } from '../components/ReferralSummaryCard';
import { referrals } from '../data/referralsData';
import type { ReferralStatus } from '../types/referral';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'follow_up', label: 'Follow up' },
  { id: 'awaiting', label: 'Awaiting' },
  { id: 'closed', label: 'Closed' },
] as const;

type FilterId = (typeof filters)[number]['id'];

const statusOrder: Record<ReferralStatus, number> = {
  follow_up: 0,
  awaiting: 1,
  closed: 2,
};

export function ReferralsScreen({
  onOpenFollowUp,
}: {
  onOpenFollowUp?: (householdId: string) => void;
}) {
  const [filter, setFilter] = useState<FilterId>('all');

  const list = useMemo(() => {
    const filtered =
      filter === 'all' ? referrals : referrals.filter((item) => item.status === filter);

    return [...filtered].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [filter]);

  return (
    <Screen bottomPadding={TAB_BAR_SCROLL_PADDING}>
      <Display lead="Open" trail="Referrals" />

      <ReferralSummaryCard />

      <ChipRow>
        {filters.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            selected={filter === item.id}
            onPress={() => setFilter(item.id)}
          />
        ))}
      </ChipRow>

      <View className="gap-3">
        {list.map((referral) => (
          <ReferralCard
            key={referral.id}
            referral={referral}
            onPress={
              referral.status === 'closed'
                ? undefined
                : () => onOpenFollowUp?.(referral.id)
            }
          />
        ))}
      </View>
    </Screen>
  );
}
