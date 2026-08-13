import { useRef } from 'react';
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
  type TextStyle,
} from 'react-native';

import { colors } from '@/shared/theme/tokens';
import { webInputReset } from '@/shared/ui/webInputReset';

const CODE_LENGTH = 6;
const BOX = 48;

type OtpInputProps = {
  digits: string[];
  onChangeDigits: (next: string[]) => void;
  autoFocus?: boolean;
};

/** Six equal OTP boxes with centered digits (including Expo web). */
export function OtpInput({ digits, onChangeDigits, autoFocus }: OtpInputProps) {
  const inputs = useRef<(TextInputType | null)[]>([]);

  const setDigit = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const next = Array(CODE_LENGTH)
        .fill('')
        .map((_, i) => cleaned[i] ?? '');
      onChangeDigits(next);
      const focusAt = Math.min(cleaned.length, CODE_LENGTH) - 1;
      inputs.current[Math.max(0, focusAt)]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleaned.slice(-1);
    onChangeDigits(next);
    if (cleaned && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <View
      className="w-full flex-row items-center justify-center self-center"
      style={{ gap: 8, maxWidth: BOX * CODE_LENGTH + 8 * (CODE_LENGTH - 1) }}>
      {digits.map((digit, index) => {
        const boxStyle = {
          width: BOX,
          height: BOX + 4,
          flexGrow: 0,
          flexShrink: 0,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        };

        const box = (
          <>
            {/* Visible centered digit — TextInput alone misaligns on web */}
            <Text
              style={{
                position: 'absolute',
                fontSize: 22,
                fontWeight: '800',
                color: colors.ink.DEFAULT,
                textAlign: 'center',
                lineHeight: 28,
                zIndex: 1,
                pointerEvents: 'none',
              }}>
              {digit}
            </Text>
            <TextInput
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => setDigit(index, value)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
                  inputs.current[index - 1]?.focus();
                }
              }}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={index === 0 ? CODE_LENGTH : 1}
              selectTextOnFocus
              autoFocus={autoFocus && index === 0}
              textAlign="center"
              caretHidden={Platform.OS !== 'web'}
              accessibilityLabel={`Digit ${index + 1}`}
              style={[
                webInputReset,
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  color: 'transparent',
                  // Keep caret usable on web while hiding typed glyphs
                  ...(Platform.OS === 'web'
                    ? ({ caretColor: colors.primary.DEFAULT, cursor: 'text' } as TextStyle)
                    : null),
                  fontSize: 22,
                  padding: 0,
                  margin: 0,
                  zIndex: 2,
                },
              ]}
            />
          </>
        );

        return Platform.OS === 'web' ? (
          <Pressable
            key={index}
            onPress={() => inputs.current[index]?.focus()}
            className={`overflow-hidden rounded-xl border bg-card-raised ${
              digit ? 'border-primary' : 'border-line'
            }`}
            style={boxStyle}>
            {box}
          </Pressable>
        ) : (
          <View
            key={index}
            className={`overflow-hidden rounded-xl border bg-card-raised ${
              digit ? 'border-primary' : 'border-line'
            }`}
            style={boxStyle}>
            {box}
          </View>
        );
      })}
    </View>
  );
}

export const OTP_LENGTH = CODE_LENGTH;
