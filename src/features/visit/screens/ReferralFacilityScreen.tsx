import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  Badge,
  Button,
  Caption,
  Card,
  Chip,
  ChipRow,
  Label,
  SearchField,
  Subheading,
} from '@/shared/components/ui';

import { FlowHeader } from '../components/FlowHeader';
import { facilitySectorFilters } from '../data/visitMockData';
import type {
  CapacityStatus,
  FacilityOption,
  FacilitySector,
  VisitCohort,
} from '../types';

const capacityShort: Record<CapacityStatus, string> = {
  yes: 'Open',
  limited: 'Limited',
  no: 'Full',
  unknown: '—',
};

const capacityTone: Record<CapacityStatus, string> = {
  yes: 'text-watch',
  limited: 'text-treat',
  no: 'text-refer',
  unknown: 'text-muted',
};

export function ReferralFacilityScreen({
  facilities,
  cohort,
  selectedId,
  suggestedId,
  capacityChecked,
  onSelect,
  onCheckCapacity,
  onBack,
  onClose,
  onContinue,
}: {
  facilities: FacilityOption[];
  cohort: VisitCohort;
  selectedId: string | null;
  suggestedId: string | null;
  capacityChecked: boolean;
  onSelect: (id: string) => void;
  onCheckCapacity: () => void;
  onBack: () => void;
  onClose: () => void;
  onContinue: () => void;
}) {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState<FacilitySector | 'all'>('all');

  const suggested = facilities.find((f) => f.id === suggestedId) ?? facilities[0];

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return facilities.filter((f) => {
      if (sector !== 'all' && f.sector !== sector) return false;
      if (!needle) return true;
      return [f.name, f.level, f.services.join(' '), f.routeNote]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [facilities, query, sector]);

  return (
    <View className="gap-5">
      <FlowHeader title="Refer to" stepLabel="Directory · all sectors" onBack={onBack} onClose={onClose} />

      {suggested ? (
        <Pressable onPress={() => onSelect(suggested.id)}>
          <Card
            tone="primary"
            className={`gap-1 p-4 ${selectedId === suggested.id ? 'border-2 border-white' : ''}`}>
            <Caption className="text-white/70">AI suggested</Caption>
            <Subheading className="text-white">{suggested.name}</Subheading>
            <Label className="text-white/85">
              {suggested.level} · {suggested.distance} · {suggested.routeNote}
            </Label>
          </Card>
        </Pressable>
      ) : null}

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search facilities…"
      />

      <ChipRow>
        {facilitySectorFilters.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            selected={sector === item.id}
            onPress={() => setSector(item.id)}
          />
        ))}
      </ChipRow>

      <Caption>
        {visible.length} site{visible.length === 1 ? '' : 's'}
      </Caption>

      <View className="gap-2">
        {visible.map((facility) => {
          const active = selectedId === facility.id;
          const capable = facility.canHandle.includes(cohort);
          return (
            <Pressable key={facility.id} onPress={() => onSelect(facility.id)}>
              <Card
                className={`flex-row items-center gap-3 p-4 ${
                  active ? 'border border-primary bg-primary-50' : ''
                } ${!capable ? 'opacity-50' : ''}`}>
                <View className="min-w-0 flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Subheading numberOfLines={1} className="min-w-0 flex-1">
                      {facility.name}
                    </Subheading>
                    {facility.id === suggestedId ? <Badge label="Best" /> : null}
                  </View>
                  <Label tone="subtle" numberOfLines={1}>
                    {facility.level} · {facility.services.slice(0, 3).join(' · ')}
                  </Label>
                  <Caption numberOfLines={1}>{facility.routeNote}</Caption>
                </View>
                <View className="items-end gap-1">
                  <Label className="font-sans-semibold">{facility.distance}</Label>
                  <Label className={capacityTone[facility.capacity]}>
                    {capacityShort[facility.capacity]}
                  </Label>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            label={capacityChecked ? 'Capacity OK' : 'Check capacity'}
            variant="ghost"
            disabled={!selectedId}
            onPress={onCheckCapacity}
          />
        </View>
        <View className="flex-1">
          <Button label="Use facility" size="lg" disabled={!selectedId} onPress={onContinue} />
        </View>
      </View>
    </View>
  );
}
