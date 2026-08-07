import { View } from 'react-native';

import { Body, Caption, Card, Label, Subheading, TriageBadge } from '@/shared/components/ui';

import type { RouteStop } from '../data/mapRouteData';

export function RouteStopCard({
  stop,
  distanceText,
  durationText,
}: {
  stop: RouteStop;
  distanceText?: string;
  durationText?: string;
}) {
  return (
    <Card className="gap-2 p-4">
      <Caption>Next on route</Caption>
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Subheading numberOfLines={1}>
            #{stop.rank} · {stop.name}
          </Subheading>
          <Body numberOfLines={1} className="mt-1">
            {stop.why}
          </Body>
        </View>
        <TriageBadge level={stop.level} />
      </View>
      <View className="flex-row items-center gap-3">
        <Label tone="subtle">{stop.distance}</Label>
        {distanceText ? <Label tone="subtle">Route {distanceText}</Label> : null}
        {durationText ? <Label tone="subtle">{durationText}</Label> : null}
      </View>
    </Card>
  );
}
