import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { router, usePathname, useRootNavigationState } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';
import { registerPushToken } from '@/services/PushNotificationService';

type NotificationTarget = {
    listId: string;
    responseId: string;
    source: 'initial' | 'live';
    userId: string;
};

function isAuthenticatedIndexRoute(pathname: string) {
    return pathname === '/' || pathname === '/(app)';
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function PushNotificationRegistration() {
    const { user } = useAuth();
    const userId = user?.id;
    const pathname = usePathname();
    const rootNavigationState = useRootNavigationState();
    const registeredTokenRef = useRef<string | null>(null);
    const handledResponseIdRef = useRef<string | null>(null);
    const pendingInitialTargetRef = useRef<NotificationTarget | null>(null);
    const pathnameRef = useRef(pathname);

    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    const clearHandledNotificationResponse = useCallback(() => {
        void Notifications.clearLastNotificationResponseAsync().catch(
            (error) => {
                console.error(
                    'Failed to clear handled notification response:',
                    error
                );
            }
        );
    }, []);

    const dispatchNotificationRoute = useCallback(
        (target: NotificationTarget) => {
            router.push(`/lists/${target.listId}`);

            clearHandledNotificationResponse();
        },
        [clearHandledNotificationResponse]
    );

    const discardPendingTarget = useCallback(
        (target: NotificationTarget) => {
            if (
                pendingInitialTargetRef.current?.responseId ===
                target.responseId
            ) {
                pendingInitialTargetRef.current = null;
            }

            clearHandledNotificationResponse();
        },
        [clearHandledNotificationResponse]
    );

    const handleNotificationResponse = useCallback(
        (
            response: Notifications.NotificationResponse | null,
            source: 'initial' | 'live'
        ) => {
            if (!response) {
                return;
            }

            if (!userId) {
                return;
            }

            const responseId = response.notification.request.identifier;

            if (handledResponseIdRef.current === responseId) {
                return;
            }

            const data = response.notification.request.content.data;
            const listId = data?.listId;

            if (!listId || typeof listId !== 'string') {
                return;
            }

            handledResponseIdRef.current = responseId;
            const target = { listId, responseId, source, userId };
            const currentPathname = pathnameRef.current;

            if (source === 'initial' && currentPathname.startsWith('/lists/')) {
                discardPendingTarget(target);
                return;
            }

            if (
                currentPathname === '/lists' ||
                (source === 'live' &&
                    !isAuthenticatedIndexRoute(currentPathname))
            ) {
                pendingInitialTargetRef.current = null;
                dispatchNotificationRoute(target);
                return;
            }

            if (isAuthenticatedIndexRoute(currentPathname)) {
                pendingInitialTargetRef.current = target;
                return;
            }

            discardPendingTarget(target);
        },
        [discardPendingTarget, dispatchNotificationRoute, userId]
    );

    useEffect(() => {
        if (Platform.OS === 'android') {
            void Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#208AEF',
            });
        }
    }, []);

    useEffect(() => {
        const pendingInitialTarget = pendingInitialTargetRef.current;

        if (!pendingInitialTarget) {
            return;
        }

        if (!userId || !rootNavigationState.key) {
            discardPendingTarget(pendingInitialTarget);
            return;
        }

        if (pendingInitialTarget.userId !== userId) {
            discardPendingTarget(pendingInitialTarget);
            return;
        }

        if (pathname === '/lists') {
            pendingInitialTargetRef.current = null;
            dispatchNotificationRoute(pendingInitialTarget);
            return;
        }

        if (pathname.startsWith('/lists/')) {
            if (pendingInitialTarget.source === 'initial') {
                discardPendingTarget(pendingInitialTarget);
                return;
            }

            pendingInitialTargetRef.current = null;
            dispatchNotificationRoute(pendingInitialTarget);
            return;
        }

        if (!isAuthenticatedIndexRoute(pathname)) {
            discardPendingTarget(pendingInitialTarget);
            return;
        }
    }, [
        discardPendingTarget,
        dispatchNotificationRoute,
        pathname,
        rootNavigationState.key,
        userId,
    ]);

    useEffect(() => {
        if (!userId || !rootNavigationState.key) {
            return;
        }

        const responseSubscription =
            Notifications.addNotificationResponseReceivedListener((response) =>
                handleNotificationResponse(response, 'live')
            );

        handleNotificationResponse(
            Notifications.getLastNotificationResponse(),
            'initial'
        );

        return () => {
            responseSubscription.remove();
        };
    }, [handleNotificationResponse, rootNavigationState.key, userId]);

    useEffect(() => {
        if (!userId) {
            registeredTokenRef.current = null;
            return;
        }

        const register = async () => {
            try {
                const { status: existingStatus } =
                    await Notifications.getPermissionsAsync();

                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } =
                        await Notifications.requestPermissionsAsync();

                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    return;
                }

                const projectId = Constants.expoConfig?.extra?.eas?.projectId;

                if (!projectId) {
                    console.error('EAS project ID is not configured');
                    return;
                }

                const token = (
                    await Notifications.getExpoPushTokenAsync({
                        projectId,
                    })
                ).data;

                if (token && registeredTokenRef.current !== token) {
                    await registerPushToken(token);
                    registeredTokenRef.current = token;
                }
            } catch (error) {
                console.error('Error during push token registration:', error);
            }
        };

        void register();
    }, [userId]);

    return null;
}
