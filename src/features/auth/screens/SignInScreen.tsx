import { useAuth, useSSO, useSignIn } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { Body, Button, Label } from '@/shared/components/ui';
import { useStableWindowHeight } from '@/shared/hooks/useStableWindowHeight';
import { images } from '@/shared/media';
import { colors } from '@/shared/theme/tokens';

import { clerkErrorMessage } from '../clerkErrors';
import { AuthField } from '../components/AuthField';
import { AuthScreen } from '../components/AuthScreen';
import { ClerkCaptcha } from '../components/ClerkCaptcha';
import { OTP_LENGTH, OtpInput } from '../components/OtpInput';
import { OrDivider, SocialAuthButtons } from '../components/SocialAuthButtons';
import { clearPendingSignupInterests } from '@/shared/storage/authOnboarding';

type Step = 'credentials' | 'code';

export function SignInScreen({
  onBack,
  onGoSignUp,
  onForgotPassword,
}: {
  onBack?: () => void;
  onGoSignUp: () => void;
  onForgotPassword?: () => void;
  /** @deprecated verification stays on this screen now */
  onNeedsVerification?: (email: string) => void;
}) {
  const { compact } = useStableWindowHeight();
  const { isLoaded: authLoaded } = useAuth();
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ready = authLoaded && !!signIn;
  const code = digits.join('');

  const sendTrustCode = async () => {
    if (!signIn) throw new Error('Sign-in not ready');

    // Client Trust / MFA email code
    if (typeof signIn.mfa?.sendEmailCode === 'function') {
      const { error } = await signIn.mfa.sendEmailCode();
      if (!error) return 'mfa';
      // fall through to first-factor email code
    }

    if (typeof signIn.emailCode?.sendCode === 'function') {
      const { error } = await signIn.emailCode.sendCode();
      if (!error) return 'emailCode';
      throw error;
    }

    if (typeof signIn.sendEmailCode === 'function') {
      const { error } = await signIn.sendEmailCode();
      if (!error) return 'sendEmailCode';
      throw error;
    }

    throw new Error('No email verification method available on this Clerk instance.');
  };

  const verifyTrustCode = async (otp: string) => {
    if (!signIn) throw new Error('Sign-in not ready');

    if (typeof signIn.mfa?.verifyEmailCode === 'function') {
      const { error } = await signIn.mfa.verifyEmailCode({ code: otp });
      if (!error) return;
      // try alternate APIs below
      if (signIn.status === 'complete') return;
    }

    if (typeof signIn.emailCode?.verifyCode === 'function') {
      const { error } = await signIn.emailCode.verifyCode({ code: otp });
      if (error) throw error;
      return;
    }

    if (typeof signIn.verifyEmailCode === 'function') {
      const { error } = await signIn.verifyEmailCode({ code: otp });
      if (error) throw error;
      return;
    }

    throw new Error('Could not verify the email code.');
  };

  const onEmailSignIn = async () => {
    if (!signIn) return;
    setError(null);
    setBusy(true);
    try {
      const emailAddress = email.trim().toLowerCase();
      const { error: passwordError } = await signIn.password({
        emailAddress,
        password,
      });
      if (passwordError) {
        setError(clerkErrorMessage(passwordError));
        return;
      }

      // Re-read status after password attempt
      const status = signIn.status;

      if (status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setError(clerkErrorMessage(finalizeError));
        } else {
          await clearPendingSignupInterests();
        }
        return;
      }

      if (
        status === 'needs_client_trust' ||
        status === 'needs_second_factor' ||
        status === 'needs_first_factor'
      ) {
        await sendTrustCode();
        setDigits(Array(OTP_LENGTH).fill(''));
        setStep('code');
        return;
      }

      setError(
        `Sign-in incomplete (status: ${status ?? 'unknown'}). Try Google, or check Clerk password / Client Trust settings.`,
      );
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onVerifyCode = async () => {
    if (!signIn || code.length !== OTP_LENGTH) return;
    setError(null);
    setBusy(true);
    try {
      await verifyTrustCode(code);

      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setError(clerkErrorMessage(finalizeError));
        } else {
          await clearPendingSignupInterests();
        }
        return;
      }

      setError(`Still incomplete after code (status: ${signIn.status}). Resend and try again.`);
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setBusy(true);
    try {
      await sendTrustCode();
      setDigits(Array(OTP_LENGTH).fill(''));
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onSocial = async (strategy: 'oauth_google') => {
    setError(null);
    setBusy(true);
    try {
      const { createdSessionId, setActive, signIn: ssoSignIn, signUp } =
        await startSSOFlow({ strategy });

      // Sign-in screen: never show interests afterward.
      await clearPendingSignupInterests();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return;
      }

      if (ssoSignIn?.status === 'complete' && setActive && ssoSignIn.createdSessionId) {
        await setActive({ session: ssoSignIn.createdSessionId });
        return;
      }

      if (signUp?.status === 'complete' && setActive && signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
        return;
      }

      setError('Social sign-in did not complete. Enable Google in Clerk → SSO connections.');
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (step === 'code') {
    return (
      <AuthScreen>
        <Pressable
          onPress={() => {
            setStep('credentials');
            setError(null);
          }}
          accessibilityLabel="Back"
          className="h-10 w-10 items-center justify-center self-start rounded-full border border-line bg-card-raised">
          <Ionicons name="arrow-back" size={18} color={colors.ink.DEFAULT} />
        </Pressable>

        <View className="items-center gap-1.5">
          <Text className="text-center font-sans-extrabold text-heading text-ink">Check your email</Text>
          <Body className="text-center text-caption">
            Enter the 6-digit code sent to {email.trim().toLowerCase() || 'your inbox'}
          </Body>
        </View>

        <OtpInput digits={digits} onChangeDigits={setDigits} autoFocus />

        {error ? (
          <Label className="text-center text-caption text-danger">{error}</Label>
        ) : null}

        <Button
          label={busy ? 'Verifying…' : 'Verify & sign in'}
          size="lg"
          trailingGlyph="→"
          disabled={busy || code.length !== OTP_LENGTH || !ready}
          onPress={() => void onVerifyCode()}
        />

        <Pressable
          onPress={() => void onResend()}
          disabled={busy}
          className="min-h-11 items-center justify-center">
          <Label tone="primary">Resend code</Label>
        </Pressable>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      footer={
        <Pressable
          onPress={onGoSignUp}
          className="min-h-11 flex-row items-center justify-center gap-1">
          <Label tone="subtle">New here?</Label>
          <Label tone="primary">Sign Up</Label>
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
          accessibilityLabel="GreenPath fox saying welcome back"
        />
      </View>

      <View className={`items-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
        <Text
          className={`text-center font-sans-extrabold text-ink ${
            compact ? 'text-heading' : 'text-title'
          }`}>
          Welcome back
        </Text>
        <Body className="text-center text-caption">Sign in to continue your climate journey</Body>
      </View>

      <SocialAuthButtons
        disabled={!ready}
        busy={busy}
        onGoogle={() => void onSocial('oauth_google')}
      />

      <OrDivider />

      <View className="gap-3">
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
          placeholder="Your password"
        />
      </View>

      <Pressable onPress={onForgotPassword} className="min-h-9 self-end justify-center">
        <Label tone="primary" className="text-caption">
          Forgot Password?
        </Label>
      </Pressable>

      {error ? (
        <Label className="text-center text-caption text-danger">{error}</Label>
      ) : null}

      <ClerkCaptcha />

      <Button
        label={busy ? 'Signing in…' : 'Sign In'}
        size="lg"
        trailingGlyph="→"
        disabled={busy || !ready || !email.trim() || !password}
        onPress={() => void onEmailSignIn()}
      />
    </AuthScreen>
  );
}
