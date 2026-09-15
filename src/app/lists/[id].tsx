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
        listItems,
        isLoading: isListItemsLoading,
        error: listItemsError,
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

    const [newListItemName, setNewListItemName] = useState('');

    const [editingListItemId, setEditingListItemId] = useState<string | null>(
        null
    );
    const [editingListItemName, setEditingListItemName] = useState('');

    const isLoading = isListLoading || isListItemsLoading;
    const error = listError || listItemsError;

    const handleCreateListItem = async () => {
        const name = newListItemName.trim();

        if (!name) {
            return;
        }

        try {
            await createListItem(name);
            setNewListItemName('');
        } catch (error) {
            console.error('Failed to create list item:', error);
        }
    };

    const handleToggleListItem = async (
        listItemId: string,
        isCompleted: boolean
    ) => {
        try {
            await updateListItem({
                id: listItemId,
                updates: {
                    is_completed: !isCompleted,
                },
            });
        } catch (error) {
            console.error('Failed to update list item:', error);
        }
    };

    const handleStartEditingListItem = (
        listItemId: string,
        listItemName: string
    ) => {
        setEditingListItemId(listItemId);
        setEditingListItemName(listItemName);
    };

    const handleCancelEditingListItem = () => {
        setEditingListItemId(null);
        setEditingListItemName('');
    };

    const handleSaveEditingListItem = async () => {
        if (!editingListItemId) {
            return;
        }

        const name = editingListItemName.trim();

        if (!name) {
            return;
        }

        try {
            await updateListItem({
                id: editingListItemId,
                updates: {
                    name,
                },
            });

            setEditingListItemId(null);
            setEditingListItemName('');
        } catch (error) {
            console.error('Failed to update list item:', error);
        }
    };

    const handleDeleteListItem = async (listItemId: string) => {
        try {
            await deleteListItem(listItemId);
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
                    <View style={styles.createListItem}>
                        <TextInput
                            style={styles.input}
                            value={newListItemName}
                            onChangeText={setNewListItemName}
                            placeholder="New list item name"
                            editable={!isCreating}
                        />

                        <Pressable
                            style={[
                                styles.addButton,
                                isCreating && styles.disabledButton,
                            ]}
                            onPress={handleCreateListItem}
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

                    <View style={styles.listItems}>
                        {listItems.map((listItem) => {
                            const isEditing = editingListItemId === listItem.id;

                            if (isEditing) {
                                return (
                                    <View
                                        key={listItem.id}
                                        style={styles.editingListItem}
                                    >
                                        <TextInput
                                            style={styles.editListItemInput}
                                            value={editingListItemName}
                                            onChangeText={
                                                setEditingListItemName
                                            }
                                            autoFocus
                                            editable={!isUpdating}
                                        />

                                        <View
                                            style={styles.editListItemButtons}
                                        >
                                            <Pressable
                                                style={styles.cancelButton}
                                                onPress={
                                                    handleCancelEditingListItem
                                                }
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
                                                onPress={
                                                    handleSaveEditingListItem
                                                }
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
                                <View key={listItem.id} style={styles.listItem}>
                                    <Pressable
                                        style={[
                                            styles.listItemContent,
                                            (isUpdating || isDeleting) &&
                                                styles.disabledListItem,
                                        ]}
                                        onPress={() =>
                                            handleToggleListItem(
                                                listItem.id,
                                                listItem.is_completed
                                            )
                                        }
                                        disabled={isUpdating || isDeleting}
                                    >
                                        <Text style={styles.checkbox}>
                                            {listItem.is_completed ? '☑' : '☐'}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.listItemName,
                                                listItem.is_completed &&
                                                    styles.completedListItemName,
                                            ]}
                                        >
                                            {listItem.name}
                                        </Text>
                                    </Pressable>

                                    <View style={styles.listItemActions}>
                                        <Pressable
                                            style={styles.editButton}
                                            onPress={() =>
                                                handleStartEditingListItem(
                                                    listItem.id,
                                                    listItem.name
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
                                                handleDeleteListItem(
                                                    listItem.id
                                                )
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

                        {listItems.length === 0 && (
                            <Text style={styles.empty}>No list items yet.</Text>
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

    createListItem: {
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

    listItems: {
        gap: 12,
    },

    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },

    listItemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
    },

    disabledListItem: {
        opacity: 0.5,
    },

    checkbox: {
        fontSize: 24,
    },

    listItemName: {
        fontSize: 18,
    },

    completedListItemName: {
        textDecorationLine: 'line-through',
        color: '#888888',
    },

    listItemActions: {
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

    editingListItem: {
        gap: 12,
    },

    editListItemInput: {
        borderWidth: 1,
        borderColor: '#208AEF',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 18,
    },

    editListItemButtons: {
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
