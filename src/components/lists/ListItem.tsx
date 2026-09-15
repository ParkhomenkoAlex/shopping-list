import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ListItem as ListItemType } from '@/services/ListItemsService';

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
    return (
        <View style={styles.container}>
            <Pressable
                style={[
                    styles.content,
                    (isUpdating || isDeleting) && styles.disabled,
                ]}
                onPress={onToggle}
                disabled={isUpdating || isDeleting}
            >
                <Text style={styles.checkbox}>
                    {listItem.is_completed ? '☑' : '☐'}
                </Text>

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
                    style={styles.editButton}
                    onPress={onEdit}
                    disabled={isUpdating || isDeleting}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                    style={styles.deleteButton}
                    onPress={onDelete}
                    disabled={isDeleting}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },

    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
    },

    disabled: {
        opacity: 0.5,
    },

    checkbox: {
        fontSize: 24,
    },

    name: {
        fontSize: 18,
    },

    completedName: {
        textDecorationLine: 'line-through',
        color: '#888888',
    },

    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#666666',
    },

    editButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#D32F2F',
    },

    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
