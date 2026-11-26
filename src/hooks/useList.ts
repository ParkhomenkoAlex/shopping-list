import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/SupabaseClient';
import {
    createList,
    deleteList,
    getListById,
    getLists,
    updateList,
} from '@/services/ListService';
import { getCurrentUserListMemberships } from '@/services/ListMemberService';
import { useAuth } from '@/providers/AuthProvider';

export function useList(id?: string) {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const userId = user?.id;

    const {
        data: listsData,
        isLoading: isListsLoading,
        error: listsError,
        refetch: refetchLists,
    } = useQuery({
        queryKey: ['lists'],
        queryFn: getLists,
        enabled: !id,
    });

    const {
        data: listMembershipsData,
        error: listMembershipsError,
        refetch: refetchListMemberships,
    } = useQuery({
        queryKey: ['current-user-list-memberships', userId],
        queryFn: () => getCurrentUserListMemberships(userId!),
        enabled: !id && Boolean(userId),
    });

    const {
        data: listData,
        isPending: isListLoading,
        isPaused: isListPaused,
        isFetching: isListFetching,
        error: listError,
        refetch: refetchList,
    } = useQuery({
        queryKey: ['list', id],
        queryFn: () => getListById(id!),
        enabled: Boolean(id),
    });

    useEffect(() => {
        if (id) {
            const channel = supabase
                .channel(`list:${id}:${Math.random().toString(36).slice(2)}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'lists',
                        filter: `id=eq.${id}`,
                    },
                    () => {
                        void queryClient.invalidateQueries({
                            queryKey: ['list', id],
                        });

                        void queryClient.invalidateQueries({
                            queryKey: ['lists'],
                        });
                    }
                )
                .subscribe();

            return () => {
                void supabase.removeChannel(channel);
            };
        }

        if (!userId) {
            return;
        }

        const channel = supabase
            .channel(
                `lists-user:${userId}:${Math.random().toString(36).slice(2)}`
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'lists',
                },
                () => {
                    void queryClient.invalidateQueries({
                        queryKey: ['lists'],
                    });
                    void queryClient.invalidateQueries({
                        queryKey: ['current-user-list-memberships', userId],
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'list_members',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    void queryClient.invalidateQueries({
                        queryKey: ['lists'],
                    });
                    void queryClient.invalidateQueries({
                        queryKey: ['current-user-list-memberships', userId],
                    });
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [id, queryClient, userId]);

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
            void queryClient.invalidateQueries({
                queryKey: ['current-user-list-memberships', userId],
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
        lists: listsData ?? [],
        hasListsData: listsData !== undefined,
        isListsLoading,
        listsError,
        refetchLists,
        listMemberships: listMembershipsData ?? [],
        hasListMembershipsData: listMembershipsData !== undefined,
        listMembershipsError,
        refetchListMemberships,

        list: listData ?? null,
        hasListData: listData !== undefined,
        isListLoading,
        isListPaused,
        isListRefetching: isListFetching && !isListLoading,
        listError,
        refetchList,

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
