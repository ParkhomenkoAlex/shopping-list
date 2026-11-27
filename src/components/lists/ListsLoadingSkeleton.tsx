import { StyleSheet, View } from 'react-native';

import { semanticColors } from '@/theme/semantic';
import { radii, spacing } from '@/theme/tokens';

export function ListsLoadingSkeleton() {
    return (
        <View
            accessibilityLabel="Loading lists"
            accessibilityRole="progressbar"
        >
            <View style={styles.banner} />
            {[0, 1, 2].map((index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.tile} />
                    <View style={styles.copy}>
                        <View style={styles.title} />
                        <View style={styles.supporting} />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        height: 154,
        borderRadius: radii.sheet,
        backgroundColor: semanticColors.border.subtle,
        marginBottom: spacing.lg,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderRadius: radii.card,
        backgroundColor: semanticColors.screen.surface,
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    tile: {
        width: 56,
        height: 56,
        borderRadius: radii.control,
        backgroundColor: semanticColors.border.subtle,
    },
    copy: {
        flex: 1,
        gap: spacing.xs,
    },
    title: {
        width: '70%',
        height: 16,
        borderRadius: 8,
        backgroundColor: semanticColors.border.subtle,
    },
    supporting: {
        width: '48%',
        height: 12,
        borderRadius: 6,
        backgroundColor: semanticColors.border.subtle,
    },
});
