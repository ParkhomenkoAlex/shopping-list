import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Illustration } from '@/components/ui/Illustration';
import { getListAppearance } from '@/theme/listAppearance';
import { semanticColors } from '@/theme/semantic';
import { elevation, radii, spacing, typography } from '@/theme/tokens';
import type { ListSummary } from '@/types/List';

type ListCardProps = {
    list: ListSummary;
    onPress: () => void;
};

function formatCount(count: number, singular: string, plural: string) {
    return `${count} ${count === 1 ? singular : plural}`;
}

export function ListCard({ list, onPress }: ListCardProps) {
    const appearance = getListAppearance(list.icon_key, list.color_key);
    const hasItems = list.item_count > 0;
    const isComplete =
        hasItems && list.completed_item_count === list.item_count;
    const progress = hasItems
        ? isComplete
            ? 100
            : Math.min(
                  99,
                  Math.round(
                      (list.completed_item_count / list.item_count) * 100
                  )
              )
        : null;
    const isShared = list.membership_role === 'member';
    const itemSummary = hasItems
        ? `${formatCount(list.item_count, 'item', 'items')} · ${formatCount(
              list.completed_item_count,
              'completed item',
              'completed items'
          )}`
        : 'No items yet';

    return (
        <Pressable
            accessibilityLabel={`Open ${list.name}. ${itemSummary}${isShared ? '. Shared with you' : ''}`}
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
        >
            <View
                style={[
                    styles.illustrationTile,
                    { backgroundColor: appearance.color.background },
                ]}
            >
                <Illustration
                    accessibilityLabel="List illustration"
                    listIconKey={appearance.iconKey}
                    style={styles.image}
                />
            </View>
            <View style={styles.copy}>
                <View style={styles.titleRow}>
                    <Text numberOfLines={2} style={styles.name}>
                        {list.name}
                    </Text>
                    {isShared && (
                        <Ionicons
                            accessibilityLabel="Shared with you"
                            color={semanticColors.content.muted}
                            name="people"
                            size={15}
                            style={styles.sharedIndicator}
                        />
                    )}
                </View>
                <Text style={styles.summary}>{itemSummary}</Text>
                {progress !== null && (
                    <View style={styles.progressRow}>
                        <View style={styles.track}>
                            <View
                                style={[
                                    styles.fill,
                                    isComplete && styles.completeFill,
                                    { width: `${progress}%` },
                                ]}
                            />
                        </View>
                        <Text
                            style={[
                                styles.percentage,
                                isComplete && styles.completePercentage,
                            ]}
                        >
                            {progress}%
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.chevron}>
                <Ionicons
                    color={semanticColors.content.muted}
                    name="chevron-forward"
                    size={20}
                />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 96,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderRadius: radii.card,
        backgroundColor: semanticColors.screen.surface,
        marginBottom: spacing.sm,
        padding: spacing.md,
        ...elevation.card,
        elevation: 0,
        shadowOpacity: 0.04,
        shadowRadius: 3,
    },
    pressed: {
        opacity: 0.86,
    },
    image: {
        width: 52,
        height: 52,
    },
    illustrationTile: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.control,
    },

    name: {
        ...typography.body,
        color: semanticColors.content.primary,
        flexShrink: 1,
        fontWeight: '600',
    },
    copy: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sharedIndicator: {
        marginLeft: spacing.xs,
    },
    summary: {
        ...typography.caption,
        color: semanticColors.content.secondary,
        marginTop: spacing.xxs,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    track: {
        flex: 1,
        height: 5,
        overflow: 'hidden',
        borderRadius: 999,
        backgroundColor: semanticColors.border.subtle,
    },
    fill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: semanticColors.control.primary,
    },
    completeFill: {
        backgroundColor: semanticColors.feedback.success,
    },
    percentage: {
        ...typography.caption,
        color: semanticColors.control.secondaryText,
        fontWeight: '700',
        minWidth: 34,
        textAlign: 'right',
    },
    completePercentage: {
        color: semanticColors.feedback.success,
    },
    chevron: {
        width: 24,
        alignItems: 'flex-end',
    },
});
