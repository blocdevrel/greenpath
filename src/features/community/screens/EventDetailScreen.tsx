import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventAttendeeStack } from '@/features/community/components/EventAttendeeStack';
import type { CommunityEventView } from '@/features/community/eventModel';
import { profileAvatarSource } from '@/shared/api';
import { eventScene } from '@/shared/components/Illustration';
import { Body, Button, Caption, Label } from '@/shared/components/ui';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function EventDetailScreen({
  event: initial,
  onBack,
  onUpdated,
}: {
  event: CommunityEventView;
  onBack: () => void;
  onUpdated?: (event: CommunityEventView) => void;
}) {
  const insets = useSafeAreaInsets();
  const { profile, events, toggleEventRsvp, sessionError } = useGreenPath();
  const event = useMemo(
    () => events.find((e) => e.id === initial.id) ?? initial,
    [events, initial],
  );
  const [busy, setBusy] = useState(false);
  const [emailNote, setEmailNote] = useState<string | null>(null);

  const spotsLeft = Math.max(0, event.capacity - event.participants);
  const youName = profile.name || 'You';
  const progress = Math.min(1, event.participants / Math.max(1, event.capacity));

  const toggleJoin = () => {
    if (busy) return;
    if (!event.joined && spotsLeft === 0) return;
    setEmailNote(null);

    const wasJoined = event.joined;
    // Instant UI flip — API syncs in the background
    setBusy(true);
    const view = toggleEventRsvp(event.id);
    if (view) onUpdated?.(view);
    if (!wasJoined && view?.joined) {
      setEmailNote(
        profile.email
          ? `You're in — confirmation email on the way${profile.email ? ` to ${profile.email}` : ''}.`
          : `You're in. Add an email to your account to get confirmations.`,
      );
    }
    // Brief lock so double-taps don't flip twice before state settles
    requestAnimationFrame(() => setBusy(false));
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28, flexGrow: 1 }}>
        <View className="relative w-full overflow-hidden bg-primary-50" style={{ height: 220 }}>
          <Image
            source={eventScene(event.illustration)}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          <View
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(13, 59, 18, 0.28)' }}
          />
          <Pressable
            onPress={onBack}
            accessibilityLabel="Back"
            className="absolute left-5 h-11 w-11 items-center justify-center rounded-full bg-card-raised"
            style={{ top: insets.top + 8 }}>
            <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
          </Pressable>
        </View>

        <View className="gap-5 px-5 pt-5">
          <View className="gap-1.5">
            <Text className="font-sans-extrabold text-title text-ink">{event.title}</Text>
            <Caption>Campus climate action</Caption>
          </View>

          <View className="gap-3 rounded-2xl bg-card p-4">
            <MetaRow icon="location-outline" text={event.location} />
            <MetaRow icon="calendar-outline" text={event.date} />
            <MetaRow icon="time-outline" text={event.time} />
          </View>

          {event.description ? (
            <View className="gap-2">
              <Label className="font-sans-bold">About this event</Label>
              <Body className="leading-6 text-ink">{event.description}</Body>
            </View>
          ) : null}

          <View className="gap-4 rounded-2xl bg-card p-4">
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Label className="font-sans-bold">Spots</Label>
                <Caption>
                  {event.participants}/{event.capacity}
                  {spotsLeft > 0 ? ` · ${spotsLeft} left` : ' · Full'}
                </Caption>
              </View>
              <View className="h-2.5 overflow-hidden rounded-full bg-canvas-sunken">
                <View
                  className="h-full rounded-full bg-lime"
                  style={{ width: `${Math.max(8, Math.round(progress * 100))}%` }}
                />
              </View>
            </View>

            <View className="h-px bg-line" />

            <View className="flex-row items-center gap-3">
              <EventAttendeeStack
                attendees={event.attendees}
                total={event.participants}
                joined={event.joined}
                youName={youName}
                youPhoto={profileAvatarSource(profile)}
                seed={event.slug ?? event.id}
                size={40}
                max={4}
              />
              <View className="min-w-0 flex-1">
                <Text className="font-sans-bold text-body text-ink">
                  {event.participants} going
                </Text>
                <Caption numberOfLines={1}>
                  {spotsLeft > 0 ? `${spotsLeft} spots still open` : 'This event is full'}
                </Caption>
              </View>
            </View>
          </View>

          {sessionError?.includes('RSVP') ? (
            <Caption className="text-danger">{sessionError}</Caption>
          ) : null}
          {emailNote && !sessionError ? (
            <Caption className="text-primary">{emailNote}</Caption>
          ) : null}

          <Button
            label={
              event.joined
                ? 'Leave event'
                : spotsLeft === 0
                  ? 'Event full'
                  : 'Join event'
            }
            size="lg"
            variant={event.joined ? 'soft' : 'primary'}
            disabled={busy || (!event.joined && spotsLeft === 0)}
            onPress={toggleJoin}
          />
          {!event.joined ? (
            <Caption className="text-center">
              Joining sends a confirmation email with the time and place.
            </Caption>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function MetaRow({
  icon,
  text,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  text: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-primary-50">
        <Ionicons name={icon} size={16} color={colors.primary.DEFAULT} />
      </View>
      <Text className="min-w-0 flex-1 font-sans text-body text-ink" style={{ lineHeight: 22 }}>
        {text}
      </Text>
    </View>
  );
}
