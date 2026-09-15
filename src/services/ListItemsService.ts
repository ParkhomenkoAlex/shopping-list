import { supabase } from '@/lib/SupabaseClient';

import type { Database } from '@/types/database/database.types';
import type { Tables } from '@/types/database/database.types';

export type ListItem = Tables<'list_items'>;

// TODO: Revisit the update architecture during the planned refactoring.
// We currently use the generated Supabase Update type directly here.
export type ListItemUpdate =
    Database['public']['Tables']['list_items']['Update'];

export async function getListItems(listId: string): Promise<ListItem[]> {
    const { data, error } = await supabase
        .from('list_items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

export async function createListItem(
    listId: string,
    name: string
): Promise<ListItem> {
    const { data, error } = await supabase
        .from('list_items')
        .insert({
            list_id: listId,
            name,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function updateListItem(
    id: string,
    updates: ListItemUpdate
): Promise<ListItem> {
    const { data, error } = await supabase
        .from('list_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function deleteListItem(id: string): Promise<void> {
    const { error } = await supabase.from('list_items').delete().eq('id', id);

    if (error) {
        throw error;
    }
}
