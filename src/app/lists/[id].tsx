import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useList } from '@/hooks/useList';
import { useListItems } from '@/hooks/useListItems';

export default function ListDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { list, isLoading: isListLoading, error: listError } = useList(id);

    const {
        items,
        isLoading: isItemsLoading,
        error: itemsError,
        createListItem,
        isCreating,
        createError,
        updateListItem,
        isUpdating,
        updateError,
        deleteListItem,
        isDeleting,
        deleteError,
    } = useListItems(id);

    const [newItemName, setNewItemName] = useState('');

    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingItemName, setEditingItemName] = useState('');

    const isLoading = isListLoading || isItemsLoading;
    const error = listError || itemsError;

    const handleCreateItem = async () => {
        const name = newItemName.trim();

        if (!name) {
            return;
        }

        try {
            await createListItem(name);
            setNewItemName('');
        } catch (error) {
            console.error('Failed to create list item:', error);
        }
    };

    const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
        try {
            await updateListItem({
                id: itemId,
                updates: {
                    is_completed: !isCompleted,
                },
            });
        } catch (error) {
            console.error('Failed to update list item:', error);
        }
    };

    const handleStartEditing = (itemId: string, itemName: string) => {
        setEditingItemId(itemId);
        setEditingItemName(itemName);
    };

    const handleCancelEditing = () => {
        setEditingItemId(null);
        setEditingItemName('');
    };

    const handleSaveEditing = async () => {
        if (!editingItemId) {
            return;
        }

        const name = editingItemName.trim();

        if (!name) {
            return;
        }

        try {
            await updateListItem({
                id: editingItemId,
                updates: {
                    name,
                },
            });

            setEditingItemId(null);
            setEditingItemName('');
        } catch (error) {
            console.error('Failed to update list item:', error);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        try {
            await deleteListItem(itemId);
        } catch (error) {
            console.error('Failed to delete list item:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>List Details</Text>

            {isLoading && <ActivityIndicator />}

            {error && <Text style={styles.error}>{error.message}</Text>}

            {list && <Text style={styles.listName}>{list.name}</Text>}

            {!isLoading && !error && (
                <View style={styles.content}>
                    <View style={styles.createItem}>
                        <TextInput
                            style={styles.input}
                            value={newItemName}
                            onChangeText={setNewItemName}
                            placeholder="Item name"
                            editable={!isCreating}
                        />

                        <Pressable
                            style={[
                                styles.addButton,
                                isCreating && styles.disabledButton,
                            ]}
                            onPress={handleCreateItem}
                            disabled={isCreating}
                        >
                            <Text style={styles.addButtonText}>
                                {isCreating ? 'Adding...' : 'Add'}
                            </Text>
                        </Pressable>

                        {createError && (
                            <Text style={styles.error}>
                                {createError.message}
                            </Text>
                        )}
                    </View>

                    {updateError && (
                        <Text style={styles.error}>{updateError.message}</Text>
                    )}

                    {deleteError && (
                        <Text style={styles.error}>{deleteError.message}</Text>
                    )}

                    <View style={styles.items}>
                        {items.map((item) => {
                            const isEditing = editingItemId === item.id;

                            if (isEditing) {
                                return (
                                    <View
                                        key={item.id}
                                        style={styles.editingItem}
                                    >
                                        <TextInput
                                            style={styles.editInput}
                                            value={editingItemName}
                                            onChangeText={setEditingItemName}
                                            autoFocus
                                            editable={!isUpdating}
                                        />

                                        <View style={styles.editButtons}>
                                            <Pressable
                                                style={styles.cancelButton}
                                                onPress={handleCancelEditing}
                                                disabled={isUpdating}
                                            >
                                                <Text
                                                    style={
                                                        styles.cancelButtonText
                                                    }
                                                >
                                                    Cancel
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={[
                                                    styles.saveButton,
                                                    isUpdating &&
                                                        styles.disabledButton,
                                                ]}
                                                onPress={handleSaveEditing}
                                                disabled={isUpdating}
                                            >
                                                <Text
                                                    style={
                                                        styles.saveButtonText
                                                    }
                                                >
                                                    {isUpdating
                                                        ? 'Saving...'
                                                        : 'Save'}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                );
                            }

                            return (
                                <View key={item.id} style={styles.item}>
                                    <Pressable
                                        style={[
                                            styles.itemContent,
                                            (isUpdating || isDeleting) &&
                                                styles.disabledItem,
                                        ]}
                                        onPress={() =>
                                            handleToggleItem(
                                                item.id,
                                                item.is_completed
                                            )
                                        }
                                        disabled={isUpdating || isDeleting}
                                    >
                                        <Text style={styles.checkbox}>
                                            {item.is_completed ? '☑' : '☐'}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.itemName,
                                                item.is_completed &&
                                                    styles.completedItemName,
                                            ]}
                                        >
                                            {item.name}
                                        </Text>
                                    </Pressable>

                                    <View style={styles.itemActions}>
                                        <Pressable
                                            style={styles.editButton}
                                            onPress={() =>
                                                handleStartEditing(
                                                    item.id,
                                                    item.name
                                                )
                                            }
                                            disabled={isUpdating || isDeleting}
                                        >
                                            <Text style={styles.editButtonText}>
                                                Edit
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            style={styles.deleteButton}
                                            onPress={() =>
                                                handleDeleteItem(item.id)
                                            }
                                            disabled={isDeleting}
                                        >
                                            <Text
                                                style={styles.deleteButtonText}
                                            >
                                                Delete
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })}

                        {items.length === 0 && (
                            <Text style={styles.empty}>No items yet.</Text>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },

    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 24,
    },

    listName: {
        fontSize: 22,
        marginBottom: 24,
    },

    content: {
        gap: 24,
    },

    createItem: {
        gap: 12,
    },

    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },

    addButton: {
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#208AEF',
        alignItems: 'center',
    },

    disabledButton: {
        opacity: 0.5,
    },

    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    items: {
        gap: 12,
    },

    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },

    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
    },

    disabledItem: {
        opacity: 0.5,
    },

    checkbox: {
        fontSize: 24,
    },

    itemName: {
        fontSize: 18,
    },

    completedItemName: {
        textDecorationLine: 'line-through',
        color: '#888888',
    },

    itemActions: {
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

    editingItem: {
        gap: 12,
    },

    editInput: {
        borderWidth: 1,
        borderColor: '#208AEF',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 18,
    },

    editButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },

    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    cancelButtonText: {
        fontSize: 16,
    },

    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#208AEF',
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },

    empty: {
        color: '#666666',
    },
});
