import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { CreateListItem } from '@/components/lists/CreateListItem';
import { EditListItem } from '@/components/lists/EditListItem';
import { EditListModal } from '@/components/lists/EditListModal';
import { ListItem } from '@/components/lists/ListItem';
import { useList } from '@/hooks/useList';
import { useListItems } from '@/hooks/useListItems';

type EditListForm = {
    name: string;
    description: string;
};

const initialForm: EditListForm = {
    name: '',
    description: '',
};

export default function ListDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const {
        list,
        isListLoading,
        listError,
        updateList,
        isUpdating,
        updateError,
        deleteList,
        isDeleting: isListDeleting,
        deleteError: deleteListError,
    } = useList(id);

    const {
        listItems,
        isLoading: isListItemsLoading,
        error: listItemsError,
        createListItem,
        isCreating,
        createError,
        updateListItem,
        isUpdating: isListItemUpdating,
        updateError: updateListItemError,
        deleteListItem,
        isDeleting: isListItemDeleting,
        deleteError: deleteListItemError,
    } = useListItems(id);

    const [newListItemName, setNewListItemName] = useState('');

    const [editingListItemId, setEditingListItemId] = useState<string | null>(
        null
    );

    const [editingListItemName, setEditingListItemName] = useState('');

    const [isEditListModalVisible, setIsEditListModalVisible] = useState(false);

    const [editListForm, setEditListForm] = useState<EditListForm>(initialForm);

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

    const handleDeleteListItem = (listItemId: string, listItemName: string) => {
        Alert.alert(
            'Delete item',
            `Are you sure you want to delete "${listItemName}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteListItem(listItemId);
                        } catch (error) {
                            console.error('Failed to delete list item:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleOpenEditListModal = () => {
        if (!list) {
            return;
        }

        setEditListForm({
            name: list.name,
            description: list.description ?? '',
        });

        setIsEditListModalVisible(true);
    };

    const handleChangeEditListForm = (
        field: keyof EditListForm,
        value: string
    ) => {
        setEditListForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
    };

    const handleCancelEditList = () => {
        setEditListForm(initialForm);
        setIsEditListModalVisible(false);
    };

    const handleSaveEditList = async () => {
        const name = editListForm.name.trim();
        const description = editListForm.description.trim();

        if (!name) {
            return;
        }

        try {
            await updateList({
                name,
                description: description || null,
            });

            setEditListForm(initialForm);
            setIsEditListModalVisible(false);
        } catch (error) {
            console.error('Failed to update list:', error);
        }
    };

    const handleDeleteList = () => {
        Alert.alert(
            'Delete list',
            'Are you sure you want to delete this list?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteList();

                            router.replace('/lists');
                        } catch (error) {
                            console.error('Failed to delete list:', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>List Details</Text>

            {isLoading && <ActivityIndicator />}

            {error && <Text style={styles.error}>{error.message}</Text>}

            {list && (
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
                                    (isUpdating || isListDeleting) &&
                                        styles.disabledButton,
                                ]}
                                onPress={handleOpenEditListModal}
                                disabled={isUpdating || isListDeleting}
                            >
                                <Text style={styles.editListButtonText}>
                                    Edit
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.deleteListButton,
                                    isListDeleting && styles.disabledButton,
                                ]}
                                onPress={handleDeleteList}
                                disabled={isListDeleting}
                            >
                                <Text style={styles.deleteListButtonText}>
                                    {isListDeleting ? 'Deleting...' : 'Delete'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {deleteListError && (
                        <Text style={styles.error}>
                            {deleteListError.message}
                        </Text>
                    )}
                </View>
            )}

            {!isLoading && !error && (
                <View style={styles.content}>
                    <CreateListItem
                        name={newListItemName}
                        isCreating={isCreating}
                        error={createError}
                        onChangeName={setNewListItemName}
                        onCreate={handleCreateListItem}
                    />

                    {updateListItemError && (
                        <Text style={styles.error}>
                            {updateListItemError.message}
                        </Text>
                    )}

                    {deleteListItemError && (
                        <Text style={styles.error}>
                            {deleteListItemError.message}
                        </Text>
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
                                        handleDeleteListItem(
                                            listItem.id,
                                            listItem.name
                                        )
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

            <EditListModal
                visible={isEditListModalVisible}
                form={editListForm}
                isUpdating={isUpdating}
                error={updateError}
                onChange={handleChangeEditListForm}
                onCancel={handleCancelEditList}
                onSubmit={handleSaveEditList}
            />
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

    content: {
        gap: 24,
        marginTop: 24,
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
