import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Body, Button, Label, Screen } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { AuthField } from '../components/AuthField';

export function ForgotPasswordScreen({
  onBack,
  onSent,
}: {
  onBack: () => void;
  onSent: () => void;
}) {
  const [email, setEmail] = useState('isaac@greenpath.gh');
  const [sent, setSent] = useState(false);

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="gap-2">
        <Text className="font-sans-extrabold text-title text-ink">Reset password</Text>
        <Body>
          Enter your email and GreenPath will send a secure link so you can get back to your
          climate journey.
        </Body>
      </View>

      {sent ? (
        <View className="gap-4 rounded-md bg-primary-50 p-5">
          <Label className="font-sans-bold">Check your inbox</Label>
          <Body className="text-ink">
            We sent reset instructions to {email}. After resetting, sign in and continue learning.
          </Body>
          <Button label="Back to Sign In" size="lg" onPress={onSent} />
        </View>
      ) : (
        <>
          <AuthField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@email.com"
          />
          <Button
            label="Send reset link"
            size="lg"
            trailingGlyph="→"
            onPress={() => setSent(true)}
          />
        </>
      )}
    </Screen>
  );
}
