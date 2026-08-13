import { useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ProfilePhotoCropModal } from '@/features/profile/components/ProfilePhotoCropModal';
import { profileAvatarSource } from '@/shared/api';
import { PhotoSourceSheet } from '@/shared/components/PhotoPicker';
import { Body, Button, Caption, Card, Label, Screen } from '@/shared/components/ui';
import { GHANA_REGIONS, type GhanaRegion } from '@/shared/data/greenpathData';
import {
  pickProfilePhoto,
  toClerkProfileFile,
} from '@/shared/media/pickEvidence';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors, fontFamily } from '@/shared/theme/tokens';

export function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const { user } = useUser();
  const { profile, updateProfile, syncClerkIdentity } = useGreenPath();
  const [displayName, setDisplayName] = useState(profile.fullName || profile.name);
  const [bio, setBio] = useState(profile.bio || '');
  const [city, setCity] = useState<GhanaRegion | string>(profile.region || 'Greater Accra');
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(profile.showOnLeaderboard ?? true);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [cropUri, setCropUri] = useState<string | null>(null);
  const [cropDataUrl, setCropDataUrl] = useState<string | null>(null);

  const avatar = localPreview
    ? { uri: localPreview }
    : profileAvatarSource(profile);

  const save = async () => {
    const name = displayName.trim();
    if (!name) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({
        displayName: name,
        bio: bio.trim(),
        city: String(city).trim() || undefined,
        showOnLeaderboard,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const openPicker = async (source: 'camera' | 'gallery') => {
    setPickerOpen(false);
    setError(null);
    setSaved(false);
    try {
      const photo = await pickProfilePhoto(source, { square: true });
      if (!photo) return;
      setCropUri(photo.uri);
      setCropDataUrl(photo.base64);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open photo picker');
    }
  };

  const uploadCroppedPhoto = async (croppedDataUrl: string) => {
    if (!user) {
      setError('Sign in again to update your photo.');
      setCropUri(null);
      setCropDataUrl(null);
      return;
    }

    setPhotoBusy(true);
    setError(null);
    setSaved(false);
    setLocalPreview(croppedDataUrl);
    setCropUri(null);
    setCropDataUrl(null);

    try {
      const file = await toClerkProfileFile(croppedDataUrl);
      await user.setProfileImage({ file });
      const refreshed = await user.reload();
      const imageUrl = refreshed.imageUrl;

      syncClerkIdentity({
        fullName: refreshed.fullName,
        email: refreshed.primaryEmailAddress?.emailAddress,
        imageUrl: refreshed.hasImage ? imageUrl : null,
        hasImage: refreshed.hasImage,
      });

      if (refreshed.hasImage && imageUrl) {
        await updateProfile({ avatarUrl: imageUrl });
        setLocalPreview(imageUrl);
      }
      setSaved(true);
    } catch (e) {
      setLocalPreview(null);
      const msg = e instanceof Error ? e.message : 'Could not update photo';
      setError(
        /network|fetch|failed/i.test(msg)
          ? 'Photo upload failed. Check your connection and try again.'
          : msg,
      );
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <Text className="font-sans-extrabold text-title text-ink">Edit profile</Text>
      <Caption>Update how you appear to other GreenPath youth.</Caption>

      <View className="items-center gap-3 py-2">
        <Pressable
          onPress={() => setPickerOpen(true)}
          disabled={photoBusy}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          className="relative">
          <View className="h-24 w-24 overflow-hidden rounded-full border border-line bg-primary-50">
            <Image
              source={avatar}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              accessibilityLabel="Profile photo"
            />
          </View>
          <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border border-line bg-card-raised">
            {photoBusy ? (
              <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
            ) : (
              <Ionicons name="camera" size={18} color={colors.primary.DEFAULT} />
            )}
          </View>
        </Pressable>
        <Pressable onPress={() => setPickerOpen(true)} disabled={photoBusy}>
          <Caption className="font-sans-semibold text-primary">
            {photoBusy ? 'Uploading photo…' : 'Change photo'}
          </Caption>
        </Pressable>
        <Caption className="text-center">Crop and zoom before you save.</Caption>
      </View>

      <Field label="Display name">
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
          placeholderTextColor={colors.muted}
          maxLength={80}
          style={inputStyle}
        />
      </Field>

      <Field label="Bio">
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Short intro about your climate journey"
          placeholderTextColor={colors.muted}
          maxLength={500}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={[inputStyle, { minHeight: 110, paddingTop: 14 }]}
        />
      </Field>

      <Field label="Region (Ghana)">
        <Pressable
          onPress={() => setRegionOpen((o) => !o)}
          className="min-h-[52px] flex-row items-center justify-between rounded-2xl border border-line bg-card-raised px-4">
          <Text className="font-sans-medium text-body text-ink">{city || 'Select region'}</Text>
          <Ionicons
            name={regionOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.muted}
          />
        </Pressable>
        {regionOpen ? (
          <Card className="mt-2 overflow-hidden p-0">
            <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
              {GHANA_REGIONS.map((region) => {
                const selected = city === region;
                return (
                  <Pressable
                    key={region}
                    onPress={() => {
                      setCity(region);
                      setRegionOpen(false);
                    }}
                    className="flex-row items-center justify-between border-b border-line px-4 py-3.5">
                    <Text
                      className={`font-sans-medium text-body ${selected ? 'text-primary' : 'text-ink'}`}>
                      {region}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color={colors.primary.DEFAULT} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>
        ) : null}
      </Field>

      <Card className="flex-row items-center justify-between py-3">
        <View className="mr-3 min-w-0 flex-1">
          <Label className="font-sans-semibold">Show on leaderboard</Label>
          <Caption>Let others see your XP ranking in your region.</Caption>
        </View>
        <Switch
          value={showOnLeaderboard}
          onValueChange={setShowOnLeaderboard}
          trackColor={{ false: colors.line.DEFAULT, true: colors.primary[300] }}
          thumbColor={showOnLeaderboard ? colors.primary.DEFAULT : '#f4f4f5'}
        />
      </Card>

      {error ? <Body className="text-danger">{error}</Body> : null}
      {saved ? <Caption className="text-primary">Profile saved.</Caption> : null}

      <Button
        label={saving ? 'Saving…' : 'Save changes'}
        onPress={() => void save()}
        disabled={saving || photoBusy}
      />
      {saving ? (
        <ActivityIndicator color={colors.primary.DEFAULT} style={{ marginTop: 8 }} />
      ) : null}

      <PhotoSourceSheet
        visible={pickerOpen}
        title="Update profile photo"
        onClose={() => setPickerOpen(false)}
        onCamera={() => void openPicker('camera')}
        onGallery={() => void openPicker('gallery')}
      />

      <ProfilePhotoCropModal
        visible={!!cropDataUrl}
        imageUri={cropUri}
        imageDataUrl={cropDataUrl}
        onCancel={() => {
          setCropUri(null);
          setCropDataUrl(null);
        }}
        onConfirm={(cropped) => void uploadCroppedPhoto(cropped)}
      />
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Label className="font-sans-semibold">{label}</Label>
      {children}
    </View>
  );
}

const inputStyle = {
  minHeight: 52,
  borderWidth: 1,
  borderColor: colors.line.DEFAULT,
  borderRadius: 16,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontFamily: fontFamily.medium,
  fontSize: 16,
  color: colors.ink.DEFAULT,
  backgroundColor: colors.card.raised,
};
