import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/SupabaseClient';
import {
    addMemberByEmail,
    getListMemberRole,
    getSharedListMembers,
    removeListMember,
} from '@/services/ListMemberService';
import { notifyListMembers } from '@/services/PushNotificationService';

export function useListMembership(
    listId: string | undefined,
    userId: string | undefined
) {
    const queryClient = useQueryClient();

    const {
        data: memberRole = null,
        isLoading: isMemberRoleLoading,
        error: memberRoleError,
    } = useQuery({
        queryKey: ['list-membership', listId, userId],
        queryFn: () => getListMemberRole(listId!, userId!),
        enabled: Boolean(listId && userId),
    });

    const {
        data: sharedMembers = [],
        isLoading: isSharedMembersLoading,
        error: sharedMembersError,
    } = useQuery({
        queryKey: ['list-shared-members', listId],
        queryFn: () => getSharedListMembers(listId!),
        enabled: Boolean(listId && userId),
    });

    useEffect(() => {
        if (!listId || !userId) {
            return;
        }

        const channel = supabase
            .channel(
                `list-membership:${listId}:${userId}:${Math.random().toString(36).slice(2)}`
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'list_members',
                    filter: `list_id=eq.${listId}`,
                },
                () => {
                    void queryClient.invalidateQueries({
                        queryKey: ['list-membership', listId, userId],
                    });

                    void queryClient.invalidateQueries({
                        queryKey: ['list-shared-members', listId],
                    });

                    void queryClient.invalidateQueries({
                        queryKey: ['lists'],
                    });

                    void queryClient.invalidateQueries({
                        queryKey: ['list', listId],
                    });
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [listId, userId, queryClient]);

    const addMemberMutation = useMutation({
        mutationFn: (email: string) => addMemberByEmail(listId!, email),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['list-shared-members', listId],
            });
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (targetUserId: string) =>
            removeListMember(listId!, targetUserId),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['list-shared-members', listId],
            });

            void queryClient.invalidateQueries({
                queryKey: ['lists'],
            });
        },
    });

    const notifyMembersMutation = useMutation({
        mutationFn: () => notifyListMembers(listId!),
    });

    return {
        memberRole,
        isMemberRoleLoading,
        memberRoleError,

        sharedMembers,
        isSharedMembersLoading,
        sharedMembersError,

        addMemberByEmail: addMemberMutation.mutateAsync,
        isAddingMember: addMemberMutation.isPending,
        addMemberError: addMemberMutation.error,

        removeMember: removeMemberMutation.mutateAsync,
        isRemovingMember: removeMemberMutation.isPending,
        removeMemberError: removeMemberMutation.error,

        notifyMembers: notifyMembersMutation.mutateAsync,
        isNotifying: notifyMembersMutation.isPending,
        notifyError: notifyMembersMutation.error,
    };
}
