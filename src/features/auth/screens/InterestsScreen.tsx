import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { interests as interestOptions } from '@/shared/data/greenpathData';
import { Body, Button, Screen } from '@/shared/components/ui';

export function InterestsScreen({
  onContinue,
}: {
  onContinue: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(['climate', 'recycling', 'trees']);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <Screen bottomPadding={28}>
      <View className="gap-2 pt-2">
        <Text className="font-sans-extrabold text-title text-ink">What interests you?</Text>
        <Body>
          Pick topics so GreenPath can personalize your lessons, quizzes, and daily climate
          missions.
        </Body>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {interestOptions.map((item) => {
          const on = selected.includes(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              className={`min-h-12 justify-center rounded-full px-5 py-3 ${
                on ? 'bg-primary' : 'border border-line bg-card-raised'
              }`}>
              <Text className={`font-sans-semibold text-body ${on ? 'text-white' : 'text-ink'}`}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1" />

      <Button
        label="Continue"
        size="lg"
        trailingGlyph="→"
        disabled={selected.length === 0}
        onPress={() => onContinue(selected)}
      />
    </Screen>
  );
}
