import { StyleSheet, Text, View } from 'react-native';

import { Illustration } from '@/components/ui/Illustration';
import { semanticColors } from '@/theme/semantic';
import { radii, spacing, typography } from '@/theme/tokens';
import type { IllustrationKey } from '@/theme/illustrations';
import type { ListSummary } from '@/types/List';

type ShoppingProgressProps = {
    lists: ListSummary[];
};

function formatCount(count: number, singular: string, plural: string) {
    return `${count} ${count === 1 ? singular : plural}`;
}

function getProgressIllustration(progress: number): IllustrationKey {
    if (progress === 100) {
        return 'basket-complete';
    }

    if (progress >= 50) {
        return 'basket-filled';
    }

    if (progress > 0) {
        return 'basket-partial';
    }

    return 'basket-empty';
}

export function ShoppingProgress({ lists }: ShoppingProgressProps) {
    const eligibleLists = lists.filter((list) => list.item_count > 0);
    const emptyLists = lists.length - eligibleLists.length;
    const hasEligibleLists = eligibleLists.length > 0;

    const completedLists = eligibleLists.filter(
        (list) => list.completed_item_count === list.item_count
    ).length;
    const isComplete =
        hasEligibleLists && completedLists === eligibleLists.length;
    const progress = hasEligibleLists
        ? isComplete
            ? 100
            : Math.min(
                  99,
                  Math.round((completedLists / eligibleLists.length) * 100)
              )
        : 0;
    const eligibleSummary = formatCount(eligibleLists.length, 'list', 'lists');
    const remainingSummary = formatCount(
        eligibleLists.length - completedLists,
        'list',
        'lists'
    );
    const emptySummary = formatCount(emptyLists, 'empty list', 'empty lists');

    return (
        <View
            accessibilityLabel={
                hasEligibleLists
                    ? `Shopping progress: ${completedLists} of ${eligibleSummary} completed`
                    : `Shopping progress: ${emptySummary}`
            }
            style={[styles.container, isComplete && styles.completeContainer]}
        >
            <View style={styles.content}>
                <View style={styles.copy}>
                    <Text style={styles.eyebrow}>Shopping progress</Text>
                    <Text style={styles.title}>
                        {!hasEligibleLists
                            ? 'No items yet'
                            : isComplete
                              ? 'All done!'
                              : `${completedLists} of ${eligibleSummary} done`}
                    </Text>
                    <Text style={styles.description}>
                        {!hasEligibleLists
                            ? emptySummary
                            : isComplete
                              ? 'Nothing left to buy.'
                              : `${remainingSummary} to go`}
                        {hasEligibleLists && emptyLists > 0
                            ? ` · ${emptySummary}`
                            : ''}
                    </Text>
                </View>
                <Illustration
                    accessibilityLabel="Shopping progress illustration"
                    illustrationKey={getProgressIllustration(progress)}
                    style={styles.illustration}
                />
            </View>
            {hasEligibleLists && (
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
                    <Text style={styles.percentage}>{progress}%</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: radii.sheet,
        backgroundColor: semanticColors.control.secondary,
        marginBottom: spacing.lg,
        padding: spacing.lg,
    },
    completeContainer: {
        backgroundColor: semanticColors.feedback.successSurface,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    copy: {
        flex: 1,
    },
    eyebrow: {
        ...typography.caption,
        color: semanticColors.control.secondaryText,
        fontWeight: '600',
    },
    title: {
        ...typography.sheetTitle,
        color: semanticColors.control.secondaryText,
        marginTop: spacing.xxs,
    },
    description: {
        ...typography.supporting,
        color: semanticColors.control.secondaryText,
        marginTop: spacing.xxs,
    },
    illustration: {
        width: 92,
        height: 92,
        marginLeft: spacing.sm,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    track: {
        flex: 1,
        height: 6,
        overflow: 'hidden',
        borderRadius: 999,
        backgroundColor: semanticColors.screen.surface,
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
    },
});
