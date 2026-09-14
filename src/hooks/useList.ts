import { useQuery } from '@tanstack/react-query';

import { getListById } from '@/services/ListsService';

export function useList(id: string | undefined) {
    const {
        data: list = null,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['list', id],
        queryFn: () => getListById(id!),
        enabled: Boolean(id),
    });

    return {
        list,
        isLoading,
        error,
    };
}
