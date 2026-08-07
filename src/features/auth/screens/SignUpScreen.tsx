import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Body, Button, Label, Screen } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { AuthField } from '../components/AuthField';

export function SignUpScreen({
  onBack,
  onContinue,
  onGoSignIn,
}: {
  onBack: () => void;
  onContinue: () => void;
  onGoSignIn: () => void;
}) {
  const [name, setName] = useState('Isaac Mensah');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="gap-2">
        <Text className="font-sans-extrabold text-title text-ink">Create your path</Text>
        <Body>Join thousands of African youth taking climate action</Body>
      </View>

      <AuthField label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@email.com"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Create a password"
      />

      <Button label="Sign Up" size="lg" trailingGlyph="→" onPress={onContinue} />

      <Pressable
        onPress={onGoSignIn}
        className="h-12 flex-row items-center justify-center gap-1">
        <Label tone="subtle">Already have an account?</Label>
        <Label tone="primary">Sign In</Label>
      </Pressable>
    </Screen>
  );
}
