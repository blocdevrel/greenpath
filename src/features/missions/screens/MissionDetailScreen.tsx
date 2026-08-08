import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTts } from '@/shared/a11y/useTts';
import { Illustration } from '@/shared/components/Illustration';
import { SpeakButton } from '@/shared/components/SpeakButton';
import { Body, Button, Caption, Card, Label } from '@/shared/components/ui';
import type { Mission } from '@/shared/data/greenpathData';
import { images } from '@/shared/media';
import {
  demoEvidenceByMission,
  useGreenPath,
} from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

export function MissionDetailScreen({
  mission,
  onBack,
  onSubmitEvidence,
}: {
  mission: Mission;
  onBack: () => void;
  onSubmitEvidence: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { setEvidence, completedMissionIds } = useGreenPath();
  const { ttsEnabled, readAloud, stop, announce } = useTts();
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [preview, setPreview] = useState(false);
  const done = completedMissionIds.includes(mission.id);

  const steps = useMemo(
    () =>
      mission.checklist
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !/photo|upload|submit|evidence|confirm/i.test(item)),
    [mission.checklist],
  );

  const checkedCount = steps.filter(({ index }) => checked[index]).length;
  const allChecked = steps.length > 0 ? checkedCount === steps.length : true;
  const canAddEvidence = allChecked && !done;
  const canSubmit = canAddEvidence && preview;
  const evidenceSource = demoEvidenceByMission[mission.id] ?? images.onboardingAction;

  const spokenText = useMemo(() => {
    const checklist = steps.map((s, i) => `Step ${i + 1}. ${s.item}.`).join(' ');
    return `Mission. ${mission.title}. Reward ${mission.xp} XP. Difficulty ${mission.difficulty}. Impact ${mission.impact}. ${mission.description}. Checklist. ${checklist}`;
  }, [mission, steps]);

  useEffect(() => {
    void announce(spokenText);
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = () => {
    if (!allChecked || done) return;
    setEvidence(evidenceSource);
    setPreview(true);
    if (ttsEnabled) void readAloud('Photo evidence added. You can submit for AI review.');
  };

  const clearEvidence = () => {
    setPreview(false);
  };

  const toggle = (i: number) => {
    if (done) return;
    setChecked((c) => {
      const next = { ...c, [i]: !c[i] };
      const stillComplete = steps.every(({ index }) => !!next[index]);
      if (!stillComplete) setPreview(false);
      const step = steps.find((s) => s.index === i);
      if (ttsEnabled && step) {
        void readAloud(
          next[i] ? `Checked. ${step.item}` : `Unchecked. ${step.item}`,
        );
      }
      return next;
    });
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 28,
          flexGrow: 1,
        }}>
        {/* Top banner slot — swap in a real Image banner later */}
        <View className="relative w-full overflow-hidden bg-primary-50" style={{ height: 220 }}>
          <View className="absolute inset-0 items-center justify-center">
            <Illustration kind={mission.illustration} size="lg" />
          </View>
          <Pressable
            onPress={() => {
              void stop();
              onBack();
            }}
            accessibilityLabel="Back"
            className="absolute left-5 h-11 w-11 items-center justify-center rounded-full bg-card-raised"
            style={{ top: insets.top + 8 }}>
            <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
          </Pressable>
        </View>

        <View className="gap-6 px-5 pt-5">
          <View className="gap-3">
            <View className="gap-2">
              <Text className="font-sans-extrabold text-title text-ink">{mission.title}</Text>
              <Caption>
                {mission.xp} XP, {mission.difficulty}, {mission.impact}
              </Caption>
              {done ? (
                <View className="self-start rounded-full bg-success-soft px-3 py-1">
                  <Caption className="font-sans-semibold text-success">Already completed</Caption>
                </View>
              ) : null}
            </View>
            <SpeakButton text={spokenText} label="Read mission aloud" />
          </View>

          <Body>{mission.description}</Body>

          <View className="gap-3">
            <View className="flex-row items-end justify-between gap-3">
              <View className="min-w-0 flex-1 gap-1">
                <Label className="font-sans-semibold">1. Complete checklist</Label>
                <Caption>Tick every step before adding evidence.</Caption>
              </View>
              <Caption className="font-sans-semibold text-primary">
                {checkedCount}/{steps.length}
              </Caption>
            </View>

            <View className="h-1.5 overflow-hidden rounded-full bg-canvas-sunken">
              <View
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${steps.length ? Math.round((checkedCount / steps.length) * 100) : 0}%`,
                }}
              />
            </View>

            {steps.map(({ item, index }, order) => {
              const on = !!checked[index];
              return (
                <Pressable
                  key={item}
                  onPress={() => toggle(index)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  disabled={done}
                  className={`flex-row items-center gap-3 rounded-xl border px-4 py-3.5 ${
                    on ? 'border-primary bg-primary-50' : 'border-line bg-card-raised'
                  }`}>
                  <View
                    className={`h-7 w-7 items-center justify-center rounded-full ${
                      on ? 'bg-primary' : 'bg-canvas-sunken'
                    }`}>
                    {on ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : (
                      <Text className="font-sans-bold text-caption text-muted">{order + 1}</Text>
                    )}
                  </View>
                  <Body className="flex-1 text-ink">{item}</Body>
                </Pressable>
              );
            })}
          </View>

          <View
            className={`overflow-hidden rounded-2xl border bg-card-raised ${
              canAddEvidence ? 'border-line' : 'border-line opacity-70'
            }`}>
            <View className="flex-row items-center justify-between border-b border-line px-4 py-3.5">
              <View className="min-w-0 flex-1 gap-0.5 pr-3">
                <Label className="font-sans-semibold">2. Add evidence</Label>
                <Caption numberOfLines={1}>
                  {canAddEvidence
                    ? preview
                      ? 'Ready for AI review'
                      : 'Photo evidence required'
                    : 'Unlocks after checklist'}
                </Caption>
              </View>
              <View
                className={`rounded-full px-2.5 py-1 ${
                  preview
                    ? 'bg-success-soft'
                    : canAddEvidence
                      ? 'bg-primary-50'
                      : 'bg-canvas-sunken'
                }`}>
                <Caption
                  className={`font-sans-semibold ${
                    preview ? 'text-success' : canAddEvidence ? 'text-primary' : 'text-muted'
                  }`}>
                  {preview ? 'Added' : canAddEvidence ? 'Open' : 'Locked'}
                </Caption>
              </View>
            </View>

            <View className="gap-4 p-4">
              {preview ? (
                <View className="overflow-hidden rounded-2xl border border-line bg-canvas-sunken">
                  <View className="h-48 w-full">
                    <Image
                      source={evidenceSource}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-row items-center justify-between gap-3 border-t border-line bg-card-raised px-3 py-3">
                    <View className="min-w-0 flex-1 flex-row items-center gap-2">
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-success-soft">
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={colors.success.DEFAULT}
                        />
                      </View>
                      <View className="min-w-0 flex-1">
                        <Label numberOfLines={1} className="font-sans-semibold">
                          Photo evidence
                        </Label>
                        <Caption numberOfLines={1}>mission-evidence.jpg</Caption>
                      </View>
                    </View>
                    <Pressable
                      onPress={clearEvidence}
                      accessibilityLabel="Remove evidence"
                      className="rounded-full border border-line px-3 py-2 active:bg-canvas-sunken">
                      <Caption className="font-sans-semibold text-ink">Replace</Caption>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View
                  className={`items-center gap-3 rounded-2xl border border-dashed px-5 py-8 ${
                    canAddEvidence
                      ? 'border-primary/40 bg-primary-50/60'
                      : 'border-line bg-canvas-sunken'
                  }`}>
                  <View
                    className={`h-14 w-14 items-center justify-center rounded-full ${
                      canAddEvidence ? 'bg-card-raised' : 'bg-card'
                    }`}>
                    <Ionicons
                      name={canAddEvidence ? 'camera-outline' : 'lock-closed-outline'}
                      size={26}
                      color={canAddEvidence ? colors.primary.DEFAULT : colors.muted}
                    />
                  </View>
                  <View className="items-center gap-1 px-2">
                    <Label className="text-center font-sans-semibold">
                      {canAddEvidence ? 'Add a photo' : 'Evidence locked'}
                    </Label>
                    <Caption className="text-center">
                      {canAddEvidence
                        ? 'Take a clear photo of your completed action to continue.'
                        : 'Finish every checklist step to unlock this section.'}
                    </Caption>
                  </View>
                </View>
              )}

              {!preview ? (
                <EvidenceChoice
                  icon="camera-outline"
                  title="Take photo"
                  subtitle="Use your device camera"
                  disabled={!canAddEvidence}
                  onPress={capture}
                />
              ) : null}
            </View>
          </View>

          <Card tone="gold" className="gap-1">
            <Caption>Reward preview</Caption>
            <Label className="font-sans-bold">+{mission.xp} XP, Chance at new badge</Label>
          </Card>

          <View className="gap-2">
            <Label className="font-sans-semibold">3. Submit for AI review</Label>
            <Button
              label="Submit for AI review"
              size="lg"
              disabled={!canSubmit}
              trailingGlyph="→"
              onPress={() => {
                void stop();
                if (ttsEnabled) void readAloud('Submitting for AI review.');
                onSubmitEvidence();
              }}
            />
            {!canSubmit && !done ? (
              <Caption className="text-center">
                {!allChecked
                  ? 'Complete the checklist first.'
                  : 'Add a photo to submit.'}
              </Caption>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function EvidenceChoice({
  icon,
  title,
  subtitle,
  disabled,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      className={`flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 ${
        disabled
          ? 'border-line bg-canvas-sunken opacity-60'
          : 'border-line bg-card active:bg-primary-50'
      }`}>
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          disabled ? 'bg-card' : 'bg-primary-50'
        }`}>
        <Ionicons
          name={icon}
          size={20}
          color={disabled ? colors.muted : colors.primary.DEFAULT}
        />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Label className="font-sans-semibold">{title}</Label>
        <Caption numberOfLines={1}>{subtitle}</Caption>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}
