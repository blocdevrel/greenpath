import { useState } from 'react';

import { useGreenPath } from '@/shared/state/GreenPathContext';

import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { InterestsScreen } from './screens/InterestsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { SplashScreen } from './screens/SplashScreen';

export type AuthStep =
  | 'splash'
  | 'onboarding'
  | 'signin'
  | 'signup'
  | 'forgot'
  | 'interests';

/**
 * Auth gate: splash → onboarding → sign in / sign up → interests → app.
 * Interests personalize lessons & missions for the climate journey.
 */
export function AuthFlow({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { setInterests } = useGreenPath();
  const [step, setStep] = useState<AuthStep>('splash');

  if (step === 'splash') {
    return <SplashScreen onDone={() => setStep('onboarding')} />;
  }

  if (step === 'onboarding') {
    return (
      <OnboardingScreen
        onSkip={() => setStep('signin')}
        onDone={() => setStep('signup')}
      />
    );
  }

  if (step === 'forgot') {
    return (
      <ForgotPasswordScreen
        onBack={() => setStep('signin')}
        onSent={() => setStep('signin')}
      />
    );
  }

  if (step === 'signin') {
    return (
      <SignInScreen
        onBack={() => setStep('onboarding')}
        onContinue={() => setStep('interests')}
        onGoSignUp={() => setStep('signup')}
        onForgotPassword={() => setStep('forgot')}
      />
    );
  }

  if (step === 'signup') {
    return (
      <SignUpScreen
        onBack={() => setStep('onboarding')}
        onContinue={() => setStep('interests')}
        onGoSignIn={() => setStep('signin')}
      />
    );
  }

  return (
    <InterestsScreen
      onContinue={(ids) => {
        setInterests(ids);
        onAuthenticated();
      }}
    />
  );
}
