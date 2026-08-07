import { View } from 'react-native';

import { Badge, Button, Card, Label, TriageBadge } from '@/shared/components/ui';

import { FlowHeader } from '../components/FlowHeader';
import type { TreatProtocol } from '../types';

export function TreatHomeScreen({
  protocol,
  onBack,
  onClose,
  onDone,
  onEscalate,
}: {
  protocol: TreatProtocol;
  onBack: () => void;
  onClose: () => void;
  onDone: () => void;
  onEscalate: () => void;
}) {
  return (
    <View className="gap-5">
      <FlowHeader title="Treat" stepLabel="Home care" onBack={onBack} onClose={onClose} />

      <TriageBadge level="treat" />
      <Label className="font-sans-semibold text-ink">{protocol.title}</Label>

      <View className="gap-2">
        {protocol.steps.map((step, index) => (
          <Card key={step} className="flex-row items-center gap-3 p-4">
            <Badge label={`${index + 1}`} />
            <Label className="min-w-0 flex-1">{step}</Label>
          </Card>
        ))}
      </View>

      {protocol.drugs.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {protocol.drugs.map((drug) => (
            <Badge key={drug} label={drug} />
          ))}
        </View>
      ) : null}

      <Button label="Record & finish" size="lg" onPress={onDone} />
      <Button label="Refer instead" variant="danger" onPress={onEscalate} />
    </View>
  );
}
