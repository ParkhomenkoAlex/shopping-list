import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { CreateListItem } from '@/components/items/CreateListItem';
import { EditListItem } from '@/components/items/EditListItem';
import { ListItem } from '@/components/items/ListItem';
import { useListItems } from '@/hooks/useListItems';
import { confirmAction } from '@/utils/confirmation';

type ListItemsProps = {
    listId: string;
    isCreateVisible: boolean;
    onCloseCreate: () => void;
};

export function ListItems({
    listId,
    isCreateVisible,
    onCloseCreate,
}: ListItemsProps) {
    const {
        listItems,
        hasListItemsData,
        isLoading,
        error: listItemsError,
        refetchListItems,
        isCreating,
        createError,
        createListItem,
        updateListItem,
        updateError: updateListItemError,
        deleteListItem,
        deleteError: deleteListItemError,
    } = useListItems(listId);

    const [newListItemName, setNewListItemName] = useState('');

    const [editingListItemId, setEditingListItemId] = useState<string | null>(
        null
    );
    const [editingListItemName, setEditingListItemName] = useState('');
    const pendingItemOperationsRef = useRef<
        Map<string, 'updating' | 'deleting'>
    >(new Map());
    const [pendingItemOperations, setPendingItemOperations] = useState<
        Map<string, 'updating' | 'deleting'>
    >(() => new Map());

    const activeItems = listItems.filter((listItem) => !listItem.is_completed);

    const finishedItems = listItems.filter((listItem) => listItem.is_completed);

    const isInitialLoading = isLoading && !hasListItemsData;
    const hasInitialLoadError = Boolean(listItemsError) && !hasListItemsData;

    const startItemOperation = (
        listItemId: string,
        operation: 'updating' | 'deleting'
    ) => {
        if (pendingItemOperationsRef.current.has(listItemId)) {
            return false;
        }

        pendingItemOperationsRef.current.set(listItemId, operation);
        setPendingItemOperations(new Map(pendingItemOperationsRef.current));
        return true;
    };

    const finishItemOperation = (listItemId: string) => {
        pendingItemOperationsRef.current.delete(listItemId);
        setPendingItemOperations(new Map(pendingItemOperationsRef.current));
    };

    const handleCreateListItem = async () => {
        const name = newListItemName.trim();

        if (!name) {
            return;
        }

        try {
            await createListItem(name);

            setNewListItemName('');
            onCloseCreate();
        } catch (error) {
            console.error('Failed to create list item:', error);
        }
    };

    const handleCancelCreateListItem = () => {
        setNewListItemName('');
        onCloseCreate();
    };

    const handleToggleListItem = async (
        listItemId: string,
        isCompleted: boolean
    ) => {
        if (!startItemOperation(listItemId, 'updating')) {
            return;
        }

        try {
            await updateListItem({
                id: listItemId,
                updates: {
                    is_completed: !isCompleted,
                },
            });
        } catch (error) {
            console.error('Failed to update list item:', error);
        } finally {
            finishItemOperation(listItemId);
        }
    };

    const handleStartEditingListItem = (
        listItemId: string,
        listItemName: string
    ) => {
        if (pendingItemOperationsRef.current.has(listItemId)) {
            return;
        }

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

        if (!startItemOperation(editingListItemId, 'updating')) {
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
        } finally {
            finishItemOperation(editingListItemId);
        }
    };

    const handleDeleteListItem = (listItemId: string, listItemName: string) => {
        confirmAction({
            title: 'Delete item',
            message: `Are you sure you want to delete "${listItemName}"?`,
            confirmText: 'Delete',
            onConfirm: async () => {
                if (!startItemOperation(listItemId, 'deleting')) {
                    return;
                }

                try {
                    await deleteListItem(listItemId);
                } catch (error) {
                    console.error('Failed to delete list item:', error);
                } finally {
                    finishItemOperation(listItemId);
                }
            },
        });
    };

    const renderListItem = (listItem: (typeof listItems)[number]) => {
        const isEditing = editingListItemId === listItem.id;
        const pendingOperation = pendingItemOperations.get(listItem.id);
        const isUpdating = pendingOperation === 'updating';
        const isDeleting = pendingOperation === 'deleting';

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
                    handleToggleListItem(listItem.id, listItem.is_completed)
                }
                onEdit={() =>
                    handleStartEditingListItem(listItem.id, listItem.name)
                }
                onDelete={() =>
                    handleDeleteListItem(listItem.id, listItem.name)
                }
            />
        );
    };

    return (
        <View style={styles.container}>
            {isInitialLoading && <ActivityIndicator />}

            {hasInitialLoadError && (
                <View>
                    <Text style={styles.error}>
                        Не удалось загрузить элементы списка.
                    </Text>
                    <Pressable onPress={() => void refetchListItems()}>
                        <Text style={styles.retry}>Повторить</Text>
                    </Pressable>
                </View>
            )}
            {updateListItemError && (
                <Text style={styles.error}>{updateListItemError.message}</Text>
            )}

            {deleteListItemError && (
                <Text style={styles.error}>{deleteListItemError.message}</Text>
            )}

            {isCreateVisible && (
                <View style={styles.create}>
                    <CreateListItem
                        name={newListItemName}
                        isCreating={isCreating}
                        error={createError}
                        onChangeName={setNewListItemName}
                        onCreate={handleCreateListItem}
                    />

                    <Pressable
                        style={styles.cancelCreateButton}
                        onPress={handleCancelCreateListItem}
                        disabled={isCreating}
                    >
                        <Text style={styles.cancelCreateText}>Cancel</Text>
                    </Pressable>
                </View>
            )}

            {hasListItemsData && (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ACTIVE</Text>

                        <View style={styles.items}>
                            {activeItems.map(renderListItem)}

                            {activeItems.length === 0 && (
                                <Text style={styles.empty}>
                                    No active items.
                                </Text>
                            )}
                        </View>
                    </View>

                    {finishedItems.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>FINISHED</Text>

                            <View style={styles.items}>
                                {finishedItems.map(renderListItem)}
                            </View>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 32,
    },

    section: {
        gap: 12,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: '#777777',
    },

    items: {
        gap: 4,
    },

    empty: {
        fontSize: 15,
        color: '#999999',
        paddingVertical: 8,
    },

    create: {
        gap: 8,
    },

    cancelCreateButton: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
    },

    cancelCreateText: {
        fontSize: 14,
        color: '#777777',
    },

    error: {
        color: '#D32F2F',
    },
    retry: { color: '#208AEF', fontSize: 15, fontWeight: '600', marginTop: 8 },
});
