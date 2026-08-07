import { TextInput, View, type TextInputProps } from 'react-native';

import { Label } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

type AuthFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
};

/** Large form field for sign-in / sign-up (48dp+ target). */
export function AuthField({ label, secureTextEntry, ...rest }: AuthFieldProps) {
  return (
    <View className="gap-2">
      <Label>{label}</Label>
      <View className="h-14 justify-center rounded-xl border border-line bg-card-raised px-4">
        <TextInput
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          className="h-full w-full font-sans text-body-lg text-ink"
          {...rest}
        />
      </View>
    </View>
  );
}
