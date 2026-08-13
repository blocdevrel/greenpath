import { createElement } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { Caption, Label } from '@/shared/components/ui';

export function LessonVideoPlayer({
  youtubeId,
  title,
  durationMin,
}: {
  youtubeId: string;
  title: string;
  durationMin: number;
}) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`;

  return (
    <View className="gap-3">
      <View className="w-full overflow-hidden bg-black" style={{ height: 220, borderRadius: 8 }}>
        {Platform.OS === 'web'
          ? createElement('iframe', {
              title,
              src: embedUrl,
              allow:
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
              allowFullScreen: true,
              style: {
                width: '100%',
                height: '100%',
                border: 0,
                display: 'block',
              } as unknown as ViewStyle,
            })
          : (
              <WebView
                source={{ uri: embedUrl }}
                style={{ flex: 1, backgroundColor: '#000' }}
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
              />
            )}
      </View>
      <View className="gap-1 px-0.5">
        <Label className="font-sans-bold text-ink">{title}</Label>
        <Caption>~{durationMin} min · watch then apply</Caption>
      </View>
    </View>
  );
}
