import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    createListItem,
    deleteListItem,
    getListItems,
    updateListItem,
} from '@/services/ListItemsService';

export function useListItems(listId: string | undefined) {
    const queryClient = useQueryClient();

    const {
        data: listItems = [],
        isLoading: isListItemsLoading,
        error: listItemsError,
    } = useQuery({
        queryKey: ['list-items', listId],
        queryFn: () => getListItems(listId!),
        enabled: Boolean(listId),
    });

    const createListItemMutation = useMutation({
        mutationFn: (name: string) => createListItem(listId!, name),

        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['list-items', listId],
            });
        },
    });

    const updateListItemMutation = useMutation({
        mutationFn: ({
            id,
            updates,
        }: {
            id: string;
            updates: Parameters<typeof updateListItem>[1];
        }) => updateListItem(id, updates),

        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['list-items', listId],
            });
        },
    });

    const deleteListItemMutation = useMutation({
        mutationFn: (id: string) => deleteListItem(id),

        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['list-items', listId],
            });
        },
    });

    return {
        listItems,
        isLoading: isListItemsLoading,
        error: listItemsError,

        createListItem: createListItemMutation.mutateAsync,
        isCreating: createListItemMutation.isPending,
        createError: createListItemMutation.error,

        updateListItem: updateListItemMutation.mutateAsync,
        isUpdating: updateListItemMutation.isPending,
        updateError: updateListItemMutation.error,

        deleteListItem: deleteListItemMutation.mutateAsync,
        isDeleting: deleteListItemMutation.isPending,
        deleteError: deleteListItemMutation.error,
    };
}
