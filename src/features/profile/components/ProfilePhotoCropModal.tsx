import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Caption, Label } from '@/shared/components/ui';
import { MOBILE_MAX_WIDTH, useShellWidth } from '@/shared/components/MobileShell';
import { cropSquareDataUrl } from '@/shared/media/pickEvidence';
import { colors } from '@/shared/theme/tokens';

type Props = {
  visible: boolean;
  imageUri: string | null;
  /** Original data URL used for canvas crop export */
  imageDataUrl: string | null;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
};

/**
 * Square avatar cropper — pan the photo under a fixed circle, zoom with buttons.
 * Exports a 512×512 JPEG data URL for Clerk upload.
 */
export function ProfilePhotoCropModal({
  visible,
  imageUri,
  imageDataUrl,
  onCancel,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const shellWidth = useShellWidth();
  const { width: windowWidth } = useWindowDimensions();
  const sheetWidth =
    Platform.OS === 'web' ? Math.min(shellWidth, MOBILE_MAX_WIDTH, windowWidth) : windowWidth;

  const frame = Math.min(sheetWidth - 48, 280);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0.5);
  const [offsetY, setOffsetY] = useState(0.5);
  const [busy, setBusy] = useState(false);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );

  const imageStyle = useMemo(() => {
    const size = frame * zoom;
    return {
      width: size,
      height: size,
      left: frame / 2 - offsetX * size,
      top: frame / 2 - offsetY * size,
    };
  }, [frame, zoom, offsetX, offsetY]);

  const reset = () => {
    setZoom(1);
    setOffsetX(0.5);
    setOffsetY(0.5);
    setBusy(false);
    setDragOrigin(null);
  };

  const confirm = async () => {
    if (!imageDataUrl) return;
    setBusy(true);
    try {
      const cropped = await cropSquareDataUrl(imageDataUrl, {
        offsetX,
        offsetY,
        zoom,
        outputSize: 512,
        quality: 0.9,
      });
      onConfirm(cropped);
      reset();
    } catch {
      // Fall back to original if canvas crop fails (rare on native).
      onConfirm(imageDataUrl);
      reset();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        className="flex-1 justify-end bg-black/50"
        style={{ alignItems: Platform.OS === 'web' ? 'center' : undefined }}>
        <Pressable
          accessibilityLabel="Dismiss"
          onPress={() => {
            reset();
            onCancel();
          }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <View
          className="rounded-t-3xl bg-card px-5 pt-4"
          style={{
            width: sheetWidth,
            maxWidth: MOBILE_MAX_WIDTH,
            paddingBottom: insets.bottom + 16,
          }}>
          <View className="mb-2 h-1.5 w-10 self-center rounded-full bg-line" />
          <Label className="font-sans-semibold">Crop profile photo</Label>
          <Caption className="mb-4">Drag to reposition. Zoom to fill the circle.</Caption>

          <View className="items-center gap-4">
            <View
              className="overflow-hidden rounded-full border-2 border-primary bg-canvas-sunken"
              style={{ width: frame, height: frame }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => {
                setDragOrigin({
                  x: e.nativeEvent.pageX,
                  y: e.nativeEvent.pageY,
                  ox: offsetX,
                  oy: offsetY,
                });
              }}
              onResponderMove={(e) => {
                if (!dragOrigin) return;
                const dx = e.nativeEvent.pageX - dragOrigin.x;
                const dy = e.nativeEvent.pageY - dragOrigin.y;
                const size = frame * zoom;
                const nextX = dragOrigin.ox - dx / size;
                const nextY = dragOrigin.oy - dy / size;
                setOffsetX(Math.max(0.15, Math.min(0.85, nextX)));
                setOffsetY(Math.max(0.15, Math.min(0.85, nextY)));
              }}
              onResponderRelease={() => setDragOrigin(null)}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={[{ position: 'absolute' }, imageStyle]}
                  resizeMode="cover"
                />
              ) : null}
            </View>

            <View className="w-full flex-row items-center justify-center gap-3">
              <Pressable
                onPress={() => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))}
                className="h-11 w-11 items-center justify-center rounded-full border border-line bg-card-raised">
                <Ionicons name="remove" size={20} color={colors.ink.DEFAULT} />
              </Pressable>
              <Text className="min-w-[64px] text-center font-sans-semibold text-caption text-ink">
                {Math.round(zoom * 100)}%
              </Text>
              <Pressable
                onPress={() => setZoom((z) => Math.min(3, Number((z + 0.15).toFixed(2))))}
                className="h-11 w-11 items-center justify-center rounded-full border border-line bg-card-raised">
                <Ionicons name="add" size={20} color={colors.ink.DEFAULT} />
              </Pressable>
            </View>
          </View>

          <View className="mt-5 gap-2">
            <Button
              label={busy ? 'Saving crop…' : 'Use this photo'}
              size="lg"
              disabled={busy || !imageDataUrl}
              onPress={() => void confirm()}
            />
            <Button
              label="Cancel"
              variant="ghost"
              size="lg"
              disabled={busy}
              onPress={() => {
                reset();
                onCancel();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
