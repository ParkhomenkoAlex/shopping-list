import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { useList } from '@/hooks/useList';
import { useListMembership } from '@/hooks/useListMembership';
import { useAuth } from '@/providers/AuthProvider';
import { initialListForm, type ListForm } from '@/types/ListForm';
import { confirmAction } from '@/utils/confirmation';

export function useListDetails(id: string) {
    const { user } = useAuth();
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

    const { memberRole, isMemberRoleLoading, memberRoleError } =
        useListMembership(id, user?.id);

    const [isEditListModalVisible, setIsEditListModalVisible] = useState(false);

    const [editListForm, setEditListForm] = useState<ListForm>(initialListForm);

    useEffect(() => {
        if (!isListLoading && list === null) {
            router.replace('/lists');
            return;
        }

        if (
            !isListLoading &&
            !isMemberRoleLoading &&
            user &&
            memberRole === null
        ) {
            router.replace('/lists');
            return;
        }

        if (listError) {
            router.replace('/lists');
        }
    }, [isListLoading, list, isMemberRoleLoading, user, memberRole, listError]);

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

    return {
        list,
        isListLoading,
        listError,
        memberRole,
        isMemberRoleLoading,
        memberRoleError,
        isEditListModalVisible,
        editListForm,
        isUpdating,
        updateError,
        isListDeleting,
        deleteListError,
        handleOpenEditListModal,
        handleChangeEditListForm,
        handleCancelEditList,
        handleSaveEditList,
        handleDeleteList,
    };
}
