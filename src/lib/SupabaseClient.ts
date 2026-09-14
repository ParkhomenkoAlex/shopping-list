import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database/database.types';

type AppExtra = {
    appEnv?: string;
    supabaseUrl?: string;
    supabasePublishableKey?: string;
};

const extra = Constants.expoConfig?.extra as AppExtra | undefined;

const supabaseUrl = extra?.supabaseUrl;
const supabasePublishableKey = extra?.supabasePublishableKey;

if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured');
}

if (!supabasePublishableKey) {
    throw new Error('Supabase publishable key is not configured');
}

export const supabase = createClient<Database>(
    supabaseUrl,
    supabasePublishableKey
);
