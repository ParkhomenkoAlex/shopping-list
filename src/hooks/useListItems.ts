import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/SupabaseClient';
import {
    createListItem,
    deleteListItem,
    getListItems,
    updateListItem,
} from '@/services/ListItemService';

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

    useEffect(() => {
        if (!listId) {
            return;
        }

        const channel = supabase
            .channel(
                `list-items:${listId}:${Math.random().toString(36).slice(2)}`
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'list_items',
                    filter: `list_id=eq.${listId}`,
                },
                () => {
                    void queryClient.invalidateQueries({
                        queryKey: ['list-items', listId],
                    });
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [listId, queryClient]);

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
