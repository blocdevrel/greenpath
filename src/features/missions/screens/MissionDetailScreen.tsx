import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pickEvidencePhoto } from '@/shared/media/pickEvidence';

import { useTts } from '@/shared/a11y/useTts';
import { ApiError, verifyMissionApi } from '@/shared/api';
import { SpeakButton } from '@/shared/components/SpeakButton';
import {
  PhotoAddWell,
  PhotoReadyPreview,
  PhotoSourceActions,
  PhotoSourceSheet,
} from '@/shared/components/PhotoPicker';
import { Body, Button, Caption, Card, Label } from '@/shared/components/ui';
import type { Mission } from '@/shared/data/greenpathData';
import { useGreenPath } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

function isPhotoStep(item: string) {
  return /photo|upload|evidence|confirm/i.test(item);
}

type ReviewPhase = 'idle' | 'scanning' | 'failed';

const SCAN_STEPS = [
  'Reading photo evidence…',
  'Matching mission checklist…',
  'Scoring climate authenticity…',
] as const;

export function MissionDetailScreen({
  mission,
  onBack,
}: {
  mission: Mission;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const {
    setEvidence,
    evidenceUri,
    getEvidenceBase64,
    completeMission,
    completedMissionIds,
  } = useGreenPath();
  const { ttsEnabled, readAloud, stop, announce } = useTts();
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [preview, setPreview] = useState(false);
  const [localPreview, setLocalPreview] = useState<typeof evidenceUri>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [phase, setPhase] = useState<ReviewPhase>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [failReason, setFailReason] = useState('');
  const [matched, setMatched] = useState<string[]>([]);
  const awarded = useRef(false);
  const done = completedMissionIds.includes(mission.id);

  const actionSteps = useMemo(
    () =>
      mission.checklist
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !isPhotoStep(item)),
    [mission.checklist],
  );

  const photoHint = useMemo(
    () =>
      mission.checklist.find((item) => isPhotoStep(item)) ??
      'Add a clear photo of your completed action.',
    [mission.checklist],
  );

  const badge =
    mission.illustration === 'tree'
      ? 'Tree Guardian'
      : mission.illustration === 'recycle'
        ? 'Waste Warrior'
        : 'Climate Hero';

  const checkedCount = actionSteps.filter(({ index }) => checked[index]).length;
  const allChecked = actionSteps.length > 0 ? checkedCount === actionSteps.length : true;
  const canAddEvidence = allChecked && !done && phase !== 'scanning';
  const canSubmit = canAddEvidence && preview && phase !== 'scanning';

  const spokenText = useMemo(() => {
    const steps = actionSteps.map((s, i) => `${i + 1}. ${s.item}.`).join(' ');
    return `Mission. ${mission.title}. ${mission.xp} XP. ${mission.difficulty}. ${mission.impact}. ${mission.description}. Steps. ${steps}`;
  }, [mission, actionSteps]);

  useEffect(() => {
    void announce(`Mission opened. ${mission.title}.`);
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addEvidenceFromSource = async (source: 'camera' | 'gallery') => {
    if (!canAddEvidence || done) return;
    try {
      const photo = await pickEvidencePhoto(source);
      if (!photo) return;
      setEvidence({ uri: photo.uri }, photo.base64);
      setLocalPreview({ uri: photo.uri });
      setPreview(true);
      setPhase('idle');
      setFailReason('');
      setConfidence(null);
      setMatched([]);
      if (ttsEnabled) void readAloud('Photo evidence added. You can submit for AI review.');
    } catch {
      // Keep UI stable on picker errors.
    } finally {
      setPickerOpen(false);
    }
  };

  const toggle = (i: number) => {
    if (done || phase === 'scanning') return;
    setChecked((c) => {
      const next = { ...c, [i]: !c[i] };
      const stillComplete = actionSteps.every(({ index }) => !!next[index]);
      if (!stillComplete) {
        setPreview(false);
        setLocalPreview(null);
        setPhase('idle');
      }
      return next;
    });
  };

  const submitForReview = async () => {
    if (!canSubmit || awarded.current) return;
    void stop();
    if (ttsEnabled) void readAloud('Submitting for AI review.');

    const photoBase64 = getEvidenceBase64();
    if (!photoBase64) {
      setPhase('failed');
      setFailReason('No photo evidence found. Add a clear photo and try again.');
      return;
    }

    setPhase('scanning');
    setStepIndex(0);
    setFailReason('');
    setConfidence(null);
    setMatched([]);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, SCAN_STEPS.length - 1));
    }, 900);

    try {
      const result = await verifyMissionApi(mission.id, { photoBase64 });
      clearInterval(stepTimer);
      setConfidence(result.confidence);
      setMatched(result.checklistMatched ?? []);

      if (result.verified) {
        if (!awarded.current) {
          awarded.current = true;
          completeMission(mission, badge);
        }
        setPhase('idle');
        if (ttsEnabled) void readAloud('Mission verified. XP awarded.');
      } else {
        setPhase('failed');
        setFailReason(result.reason || 'Vision AI could not verify this photo.');
      }
    } catch (e) {
      clearInterval(stepTimer);
      setPhase('failed');
      if (e instanceof ApiError) {
        const body = e.body as { confidence?: number; checklistMatched?: string[] } | null;
        setConfidence(typeof body?.confidence === 'number' ? body.confidence : null);
        setMatched(Array.isArray(body?.checklistMatched) ? body.checklistMatched : []);
        setFailReason(e.message || 'Vision AI could not verify this photo.');
      } else {
        setFailReason(e instanceof Error ? e.message : 'Verification failed. Please try again.');
      }
    }
  };

  return (
    <View className="flex-1 bg-canvas" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: '100%' }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 28,
          flexGrow: 1,
          width: '100%',
          maxWidth: '100%',
        }}>
        <View
          className="w-full gap-4 px-5 pb-1"
          style={{ paddingTop: insets.top + 8, maxWidth: '100%' }}>
          <Pressable
            onPress={() => {
              void stop();
              onBack();
            }}
            accessibilityLabel="Back"
            className="h-11 w-11 items-center justify-center rounded-full bg-card-raised">
            <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
          </Pressable>

          <View className="w-full gap-2">
            <View className="flex-row flex-wrap gap-2">
              <MetaPill label={`${mission.xp} XP`} tone="gold" />
              <MetaPill label={mission.difficulty} />
              <MetaPill label={`${mission.minutes} min`} icon="timer-outline" />
            </View>
            <Text className="font-sans-extrabold text-title text-ink">{mission.title}</Text>
            <Text className="font-sans-semibold text-caption text-subtle">{mission.impact}</Text>
          </View>
        </View>

        <View className="w-full gap-6 px-5 pt-4" style={{ maxWidth: '100%' }}>
          {done ? (
            <View className="self-start rounded-full bg-success-soft px-3 py-1.5">
              <Caption className="font-sans-semibold text-success">Mission completed</Caption>
            </View>
          ) : null}

          <View className="w-full gap-3">
            <Label className="font-sans-semibold">About this mission</Label>
            <Body>{mission.description}</Body>
            <SpeakButton text={spokenText} label="Read mission aloud" />
          </View>

          <View className="w-full gap-3">
            <Label className="font-sans-semibold">What to do</Label>

            {actionSteps.map(({ item, index }, order) => {
              const on = !!checked[index];
              return (
                <Pressable
                  key={`${index}-${item}`}
                  onPress={() => toggle(index)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  disabled={done || phase === 'scanning'}
                  className={`w-full flex-row items-center gap-3 rounded-[8px] border px-4 py-3.5 ${
                    on ? 'border-primary bg-primary-50' : 'border-line bg-card-raised'
                  }`}>
                  <View
                    className={`h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      on ? 'bg-primary' : 'bg-canvas-sunken'
                    }`}>
                    {on ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : (
                      <Text className="font-sans-bold text-caption text-muted">{order + 1}</Text>
                    )}
                  </View>
                  <Body className="min-w-0 flex-1 text-ink">{item}</Body>
                </Pressable>
              );
            })}
          </View>

          <View
            className={`w-full overflow-hidden rounded-[8px] border bg-card-raised ${
              canAddEvidence || preview ? 'border-line' : 'border-line opacity-80'
            }`}>
            <View className="border-b border-line px-4 py-3">
              <Label className="font-sans-semibold">Evidence</Label>
            </View>

            <View className="w-full gap-3 p-4">
              {preview && (localPreview || evidenceUri) ? (
                <PhotoReadyPreview
                  source={localPreview || evidenceUri!}
                  onChange={
                    done || phase === 'scanning'
                      ? undefined
                      : () => {
                          setPreview(false);
                          setLocalPreview(null);
                          setEvidence(null);
                          setPhase('idle');
                          setFailReason('');
                        }
                  }
                />
              ) : (
                <PhotoAddWell
                  hint={photoHint}
                  locked={!canAddEvidence}
                  onPress={() => canAddEvidence && setPickerOpen(true)}
                />
              )}

              {!preview && !done ? (
                <PhotoSourceActions
                  disabled={!canAddEvidence}
                  onCamera={() => void addEvidenceFromSource('camera')}
                  onGallery={() => void addEvidenceFromSource('gallery')}
                />
              ) : null}
            </View>
          </View>

          {phase === 'scanning' ? (
            <Card className="w-full gap-3">
              <View className="flex-row items-center gap-3">
                <ActivityIndicator color={colors.primary.DEFAULT} />
                <Label className="font-sans-semibold">Vision AI verifying…</Label>
              </View>
              <Body>{SCAN_STEPS[stepIndex]}</Body>
              <View className="gap-2">
                {SCAN_STEPS.map((label, i) => (
                  <View key={label} className="flex-row items-center gap-2">
                    <View
                      className={`h-2 w-2 rounded-full ${
                        i <= stepIndex ? 'bg-primary' : 'bg-line'
                      }`}
                    />
                    <Caption className={i <= stepIndex ? 'text-ink' : 'text-muted'}>{label}</Caption>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          {phase === 'failed' ? (
            <Card className="w-full gap-2 border border-danger/30">
              <View className="flex-row items-center gap-2">
                <Ionicons name="alert-circle" size={18} color={colors.danger.DEFAULT} />
                <Label className="font-sans-semibold">Needs a clearer photo</Label>
              </View>
              <Body>{failReason || 'Try again with a photo that clearly shows the completed action.'}</Body>
              {confidence != null ? (
                <Caption>
                  Confidence {Math.round(confidence * 100)}%
                  {matched.length ? ` · Matched ${matched.length} checklist item(s)` : ''}
                </Caption>
              ) : null}
            </Card>
          ) : null}

          <Card tone="gold" className="w-full gap-1">
            <Caption>Reward</Caption>
            <Label className="font-sans-bold">+{mission.xp} XP · chance at a new badge</Label>
          </Card>

          {!done ? (
            <View className="w-full gap-2 pb-2">
              <Button
                label={
                  phase === 'scanning'
                    ? 'Verifying…'
                    : phase === 'failed'
                      ? 'Submit again for AI review'
                      : 'Submit for AI review'
                }
                size="lg"
                disabled={!canSubmit}
                trailingGlyph={phase === 'scanning' ? undefined : '→'}
                onPress={() => void submitForReview()}
              />
              {!canSubmit && phase !== 'scanning' ? (
                <Caption className="text-center">
                  {!allChecked ? 'Complete every step first.' : 'Add a photo to submit.'}
                </Caption>
              ) : null}
            </View>
          ) : (
            <View className="w-full gap-2 pb-2">
              <Button label="Back to home" size="lg" trailingGlyph="→" onPress={onBack} />
            </View>
          )}
        </View>
      </ScrollView>

      <PhotoSourceSheet
        visible={pickerOpen}
        title="Add mission evidence"
        onClose={() => setPickerOpen(false)}
        onCamera={() => void addEvidenceFromSource('camera')}
        onGallery={() => void addEvidenceFromSource('gallery')}
      />
    </View>
  );
}

function MetaPill({
  label,
  tone,
  icon,
}: {
  label: string;
  tone?: 'gold';
  icon?: ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View
      className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
        tone === 'gold' ? 'bg-gold-soft' : 'bg-canvas-sunken'
      }`}>
      {icon ? <Ionicons name={icon} size={12} color={colors.muted} /> : null}
      <Text
        className="font-sans-bold text-caption"
        style={{ color: tone === 'gold' ? '#D97706' : colors.ink.DEFAULT }}>
        {label}
      </Text>
    </View>
  );
}
