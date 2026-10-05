import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ListItem as ListItemType } from '@/services/ListItemService';

type ListItemProps = {
    listItem: ListItemType;
    isUpdating: boolean;
    isDeleting: boolean;
    onToggle: () => void | Promise<void>;
    onEdit: () => void;
    onDelete: () => void | Promise<void>;
};

export function ListItem({
    listItem,
    isUpdating,
    isDeleting,
    onToggle,
    onEdit,
    onDelete,
}: ListItemProps) {
    const isDisabled = isUpdating || isDeleting;

    return (
        <View
            style={[
                styles.container,
                listItem.is_completed && styles.completedContainer,
            ]}
        >
            <Pressable
                style={[styles.content, isDisabled && styles.disabled]}
                onPress={onToggle}
                disabled={isDisabled}
            >
                <Ionicons
                    name={
                        listItem.is_completed
                            ? 'checkmark-circle'
                            : 'ellipse-outline'
                    }
                    size={24}
                    color={listItem.is_completed ? '#8A8A8A' : '#208AEF'}
                />

                <Text
                    style={[
                        styles.name,
                        listItem.is_completed && styles.completedName,
                    ]}
                >
                    {listItem.name}
                </Text>
            </Pressable>

            <View style={styles.actions}>
                <Pressable
                    style={styles.actionButton}
                    onPress={onEdit}
                    disabled={isDisabled}
                    hitSlop={8}
                >
                    <Ionicons name="pencil-outline" size={19} color="#666666" />
                </Pressable>

                <Pressable
                    style={styles.actionButton}
                    onPress={onDelete}
                    disabled={isDeleting}
                    hitSlop={8}
                >
                    <Ionicons name="trash-outline" size={19} color="#D32F2F" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E8E8E8',
    },

    completedContainer: {
        opacity: 0.65,
    },

    content: {
        flex: 1,
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    name: {
        flex: 1,
        fontSize: 17,
        color: '#111111',
    },

    completedName: {
        color: '#777777',
        textDecorationLine: 'line-through',
    },

    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    actionButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    disabled: {
        opacity: 0.5,
    },
});
