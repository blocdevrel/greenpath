import { useEffect, useRef } from 'react';
import {
  Platform,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type HorizontalScrollRowProps = Omit<ScrollViewProps, 'horizontal'> & {
  width?: number;
};

function getScrollableElement(ref: ScrollView | null): HTMLElement | null {
  if (!ref) return null;
  const node = ref as ScrollView & { getScrollableNode?: () => HTMLElement };
  return node.getScrollableNode?.() ?? (node as unknown as HTMLElement);
}

/** Horizontal carousel row that scrolls reliably inside nested vertical lists on web. */
export function HorizontalScrollRow({
  width,
  style,
  contentContainerStyle,
  children,
  ...rest
}: HorizontalScrollRowProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let el: HTMLElement | null = null;
    let onWheel: ((event: WheelEvent) => void) | null = null;
    let frame = 0;

    const bind = () => {
      el = getScrollableElement(scrollRef.current);
      if (!el || onWheel) return;

      onWheel = (event: WheelEvent) => {
        if (el!.scrollWidth <= el!.clientWidth) return;
        // Only consume horizontal trackpad gestures — let vertical wheel bubble to the page.
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        el!.scrollLeft += event.deltaX;
        event.preventDefault();
        event.stopPropagation();
      };

      el.addEventListener('wheel', onWheel, { passive: false });
    };

    frame = requestAnimationFrame(bind);

    return () => {
      cancelAnimationFrame(frame);
      if (el && onWheel) el.removeEventListener('wheel', onWheel);
    };
  }, [children]);

  const webStyle: StyleProp<ViewStyle> =
    Platform.OS === 'web'
      ? ({
          overflowX: 'auto',
          overflowY: 'hidden',
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
          flexGrow: 0,
          flexShrink: 0,
          touchAction: 'pan-x',
        } as ViewStyle)
      : null;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      style={[width != null ? { width } : null, webStyle, style]}
      contentContainerStyle={contentContainerStyle}
      {...rest}>
      {children}
    </ScrollView>
  );
}
