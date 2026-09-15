import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CreateListItem } from '@/components/lists/CreateListItem';
import { EditListItem } from '@/components/lists/EditListItem';
import { ListItem } from '@/components/lists/ListItem';
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
                    <CreateListItem
                        name={newListItemName}
                        isCreating={isCreating}
                        error={createError}
                        onChangeName={setNewListItemName}
                        onCreate={handleCreateListItem}
                    />

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
                                    <EditListItem
                                        key={listItem.id}
                                        name={editingListItemName}
                                        isUpdating={isUpdating}
                                        onChangeName={setEditingListItemName}
                                        onCancel={handleCancelEditingListItem}
                                        onSave={handleSaveEditingListItem}
                                    />
                                );
                            }

                            return (
                                <ListItem
                                    key={listItem.id}
                                    listItem={listItem}
                                    isUpdating={isUpdating}
                                    isDeleting={isDeleting}
                                    onToggle={() =>
                                        handleToggleListItem(
                                            listItem.id,
                                            listItem.is_completed
                                        )
                                    }
                                    onEdit={() =>
                                        handleStartEditingListItem(
                                            listItem.id,
                                            listItem.name
                                        )
                                    }
                                    onDelete={() =>
                                        handleDeleteListItem(listItem.id)
                                    }
                                />
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

    listItems: {
        gap: 12,
    },

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },

    empty: {
        color: '#666666',
    },
});
