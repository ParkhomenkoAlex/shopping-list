import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform, StatusBar } from 'react-native';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { IllustrationStyleProvider } from '@/providers/IllustrationStyleProvider';
import { queryClient } from '@/lib/QueryClient';
import { PushNotificationRegistration } from '@/components/notifications/PushNotificationRegistration';
import { AppErrorBoundary } from '@/components/reliability/AppErrorBoundary';
import { OfflineBanner } from '@/components/reliability/OfflineBanner';
import { StartupScreen } from '@/components/reliability/StartupScreen';
import { addMonitoringBreadcrumb } from '@/lib/Monitoring';
import { semanticColors } from '@/theme/semantic';

function AppLifecycle() {
    useEffect(() => {
        addMonitoringBreadcrumb('app_launch');
        const subscription = AppState.addEventListener('change', (state) => {
            addMonitoringBreadcrumb(
                state === 'active'
                    ? 'app_entered_foreground'
                    : 'app_entered_background'
            );
            if (Platform.OS !== 'web') {
                focusManager.setFocused(state === 'active');
            }
        });
        return () => subscription.remove();
    }, []);
    return null;
}

function RootNavigator() {
    const { session, startupStatus, retryInitialization } = useAuth();

    useEffect(() => {
        if (startupStatus === 'ready') {
            addMonitoringBreadcrumb('auth_route_guards_ready', {
                authenticated: Boolean(session),
            });
        }
    }, [session, startupStatus]);

    if (startupStatus !== 'ready') {
        return (
            <StartupScreen
                error={startupStatus === 'error'}
                onRetry={retryInitialization}
            />
        );
    }

    return (
        <>
            <PushNotificationRegistration />
            <OfflineBanner />

            <Stack
                screenOptions={{
                    contentStyle: {
                        backgroundColor: semanticColors.screen.background,
                    },
                    headerShown: false,
                }}
            >
                <Stack.Protected guard={Boolean(session)}>
                    <Stack.Screen
                        name="(app)"
                        options={{ headerShown: false }}
                    />
                </Stack.Protected>

                <Stack.Protected guard={!session}>
                    <Stack.Screen
                        name="auth"
                        options={{ headerShown: false }}
                    />
                </Stack.Protected>
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <AppErrorBoundary>
            <StatusBar
                backgroundColor={semanticColors.screen.background}
                barStyle="dark-content"
            />
            <QueryClientProvider client={queryClient}>
                <IllustrationStyleProvider>
                    <AuthProvider>
                        <AppLifecycle />
                        <RootNavigator />
                    </AuthProvider>
                </IllustrationStyleProvider>
            </QueryClientProvider>
        </AppErrorBoundary>
    );
}
