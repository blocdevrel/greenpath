import { View } from 'react-native';

import { Badge, Body, Button, Card, Display, Screen } from '@/shared/components/ui';

const tips = [
  { title: 'Under 6 months', detail: 'Exclusive breastfeeding only.' },
  { title: '6–23 months', detail: 'Breast milk + thick local foods 3–4×/day.' },
  { title: 'Food stress', detail: 'Energy-dense meals; MUAC red → refer.' },
  { title: 'Anaemia', detail: 'Greens, liver, beans + vitamin C foods.' },
];

export function NutritionScreen({ onClose }: { onClose: () => void }) {
  return (
    <Screen bottomPadding={28}>
      <Display lead="Local" trail="Nutrition" />

      <View className="gap-3">
        {tips.map((tip) => (
          <Card key={tip.title} className="gap-1 p-4">
            <Body className="font-sans-semibold text-ink">{tip.title}</Body>
            <Body>{tip.detail}</Body>
          </Card>
        ))}
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Badge label="Offline" />
        <Badge label="Dagbani soon" />
      </View>

      <Button label="Done" size="lg" onPress={onClose} />
    </Screen>
  );
}
