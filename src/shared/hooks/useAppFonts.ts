import { PlusJakartaSans_300Light } from '@expo-google-fonts/plus-jakarta-sans/300Light';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Loads the six Plus Jakarta Sans weights the type scale depends on.
 * Imported by subpath so the unused italics stay out of the bundle.
 */
export function useAppFonts() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [timedOut, setTimedOut] = useState(false);

  // FontFaceObserver on web can hit a 12s timeout without surfacing an error
  // to useFonts — that left App stuck on `return null` (blank screen).
  useEffect(() => {
    if (loaded || error) return;
    const ms = Platform.OS === 'web' ? 4000 : 12000;
    const timer = setTimeout(() => setTimedOut(true), ms);
    return () => clearTimeout(timer);
  }, [loaded, error]);

  return loaded || error !== null || timedOut;
}
