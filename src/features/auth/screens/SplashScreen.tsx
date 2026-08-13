import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeafLoader } from '@/shared/components/Illustration';
import { useShellWidth } from '@/shared/components/MobileShell';
import { Body, Caption } from '@/shared/components/ui';
import { images } from '@/shared/media';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const width = useShellWidth();
  const { height: windowHeight } = useWindowDimensions();
  const [progress, setProgress] = useState(0.15);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const availableHeight = windowHeight - insets.top - insets.bottom;

  // Scale mascot to available height so tagline + loader never get clipped.
  const artSize = (() => {
    const byWidth = width - 56;
    const byHeight = availableHeight * 0.38;
    return Math.max(160, Math.min(byWidth, byHeight, 280));
  })();

  const compact = availableHeight < 700;

  // Stable effect — parent often re-creates `onDone`, which used to reset the
  // timer forever and leave splash blinking.
  useEffect(() => {
    const tick = setInterval(() => {
      setProgress((p) => Math.min(1, p + 0.12));
    }, 220);
    const done = setTimeout(() => onDoneRef.current(), 2200);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, []);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: insets.top + (compact ? 12 : 20),
          paddingBottom: insets.bottom + (compact ? 12 : 20),
          paddingHorizontal: 24,
          gap: compact ? 14 : 20,
          minHeight: availableHeight,
        }}>
        <View className="items-center" style={{ gap: compact ? 6 : 8 }}>
          <Text className="font-sans-extrabold text-subheading text-primary">
            GreenPath Ghana
          </Text>
        </View>

        <Image
          source={images.mascotWelcome}
          style={{ width: artSize, height: artSize }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel="GreenPath fox mascot waving hello"
        />

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
