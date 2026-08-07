import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Body, Button, Label, Screen } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { AuthField } from '../components/AuthField';

function SocialButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="h-14 flex-row items-center justify-center gap-3 rounded-full border border-line bg-card-raised active:opacity-80">
      <Ionicons name={icon} size={20} color={colors.ink.DEFAULT} />
      <Text className="font-sans-semibold text-body text-ink">{label}</Text>
    </Pressable>
  );
}

export function SignInScreen({
  onBack,
  onContinue,
  onGoSignUp,
  onForgotPassword,
}: {
  onBack: () => void;
  onContinue: () => void;
  onGoSignUp: () => void;
  onForgotPassword?: () => void;
}) {
  const [email, setEmail] = useState('isaac@greenpath.gh');
  const [password, setPassword] = useState('••••••••');

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="gap-2">
        <Text className="font-sans-extrabold text-title text-ink">Welcome back</Text>
        <Body>Sign in to continue your climate journey</Body>
      </View>

      <View className="gap-3">
        <SocialButton label="Continue with Google" icon="logo-google" onPress={onContinue} />
        <SocialButton label="Continue with Apple" icon="logo-apple" onPress={onContinue} />
      </View>

      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-line" />
        <Text className="font-sans text-caption text-muted">or email</Text>
        <View className="h-px flex-1 bg-line" />
      </View>

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
        placeholder="Your password"
      />

      <Pressable onPress={onForgotPassword} className="self-end">
        <Label tone="primary">Forgot Password?</Label>
      </Pressable>

      <Button label="Sign In" size="lg" trailingGlyph="→" onPress={onContinue} />

      <Pressable
        onPress={onGoSignUp}
        className="h-12 flex-row items-center justify-center gap-1">
        <Label tone="subtle">New here?</Label>
        <Label tone="primary">Sign Up</Label>
      </Pressable>
    </Screen>
  );
}
