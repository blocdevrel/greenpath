import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { Illustration } from '@/shared/components/Illustration';
import { Body, Caption, Card, Label, Screen } from '@/shared/components/ui';
import { leaderboard } from '@/shared/data/greenpathData';
import { colors } from '@/shared/theme/tokens';

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="items-center gap-2">
        <Illustration kind="trophy" size="md" />
        <Text className="font-sans-extrabold text-title text-ink">Leaderboard</Text>
        <Body className="text-center">Weekly challenge, Friends, Community ranking</Body>
      </View>

      <Card tone="gold" className="gap-1">
        <Caption>Weekly challenge</Caption>
        <Label className="font-sans-bold">Complete 3 missions for bonus +250 XP</Label>
      </Card>

      <View className="gap-3">
        {leaderboard.map((row) => (
          <Card
            key={row.rank}
            className={`flex-row items-center gap-4 py-4 ${row.you ? 'border-2 border-primary' : ''}`}>
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                row.rank <= 3 ? 'bg-gold' : 'bg-canvas-sunken'
              }`}>
              <Text className="font-sans-bold text-body text-ink">
                {row.rank <= 3 ? '🏆' : row.rank}
              </Text>
            </View>
            <View className="flex-1">
              <Label className="font-sans-semibold">
                {row.name}
                {row.you ? ' (You)' : ''}
              </Label>
              <Caption>{row.xp.toLocaleString()} XP</Caption>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
