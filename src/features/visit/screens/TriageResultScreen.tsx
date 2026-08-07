import { View } from 'react-native';

import { Body, Button, Card, Title, TriageBadge } from '@/shared/components/ui';
import type { TriageLevel } from '@/shared/theme/tokens';
import { triage } from '@/shared/theme/tokens';

import { FlowHeader } from '../components/FlowHeader';

export function TriageResultScreen({
  level,
  positiveCount,
  onBack,
  onClose,
  onConfirm,
  onOverride,
}: {
  level: TriageLevel;
  positiveCount: number;
  onBack: () => void;
  onClose: () => void;
  onConfirm: () => void;
  onOverride: (level: TriageLevel) => void;
}) {
  return (
    <View className="gap-5">
      <FlowHeader title="Result" stepLabel="Confirm" onBack={onBack} onClose={onClose} />

      <Card
        className={`gap-3 p-5 ${
          level === 'refer'
            ? 'bg-refer-soft'
            : level === 'treat'
              ? 'bg-treat-soft'
              : 'bg-watch-soft'
        }`}>
        <TriageBadge level={level} />
        <Title>{triage[level].label}</Title>
        <Body>
          {positiveCount === 0 ? 'No danger signs' : `${positiveCount} danger sign(s)`}
        </Body>
      </Card>

      <View className="flex-row flex-wrap gap-2">
        {(['watch', 'treat', 'refer'] as TriageLevel[]).map((option) => (
          <Button
            key={option}
            label={triage[option].label}
            variant={option === level ? 'primary' : 'ghost'}
            size="sm"
            fullWidth={false}
            onPress={() => onOverride(option)}
          />
        ))}
      </View>

      <Button label="Continue" size="lg" onPress={onConfirm} trailingGlyph="→" />
    </View>
  );
}
