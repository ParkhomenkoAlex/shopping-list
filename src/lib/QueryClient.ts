import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClient } from '@tanstack/react-query';

import { addMonitoringBreadcrumb } from '@/lib/Monitoring';

onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
        const online =
            state.isConnected === true && state.isInternetReachable !== false;
        setOnline(online);
        addMonitoringBreadcrumb('connectivity_changed', { online });
    })
);

function isRetryable(error: unknown) {
    const status =
        typeof error === 'object' && error && 'status' in error
            ? Number(error.status)
            : undefined;
    return (
        status === undefined ||
        status >= 500 ||
        status === 408 ||
        status === 429
    );
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) =>
                isRetryable(error) && failureCount < 2,
            retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
            staleTime: 30_000,
            refetchOnReconnect: true,
        },
        mutations: { retry: false },
    },
});
