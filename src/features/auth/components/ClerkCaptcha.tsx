import { createElement, useEffect, useRef } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';

const CAPTCHA_ID = 'clerk-captcha';

/**
 * Mount point for Clerk bot-protection CAPTCHA.
 * On Expo web Clerk looks up `document.getElementById('clerk-captcha')`.
 */
export function ClerkCaptcha() {
  if (Platform.OS === 'web') {
    return <WebClerkCaptcha />;
  }

  return (
    <View
      nativeID={CAPTCHA_ID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ minHeight: 1, width: '100%' }}
    />
  );
}

function WebClerkCaptcha() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    el.id = CAPTCHA_ID;
  }, []);

  return createElement('div', {
    ref: hostRef,
    id: CAPTCHA_ID,
    style: {
      width: '100%',
      minHeight: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    } as unknown as ViewStyle,
  });
}
