import { Platform } from 'react-native';

import { supabase } from '@/lib/SupabaseClient';

export async function registerPushToken(token: string): Promise<void> {
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    const { error } = await supabase.rpc('register_push_token', {
        p_token: token,
        p_platform: platform,
    });

    if (error) {
        console.error('Failed to register push token:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
        });
        throw error;
    }
}

export async function unregisterPushToken(token: string): Promise<void> {
    const { error } = await supabase
        .from('user_push_tokens')
        .delete()
        .eq('token', token);

    if (error) {
        console.error('Failed to unregister push token:', error);
    }
}

export interface NotifyListMembersResponse {
    success: boolean;
    notifiedCount: number;
    failedCount: number;
    message?: string;
    error?: string;
    tickets?: unknown[];
}

export async function notifyListMembers(
    listId: string
): Promise<NotifyListMembersResponse> {
    const { data, error } = await supabase.functions.invoke(
        'notify-list-members',
        {
            body: { listId },
        }
    );

    if (error) {
        throw error;
    }

    return data as NotifyListMembersResponse;
}
