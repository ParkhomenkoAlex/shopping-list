import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ListItems } from '@/components/items/ListItems';
import { EditListModal } from '@/components/lists/EditListModal';
import { ListHeader } from '@/components/lists/ListHeader';
import { useList } from '@/hooks/useList';
import { confirmAction } from '@/utils/confirmation';
import { initialListForm, type ListForm } from '@/types/ListForm';

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

    const [isEditListModalVisible, setIsEditListModalVisible] = useState(false);

    const [editListForm, setEditListForm] = useState<ListForm>(initialListForm);

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

    const handleChangeEditListForm = (field: keyof ListForm, value: string) => {
        setEditListForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
    };

    const handleCancelEditList = () => {
        setEditListForm(initialListForm);
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

            setEditListForm(initialListForm);
            setIsEditListModalVisible(false);
        } catch (error) {
            console.error('Failed to update list:', error);
        }
    };

    const handleDeleteList = () => {
        confirmAction({
            title: 'Delete list',
            message: 'Are you sure you want to delete this list?',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await deleteList();

                    router.replace('/lists');
                } catch (error) {
                    console.error('Failed to delete list:', error);
                }
            },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>List Details</Text>

            {isListLoading && <ActivityIndicator />}

            {listError && <Text style={styles.error}>{listError.message}</Text>}

            {list && (
                <ListHeader
                    list={list}
                    isUpdating={isUpdating}
                    isDeleting={isListDeleting}
                    deleteError={deleteListError}
                    onEdit={handleOpenEditListModal}
                    onDelete={handleDeleteList}
                />
            )}

            {!isListLoading && !listError && list && (
                <View style={styles.content}>
                    <ListItems listId={id} />
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

    content: {
        marginTop: 24,
    },

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },
});
