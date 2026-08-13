import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Body, Caption, Card, Label, Screen, SearchField } from '@/shared/components/ui';
import { climateGlossary } from '@/shared/data/greenpathData';
import { colors } from '@/shared/theme/tokens';

export function GlossaryScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return climateGlossary;
    return climateGlossary.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.plainMeaning.toLowerCase().includes(q) ||
        t.applyDaily.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="gap-2">
        <Text className="font-sans-extrabold text-title text-ink">Climate glossary</Text>
        <Caption>
          Plain-language terms and how to apply them in daily life in Ghana.
        </Caption>
      </View>

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search terms…"
        accessibilityLabel="Search climate terms"
      />

      <View className="gap-3">
        {filtered.map((term) => (
          <Card key={term.id} className="gap-3">
            <Label className="font-sans-bold text-subheading">{term.term}</Label>
            <View className="gap-1">
              <Caption>What it means</Caption>
              <Body className="text-ink">{term.plainMeaning}</Body>
            </View>
            <View className="gap-1 rounded-xl bg-lime-soft px-3 py-3">
              <Caption>Apply today</Caption>
              <Body className="text-ink">{term.applyDaily}</Body>
            </View>
          </Card>
        ))}
        {filtered.length === 0 ? (
          <Card className="items-center py-8">
            <Caption>No terms match that search.</Caption>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}
