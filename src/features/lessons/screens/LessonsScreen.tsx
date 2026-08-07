import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeakButton } from '@/shared/components/SpeakButton';
import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Body, Caption, Card, Heading, Label, Overline } from '@/shared/components/ui';
import type { Lesson } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function LessonsScreen({ onOpenLesson }: { onOpenLesson: (lesson: Lesson) => void }) {
  const insets = useSafeAreaInsets();
  const { filteredLessons, interests } = useGreenPath();

  const listSpeech = `Climate lessons. ${filteredLessons.length} lessons available.${
    interests.length ? ` Personalized for ${interests.length} topics.` : ''
  } ${filteredLessons.map((l, i) => `Lesson ${i + 1}. ${l.title}. ${l.minutes} minutes. ${l.difficulty}.`).join(' ')}`;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: TAB_BAR_SCROLL_PADDING + insets.bottom,
        }}>
        <View className="gap-6 px-5 pb-8">
          <View className="gap-3">
            <View className="gap-2">
              <Overline>Learn</Overline>
              <Heading>Climate Lessons</Heading>
              <Caption>
                Personalized for your interests
                {interests.length ? `, ${interests.length} topics` : ''}
              </Caption>
            </View>
            <SpeakButton text={listSpeech} label="Read lessons aloud" />
          </View>

          {filteredLessons.length === 0 ? (
            <Card className="items-center gap-3 py-10">
              <Label className="font-sans-semibold">No lessons yet</Label>
              <Body className="text-center">Pick interests during onboarding to personalize.</Body>
            </Card>
          ) : (
            <View className="gap-4">
              {filteredLessons.map((lesson) => {
                const pct = Math.round(lesson.progress * 100);
                return (
                  <Pressable key={lesson.id} onPress={() => onOpenLesson(lesson)}>
                    <View className="overflow-hidden rounded-md border border-line bg-card-raised">
                      <View className="h-36 w-full overflow-hidden bg-primary-50">
                        <Image
                          source={images.landingHero}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                          accessibilityIgnoresInvertColors
                        />
                      </View>

                      <View className="gap-3 p-4">
                        <View className="flex-row items-start gap-3">
                          <View className="min-w-0 flex-1 gap-1.5">
                            <Label className="font-sans-bold text-subheading">{lesson.title}</Label>
                            <Caption>{lesson.topic}</Caption>
                            <MetaRow
                              icon="time-outline"
                              text={`${lesson.minutes} min, ${lesson.difficulty}`}
                            />
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                        </View>

                        <View className="gap-1.5">
                          <View className="h-2 overflow-hidden rounded-full bg-canvas-sunken">
                            <View
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </View>
                          <Caption className="text-primary">
                            {pct === 100 ? 'Completed' : `${pct}% complete`}
                          </Caption>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
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
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={14} color={colors.muted} />
      <Caption numberOfLines={1}>{text}</Caption>
    </View>
  );
}
