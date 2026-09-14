import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createList, getLists } from '@/services/ListsService';

export function useLists() {
    const queryClient = useQueryClient();

    const {
        data: lists = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['lists'],
        queryFn: getLists,
    });

    const createListMutation = useMutation({
        mutationFn: createList,

        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['lists'],
            });
        },
    });

    return {
        lists,
        isLoading,
        error,
        createList: createListMutation.mutateAsync,
        isCreating: createListMutation.isPending,
        createError: createListMutation.error,
    };
}
