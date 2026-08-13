import { useAuth, useSignIn, useSignUp } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button, Display, Label } from '@/shared/components/ui';
import {
  clearPendingSignupInterests,
  markPendingSignupInterests,
} from '@/shared/storage/authOnboarding';
import { colors } from '@/shared/theme/tokens';

import { clerkErrorMessage } from '../clerkErrors';
import { AuthScreen } from '../components/AuthScreen';
import { OTP_LENGTH, OtpInput } from '../components/OtpInput';

export type VerifyMode = 'signup' | 'signin';

export function VerifyCodeScreen({
  email,
  mode = 'signup',
  onBack,
}: {
  email: string;
  mode?: VerifyMode;
  onBack: () => void;
}) {
  const { isLoaded: authLoaded } = useAuth();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const code = digits.join('');
  const ready = code.length === OTP_LENGTH;

  const onVerify = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        if (!signIn) return;
        const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code });
        if (verifyError) {
          setError(clerkErrorMessage(verifyError));
          return;
        }
        if (signIn.status === 'complete') {
          const { error: finalizeError } = await signIn.finalize();
          if (finalizeError) setError(clerkErrorMessage(finalizeError));
          else await clearPendingSignupInterests();
        } else {
          setError(`Sign-in incomplete (${signIn.status}). Try again.`);
        }
        return;
      }

      if (!signUp) return;
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        setError(clerkErrorMessage(verifyError));
        return;
      }
      await markPendingSignupInterests();
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setError(clerkErrorMessage(finalizeError));
        await clearPendingSignupInterests();
      }
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
      if (mode === 'signin') {
        if (!signIn) return;
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) {
          setError(clerkErrorMessage(sendError));
          return;
        }
      } else {
        if (!signUp) return;
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
          setError(clerkErrorMessage(sendError));
          return;
        }
      }
      setDigits(Array(OTP_LENGTH).fill(''));
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-10 w-10 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={18} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="gap-1.5">
        <Display lead="Enter" trail="Code" />
        <Label tone="subtle" className="text-caption">
          {mode === 'signin'
            ? `New device check — code sent to ${email || 'your inbox'}`
            : `Email code sent to ${email || 'your inbox'}`}
        </Label>
      </View>

      <OtpInput digits={digits} onChangeDigits={setDigits} autoFocus />

      {error ? <Label className="text-center text-caption text-danger">{error}</Label> : null}

      <Button
        label={busy ? 'Verifying…' : 'Verify'}
        size="lg"
        disabled={!ready || busy || !authLoaded}
        onPress={() => void onVerify()}
        trailingGlyph="→"
      />

      {busy ? <ActivityIndicator color={colors.primary.DEFAULT} /> : null}

      <Pressable
        onPress={() => void onResend()}
        disabled={busy}
        className="min-h-11 items-center justify-center">
        <Label tone="primary">Resend code</Label>
      </Pressable>
    </AuthScreen>
  );
}
