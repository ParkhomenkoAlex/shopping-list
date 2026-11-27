import type { Database, Tables } from '@/types/database/database.types';

export type List = Tables<'lists'>;

type ListSummaryRpc =
    Database['public']['Functions']['get_accessible_list_summaries']['Returns'][number];

export type ListSummary = Omit<ListSummaryRpc, 'description'> & {
    description: string | null;
};
