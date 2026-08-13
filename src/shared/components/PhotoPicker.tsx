import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, Modal, Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOBILE_MAX_WIDTH, useShellWidth } from '@/shared/components/MobileShell';
import { Caption, Label } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

type IonName = ComponentProps<typeof Ionicons>['name'];

export function PhotoSourceSheet({
  visible,
  title,
  onClose,
  onCamera,
  onGallery,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}) {
  const insets = useSafeAreaInsets();
  const shellWidth = useShellWidth();
  const { width: windowWidth } = useWindowDimensions();
  const sheetWidth =
    Platform.OS === 'web' ? Math.min(shellWidth, MOBILE_MAX_WIDTH, windowWidth) : windowWidth;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 justify-end bg-black/35"
        style={{ alignItems: Platform.OS === 'web' ? 'center' : undefined }}>
        <Pressable
          accessibilityLabel="Dismiss"
          onPress={onClose}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <View
          className="rounded-t-3xl bg-card p-4"
          style={{
            width: sheetWidth,
            maxWidth: MOBILE_MAX_WIDTH,
            paddingBottom: insets.bottom + 16,
          }}>
          <View className="mb-1 h-1.5 w-10 self-center rounded-full bg-line" />
          <Label className="px-1 pb-2 pt-1 font-sans-semibold">{title}</Label>
          <PhotoSourceOption
            icon="camera"
            title="Take photo"
            subtitle="Open your camera"
            onPress={onCamera}
          />
          <PhotoSourceOption
            icon="images"
            title="Upload from gallery"
            subtitle="Choose an existing photo"
            onPress={onGallery}
          />
          <Pressable
            onPress={onClose}
            className="mt-2 min-h-11 items-center justify-center rounded-[8px] bg-canvas-sunken">
            <Caption className="font-sans-semibold">Cancel</Caption>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function PhotoSourceOption({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IonName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center gap-3 rounded-[8px] border border-line bg-card-raised px-4 py-3.5">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
        <Ionicons name={icon} size={20} color={colors.primary.DEFAULT} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Label className="font-sans-semibold">{title}</Label>
        <Caption numberOfLines={1}>{subtitle}</Caption>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}

export function PhotoChoiceRow({
  icon,
  title,
  disabled,
  onPress,
}: {
  icon: IonName;
  title: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      className={`w-full flex-row items-center gap-3 rounded-[8px] border px-4 py-3.5 ${
        disabled
          ? 'border-line bg-canvas-sunken opacity-60'
          : 'border-line bg-card active:bg-primary-50'
      }`}>
      <View
        className={`h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          disabled ? 'bg-card' : 'bg-primary-50'
        }`}>
        <Ionicons name={icon} size={20} color={disabled ? colors.muted : colors.primary.DEFAULT} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Label className="font-sans-semibold">{title}</Label>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}

/** Inline camera / gallery actions that stay inside the evidence card width. */
export function PhotoSourceActions({
  disabled,
  onCamera,
  onGallery,
}: {
  disabled?: boolean;
  onCamera: () => void;
  onGallery: () => void;
}) {
  return (
    <View className="w-full flex-row gap-2">
      <Pressable
        onPress={onCamera}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        className={`min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-[8px] border px-3 py-3 ${
          disabled
            ? 'border-line bg-canvas-sunken opacity-60'
            : 'border-line bg-card active:bg-primary-50'
        }`}>
        <Ionicons
          name="camera-outline"
          size={18}
          color={disabled ? colors.muted : colors.primary.DEFAULT}
        />
        <Caption className={`font-sans-semibold ${disabled ? 'text-muted' : 'text-ink'}`}>
          Camera
        </Caption>
      </Pressable>
      <Pressable
        onPress={onGallery}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        className={`min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-[8px] border px-3 py-3 ${
          disabled
            ? 'border-line bg-canvas-sunken opacity-60'
            : 'border-line bg-card active:bg-primary-50'
        }`}>
        <Ionicons
          name="images-outline"
          size={18}
          color={disabled ? colors.muted : colors.primary.DEFAULT}
        />
        <Caption className={`font-sans-semibold ${disabled ? 'text-muted' : 'text-ink'}`}>
          Gallery
        </Caption>
      </Pressable>
    </View>
  );
}

export function PhotoReadyPreview({
  source,
  onChange,
}: {
  source: ImageSourcePropType;
  onChange?: () => void;
}) {
  return (
    <View className="w-full overflow-hidden rounded-[8px] border border-line">
      <Image source={source} style={{ width: '100%', height: 220 }} resizeMode="cover" />
      <View className="flex-row items-center justify-between gap-3 border-t border-line bg-card px-3 py-3">
        <View className="min-w-0 flex-row items-center gap-2">
          <Ionicons name="checkmark-circle" size={20} color={colors.success.DEFAULT} />
          <Caption className="font-sans-semibold">Ready</Caption>
        </View>
        {onChange ? (
          <Pressable onPress={onChange} className="shrink-0 rounded-full border border-line px-3 py-1.5">
            <Caption className="font-sans-semibold">Change</Caption>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function PhotoAddWell({
  hint,
  locked,
  onPress,
}: {
  hint: string;
  locked?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      className={`w-full overflow-hidden rounded-[8px] border ${
        locked ? 'border-line opacity-65' : 'border-line'
      }`}>
      <View className="relative h-52 w-full items-center justify-center bg-primary-50">
        <Ionicons
          name={locked ? 'lock-closed' : 'camera-outline'}
          size={36}
          color={locked ? colors.muted : colors.primary.DEFAULT}
        />
        <View className="absolute bottom-3 right-3 rounded-full bg-card-raised/95 px-3 py-2">
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name={locked ? 'lock-closed' : 'add-circle'}
              size={16}
              color={locked ? colors.muted : colors.primary.DEFAULT}
            />
            <Caption className={`font-sans-semibold ${locked ? 'text-muted' : 'text-primary'}`}>
              {locked ? 'Locked' : 'Add Photo'}
            </Caption>
          </View>
        </View>
      </View>
      <View className="w-full flex-row items-center justify-between gap-2 bg-card px-3 py-2.5">
        <Caption className="min-w-0 flex-1 font-sans-semibold" numberOfLines={2}>
          {hint}
        </Caption>
        <Ionicons name="chevron-forward" size={14} color={colors.muted} />
      </View>
    </Pressable>
  );
}
