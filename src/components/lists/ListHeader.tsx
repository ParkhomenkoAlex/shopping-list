import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { List } from '@/types/List';

type ListHeaderProps = {
    list: List;
    isUpdating: boolean;
    isDeleting: boolean;
    deleteError: Error | null;
    onEdit: () => void;
    onDelete: () => void;
};

export function ListHeader({
    list,
    isUpdating,
    isDeleting,
    deleteError,
    onEdit,
    onDelete,
}: ListHeaderProps) {
    return (
        <View style={styles.listInfo}>
            <View style={styles.listHeader}>
                <View style={styles.listText}>
                    <Text style={styles.listName}>{list.name}</Text>

                    {list.description && (
                        <Text style={styles.listDescription}>
                            {list.description}
                        </Text>
                    )}
                </View>

                <View style={styles.listActions}>
                    <Pressable
                        style={[
                            styles.editListButton,
                            (isUpdating || isDeleting) && styles.disabledButton,
                        ]}
                        onPress={onEdit}
                        disabled={isUpdating || isDeleting}
                    >
                        <Text style={styles.editListButtonText}>Edit</Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.deleteListButton,
                            isDeleting && styles.disabledButton,
                        ]}
                        onPress={onDelete}
                        disabled={isDeleting}
                    >
                        <Text style={styles.deleteListButtonText}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Text>
                    </Pressable>
                </View>
            </View>

            {deleteError && (
                <Text style={styles.error}>{deleteError.message}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    listInfo: {
        gap: 8,
    },

    listHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
    },

    listText: {
        flex: 1,
        gap: 8,
    },

    listName: {
        fontSize: 22,
    },

    listDescription: {
        fontSize: 16,
        color: '#666666',
    },

    listActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    editListButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#666666',
    },

    editListButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    deleteListButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#D32F2F',
    },

    deleteListButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    disabledButton: {
        opacity: 0.5,
    },

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },
});
