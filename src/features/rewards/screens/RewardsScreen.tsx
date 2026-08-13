import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, Text, View } from 'react-native';

import { BadgeMedal } from '@/features/rewards/components/BadgeMedal';
import { StreakFireIcon } from '@/shared/components/GameArt';
import { Body, Caption, Label, Screen, Stat } from '@/shared/components/ui';
import { images } from '@/shared/media';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function RewardsScreen({ onBack }: { onBack: () => void }) {
  const { profile, badges } = useGreenPath();
  const xpPct = Math.min(1, profile.xpToNext > 0 ? profile.xp / profile.xpToNext : 0);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start border border-line bg-card-raised"
        style={{ borderRadius: 8 }}>
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="flex-row items-center gap-3">
        <Image
          source={images.treasure}
          style={{ width: 52, height: 52 }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel="Rewards treasure"
        />
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-sans-extrabold text-title text-ink">Rewards</Text>
          <Body>
            Earn XP from lessons, quizzes, and verified climate missions.
          </Body>
          <Caption>
            {unlockedCount} / {Math.max(badges.length, 1)} badges unlocked
          </Caption>
        </View>
      </View>

      <View className="gap-3 bg-card p-4" style={{ borderRadius: 8 }}>
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
        <View className="h-2.5 overflow-hidden bg-canvas-sunken" style={{ borderRadius: 8 }}>
          <View
            className="h-full bg-gold"
            style={{ width: `${Math.round(xpPct * 100)}%`, borderRadius: 8 }}
          />
        </View>
      </View>

      <View className="flex-row items-center justify-between bg-primary px-4 py-3.5" style={{ borderRadius: 8 }}>
        <View>
          <Caption className="text-white/80">Learning streak</Caption>
          <Text className="font-sans-extrabold text-heading text-white">
            {profile.streak} days
          </Text>
        </View>
        <View
          className="h-12 w-12 items-center justify-center bg-white/15"
          style={{ borderRadius: 8 }}>
          <StreakFireIcon size={36} />
        </View>
      </View>

      <Label className="font-sans-semibold">Badges</Label>
      {badges.length === 0 ? (
        <View className="bg-card p-4" style={{ borderRadius: 8 }}>
          <Caption>
            Sign in online to load the badge catalog. Completing lessons and missions unlocks them.
          </Caption>
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between gap-y-2.5">
          {badges.map((badge) => (
            <View
              key={badge.key}
              className="items-center gap-2 bg-card px-3 py-4"
              style={{ width: '48.5%', borderRadius: 8, opacity: badge.unlocked ? 1 : 0.85 }}>
              <BadgeMedal visual={badge.visual} unlocked={badge.unlocked} size="md" />
              <Label className="text-center font-sans-semibold" numberOfLines={1}>
                {badge.name}
              </Label>
              <Caption className="text-center" numberOfLines={2}>
                {badge.unlocked ? badge.description : badge.hint}
              </Caption>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
