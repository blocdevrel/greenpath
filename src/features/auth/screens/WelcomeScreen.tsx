import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { Body, Button, Card, Display, Label, Screen } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

export function WelcomeScreen({
  onGetStarted,
  onSignIn,
}: {
  onGetStarted: () => void;
  onSignIn: () => void;
}) {
  return (
    <Screen bottomPadding={28} scroll={false}>
      <View className="flex-1">
        <View className="flex-row items-center gap-3 pt-2">
          <View className="h-12 w-12 items-center justify-center rounded-md bg-primary">
            <Ionicons name="pulse" size={26} color={colors.card.raised} />
          </View>
          <Label className="font-sans-bold text-heading">Reach</Label>
        </View>

        <View className="mt-10 gap-4">
          <Display lead="Offline care" trail="Companion" xl />
          <Body>
            Rank visits, check danger signs, and close referrals — even without signal.
          </Body>
        </View>

        <View className="flex-1" />

        <View className="gap-4">
          <Card tone="dark" className="gap-2">
            <Label tone="subtle">Built for</Label>
            <Label className="font-sans-semibold text-body-lg">CHPS · Northern Ghana</Label>
          </Card>

          <Button label="Get started" size="lg" trailingGlyph="→" onPress={onGetStarted} />
          <Pressable onPress={onSignIn} className="h-12 items-center justify-center">
            <Label tone="primary">I have an account</Label>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
