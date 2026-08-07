import { View } from 'react-native';

import { Card, Caption, Label, Stat } from '@/shared/components/ui';

import { profileStats } from '../data/profileData';

export function ProfileStats() {
  return (
    <View className="flex-row gap-3">
      {profileStats.map((stat, index) => (
        <Card
          key={stat.id}
          tone={index === 0 ? 'dark' : index === 1 ? 'primary' : 'light'}
          className="flex-1 items-start gap-1 p-4">
          <Caption>{stat.label}</Caption>
          {index < 2 ? (
            <Stat>{stat.value}</Stat>
          ) : (
            <Label className="font-sans-extrabold text-stat">{stat.value}</Label>
          )}
        </Card>
      ))}
    </View>
  );
}
