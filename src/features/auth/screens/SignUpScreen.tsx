import { useAuth, useSSO, useSignUp } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { Body, Button, Caption, Label } from '@/shared/components/ui';
import { useStableWindowHeight } from '@/shared/hooks/useStableWindowHeight';
import { images } from '@/shared/media';
import {
  clearPendingSignupInterests,
  markPendingSignupInterests,
} from '@/shared/storage/authOnboarding';
import { colors } from '@/shared/theme/tokens';

import { clerkErrorMessage, isExistingAccountError } from '../clerkErrors';
import { AuthField } from '../components/AuthField';
import { AuthScreen } from '../components/AuthScreen';
import { ClerkCaptcha } from '../components/ClerkCaptcha';
import { OrDivider, SocialAuthButtons } from '../components/SocialAuthButtons';

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function SignUpScreen({
  onBack,
  onNeedsVerification,
  onGoSignIn,
}: {
  onBack?: () => void;
  onNeedsVerification: (email: string) => void;
  onGoSignIn: () => void;
}) {
  const { compact } = useStableWindowHeight();
  const { isLoaded: authLoaded } = useAuth();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailOk = email.trim().includes('@');
  const passwordOk =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
  const canSubmit = authLoaded && !!signUp && !busy && emailOk && passwordOk;

  const onEmailSignUp = async () => {
    if (!signUp) return;
    setError(null);
    setBusy(true);
    try {
      const names = splitName(name);
      const emailAddress = email.trim().toLowerCase();

      const { error: passwordError } = await signUp.password({
        emailAddress,
        password,
        ...names,
      });
      if (passwordError) {
        setError(clerkErrorMessage(passwordError));
        if (isExistingAccountError(passwordError)) {
          // Nudge to sign-in after a beat so the message is readable
          setTimeout(() => onGoSignIn(), 1400);
        }
        return;
      }

      if (signUp.status === 'complete') {
        await markPendingSignupInterests();
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
          setError(clerkErrorMessage(finalizeError));
          await clearPendingSignupInterests();
        }
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(clerkErrorMessage(sendError));
        if (isExistingAccountError(sendError)) {
          setTimeout(() => onGoSignIn(), 1400);
        }
        return;
      }

      await markPendingSignupInterests();
      onNeedsVerification(emailAddress);
    } catch (e) {
      setError(clerkErrorMessage(e));
      if (isExistingAccountError(e)) {
        setTimeout(() => onGoSignIn(), 1400);
      }
    } finally {
      setBusy(false);
    }
  };

  const onSocial = async (strategy: 'oauth_google') => {
    setError(null);
    setBusy(true);
    try {
      const { createdSessionId, setActive, signIn, signUp: ssoSignUp } =
        await startSSOFlow({ strategy });

      // Existing account via Sign Up Google → treat as sign-in (no interests).
      if (signIn?.status === 'complete' && setActive && signIn.createdSessionId) {
        await clearPendingSignupInterests();
        await setActive({ session: signIn.createdSessionId });
        return;
      }

      if (ssoSignUp?.status === 'complete' && setActive && ssoSignUp.createdSessionId) {
        await markPendingSignupInterests();
        await setActive({ session: ssoSignUp.createdSessionId });
        return;
      }

      if (createdSessionId && setActive) {
        // Ambiguous session from SSO — prefer signup interests only if no signIn object.
        if (signIn) await clearPendingSignupInterests();
        else await markPendingSignupInterests();
        await setActive({ session: createdSessionId });
        return;
      }

      setError('Social sign-up did not complete. Enable Google in Clerk → SSO connections.');
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      footer={
        <Pressable
          onPress={onGoSignIn}
          className="min-h-11 flex-row items-center justify-center gap-1">
          <Label tone="subtle">Already have an account?</Label>
          <Label tone="primary">Sign In</Label>
        </Pressable>
      }>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityLabel="Back"
          className="h-10 w-10 items-center justify-center self-start rounded-full border border-line bg-card-raised">
          <Ionicons name="arrow-back" size={18} color={colors.ink.DEFAULT} />
        </Pressable>
      ) : null}

      <View className="items-center">
        <Image
          source={images.mascotAuth}
          style={{ width: compact ? 88 : 108, height: compact ? 72 : 88 }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel="GreenPath fox welcoming new members"
        />
      </View>

      <View className={`items-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
        <Text
          className={`text-center font-sans-extrabold text-ink ${
            compact ? 'text-heading' : 'text-title'
          }`}>
          Create your path
        </Text>
        <Body className="text-center text-caption">
          Join African youth taking climate action
        </Body>
      </View>

      <SocialAuthButtons
        disabled={!authLoaded}
        busy={busy}
        onGoogle={() => void onSocial('oauth_google')}
      />

      <OrDivider label="or email" />

      <View className="gap-3">
        <AuthField
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />
        <AuthField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="you@email.com"
        />
        <AuthField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Create a password"
        />
        <Caption>
          8+ chars with upper, lower, number & symbol
        </Caption>
      </View>

      <ClerkCaptcha />

      {error ? (
        <View className="gap-2">
          <Label className="text-center text-caption text-danger">{error}</Label>
          {/already has an account|Sign In instead/i.test(error) ? (
            <Pressable
              onPress={onGoSignIn}
              className="min-h-10 items-center justify-center rounded-xl bg-primary-50 px-3">
              <Label tone="primary">Go to Sign In</Label>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Button
        label={busy ? 'Creating…' : 'Sign Up'}
        size="lg"
        trailingGlyph="→"
        disabled={!canSubmit}
        onPress={() => void onEmailSignUp()}
      />
    </AuthScreen>
  );
}
