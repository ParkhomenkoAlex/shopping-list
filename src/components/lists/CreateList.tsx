import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { semanticColors } from '@/theme/semantic';
import { elevation, spacing } from '@/theme/tokens';

type CreateListProps = {
    isCreating: boolean;
    onPress: () => void;
    variant?: 'circle' | 'inline';
};

export function CreateList({
    isCreating,
    onPress,
    variant = 'circle',
}: CreateListProps) {
    return (
        <Pressable
            accessibilityLabel="Create a list"
            accessibilityRole="button"
            accessibilityState={{ disabled: isCreating, busy: isCreating }}
            disabled={isCreating}
            onPress={onPress}
            style={
                variant === 'circle' ? styles.addButton : styles.inlineButton
            }
        >
            <Ionicons
                color={semanticColors.content.onPrimary}
                name="add"
                size={variant === 'circle' ? 28 : 20}
            />
            {variant === 'inline' && (
                <Text style={styles.inlineButtonText}>Create a list</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: semanticColors.control.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...elevation.floating,
        elevation: 2,
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    inlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: semanticColors.control.primary,
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    inlineButtonText: {
        color: semanticColors.content.onPrimary,
        fontWeight: '700',
    },
});
