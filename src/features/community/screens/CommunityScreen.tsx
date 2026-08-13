import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventAttendeeStack } from '@/features/community/components/EventAttendeeStack';
import type { CommunityEventView } from '@/features/community/eventModel';
import { promoImageHeights } from '@/features/home/components/IllustratedPromoCard';
import { profileAvatarSource } from '@/shared/api';
import { eventScene } from '@/shared/components/Illustration';
import { useShellWidth } from '@/shared/components/MobileShell';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Button, Caption, Card, Heading, Overline } from '@/shared/components/ui';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function CommunityScreen({
  onOpenLeaderboard,
  onOpenEvent,
}: {
  onOpenLeaderboard: () => void;
  onOpenEvent: (event: CommunityEventView) => void;
}) {
  const insets = useSafeAreaInsets();
  const shellWidth = useShellWidth();
  const cardWidth = shellWidth - 40;
  const { frameHeight, imageHeight } = promoImageHeights(cardWidth);
  const { profile, events, sessionStatus, sessionError, hydrateFromServer, toggleEventRsvp } =
    useGreenPath();
  const avatarSrc = profileAvatarSource(profile);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = sessionStatus === 'loading' && events.length === 0;
  const showRetry = sessionStatus === 'error' && events.length === 0;

  const toggleJoin = (event: CommunityEventView) => {
    if (busyId === event.id) return;
    setError(null);
    setBusyId(event.id);
    toggleEventRsvp(event.id);
    requestAnimationFrame(() => setBusyId(null));
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: TAB_BAR_SCROLL_PADDING + insets.bottom,
        }}>
        <View className="gap-6 px-5 pb-8">
          <View className="flex-row items-start justify-between">
            <View className="gap-2 pr-4">
              <Overline>Community</Overline>
              <Heading>Campus Climate Events</Heading>
              <Caption>Local cleanups, drain clears, and tree care near you.</Caption>
            </View>
            <Pressable
              onPress={onOpenLeaderboard}
              accessibilityLabel="Leaderboard"
              className="h-12 w-12 items-center justify-center rounded-full bg-gold-soft">
              <Ionicons name="trophy" size={22} color={colors.gold.DEFAULT} />
            </Pressable>
          </View>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator color={colors.primary.DEFAULT} />
              <Caption className="mt-3">Loading campus events…</Caption>
            </View>
          ) : null}

          {showRetry ? (
            <Card className="gap-2">
              <Caption>{sessionError ?? 'Could not load events from the server.'}</Caption>
              <Button
                label="Retry"
                size="sm"
                variant="soft"
                onPress={() => void hydrateFromServer()}
              />
            </Card>
          ) : null}

          {error ? (
            <Card className="gap-2">
              <Caption>{error}</Caption>
            </Card>
          ) : null}

          {!loading && events.length === 0 && !showRetry ? (
            <View
              className="items-center gap-2 rounded-lg bg-card px-5 py-10"
              style={{ borderRadius: 8 }}>
              <Caption className="text-center">No campus events yet. Check back soon.</Caption>
            </View>
          ) : null}

          <View className="gap-4">
            {events.map((event) => {
              const spotsLeft = Math.max(0, event.capacity - event.participants);

              return (
                <View
                  key={event.id}
                  className="gap-3 overflow-hidden bg-card"
                  style={{ borderRadius: 8 }}>
                  <Pressable
                    onPress={() => onOpenEvent(event)}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${event.title}`}
                    className="gap-2.5">
                    <View
                      className="bg-primary-50"
                      style={{
                        width: cardWidth,
                        height: frameHeight,
                        borderRadius: 8,
                        overflow: 'hidden',
                        justifyContent: 'flex-start',
                      }}>
                      <Image
                        source={eventScene(event.illustration)}
                        style={{ width: cardWidth, height: imageHeight, maxWidth: cardWidth }}
                        resizeMode="stretch"
                        accessibilityIgnoresInvertColors
                      />
                    </View>

                    <View className="flex-row items-start gap-2 px-3.5">
                      <View className="min-w-0 flex-1 gap-0.5">
                        <Text className="font-sans-bold text-body text-ink" numberOfLines={1}>
                          {event.title}
                        </Text>
                        <Caption numberOfLines={1}>{event.location}</Caption>
                        <Caption numberOfLines={1}>{`${event.date} · ${event.time}`}</Caption>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                    </View>
                  </Pressable>

                  <View className="flex-row items-center gap-3 px-3.5 pb-3.5">
                    <EventAttendeeStack
                      attendees={event.attendees}
                      total={event.participants}
                      joined={event.joined}
                      youName={profile.name || 'You'}
                      youPhoto={avatarSrc}
                      seed={event.slug ?? event.id}
                      size={28}
                      max={4}
                    />
                    <Caption className="min-w-0 flex-1" numberOfLines={1}>
                      {spotsLeft > 0
                        ? `${event.participants} going · ${spotsLeft} spots left`
                        : `${event.participants} going · Full`}
                    </Caption>
                    <Pressable
                      onPress={() => toggleJoin(event)}
                      disabled={busyId === event.id || (!event.joined && spotsLeft === 0)}
                      className={`px-4 py-2 ${event.joined ? 'bg-primary-50' : 'bg-primary'}`}
                      style={{ borderRadius: 8 }}>
                      <Caption
                        className={`font-sans-semibold ${
                          event.joined ? 'text-primary' : 'text-white'
                        }`}>
                        {event.joined
                          ? 'Joined'
                          : spotsLeft === 0
                            ? 'Full'
                            : 'Join'}
                      </Caption>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
