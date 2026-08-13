import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/shared/theme/tokens';
import {
  markSplashFinishedThisSession,
  readAuthOnboardingSeen,
  readSplashFinishedThisSession,
  writeAuthOnboardingSeen,
} from '@/shared/storage/authOnboarding';
import { captureInviteFromLaunch } from '@/shared/storage/inviteReferral';

import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { SplashScreen } from './screens/SplashScreen';
import { VerifyCodeScreen, type VerifyMode } from './screens/VerifyCodeScreen';

export type AuthStep =
  | 'splash'
  | 'onboarding'
  | 'signin'
  | 'signup'
  | 'verify'
  | 'forgot';

function initialAuthStep(): AuthStep {
  if (readSplashFinishedThisSession()) return 'onboarding';
  return 'splash';
}

/**
 * Auth gate driven by Clerk session outside this flow.
 * splash → onboarding (once) → sign in / sign up → (verify email / device trust) → app.
 */
export function AuthFlow() {
  const [booting, setBooting] = useState(true);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [step, setStep] = useState<AuthStep>(initialAuthStep);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyMode, setVerifyMode] = useState<VerifyMode>('signup');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [seen] = await Promise.all([
        readAuthOnboardingSeen(),
        // Remember referral links silently — do not surface an invite code on signup.
        captureInviteFromLaunch(),
      ]);
      if (cancelled) return;
      setOnboardingSeen(seen);
      if (seen) setStep('signin');
      setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const finishSplash = () => {
    markSplashFinishedThisSession();
    setStep('onboarding');
  };

  const completeAuthOnboarding = (next: AuthStep) => {
    setOnboardingSeen(true);
    void writeAuthOnboardingSeen();
    setStep(next);
  };

  const goVerify = (email: string, mode: VerifyMode) => {
    setVerifyEmail(email);
    setVerifyMode(mode);
    setStep('verify');
  };

  if (booting) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (step === 'splash') {
    return <SplashScreen onDone={finishSplash} />;
  }

  if (step === 'onboarding') {
    return (
      <OnboardingScreen
        onSkip={() => completeAuthOnboarding('signin')}
        onDone={() => completeAuthOnboarding('signup')}
      />
    );
  }

  if (step === 'forgot') {
    return (
      <ForgotPasswordScreen
        onBack={() => setStep('signin')}
        onDone={() => setStep('signin')}
      />
    );
  }

  if (step === 'verify') {
    return (
      <VerifyCodeScreen
        email={verifyEmail}
        mode={verifyMode}
        onBack={() => setStep(verifyMode === 'signin' ? 'signin' : 'signup')}
      />
    );
  }

  if (step === 'signin') {
    return (
      <SignInScreen
        onBack={onboardingSeen ? undefined : () => setStep('onboarding')}
        onGoSignUp={() => setStep('signup')}
        onForgotPassword={() => setStep('forgot')}
      />
    );
  }

  return (
    <SignUpScreen
      onBack={onboardingSeen ? undefined : () => setStep('onboarding')}
      onNeedsVerification={(email) => goVerify(email, 'signup')}
      onGoSignIn={() => setStep('signin')}
    />
  );
}
