import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    addMemberByEmail,
    getListMemberRole,
    getSharedListMembers,
} from '@/services/ListMemberService';

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

    const addMemberMutation = useMutation({
        mutationFn: (email: string) => addMemberByEmail(listId!, email),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['list-shared-members', listId],
            });
        },
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
    };
}
