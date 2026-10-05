import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    type View as ViewType,
} from 'react-native';

import type { List } from '@/types/List';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

export type MenuAnchor = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type ListHeaderProps = {
    list: List;
    onMenuPress: (anchor: MenuAnchor) => void;
};

export function ListHeader({ list, onMenuPress }: ListHeaderProps) {
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
                    onPress={() => router.back()}
                    hitSlop={12}
                >
                    <Ionicons name="chevron-back" size={26} color="#111111" />
                </Pressable>

                <Pressable
                    ref={menuButtonRef}
                    style={styles.iconButton}
                    onPress={handleMenuPress}
                    hitSlop={12}
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={24}
                        color="#111111"
                    />
                </Pressable>
            </View>

            <View style={styles.listInfo}>
                <View style={styles.titleRow}>
                    <Text style={styles.listName}>{list.name}</Text>

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
        gap: 16,
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
        gap: 6,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: 6,
    },

    listName: {
        fontSize: 30,
        fontWeight: '700',
        color: '#111111',
    },

    updatedAt: {
        fontSize: 12,
        fontWeight: '400',
        color: '#999999',
    },

    description: {
        fontSize: 16,
        lineHeight: 22,
        color: '#555555',
    },
});
