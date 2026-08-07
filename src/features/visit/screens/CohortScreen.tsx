import { Pressable, View } from 'react-native';

import { Button, Card, Label, Subheading } from '@/shared/components/ui';

import { FlowHeader } from '../components/FlowHeader';
import { cohorts } from '../data/visitMockData';
import type { VisitCohort } from '../types';

export function CohortScreen({
  suggested,
  selected,
  onSelect,
  onBack,
  onClose,
  onContinue,
}: {
  suggested: VisitCohort;
  selected: VisitCohort | null;
  onSelect: (cohort: VisitCohort) => void;
  onBack: () => void;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <View className="gap-5">
      <FlowHeader title="Who?" stepLabel="Cohort" onBack={onBack} onClose={onClose} />

      <View className="gap-2">
        {cohorts.map((cohort) => {
          const active = selected === cohort.id;
          return (
            <Pressable key={cohort.id} onPress={() => onSelect(cohort.id)}>
              <Card
                className={`flex-row items-center justify-between p-4 ${
                  active ? 'border border-primary bg-primary-50' : ''
                }`}>
                <Subheading>{cohort.title}</Subheading>
                {cohort.id === suggested ? <Label tone="primary">Suggested</Label> : null}
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Card className="flex-row items-center justify-between p-4">
        <Label>Dagbani · English</Label>
        <Label tone="subtle">Voice / tap</Label>
      </Card>

      <Button label="Continue" size="lg" disabled={!selected} onPress={onContinue} trailingGlyph="→" />
    </View>
  );
}
