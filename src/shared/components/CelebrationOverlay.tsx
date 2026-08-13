import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Body, Button, Caption, Label } from '@/shared/components/ui';
import {
  buildCelebrationShare,
  shareAchievement,
} from '@/shared/share/shareAchievement';
import { colors } from '@/shared/theme/tokens';

/** Lightweight confetti-style celebration overlay for XP / badge moments. */
export function CelebrationOverlay({
  title,
  subtitle,
  xp,
  onDone,
}: {
  title: string;
  subtitle: string;
  xp: number;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const [sharing, setSharing] = useState(false);
  const dots = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${6 + ((i * 17) % 88)}%`,
        delay: (i % 6) * 40,
        color: [colors.primary.DEFAULT, colors.lime.DEFAULT, colors.gold.DEFAULT, colors.accent.DEFAULT][
          i % 4
        ],
        size: 8 + (i % 4) * 3,
      })),
    [],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 8000);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    onDone();
  };

  return (
    <View className="absolute inset-0 z-[100] items-center justify-center bg-ink/55 px-8">
      {dots.map((d) => (
        <View
          key={d.id}
          style={{
            position: 'absolute',
            top: 80 + (d.id % 7) * 28,
            left: d.left as `${number}%`,
            width: d.size,
            height: d.size,
            borderRadius: 99,
            backgroundColor: d.color,
            opacity: 0.9,
          }}
        />
      ))}
      <View className="w-full max-w-sm items-center gap-3 rounded-3xl bg-card-raised px-6 py-8">
        <Pressable
          onPress={dismiss}
          accessibilityLabel="Close"
          hitSlop={8}
          className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-canvas-sunken">
          <Text className="font-sans-bold text-body text-ink">✕</Text>
        </Pressable>
        <Text className="text-4xl">🎉</Text>
        <Label className="text-center font-sans-extrabold text-heading">{title}</Label>
        <Body className="text-center">{subtitle}</Body>
        <View className="rounded-full bg-gold-soft px-4 py-2">
          <Caption className="font-sans-bold text-ink">+{xp} XP</Caption>
        </View>
        <Button
          label={sharing ? 'Opening share…' : 'Share on social'}
          variant="soft"
          size="md"
          disabled={sharing}
          onPress={() => {
            setSharing(true);
            void shareAchievement(buildCelebrationShare(title, xp)).finally(() =>
              setSharing(false),
            );
          }}
        />
        <Button label="Continue" size="md" onPress={dismiss} />
      </View>
    </View>
  );
}
