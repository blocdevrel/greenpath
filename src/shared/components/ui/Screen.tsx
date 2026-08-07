import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Standard screen scaffold: canvas background, safe-area spacing, screen gutter.
 *
 * The canvas fills behind the status bar and the top inset is applied to the
 * content rather than a wrapping SafeAreaView, so scrolling content is never
 * clipped at the safe-area edge.
 *
 * Set `scroll={false}` for screens that manage their own scrolling.
 * Non-scrolling screens give the body `flex-1` so children can use justify-between.
 */
export const Screen = ({
  children,
  scroll = true,
  /** Extra space above the home-indicator / tab bar. Replaces the default 40. */
  bottomPadding = 40,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  bottomPadding?: number;
}) => {
  const insets = useSafeAreaInsets();
  const body = (
    <View className={`gap-6 px-5 ${scroll ? '' : 'flex-1'}`}>{children}</View>
  );

  return (
    <View className="flex-1 bg-canvas">
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + bottomPadding,
            flexGrow: 1,
          }}>
          {body}
        </ScrollView>
      ) : (
        <View
          className="flex-1"
          style={{
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + bottomPadding,
          }}>
          {body}
        </View>
      )}
    </View>
  );
};

/** Section wrapper that pairs an overline with its content. */
export const Section = ({ children }: { children: React.ReactNode }) => (
  <View className="gap-3">{children}</View>
);
