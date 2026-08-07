import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { Illustration } from '@/shared/components/Illustration';
import { Body, Caption, Card, Label, Screen, Stat } from '@/shared/components/ui';
import { badges } from '@/shared/data/greenpathData';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function RewardsScreen({ onBack }: { onBack: () => void }) {
  const { profile, unlockedBadgeIds } = useGreenPath();
  const xpPct = profile.xp / profile.xpToNext;

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="items-center gap-2">
        <Illustration kind="trophy" size="lg" />
        <Text className="font-sans-extrabold text-title text-ink">Rewards</Text>
        <Body className="text-center">
          Earn XP from lessons, quizzes, and verified climate missions.
        </Body>
      </View>

      <Card className="gap-3">
        <View className="flex-row items-end justify-between">
          <View>
            <Caption>XP meter</Caption>
            <Stat>
              {profile.xp}
              <Text className="font-sans text-label text-muted"> / {profile.xpToNext}</Text>
            </Stat>
          </View>
          <Label tone="primary">Level {profile.level}</Label>
        </View>
        <View className="h-3 overflow-hidden rounded-full bg-canvas-sunken">
          <View
            className="h-full rounded-full bg-gold"
            style={{ width: `${Math.round(xpPct * 100)}%` }}
          />
        </View>
      </Card>

      <Card tone="primary" className="flex-row items-center justify-between">
        <View>
          <Caption className="text-white/80">Learning streak</Caption>
          <Text className="font-sans-extrabold text-heading text-white">
            {profile.streak} days 🔥
          </Text>
        </View>
        <Text className="text-3xl">🎉</Text>
      </Card>

      <Label className="font-sans-semibold">Badges</Label>
      <View className="flex-row flex-wrap gap-3">
        {badges.map((badge) => {
          const unlocked = unlockedBadgeIds.includes(badge.id);
          return (
            <Card
              key={badge.id}
              className={`w-[47%] items-center gap-2 py-4 ${unlocked ? '' : 'opacity-45'}`}>
              <Illustration kind={badge.illustration} size="sm" />
              <Label className="text-center font-sans-semibold">{badge.name}</Label>
              <Caption>{unlocked ? 'Unlocked' : 'Locked. Complete missions'}</Caption>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
