import { Pressable, TextInput, View } from 'react-native';

import { Button, Card, Label, Subheading } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { FlowHeader } from '../components/FlowHeader';
import type { VisitFlowState } from '../types';

type Vitals = VisitFlowState['vitals'];

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suffix?: string;
}) {
  return (
    <View className="min-w-[46%] flex-1 gap-1">
      <Label tone="subtle">{label}</Label>
      <View className="h-14 flex-row items-center rounded-md border border-line bg-card-raised px-4">
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          className="flex-1 font-sans text-body text-ink"
        />
        {suffix ? <Label tone="subtle">{suffix}</Label> : null}
      </View>
    </View>
  );
}

export function VitalsScreen({
  vitals,
  onChange,
  onBack,
  onClose,
  onContinue,
  onSkipToRoutine,
}: {
  vitals: Vitals;
  onChange: (patch: Partial<Vitals>) => void;
  onBack: () => void;
  onClose: () => void;
  onContinue: () => void;
  onSkipToRoutine: () => void;
}) {
  return (
    <View className="gap-5">
      <FlowHeader title="Vitals" stepLabel="Look" onBack={onBack} onClose={onClose} />

      <View className="flex-row flex-wrap gap-3">
        <Field
          label="BP sys"
          value={vitals.bpSystolic}
          onChange={(bpSystolic) => onChange({ bpSystolic })}
          placeholder="120"
          suffix="mmHg"
        />
        <Field
          label="BP dia"
          value={vitals.bpDiastolic}
          onChange={(bpDiastolic) => onChange({ bpDiastolic })}
          placeholder="80"
          suffix="mmHg"
        />
        <Field
          label="Pulse"
          value={vitals.pulse}
          onChange={(pulse) => onChange({ pulse })}
          placeholder="72"
          suffix="/min"
        />
        <Field
          label="Temp"
          value={vitals.temp}
          onChange={(temp) => onChange({ temp })}
          placeholder="36.8"
          suffix="°C"
        />
        <Field
          label="Resp"
          value={vitals.respRate}
          onChange={(respRate) => onChange({ respRate })}
          placeholder="18"
          suffix="/min"
        />
      </View>

      <Pressable onPress={() => onChange({ pallor: !vitals.pallor })}>
        <Card
          className={`flex-row items-center justify-between p-4 ${
            vitals.pallor ? 'border border-refer bg-refer-soft' : ''
          }`}>
          <Subheading>Severe pallor</Subheading>
          <Label className={vitals.pallor ? 'text-refer' : 'text-muted'}>
            {vitals.pallor ? 'Yes' : 'No'}
          </Label>
        </Card>
      </Pressable>

      <Button label="Continue" size="lg" onPress={onContinue} trailingGlyph="→" />
      <Button label="Skip" variant="ghost" onPress={onSkipToRoutine} />
    </View>
  );
}
