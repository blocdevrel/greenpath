import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { Label } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';
import { webInputReset } from '@/shared/ui/webInputReset';

type AuthFieldProps = TextInputProps & {
  label: string;
  compact?: boolean;
};

/** Form field sized for mobile auth (44–48dp touch target). */
export function AuthField({
  label,
  secureTextEntry,
  style,
  compact = true,
  autoComplete,
  textContentType,
  ...rest
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = Boolean(secureTextEntry);
  const hide = isPassword && !visible;
  const fieldHeight = compact ? 48 : 56;

  return (
    <View className={compact ? 'gap-1.5' : 'gap-2'}>
      <Label className={compact ? 'text-caption' : undefined}>{label}</Label>
      <View
        className="relative overflow-hidden rounded-xl border border-line bg-card-raised"
        style={{ height: fieldHeight }}>
        <TextInput
          placeholderTextColor={colors.muted}
          secureTextEntry={hide}
          autoComplete={
            autoComplete ?? (isPassword ? 'password' : undefined)
          }
          textContentType={
            textContentType ?? (isPassword ? 'password' : undefined)
          }
          className={`font-sans text-ink ${compact ? 'text-body' : 'text-body-lg'}`}
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
              paddingLeft: 14,
              paddingRight: isPassword ? 48 : 14,
              // iOS Safari: 16px+ avoids focus zoom that collapses fixed shells.
              fontSize: 16,
            },
            Platform.OS === 'web' ? ({ cursor: 'text' } as TextStyle) : null,
            style,
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          {...rest}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            // Keep focus in the password field when tapping the eye (web).
            {...(Platform.OS === 'web'
              ? {
                  // RN-web forwards this to the DOM node.
                  onMouseDown: (e: { preventDefault: () => void }) => e.preventDefault(),
                }
              : null)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            className="absolute right-0 top-0 z-10 items-center justify-center"
            style={{ width: 48, height: fieldHeight }}>
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
