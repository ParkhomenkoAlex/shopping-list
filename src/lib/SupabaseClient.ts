import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL is not defined');
}

if (!supabasePublishableKey) {
    throw new Error('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not defined');
}

export const supabase = createClient<Database>(
    supabaseUrl,
    supabasePublishableKey
);
