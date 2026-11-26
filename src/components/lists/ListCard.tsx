import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Illustration } from '@/components/ui/Illustration';
import { semanticColors } from '@/theme/semantic';
import { elevation, radii, spacing, typography } from '@/theme/tokens';
import type { List } from '@/types/List';

type ListCardProps = {
    list: List;
    onPress: () => void;
};

export function ListCard({ list, onPress }: ListCardProps) {
    return (
        <Pressable
            accessibilityLabel={`Open ${list.name}`}
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
        >
            <Illustration
                accessibilityLabel="List illustration"
                style={styles.image}
            />
            <Text numberOfLines={2} style={styles.name}>
                {list.name}
            </Text>
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
        minHeight: 88,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderRadius: radii.card,
        backgroundColor: semanticColors.screen.surface,
        marginBottom: spacing.sm,
        padding: spacing.md,
        ...elevation.card,
    },
    pressed: {
        opacity: 0.86,
    },
    image: {
        width: 56,
        height: 56,
    },

    name: {
        ...typography.body,
        color: semanticColors.content.primary,
        flex: 1,
        fontWeight: '600',
    },
    chevron: {
        width: 24,
        alignItems: 'flex-end',
    },
});
