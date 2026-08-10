import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LocationMapPicker,
  type PickedLocation,
} from '@/features/missions/components/LocationMapPicker';
import { Button, Caption, Label } from '@/shared/components/ui';
import type { CommunityReportKind } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';
import { webInputReset } from '@/shared/ui/webInputReset';

const kinds: { id: CommunityReportKind; label: string }[] = [
  { id: 'trash', label: 'Trash pile' },
  { id: 'blocked-drain', label: 'Blocked drain' },
  { id: 'dumping', label: 'Illegal dumping' },
];

export function ReportNearbyScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { submitCommunityReport, setEvidence } = useGreenPath();
  const [kind, setKind] = useState<CommunityReportKind>('trash');
  const [caption, setCaption] = useState('');
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [photoReady, setPhotoReady] = useState(false);

  const title = useMemo(() => {
    if (kind === 'blocked-drain') return 'Blocked drain nearby';
    if (kind === 'dumping') return 'Illegal dumping spot';
    return 'Trash in the area';
  }, [kind]);

  const canSubmit = photoReady && caption.trim().length > 8 && !!picked;

  const captureMock = () => {
    setPhotoReady(true);
    setEvidence(images.onboardingAction);
  };

  const submit = () => {
    if (!canSubmit || !picked) return;
    submitCommunityReport({
      kind,
      title,
      caption: caption.trim(),
      location: picked.label,
      latitude: picked.latitude,
      longitude: picked.longitude,
      photo: images.onboardingAction,
    });
    onBack();
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
          <View className="flex-row gap-1.5">
            {kinds.map((item) => {
              const on = kind === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setKind(item.id)}
                  className={`min-w-0 flex-1 items-center justify-center rounded-full border px-2 py-2.5 ${
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

        <View className="gap-2">
          <Label className="font-sans-semibold">Where is it?</Label>
          <LocationMapPicker value={picked} onChange={setPicked} height={300} />
        </View>

        <View className="gap-2">
          <Label className="font-sans-semibold">Photo</Label>
          {photoReady ? (
            <View className="overflow-hidden rounded-2xl border border-line bg-card">
              <View className="h-48 w-full">
                <Image
                  source={images.onboardingAction}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              <View className="flex-row items-center justify-between px-4 py-3">
                <Caption>Photo added</Caption>
                <Pressable onPress={() => setPhotoReady(false)}>
                  <Caption className="font-sans-semibold text-primary">Retake</Caption>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={captureMock}
              className="items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-50/60 px-5 py-10">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-card-raised">
                <Ionicons name="camera-outline" size={26} color={colors.primary.DEFAULT} />
              </View>
              <Label className="font-sans-semibold">Take a photo</Label>
            </Pressable>
          )}
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
          label="Post report"
          size="lg"
          disabled={!canSubmit}
          trailingGlyph="→"
          onPress={submit}
        />
      </ScrollView>
    </View>
  );
}
