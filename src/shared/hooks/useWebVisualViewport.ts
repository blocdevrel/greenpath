import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type WebVisualViewport = {
  /** Visible height (shrinks when the soft keyboard is open). */
  height: number;
  /** iOS often offsets the visual viewport when the keyboard opens. */
  offsetTop: number;
  /** Approximate keyboard overlap vs the layout viewport. */
  keyboardInset: number;
};

function readViewport(): WebVisualViewport {
  if (typeof window === 'undefined') {
    return { height: 800, offsetTop: 0, keyboardInset: 0 };
  }
  const layoutH = window.innerHeight || document.documentElement.clientHeight || 800;
  const vv = window.visualViewport;
  if (!vv) {
    return { height: layoutH, offsetTop: 0, keyboardInset: 0 };
  }
  const height = Math.max(1, Math.round(vv.height));
  const offsetTop = Math.max(0, Math.round(vv.offsetTop));
  const keyboardInset = Math.max(0, Math.round(layoutH - vv.height - vv.offsetTop));
  return { height, offsetTop, keyboardInset };
}

/**
 * Tracks the browser visual viewport so web auth/forms can shrink with the
 * soft keyboard instead of staying locked to a stale layout height.
 */
export function useWebVisualViewport(): WebVisualViewport {
  const [viewport, setViewport] = useState<WebVisualViewport>(() =>
    Platform.OS === 'web' ? readViewport() : { height: 0, offsetTop: 0, keyboardInset: 0 },
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Prefer content resize when the soft keyboard opens (Chrome/Android).
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      const content = meta.getAttribute('content') ?? '';
      if (!content.includes('interactive-widget')) {
        meta.setAttribute(
          'content',
          `${content.replace(/,\s*$/, '')}, interactive-widget=resizes-content`,
        );
      }
    }

    let frame = 0;
    const publish = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setViewport(readViewport()));
    };

    publish();
    window.addEventListener('resize', publish);
    window.visualViewport?.addEventListener('resize', publish);
    window.visualViewport?.addEventListener('scroll', publish);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', publish);
      window.visualViewport?.removeEventListener('resize', publish);
      window.visualViewport?.removeEventListener('scroll', publish);
    };
  }, []);

  return viewport;
}
