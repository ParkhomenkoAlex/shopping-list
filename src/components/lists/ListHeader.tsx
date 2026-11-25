import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    type View as ViewType,
} from 'react-native';

import type { List } from '@/types/List';
import { iconSizes, spacing, typography } from '@/theme/tokens';
import { semanticColors } from '@/theme/semantic';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

export type MenuAnchor = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type ListHeaderProps = {
    list: List;
    onBack: () => void;
    onMenuPress: (anchor: MenuAnchor) => void;
};

export function ListHeader({ list, onBack, onMenuPress }: ListHeaderProps) {
    const menuButtonRef = useRef<ViewType>(null);

    const handleMenuPress = () => {
        menuButtonRef.current?.measureInWindow((x, y, width, height) => {
            onMenuPress({
                x,
                y,
                width,
                height,
            });
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.navigation}>
                <Pressable
                    style={styles.iconButton}
                    onPress={onBack}
                    hitSlop={12}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <Ionicons
                        name="chevron-back"
                        size={iconSizes.list}
                        color={semanticColors.content.primary}
                    />
                </Pressable>

                <Pressable
                    ref={menuButtonRef}
                    style={styles.iconButton}
                    onPress={handleMenuPress}
                    hitSlop={12}
                    accessibilityLabel="List actions"
                    accessibilityRole="button"
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={iconSizes.list}
                        color={semanticColors.content.primary}
                    />
                </Pressable>
            </View>

            <View style={styles.listInfo}>
                <View style={styles.titleRow}>
                    <Text accessibilityRole="header" style={styles.listName}>
                        {list.name}
                    </Text>

                    <Text style={styles.updatedAt}>
                        ({formatRelativeTime(list.updated_at)})
                    </Text>
                </View>

                {list.description && (
                    <Text style={styles.description}>{list.description}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },

    navigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    iconButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    listInfo: {
        gap: spacing.xs,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },

    listName: {
        ...typography.screenTitle,
        color: semanticColors.content.primary,
    },

    updatedAt: {
        ...typography.caption,
        color: semanticColors.content.muted,
    },

    description: {
        ...typography.body,
        color: semanticColors.content.secondary,
    },
});
