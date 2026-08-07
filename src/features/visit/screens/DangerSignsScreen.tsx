import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { Button, Caption, Card, Label, Subheading } from '@/shared/components/ui';

import { FlowHeader } from '../components/FlowHeader';
import type { DangerSignItem } from '../types';

export function DangerSignsScreen({
  items,
  answers,
  onAnswer,
  onBack,
  onClose,
  onSubmit,
}: {
  items: DangerSignItem[];
  answers: Record<string, boolean | null>;
  onAnswer: (id: string, value: boolean) => void;
  onBack: () => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const unanswered = items.some((item) => answers[item.id] == null);

  return (
    <View className="gap-5">
      <FlowHeader title="Danger signs" stepLabel="Ask · look · voice" onBack={onBack} onClose={onClose} />

      <Card tone="primary" className="flex-row items-center gap-3 p-4">
        <Ionicons name="mic" size={22} color="#FFFFFF" />
        <Label className="text-white">Voice or tap Yes / No</Label>
      </Card>

      <View className="gap-3">
        {items.map((item, index) => {
          const value = answers[item.id];
          return (
            <Card key={item.id} className="gap-3 p-4">
              <Caption>
                {index + 1}/{items.length}
              </Caption>
              <Subheading>{item.prompt}</Subheading>
              {item.lookHint ? <Label tone="subtle">{item.lookHint}</Label> : null}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => onAnswer(item.id, true)}
                  className={`h-12 flex-1 items-center justify-center rounded-full ${
                    value === true ? 'bg-refer' : 'border border-line bg-card-raised'
                  }`}>
                  <Label className={value === true ? 'text-white' : 'text-ink'}>Yes</Label>
                </Pressable>
                <Pressable
                  onPress={() => onAnswer(item.id, false)}
                  className={`h-12 flex-1 items-center justify-center rounded-full ${
                    value === false ? 'bg-watch' : 'border border-line bg-card-raised'
                  }`}>
                  <Label className={value === false ? 'text-white' : 'text-ink'}>No</Label>
                </Pressable>
              </View>
            </Card>
          );
        })}
      </View>

      <Button label="See result" size="lg" disabled={unanswered} onPress={onSubmit} trailingGlyph="→" />
    </View>
  );
}
