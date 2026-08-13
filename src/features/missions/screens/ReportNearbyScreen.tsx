import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LocationMapPicker,
  type PickedLocation,
} from '@/features/missions/components/LocationMapPicker';
import {
  PhotoAddWell,
  PhotoChoiceRow,
  PhotoReadyPreview,
  PhotoSourceSheet,
} from '@/shared/components/PhotoPicker';
import { Button, Caption, Label } from '@/shared/components/ui';
import type { CommunityReportKind } from '@/shared/data/greenpathData';
import { pickEvidencePhoto } from '@/shared/media/pickEvidence';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';
import { webInputReset } from '@/shared/ui/webInputReset';

const kinds: { id: CommunityReportKind; label: string }[] = [
  { id: 'trash', label: 'Trash pile' },
  { id: 'blocked-drain', label: 'Blocked drain' },
  { id: 'dumping', label: 'Illegal dumping' },
  { id: 'other', label: 'Other' },
];

export function ReportNearbyScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { submitCommunityReport } = useGreenPath();
  const [kind, setKind] = useState<CommunityReportKind>('trash');
  const [customTitle, setCustomTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [posting, setPosting] = useState(false);

  const title = useMemo(() => {
    if (kind === 'other') {
      const custom = customTitle.trim();
      return custom || 'Other issue nearby';
    }
    if (kind === 'blocked-drain') return 'Blocked drain nearby';
    if (kind === 'dumping') return 'Illegal dumping spot';
    return 'Trash in the area';
  }, [kind, customTitle]);

  const otherTitleOk = kind !== 'other' || customTitle.trim().length >= 3;
  const canSubmit =
    !!photoBase64 &&
    caption.trim().length > 8 &&
    !!picked &&
    otherTitleOk &&
    !posting;

  const addPhoto = async (source: 'camera' | 'gallery') => {
    try {
      const photo = await pickEvidencePhoto(source);
      if (!photo) return;
      setPhotoUri(photo.uri);
      setPhotoBase64(photo.base64);
    } finally {
      setPickerOpen(false);
    }
  };

  const submit = async () => {
    if (!canSubmit || !picked || !photoBase64) return;
    setPosting(true);
    try {
      await submitCommunityReport({
        kind,
        title,
        caption: caption.trim(),
        location: picked.label,
        latitude: picked.latitude,
        longitude: picked.longitude,
        photo: { uri: photoUri ?? photoBase64 },
        photoBase64,
      });
      onBack();
    } finally {
      setPosting(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="border-b border-line bg-card px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}>
        <View className="min-h-12 flex-row items-center">
          <Pressable
            onPress={onBack}
            accessibilityLabel="Back"
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-full bg-canvas-sunken">
            <Ionicons name="arrow-back" size={22} color={colors.ink.DEFAULT} />
          </Pressable>
          <Text className="ml-3 font-sans-extrabold text-title text-ink">Report</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 20,
          paddingTop: 20,
          gap: 20,
        }}>
        <View className="gap-2">
          <Label className="font-sans-semibold">What are you reporting?</Label>
          <View className="flex-row flex-wrap gap-1.5">
            {kinds.map((item) => {
              const on = kind === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setKind(item.id)}
                  className={`min-w-[46%] flex-1 items-center justify-center rounded-full border px-2 py-2.5 ${
                    on ? 'border-primary bg-primary-50' : 'border-line bg-card'
                  }`}>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    className={`text-center font-sans-semibold text-caption ${
                      on ? 'text-primary' : 'text-ink'
                    }`}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {kind === 'other' ? (
          <View className="gap-2">
            <Label className="font-sans-semibold">Describe the problem</Label>
            <View className="rounded-2xl border border-line bg-card px-4 py-3">
              <TextInput
                value={customTitle}
                onChangeText={setCustomTitle}
                placeholder="e.g. Broken streetlight, open sewage…"
                placeholderTextColor={colors.muted}
                maxLength={120}
                className="w-full font-sans text-body text-ink"
                style={webInputReset}
              />
            </View>
            <Caption>At least 3 characters so neighbours know what to look for.</Caption>
          </View>
        ) : null}

        <View className="gap-2">
          <Label className="font-sans-semibold">Where is it?</Label>
          <LocationMapPicker value={picked} onChange={setPicked} height={300} />
        </View>

        <View className="overflow-hidden rounded-[8px] border border-line bg-card-raised">
          <View className="border-b border-line px-4 py-3">
            <Label className="font-sans-semibold">Photo</Label>
          </View>
          <View className="gap-4 p-4">
            {photoUri ? (
              <PhotoReadyPreview
                source={{ uri: photoUri }}
                onChange={() => {
                  setPhotoUri(null);
                  setPhotoBase64(null);
                }}
              />
            ) : (
              <PhotoAddWell
                hint="Add a clear photo of the spot."
                onPress={() => setPickerOpen(true)}
              />
            )}
            {!photoUri ? (
              <PhotoChoiceRow
                icon="images-outline"
                title="Choose from camera or gallery"
                onPress={() => setPickerOpen(true)}
              />
            ) : null}
          </View>
        </View>

        <View className="gap-2">
          <Label className="font-sans-semibold">Description</Label>
          <View className="min-h-[110px] rounded-2xl border border-line bg-card px-4 py-3">
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="What should people know about this spot?"
              placeholderTextColor={colors.muted}
              multiline
              className="min-h-[86px] w-full font-sans text-body text-ink"
              textAlignVertical="top"
              style={webInputReset}
            />
          </View>
        </View>

        <Button
          label={posting ? 'Posting…' : 'Post report'}
          size="lg"
          disabled={!canSubmit}
          trailingGlyph="→"
          onPress={() => void submit()}
        />
      </ScrollView>

      <PhotoSourceSheet
        visible={pickerOpen}
        title="Add report photo"
        onClose={() => setPickerOpen(false)}
        onCamera={() => void addPhoto('camera')}
        onGallery={() => void addPhoto('gallery')}
      />
    </View>
  );
}
