import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Body, Button, Caption, Screen } from '@/shared/components/ui';
import {
  interests as interestOptions,
  type InterestIcon,
} from '@/shared/data/greenpathData';
import {
  Droplet,
  Factory,
  Globe,
  Recycle,
  Sprout,
  Trash2,
  Trees,
  Turtle,
  Waves,
  Zap,
  type LucideIcon,
} from '@/shared/icons/lucide';
import { colors } from '@/shared/theme/tokens';

const interestIcons: Record<InterestIcon, LucideIcon> = {
  recycle: Recycle,
  trees: Trees,
  droplet: Droplet,
  zap: Zap,
  sprout: Sprout,
  globe: Globe,
  turtle: Turtle,
  factory: Factory,
  waves: Waves,
  trash: Trash2,
};

export function InterestsScreen({
  onContinue,
}: {
  onContinue: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const canContinue = selected.length > 0;

  return (
    <Screen bottomPadding={28}>
      <View className="gap-3 pt-2">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
          <MaterialCommunityIcons
            name="bullseye-arrow"
            size={26}
            color={colors.primary.DEFAULT}
          />
        </View>
        <Text className="font-sans-extrabold text-title text-ink">What interests you?</Text>
        <Body>Select topics to personalise your learning experience.</Body>
      </View>

      <View className="flex-row items-center justify-between">
        <Caption>Select all that apply</Caption>
        <Caption className="font-sans-semibold text-subtle">
          {selected.length} selected
        </Caption>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {interestOptions.map((item) => {
          const on = selected.includes(item.id);
          const Icon = interestIcons[item.icon];
          return (
            <Pressable
              key={item.id}
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={item.label}
              className={`min-h-[64px] flex-row items-center gap-3 rounded-2xl px-3 py-3.5 active:opacity-90 ${
                on ? 'bg-primary-50' : 'bg-card'
              }`}
              style={{ width: '48%' }}>
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: on ? '#FFFFFF' : item.soft }}>
                <Icon size={20} color={on ? colors.primary.DEFAULT : item.tint} strokeWidth={2.25} />
              </View>
              <Text
                className={`min-w-0 flex-1 font-sans-semibold text-caption ${
                  on ? 'text-primary' : 'text-ink'
                }`}
                numberOfLines={2}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1" />

      <Button
        label={canContinue ? 'Continue' : 'Select at least one topic'}
        size="lg"
        trailingGlyph={canContinue ? '→' : undefined}
        disabled={!canContinue}
        onPress={() => onContinue(selected)}
      />
    </Screen>
  );
}
