import { Text, View } from 'react-native';

/** Neutral metadata pill: distance, overdue count, sync state. */
export const Badge = ({ label, className }: { label: string; className?: string }) => (
  <View className={`h-7 justify-center bg-canvas-sunken px-3 ${className ?? ''}`} style={{ borderRadius: 8 }}>
    <Text className="font-sans-medium text-caption text-subtle">{label}</Text>
  </View>
);
