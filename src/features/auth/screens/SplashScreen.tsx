import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeafLoader } from '@/shared/components/Illustration';
import { useShellWidth } from '@/shared/components/MobileShell';
import { Body, Caption } from '@/shared/components/ui';

import { splashArt } from '../data/onboardingArt';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const width = useShellWidth();
  const { height: windowHeight } = useWindowDimensions();
  const [progress, setProgress] = useState(0.15);
  const [heroReady, setHeroReady] = useState(false);

  const availableHeight = windowHeight - insets.top - insets.bottom;

  // Scale avatar to available height so tagline + loader never get clipped.
  const artSize = useMemo(() => {
    const byWidth = width - 72;
    const byHeight = availableHeight * 0.28;
    return Math.max(120, Math.min(byWidth, byHeight, 200));
  }, [width, availableHeight]);

  const compact = availableHeight < 700;

  useEffect(() => {
    const tick = setInterval(() => {
      setProgress((p) => Math.min(1, p + 0.12));
    }, 220);
    const done = setTimeout(onDone, 2200);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: insets.top + (compact ? 12 : 20),
          paddingBottom: insets.bottom + (compact ? 12 : 20),
          paddingHorizontal: 24,
          gap: compact ? 14 : 20,
        }}>
        <View className="items-center" style={{ gap: compact ? 6 : 8 }}>
          <View
            className="items-center justify-center rounded-2xl bg-primary"
            style={{ width: compact ? 44 : 48, height: compact ? 44 : 48 }}>
            <Text className="font-sans-extrabold text-heading text-white">GP</Text>
          </View>
          <Text className="font-sans-extrabold text-subheading text-primary">
            GreenPath Ghana
          </Text>
        </View>

        <View
          className="overflow-hidden rounded-full border-2 border-line bg-primary-50"
          style={{
            width: artSize,
            height: artSize,
            maxWidth: '100%',
          }}>
          <Image
            source={splashArt}
            style={{
              width: '100%',
              height: '100%',
              opacity: heroReady ? 1 : 0.4,
            }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            accessibilityLabel="African youth taking climate action in Ghana"
            onLoad={() => setHeroReady(true)}
          />
        </View>

        <View className="w-full items-center gap-2" style={{ maxWidth: 340 }}>
          <Text
            className={`text-center font-sans-bold text-ink ${
              compact ? 'text-body-lg' : 'text-subheading'
            }`}>
            Transform Climate Awareness Into Climate Action
          </Text>
          <Body className="text-center">
            Learn, act, and earn rewards with Africa’s youth climate journey.
          </Body>
        </View>

        <View className="items-center gap-2">
          <LeafLoader progress={progress} size={compact ? 'md' : 'lg'} />
          <Caption>Growing your path…</Caption>
        </View>
      </ScrollView>
    </View>
  );
}
