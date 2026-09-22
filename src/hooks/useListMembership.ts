import { useMutation, useQuery } from '@tanstack/react-query';

import {
    addMemberByEmail,
    getListMemberRole,
} from '@/services/ListMemberService';

export function useListMembership(
    listId: string | undefined,
    userId: string | undefined
) {
    const {
        data: memberRole = null,
        isLoading: isMemberRoleLoading,
        error: memberRoleError,
    } = useQuery({
        queryKey: ['list-membership', listId, userId],
        queryFn: () => getListMemberRole(listId!, userId!),
        enabled: Boolean(listId && userId),
    });

    const addMemberMutation = useMutation({
        mutationFn: (email: string) => addMemberByEmail(listId!, email),
    });

    return {
        memberRole,
        isMemberRoleLoading,
        memberRoleError,

        addMemberByEmail: addMemberMutation.mutateAsync,
        isAddingMember: addMemberMutation.isPending,
        addMemberError: addMemberMutation.error,
    };
}
