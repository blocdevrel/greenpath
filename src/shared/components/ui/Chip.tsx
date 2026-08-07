import { Pressable, type PressableProps, ScrollView, Text, View } from 'react-native';

type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  className?: string;
};

export const Chip = ({ label, selected = false, className, ...rest }: ChipProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected }}
    className={`h-11 justify-center rounded-full px-4 active:opacity-80 ${selected ? 'bg-primary' : 'border border-line bg-card-raised'} ${className ?? ''}`}
    {...rest}>
    <Text className={`font-sans-medium text-label ${selected ? 'text-white' : 'text-ink'}`}>
      {label}
    </Text>
  </Pressable>
);

/** Horizontally scrolling filter row; the last chip peeks off the edge. */
export const ChipRow = ({ children }: { children: React.ReactNode }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingRight: 20 }}>
    <View className="flex-row gap-2">{children}</View>
  </ScrollView>
);
