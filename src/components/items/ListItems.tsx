import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CreateListItem } from '@/components/items/CreateListItem';
import { EditListItem } from '@/components/items/EditListItem';
import { ListItem } from '@/components/items/ListItem';
import { useListItems } from '@/hooks/useListItems';
import { confirmAction } from '@/utils/confirmation';

type ListItemsProps = {
    listId: string;
};

export function ListItems({ listId }: ListItemsProps) {
    const {
        listItems,
        isCreating,
        createError,
        createListItem,
        updateListItem,
        isUpdating: isListItemUpdating,
        updateError: updateListItemError,
        deleteListItem,
        isDeleting: isListItemDeleting,
        deleteError: deleteListItemError,
    } = useListItems(listId);

    const [newListItemName, setNewListItemName] = useState('');

    const [editingListItemId, setEditingListItemId] = useState<string | null>(
        null
    );

    const [editingListItemName, setEditingListItemName] = useState('');

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

    const handleDeleteListItem = (listItemId: string, listItemName: string) => {
        confirmAction({
            title: 'Delete item',
            message: `Are you sure you want to delete "${listItemName}"?`,
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await deleteListItem(listItemId);
                } catch (error) {
                    console.error('Failed to delete list item:', error);
                }
            },
        });
    };

    return (
        <View style={styles.container}>
            <CreateListItem
                name={newListItemName}
                isCreating={isCreating}
                error={createError}
                onChangeName={setNewListItemName}
                onCreate={handleCreateListItem}
            />

            {updateListItemError && (
                <Text style={styles.error}>{updateListItemError.message}</Text>
            )}

            {deleteListItemError && (
                <Text style={styles.error}>{deleteListItemError.message}</Text>
            )}

            <View style={styles.listItems}>
                {listItems.map((listItem) => {
                    const isEditing = editingListItemId === listItem.id;

                    if (isEditing) {
                        return (
                            <EditListItem
                                key={listItem.id}
                                name={editingListItemName}
                                isUpdating={isListItemUpdating}
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
                            isUpdating={isListItemUpdating}
                            isDeleting={isListItemDeleting}
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
                                handleDeleteListItem(listItem.id, listItem.name)
                            }
                        />
                    );
                })}

                {listItems.length === 0 && (
                    <Text style={styles.empty}>No list items yet.</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
