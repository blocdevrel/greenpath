import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import {
  Caption,
  Chip,
  ChipRow,
  Display,
  IconButton,
  Screen,
  SearchField,
  Section,
} from '@/shared/components/ui';

import { RoundSummaryCard } from '../components/RoundSummaryCard';
import { RoundTable } from '../components/RoundTable';
import { factorLabels, roundVisits } from '../data/roundsData';
import type { RankFactor } from '../types/round';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'danger', label: factorLabels.danger },
  { id: 'overdue', label: factorLabels.overdue },
  { id: 'reach', label: factorLabels.reach },
  { id: 'food', label: factorLabels.food },
  { id: 'done', label: 'Done' },
] as const;

type FilterId = (typeof filters)[number]['id'];

export function RoundsScreen({
  onStartVisit,
}: {
  onStartVisit?: (householdId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<FilterId>('all');

  const visits = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return roundVisits
      .filter((visit) => {
        if (filter === 'done') return !!visit.completed;
        if (visit.completed && filter !== 'all') return false;
        if (filter !== 'all' && !visit.factors.includes(filter as RankFactor)) return false;

        if (!needle) return true;

        const haystack = [
          visit.name,
          visit.why,
          visit.patientType,
          visit.distance,
          visit.dueLabel,
          visit.level,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(needle);
      })
      .sort((a, b) => {
        if (filter !== 'done' && !!a.completed !== !!b.completed) {
          return Number(!!a.completed) - Number(!!b.completed);
        }
        return a.rank - b.rank;
      });
  }, [filter, query]);

  const visibleNext = visits.find((visit) => !visit.completed);

  return (
    <Screen bottomPadding={TAB_BAR_SCROLL_PADDING}>
      <View className="h-[76px] flex-row items-center gap-3">
        {searchOpen ? (
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search households…"
            autoFocus
            className="min-w-0 flex-1"
          />
        ) : (
          <Display lead="Who to" trail="Visit today" className="min-w-0 flex-1" />
        )}
        <IconButton
          icon={searchOpen ? 'close-outline' : 'search-outline'}
          label={searchOpen ? 'Close search' : 'Search'}
          size="sm"
          onPress={() => {
            setSearchOpen((open) => {
              if (open) setQuery('');
              return !open;
            });
          }}
        />
      </View>

      <RoundSummaryCard />

      <Section>
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

        <Caption>
          {visits.length} household{visits.length === 1 ? '' : 's'}
          {query.trim() ? ` for “${query.trim()}”` : ''}
        </Caption>

        <RoundTable visits={visits} nextId={visibleNext?.id} onVisitPress={onStartVisit} />
      </Section>
    </Screen>
  );
}
