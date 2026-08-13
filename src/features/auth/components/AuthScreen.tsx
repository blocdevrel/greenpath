import { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStableWindowHeight } from '@/shared/hooks/useStableWindowHeight';

/**
 * Mobile-first auth layout: keyboard-safe scrolling on native + web.
 * Web: never scroll the document on focus (that blurs inputs). Keep layout
 * height stable while the browser resizes with the soft keyboard.
 */
export function AuthScreen({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { height: layoutHeight, compact } = useStableWindowHeight();
  const scrollRef = useRef<ScrollView>(null);
  const bottomPad = Math.max(insets.bottom, 12) + 24;

  const scroll = (
    <ScrollView
      ref={scrollRef}
      className="flex-1"
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      bounces
      overScrollMode="auto"
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      contentContainerStyle={{
        flexGrow: 1,
        minHeight:
          Platform.OS === 'web'
            ? Math.max(0, layoutHeight - insets.top - insets.bottom)
            : undefined,
        paddingTop: Math.max(insets.top, 8) + (compact ? 4 : 8),
        paddingBottom: bottomPad,
        paddingHorizontal: 20,
        gap: compact ? 12 : 16,
        justifyContent: Platform.OS === 'web' ? 'flex-start' : 'center',
        alignItems: 'stretch',
        maxWidth: 480,
        width: '100%',
        alignSelf: 'center',
      }}>
      {Platform.OS === 'web' ? (
        <View style={{ paddingTop: compact ? 12 : Math.max(24, layoutHeight * 0.08) }} />
      ) : null}
      {children}
      {footer ? <View className={compact ? 'pt-1' : 'pt-2'}>{footer}</View> : null}
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-canvas" style={{ flex: 1, minHeight: 0 }}>
      {Platform.OS === 'web' ? (
        scroll
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          style={{ flex: 1, minHeight: 0 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          {scroll}
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
