import { supabase } from '@/lib/SupabaseClient';

import type { Database, Tables } from '@/types/database/database.types';

export type ListMemberRole = Tables<'list_members'>['role'];

export type SharedListMember =
    Database['public']['Functions']['get_list_shared_members']['Returns'][number];

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

export async function getSharedListMembers(
    listId: string
): Promise<SharedListMember[]> {
    const { data, error } = await supabase.rpc('get_list_shared_members', {
        target_list_id: listId,
    });

    if (error) {
        throw error;
    }

    return data;
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

export async function removeListMember(
    listId: string,
    userId: string
): Promise<void> {
    const { error } = await supabase
        .from('list_members')
        .delete()
        .eq('list_id', listId)
        .eq('user_id', userId);

    if (error) {
        throw error;
    }
}
