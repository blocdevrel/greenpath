import { useAuth, useSignIn } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Body, Button, Label, Screen } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { clerkErrorMessage } from '../clerkErrors';
import { AuthField } from '../components/AuthField';

type Step = 'email' | 'code' | 'password';

export function ForgotPasswordScreen({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const { isLoaded: authLoaded } = useAuth();
  const { signIn } = useSignIn();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!signIn) return;
    setError(null);
    setBusy(true);
    try {
      const { error: createError } = await signIn.create({
        identifier: email.trim(),
      });
      if (createError) {
        setError(clerkErrorMessage(createError));
        return;
      }

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(clerkErrorMessage(sendError));
        return;
      }

      setStep('code');
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!signIn) return;
    setError(null);
    setBusy(true);
    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });
      if (verifyError) {
        setError(clerkErrorMessage(verifyError));
        return;
      }
      setStep('password');
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async () => {
    if (!signIn) return;
    setError(null);
    setBusy(true);
    try {
      const { error: passwordError } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (passwordError) {
        setError(clerkErrorMessage(passwordError));
        return;
      }

      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setError(clerkErrorMessage(finalizeError));
          return;
        }
        onDone();
        return;
      }

      setError('Password updated, but sign-in needs another step. Try signing in.');
      onDone();
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

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
          {step === 'email'
            ? 'Enter your email and Clerk will send a reset code.'
            : step === 'code'
              ? `Enter the code sent to ${email}.`
              : 'Choose a new password to get back on your climate journey.'}
        </Body>
      </View>

      {step === 'email' ? (
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
            label={busy ? 'Sending…' : 'Send reset code'}
            size="lg"
            trailingGlyph="→"
            disabled={busy || !authLoaded || !email.trim()}
            onPress={() => void sendCode()}
          />
        </>
      ) : null}

      {step === 'code' ? (
        <>
          <AuthField
            label="Reset code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholder="6-digit code"
          />
          <Button
            label={busy ? 'Verifying…' : 'Verify code'}
            size="lg"
            trailingGlyph="→"
            disabled={busy || !code.trim()}
            onPress={() => void verifyCode()}
          />
        </>
      ) : null}

      {step === 'password' ? (
        <>
          <AuthField
            label="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 8 characters"
          />
          <Button
            label={busy ? 'Saving…' : 'Set new password'}
            size="lg"
            trailingGlyph="→"
            disabled={busy || password.length < 8}
            onPress={() => void submitPassword()}
          />
        </>
      ) : null}

      {error ? <Label className="text-center text-danger">{error}</Label> : null}
      {busy ? <ActivityIndicator color={colors.primary.DEFAULT} /> : null}
    </Screen>
  );
}
