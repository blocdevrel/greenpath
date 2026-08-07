import Ionicons from '@expo/vector-icons/Ionicons';
import { TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/shared/theme/tokens';

type SearchFieldProps = Omit<TextInputProps, 'style'> & {
  className?: string;
};

/** Compact search input used above list/table surfaces. */
export function SearchField({ className, placeholder = 'Search', ...rest }: SearchFieldProps) {
  return (
    <View
      className={`h-12 flex-row items-center gap-2 rounded-md border border-line bg-card-raised px-3 ${className ?? ''}`}>
      <Ionicons name="search-outline" size={18} color={colors.muted} />
      <TextInput
        accessibilityRole="search"
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        className="min-w-0 flex-1 font-sans text-body text-ink"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        {...rest}
      />
    </View>
  );
}
