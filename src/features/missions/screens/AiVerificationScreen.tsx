import { useEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { Illustration } from '@/shared/components/Illustration';
import { Body, Button, Caption, Card, Label, Screen, Stat } from '@/shared/components/ui';
import type { Mission } from '@/shared/data/greenpathData';
import { useGreenPath } from '@/shared/state/GreenPathContext';

export function AiVerificationScreen({
  mission,
  onContinue,
}: {
  mission: Mission;
  onContinue: () => void;
}) {
  const { evidenceUri, completeMission } = useGreenPath();
  const [phase, setPhase] = useState<'scanning' | 'done'>('scanning');
  const awarded = useRef(false);
  const badge =
    mission.illustration === 'tree'
      ? 'Tree Guardian'
      : mission.illustration === 'recycle'
        ? 'Waste Warrior'
        : 'Climate Hero';

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('done');
      if (!awarded.current) {
        awarded.current = true;
        completeMission(mission, badge);
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [badge, completeMission, mission]);

  return (
    <Screen bottomPadding={28} scroll={false}>
      <View className="flex-1 justify-between">
        <View className="items-center gap-4 pt-8">
          <Illustration kind="scan" size="xl" />
          <Label className="font-sans-bold text-heading">
            {phase === 'scanning' ? 'AI is verifying…' : 'Mission Verified'}
          </Label>
          <Body className="text-center">
            {phase === 'scanning'
              ? 'Scanning your evidence for climate action authenticity.'
              : 'Your impact counts. Keep growing your GreenPath.'}
          </Body>
        </View>

        <Card className="items-center gap-4 py-6">
          <View className="h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-canvas-sunken">
            {evidenceUri ? (
              <Image
                source={evidenceUri}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Illustration kind={mission.illustration} size="md" />
            )}
            {phase === 'scanning' ? (
              <View className="absolute left-4 right-4 top-1/2 h-0.5 bg-accent" />
            ) : null}
          </View>
          <Caption>
            {phase === 'scanning' ? 'Matching checklist + photo evidence' : 'Evidence accepted'}
          </Caption>
        </Card>

        {phase === 'done' ? (
          <View className="gap-3">
            <Card tone="lime" className="flex-row items-center justify-between">
              <Label className="font-sans-semibold">Reward</Label>
              <Stat className="text-heading">+{mission.xp} XP</Stat>
            </Card>
            <Card tone="gold" className="flex-row items-center justify-between">
              <Label className="font-sans-semibold">New Badge</Label>
              <Text className="font-sans-bold text-body text-ink">{badge}</Text>
            </Card>
            <Button label="Continue" size="lg" trailingGlyph="→" onPress={onContinue} />
          </View>
        ) : (
          <View className="h-14" />
        )}
      </View>
    </Screen>
  );
}
