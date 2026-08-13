import { Image, type ImageSourcePropType, Text, View } from 'react-native';

import type { EventAttendee } from '@/features/community/eventModel';
import { images } from '@/shared/media';

const PALETTE = [
  { bg: '#E8F5E9', fg: '#1B5E20' },
  { bg: '#F1F8E9', fg: '#33691E' },
  { bg: '#FFFBEB', fg: '#92400E' },
  { bg: '#EFF6FF', fg: '#1D4ED8' },
  { bg: '#FCE7F3', fg: '#9D174D' },
] as const;

const FACE_POOL: { name: string; photo: ImageSourcePropType }[] = [
  { name: 'Ama', photo: images.avatar1 },
  { name: 'Kwame', photo: images.avatar2 },
  { name: 'Efua', photo: images.avatar3 },
  { name: 'Yaw', photo: images.avatar4 },
  { name: 'Isaac', photo: images.avatarIsaac },
];

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
}

export function faceForName(name: string): ImageSourcePropType {
  const known = FACE_POOL.find((f) => f.name.toLowerCase() === name.trim().toLowerCase());
  if (known) return known.photo;
  return FACE_POOL[hashName(name) % FACE_POOL.length]!.photo;
}

/** Visual stack faces when the API has a count but few/no named RSVPs yet. */
export function previewFaces(seed: string, count: number): EventAttendee[] {
  const take = Math.min(4, Math.max(3, Math.min(count, 4)));
  const start = hashName(seed) % FACE_POOL.length;
  return Array.from({ length: take }, (_, i) => {
    const face = FACE_POOL[(start + i) % FACE_POOL.length]!;
    return { name: face.name, avatarUrl: null, photo: face.photo };
  });
}

export function EventFace({
  name,
  photo,
  avatarUrl,
  size = 36,
  ring = true,
}: {
  name: string;
  photo?: ImageSourcePropType;
  avatarUrl?: string | null;
  size?: number;
  ring?: boolean;
}) {
  const source =
    avatarUrl && /^https?:\/\//i.test(avatarUrl) ? { uri: avatarUrl } : photo ?? faceForName(name);
  const tone = PALETTE[hashName(name) % PALETTE.length]!;
  const fontSize = size < 32 ? 11 : size < 40 ? 12 : 13;

  return (
    <View
      accessibilityLabel={name}
      className="overflow-hidden items-center justify-center rounded-full bg-primary-50"
      style={{
        width: size,
        height: size,
        borderWidth: ring ? 2 : 0,
        borderColor: '#FFFFFF',
      }}>
      {source ? (
        <Image
          source={source}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text className="font-sans-bold" style={{ color: tone.fg, fontSize }}>
          {initialsFromName(name)}
        </Text>
      )}
    </View>
  );
}

export function EventAttendeeStack({
  attendees,
  total,
  joined,
  youName = 'You',
  youPhoto,
  seed = 'event',
  size = 36,
  max = 4,
}: {
  attendees: EventAttendee[];
  total: number;
  joined?: boolean;
  youName?: string;
  youPhoto?: ImageSourcePropType;
  seed?: string;
  size?: number;
  max?: number;
}) {
  const faces: { name: string; photo?: ImageSourcePropType; avatarUrl?: string | null }[] = [];
  if (joined) {
    faces.push({ name: youName, photo: youPhoto ?? images.avatarIsaac });
  }
  for (const person of attendees) {
    if (faces.length >= max) break;
    if (joined && person.name.toLowerCase() === youName.toLowerCase()) continue;
    faces.push({
      name: person.name,
      photo: person.photo ?? faceForName(person.name),
      avatarUrl: person.avatarUrl,
    });
  }
  if (faces.length < Math.min(max, Math.max(1, total)) && total > 0) {
    for (const extra of previewFaces(seed, max)) {
      if (faces.length >= max) break;
      if (faces.some((f) => f.name.toLowerCase() === extra.name.toLowerCase())) continue;
      faces.push(extra);
    }
  }

  const extra = Math.max(0, total - faces.length);

  if (faces.length === 0 && extra === 0) {
    return <Text className="font-sans text-caption text-subtle">No one has joined yet</Text>;
  }

  return (
    <View className="flex-row items-center">
      {faces.map((person, index) => (
        <View
          key={`${person.name}-${index}`}
          style={{ marginLeft: index === 0 ? 0 : -(size * 0.28), zIndex: 20 - index }}>
          <EventFace
            name={person.name}
            photo={person.photo}
            avatarUrl={person.avatarUrl}
            size={size}
          />
        </View>
      ))}
      {extra > 0 ? (
        <View
          className="items-center justify-center rounded-full border-2 border-white bg-primary"
          style={{
            width: size,
            height: size,
            marginLeft: -(size * 0.28),
            zIndex: 1,
          }}>
          <Text className="font-sans-bold text-white" style={{ fontSize: size < 34 ? 10 : 12 }}>
            +{extra > 99 ? 99 : extra}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
