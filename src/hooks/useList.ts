import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    createList,
    deleteList,
    getListById,
    getLists,
    updateList,
} from '@/services/ListsService';

export function useList(id?: string) {
    const queryClient = useQueryClient();

    const {
        data: lists = [],
        isLoading: isListsLoading,
        error: listsError,
    } = useQuery({
        queryKey: ['lists'],
        queryFn: getLists,
        enabled: !id,
    });

    const {
        data: list = null,
        isLoading: isListLoading,
        error: listError,
    } = useQuery({
        queryKey: ['list', id],
        queryFn: () => getListById(id!),
        enabled: Boolean(id),
    });

    const createListMutation = useMutation({
        mutationFn: ({
            name,
            description,
        }: {
            name: string;
            description: string | null;
        }) => createList(name, description),

        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['lists'],
            });
        },
    });

    const updateListMutation = useMutation({
        mutationFn: (updates: Parameters<typeof updateList>[1]) =>
            updateList(id!, updates),

        onSuccess: (updatedList) => {
            queryClient.setQueryData(['list', id], updatedList);

            void queryClient.invalidateQueries({
                queryKey: ['lists'],
            });
        },
    });

    const deleteListMutation = useMutation({
        mutationFn: () => deleteList(id!),

        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['lists'],
            });

            queryClient.removeQueries({
                queryKey: ['list', id],
            });
        },
    });

    return {
        lists,
        isListsLoading,
        listsError,

        list,
        isListLoading,
        listError,

        createList: createListMutation.mutateAsync,
        isCreating: createListMutation.isPending,
        createError: createListMutation.error,

        updateList: updateListMutation.mutateAsync,
        isUpdating: updateListMutation.isPending,
        updateError: updateListMutation.error,

        deleteList: deleteListMutation.mutateAsync,
        isDeleting: deleteListMutation.isPending,
        deleteError: deleteListMutation.error,
    };
}
