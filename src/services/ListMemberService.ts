import { supabase } from '@/lib/SupabaseClient';

import type { Tables } from '@/types/database/database.types';

export type ListMemberRole = Tables<'list_members'>['role'];

export async function getListMemberRole(
    listId: string,
    userId: string
): Promise<ListMemberRole | null> {
    const { data, error } = await supabase
        .from('list_members')
        .select('role')
        .eq('list_id', listId)
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data?.role ?? null;
}

export async function addMemberByEmail(
    listId: string,
    email: string
): Promise<void> {
    const { error } = await supabase.rpc('add_list_member_by_email', {
        target_list_id: listId,
        target_email: email,
    });

    if (error) {
        throw error;
    }
}
