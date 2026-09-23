import * as Crypto from 'expo-crypto';

import { supabase } from '@/lib/SupabaseClient';

import type { Database } from '@/types/database/database.types';
import type { List } from '@/types/List';

export type ListUpdate = Database['public']['Tables']['lists']['Update'];

export async function getLists(): Promise<List[]> {
    const { data, error } = await supabase
        .from('lists')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

export async function getListById(id: string): Promise<List | null> {
    const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function createList(
    name: string,
    description: string | null
): Promise<List> {
    const id = Crypto.randomUUID();

    // Owner membership is created automatically by a PostgreSQL trigger
    // after the list is inserted. The mobile client only creates the list.
    // TODO: Document this list ownership flow in README.md.
    const { error } = await supabase.from('lists').insert({
        id,
        name,
        description,
    });

    if (error) {
        throw error;
    }

    const createdList = await getListById(id);

    if (!createdList) {
        throw new Error('Failed to retrieve created list');
    }

    return createdList;
}

export async function updateList(
    id: string,
    updates: ListUpdate
): Promise<List> {
    const { data, error } = await supabase
        .from('lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function deleteList(id: string): Promise<void> {
    const { error } = await supabase.from('lists').delete().eq('id', id);

    if (error) {
        throw error;
    }
}
