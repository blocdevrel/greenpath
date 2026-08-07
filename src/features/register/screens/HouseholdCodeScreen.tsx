import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Label, Subheading } from '@/shared/components/ui';
import { colors } from '@/shared/theme/tokens';

import { workerProfile } from '@/features/profile/data/profileData';

import { nextHhNumber, zonePrefixes } from '../data/hhCodeData';

/**
 * Simple bottom sheet: name → generate HH code for USSD/SMS.
 */
export function HouseholdCodeSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const zone =
    zonePrefixes.find((item) =>
      workerProfile.zone.toLowerCase().includes(item.label.toLowerCase()),
    ) ?? zonePrefixes[0];

  const [name, setName] = useState('');
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slide, {
          toValue: 1,
          useNativeDriver: true,
          damping: 22,
          stiffness: 220,
        }),
      ]).start();
      return;
    }
    fade.setValue(0);
    slide.setValue(0);
    setName('');
    setCode(null);
  }, [visible, fade, slide]);

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [360, 0],
  });

  const handleClose = () => {
    setName('');
    setCode(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={{ opacity: fade }} className="absolute inset-0 bg-ink/40">
          <Pressable className="flex-1" onPress={handleClose} accessibilityLabel="Dismiss" />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY }],
            paddingBottom: Math.max(insets.bottom, 20),
          }}
          className="rounded-t-2xl bg-canvas px-5 pt-3">
          <View className="mb-3 items-center">
            <View className="h-1.5 w-12 rounded-full bg-canvas-sunken" />
          </View>

          <View className="mb-5 flex-row items-center justify-between">
            <Subheading>HH code</Subheading>
            <Pressable
              onPress={handleClose}
              accessibilityLabel="Close"
              className="h-10 w-10 items-center justify-center rounded-full border border-line bg-card-raised">
              <Ionicons name="close" size={18} color={colors.ink.DEFAULT} />
            </Pressable>
          </View>

          {!code ? (
            <View className="gap-4">
              <Label tone="subtle">
                {zone.label} · for USSD / SMS
              </Label>

              <View className="h-14 justify-center rounded-md border border-line bg-card-raised px-4">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Household name"
                  placeholderTextColor={colors.muted}
                  autoFocus
                  className="font-sans text-body-lg text-ink"
                />
              </View>

              <Button
                label="Generate"
                size="lg"
                disabled={name.trim().length < 2}
                onPress={() => setCode(nextHhNumber(zone.prefix))}
              />
            </View>
          ) : (
            <View className="gap-4">
              <View className="items-center gap-2 rounded-xl bg-ink-800 px-5 py-8">
                <Text className="font-sans-extrabold text-display-xl text-white tracking-wide">
                  {code}
                </Text>
                <Text className="font-sans text-body text-white/70" numberOfLines={1}>
                  {name.trim()}
                </Text>
              </View>

              <Label tone="subtle" className="text-center">
                Volunteer enters this on *123#
              </Label>

              <Button label="Done" size="lg" onPress={handleClose} />
              <Pressable
                onPress={() => setCode(null)}
                className="h-11 items-center justify-center">
                <Label tone="primary">New code</Label>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
