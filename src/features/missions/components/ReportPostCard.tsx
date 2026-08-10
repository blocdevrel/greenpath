import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, Text, View } from 'react-native';

import { Caption } from '@/shared/components/ui';
import type { CommunityReport } from '@/shared/data/greenpathData';
import type { ReportVote } from '@/shared/state/GreenPathContext';
import { colors } from '@/shared/theme/tokens';

const kindLabel: Record<CommunityReport['kind'], string> = {
  trash: 'Trash',
  'blocked-drain': 'Blocked drain',
  dumping: 'Dumping',
};

export function ReportPostCard({
  report,
  vote,
  onVote,
}: {
  report: CommunityReport;
  vote?: ReportVote;
  onVote: (vote: ReportVote) => void;
}) {
  const author = report.you ? 'You' : report.author;
  const upvoted = vote === 'up';
  const downvoted = vote === 'down';

  return (
    <View className="gap-2.5 bg-canvas">
      <View className="flex-row items-center gap-3 px-1">
        <View className="h-9 w-9 overflow-hidden rounded-full bg-primary-50">
          <Image
            source={report.authorAvatar}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-sans-bold text-body text-ink" numberOfLines={1}>
            {author}
          </Text>
          <Caption numberOfLines={1}>
            {report.location} · {report.timeAgo}
          </Caption>
        </View>
        <Caption className="font-sans-semibold text-primary">{kindLabel[report.kind]}</Caption>
      </View>

      <View className="w-full overflow-hidden bg-canvas-sunken" style={{ aspectRatio: 1 }}>
        <Image
          source={report.photo}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>

      <View className="flex-row items-center gap-5 px-1">
        <Pressable
          onPress={() => onVote('up')}
          accessibilityRole="button"
          accessibilityLabel={upvoted ? 'Remove upvote' : 'Upvote to confirm'}
          hitSlop={6}
          className="flex-row items-center gap-1.5">
          <Ionicons
            name={upvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
            size={28}
            color={upvoted ? colors.primary.DEFAULT : colors.ink.DEFAULT}
          />
          <Text
            className={`font-sans-bold text-body ${upvoted ? 'text-primary' : 'text-ink'}`}>
            {report.upvotes}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onVote('down')}
          accessibilityRole="button"
          accessibilityLabel={downvoted ? 'Remove downvote' : 'Downvote this report'}
          hitSlop={6}
          className="flex-row items-center gap-1.5">
          <Ionicons
            name={downvoted ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
            size={28}
            color={downvoted ? colors.danger.DEFAULT : colors.ink.DEFAULT}
          />
          <Text
            className="font-sans-bold text-body"
            style={{ color: downvoted ? colors.danger.DEFAULT : colors.ink.DEFAULT }}>
            {report.downvotes}
          </Text>
        </Pressable>

        <Pressable hitSlop={6} accessibilityLabel="Share" className="ml-auto">
          <Ionicons name="paper-plane-outline" size={24} color={colors.ink.DEFAULT} />
        </Pressable>
      </View>

      <View className="gap-1 px-1">
        <Text className="font-sans-semibold text-body text-ink">
          {upvoted
            ? 'You confirmed this report'
            : downvoted
              ? 'You disputed this report'
              : 'Upvote to confirm · Downvote if wrong'}
        </Text>
        <Text className="font-sans text-body text-ink">
          <Text className="font-sans-bold">{author} </Text>
          {report.caption}
        </Text>
        {report.distance ? (
          <Caption>
            {report.distance} away · {kindLabel[report.kind]}
          </Caption>
        ) : null}
      </View>
    </View>
  );
}
