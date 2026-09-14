import { supabase } from '@/lib/SupabaseClient';

import type { List } from '@/types/List';

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

export async function getListById(id: string): Promise<List> {
    const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function createList(name: string): Promise<List> {
    const { data, error } = await supabase
        .from('lists')
        .insert({ name })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}
