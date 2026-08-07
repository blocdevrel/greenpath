import { useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useShellWidth } from '@/shared/components/MobileShell';
import { Body, Button, Label } from '@/shared/components/ui';

import { onboardingPages } from '../data/onboardingArt';

export function OnboardingScreen({
  onSkip,
  onDone,
}: {
  onSkip: () => void;
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const shellWidth = useShellWidth();
  const { height: windowHeight } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(shellWidth);
  const pager = useRef<ScrollView>(null);
  const last = index === onboardingPages.length - 1;

  const footerHeight = 120 + insets.bottom;
  const headerHeight = 52 + insets.top;
  const contentHeight = Math.max(280, windowHeight - headerHeight - footerHeight);

  // Keep illustration within remaining space so title/subtitle stay visible.
  const artSize = Math.max(
    140,
    Math.min(pageWidth - 48, contentHeight * 0.52, 260),
  );

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(next, onboardingPages.length - 1));
    pager.current?.scrollTo({ x: clamped * pageWidth, animated: true });
    setIndex(clamped);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setIndex(Math.max(0, Math.min(next, onboardingPages.length - 1)));
  };

  const goNext = () => {
    if (last) {
      onDone();
      return;
    }
    goTo(index + 1);
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between px-5 pb-2">
        <Text className="font-sans-bold text-label text-primary">GreenPath Ghana</Text>
        <Pressable onPress={onSkip} accessibilityRole="button" className="h-11 justify-center px-2">
          <Label tone="subtle">Skip</Label>
        </Pressable>
      </View>

      <View
        className="flex-1"
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          if (w > 0 && w !== pageWidth) setPageWidth(w);
        }}>
        <ScrollView
          ref={pager}
          horizontal
          pagingEnabled
          bounces={false}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          onScrollEndDrag={onScrollEnd}
          decelerationRate="fast"
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: 'stretch' }}>
          {onboardingPages.map((page) => (
            <View
              key={page.id}
              style={{
                width: pageWidth,
                height: contentHeight,
                paddingHorizontal: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                className="overflow-hidden rounded-3xl bg-card"
                style={{ width: artSize, height: artSize, maxWidth: '100%' }}>
                <Image
                  source={page.art}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                  accessibilityLabel={page.title}
                />
              </View>

              <View className="mt-5 w-full items-center gap-2 px-1" style={{ maxWidth: 360 }}>
                <Text
                  className="text-center font-sans-extrabold text-ink"
                  style={{ fontSize: contentHeight < 420 ? 20 : 26 }}
                  numberOfLines={2}>
                  {page.title}
                </Text>
                <Body className="text-center" numberOfLines={3}>
                  {page.subtitle}
                </Body>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="gap-3 px-5" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row justify-center gap-2">
          {onboardingPages.map((page, i) => (
            <View
              key={page.id}
              className={`h-2 rounded-full ${i === index ? 'w-7 bg-primary' : 'w-2 bg-canvas-sunken'}`}
            />
          ))}
        </View>
        <Button
          label={last ? 'Get Started' : 'Next'}
          size="lg"
          trailingGlyph="→"
          onPress={goNext}
        />
      </View>
    </View>
  );
}
