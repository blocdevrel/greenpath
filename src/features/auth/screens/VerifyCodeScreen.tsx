import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Button, Display, Label, Screen } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';
import { webInputReset } from '@/shared/ui/webInputReset';

const CODE_LENGTH = 4;

export function VerifyCodeScreen({
  phone,
  onBack,
  onVerified,
}: {
  phone: string;
  onBack: () => void;
  onVerified: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const code = digits.join('');
  const ready = code.length === CODE_LENGTH;

  const setDigit = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);

    if (cleaned && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <Screen bottomPadding={28}>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center self-start rounded-full border border-line bg-card-raised">
        <Ionicons name="arrow-back" size={20} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="gap-2">
        <Display lead="Enter" trail="Code" />
        <Label tone="subtle">SMS sent to {phone || 'your phone'}</Label>
      </View>

      <View className="flex-row justify-between gap-3">
        {digits.map((digit, index) => (
          <View
            key={index}
            className={`h-16 flex-1 items-center justify-center rounded-md border bg-card-raised ${
              digit ? 'border-primary' : 'border-line'
            }`}>
            <TextInput
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => setDigit(index, value)}
              onKeyPress={({ nativeEvent }) => onKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
              className="h-full w-full font-sans-extrabold text-title text-ink"
              accessibilityLabel={`Digit ${index + 1}`}
              style={webInputReset}
            />
          </View>
        ))}
      </View>

      <Button
        label="Verify"
        size="lg"
        disabled={!ready}
        onPress={onVerified}
        trailingGlyph="→"
      />

      <Pressable
        onPress={() => setDigits(Array(CODE_LENGTH).fill(''))}
        className="h-12 items-center justify-center">
        <Label tone="primary">Resend code</Label>
      </Pressable>
    </Screen>
  );
}
