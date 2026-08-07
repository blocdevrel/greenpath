import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { Caption, Card, Label, Screen, Stat } from '@/shared/components/ui';
import { userProfile, weeklyProgress } from '@/shared/data/greenpathData';
import { colors } from '@/shared/theme/tokens';

export function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <Text className="font-sans-extrabold text-title text-ink">Analytics</Text>
      <Caption>Track lessons, quizzes, missions, and XP growth</Caption>

      <View className="flex-row flex-wrap gap-3">
        <Metric label="Lessons" value={String(userProfile.lessonsCompleted)} />
        <Metric label="Missions" value={String(userProfile.missionsCompleted)} />
        <Metric label="Quiz avg" value="80%" />
        <Metric label="XP growth" value="+420" />
      </View>

      <Card className="gap-4">
        <Label className="font-sans-semibold">Weekly activity</Label>
        <View className="h-36 flex-row items-end justify-between gap-2">
          {weeklyProgress.map((d) => (
            <View key={d.day} className="flex-1 items-center gap-2">
              <View
                className="w-full rounded-md bg-accent"
                style={{ height: Math.max(16, (d.value / 100) * 120), opacity: 0.85 }}
              />
              <Caption>{d.day}</Caption>
            </View>
          ))}
        </View>
      </Card>

      <Card className="gap-4">
        <Label className="font-sans-semibold">Learning progress</Label>
        <ProgressRow label="Lessons completed" pct={72} />
        <ProgressRow label="Quiz performance" pct={80} />
        <ProgressRow label="Mission completion" pct={64} />
        <ProgressRow label="XP toward next level" pct={Math.round((userProfile.xp / userProfile.xpToNext) * 100)} />
      </Card>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="w-[47%] gap-1 py-4">
      <Stat className="text-heading">{value}</Stat>
      <Caption>{label}</Caption>
    </Card>
  );
}

function ProgressRow({ label, pct }: { label: string; pct: number }) {
  return (
    <View className="gap-2">
      <View className="flex-row justify-between">
        <Caption>{label}</Caption>
        <Caption>{pct}%</Caption>
      </View>
      <View className="h-2.5 overflow-hidden rounded-full bg-canvas-sunken">
        <View className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}
