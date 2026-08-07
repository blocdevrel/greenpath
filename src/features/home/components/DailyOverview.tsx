import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { Overline } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { dailyMetrics } from '../data/homeData';

const CARD_GAP = 12;

/**
 * Your day metrics — same sliding dark/primary card language as onboarding schedule.
 */
export function DailyOverview() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.round(width * 0.72);

  return (
    <View className="gap-3">
      <Overline className="px-0">Your day</Overline>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + CARD_GAP}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={{ paddingRight: 4 }}>
        {dailyMetrics.map((metric, index) => {
          const isPrimary = metric.tone === 'primary';
          const isLight = metric.tone === 'light';
          const surface = isPrimary
            ? 'bg-primary'
            : isLight
              ? 'bg-card'
              : 'bg-ink-800';
          const inverse = !isLight;

          return (
            <View
              key={metric.id}
              style={{
                width: cardWidth,
                marginRight: index === dailyMetrics.length - 1 ? 0 : CARD_GAP,
              }}
              className={`h-52 justify-between rounded-xl p-5 ${surface}`}>
              <View className="flex-row items-start justify-between">
                <View
                  className={`h-11 w-11 items-center justify-center rounded-full ${
                    isLight ? 'bg-primary-50' : 'bg-white/15'
                  }`}>
                  <Ionicons
                    name={metric.icon}
                    size={22}
                    color={isLight ? colors.primary.DEFAULT : colors.card.raised}
                  />
                </View>
                <Text
                  className={`font-sans-medium text-label ${
                    inverse ? 'text-white/70' : 'text-subtle'
                  }`}>
                  {metric.label}
                </Text>
              </View>

              <View className="gap-1">
                <Text
                  className={`font-sans-extrabold text-title ${
                    inverse ? 'text-white' : 'text-ink'
                  }`}>
                  {metric.value}
                </Text>
                <Text
                  className={`font-sans text-body ${
                    inverse ? 'text-white/75' : 'text-subtle'
                  }`}>
                  {metric.detail}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
