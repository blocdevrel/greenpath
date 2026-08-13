import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';

import { Body, Caption, Label } from '@/shared/components/ui';
import {
  buildReferralShare,
  inviteLinkForCode,
  shareAchievement,
} from '@/shared/share/shareAchievement';
import { colors } from '@/shared/theme/tokens';

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  return shareAchievement({ title: 'GreenPath invite link', message: text, url: text });
}

export function InviteFriendsCard({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const inviteLink = useMemo(
    () => (referralCode ? inviteLinkForCode(referralCode) : ''),
    [referralCode],
  );

  if (!referralCode || !inviteLink) {
    return (
      <View className="rounded-2xl border border-line bg-card-raised px-3.5 py-3.5">
        <Caption>Invite link</Caption>
        <Body>Sign in fully to get your personal invite link.</Body>
      </View>
    );
  }

  const onCopy = async () => {
    const ok = await copyToClipboard(inviteLink);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onShare = async () => {
    setSharing(true);
    try {
      await shareAchievement(buildReferralShare(referralCode));
    } finally {
      setSharing(false);
    }
  };

  const onOpenLink = () => {
    void Linking.openURL(inviteLink);
  };

  return (
    <View className="gap-3 rounded-2xl border border-line bg-card-raised px-3.5 py-3.5">
      <View className="gap-0.5">
        <Caption>Your invite link</Caption>
        <Pressable onPress={onOpenLink} accessibilityRole="link" accessibilityLabel="Open invite link">
          <Text
            className="font-sans-semibold text-body text-primary"
            numberOfLines={2}
            selectable>
            {inviteLink}
          </Text>
        </Pressable>
        {copied ? <Caption className="text-primary">Link copied</Caption> : null}
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => void onCopy()}
          accessibilityLabel="Copy invite link"
          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-line bg-canvas px-3">
          <Ionicons
            name={copied ? 'checkmark' : 'link-outline'}
            size={18}
            color={copied ? colors.primary.DEFAULT : colors.ink.DEFAULT}
          />
          <Label className="font-sans-semibold">{copied ? 'Copied' : 'Copy link'}</Label>
        </Pressable>

        <Pressable
          onPress={() => void onShare()}
          disabled={sharing}
          accessibilityLabel="Share invite link"
          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-primary px-3">
          <Ionicons name="share-social" size={18} color="#fff" />
          <Label className="font-sans-semibold text-white">
            {sharing ? 'Sharing…' : 'Share'}
          </Label>
        </Pressable>
      </View>
    </View>
  );
}
