import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Illustration } from '@/shared/components/Illustration';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Button, Caption, Card, Heading, Label, Overline } from '@/shared/components/ui';
import { events } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';
import { colors } from '@/shared/theme/tokens';

export function CommunityScreen({ onOpenLeaderboard }: { onOpenLeaderboard: () => void }) {
  const insets = useSafeAreaInsets();
  const [joined, setJoined] = useState<Record<string, boolean>>({});

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
              <Heading>Climate Events</Heading>
              <Caption>Plant trees, clean up, and learn together.</Caption>
            </View>
            <Pressable
              onPress={onOpenLeaderboard}
              accessibilityLabel="Leaderboard"
              className="h-12 w-12 items-center justify-center rounded-full bg-gold-soft">
              <Ionicons name="trophy" size={22} color={colors.gold.DEFAULT} />
            </Pressable>
          </View>

          <View className="gap-4">
            {events.map((event) => {
              const isJoined = !!joined[event.id];
              const participantCount = event.participants + (isJoined ? 1 : 0);
              const spotsLeft = Math.max(0, event.capacity - participantCount);
              const previewAttendees = isJoined
                ? [
                    { name: 'You', source: images.avatarIsaac },
                    ...event.attendees.slice(0, 3),
                  ]
                : event.attendees;

              return (
                <Card key={event.id} className="gap-4">
                  <View className="flex-row gap-4">
                    <Illustration kind={event.illustration} size="sm" />
                    <View className="min-w-0 flex-1 gap-2">
                      <Label className="font-sans-bold text-subheading">{event.title}</Label>

                      <MetaRow icon="location-outline" text={event.location} />
                      <MetaRow icon="calendar-outline" text={event.date} />
                      <MetaRow icon="time-outline" text={event.time} />
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between gap-3">
                    <View className="min-w-0 flex-1 flex-row items-center gap-3">
                      <View className="flex-row items-center">
                        {previewAttendees.slice(0, 4).map((person, index) => (
                          <View
                            key={`${event.id}-${person.name}-${index}`}
                            className="h-9 w-9 overflow-hidden rounded-full border-2 border-card-raised bg-primary-50"
                            style={{ marginLeft: index === 0 ? 0 : -10, zIndex: 10 - index }}>
                            <Image
                              source={person.source}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                              accessibilityIgnoresInvertColors
                            />
                          </View>
                        ))}
                        {participantCount > 4 ? (
                          <View
                            className="h-9 w-9 items-center justify-center rounded-full border-2 border-card-raised bg-primary"
                            style={{ marginLeft: -10 }}>
                            <Text className="font-sans-bold text-caption text-white">
                              +{participantCount - 4}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View className="min-w-0 flex-1">
                        <Caption numberOfLines={1}>
                          {spotsLeft > 0
                            ? `${participantCount} joined, ${spotsLeft} spots left`
                            : `${participantCount} joined, Full`}
                        </Caption>
                      </View>
                    </View>
                  </View>

                  <Button
                    label={isJoined ? 'Joined' : spotsLeft === 0 ? 'Waitlist' : 'Join'}
                    size="sm"
                    variant={isJoined ? 'soft' : 'primary'}
                    disabled={!isJoined && spotsLeft === 0}
                    onPress={() =>
                      setJoined((j) => ({ ...j, [event.id]: !j[event.id] }))
                    }
                  />
                </Card>
              );
            })}
          </View>
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
    <View className="flex-row items-center gap-2">
      <Ionicons name={icon} size={16} color={colors.subtle} />
      <Caption className="flex-1" numberOfLines={1}>
        {text}
      </Caption>
    </View>
  );
}
