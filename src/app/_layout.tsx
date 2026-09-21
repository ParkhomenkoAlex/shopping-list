import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { queryClient } from '@/lib/QueryClient';

function RootNavigator() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    return (
        <Stack>
            <Stack.Protected guard={Boolean(session)}>
                <Stack.Screen name="(app)" />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
                <Stack.Screen
                    name="auth"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack.Protected>
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RootNavigator />
            </AuthProvider>
        </QueryClientProvider>
    );
}
