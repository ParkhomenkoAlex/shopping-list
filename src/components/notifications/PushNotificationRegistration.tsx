import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { router } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';
import { registerPushToken } from '@/services/PushNotificationService';

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
    const registeredTokenRef = useRef<string | null>(null);

    useEffect(() => {
        if (Platform.OS === 'android') {
            void Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#208AEF',
            });
        }

        const responseSubscription =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    const data = response.notification.request.content.data;
                    const listId = data?.listId;
                    if (listId && typeof listId === 'string') {
                        router.push(`/lists/${listId}`);
                    }
                }
            );

        return () => {
            responseSubscription.remove();
        };
    }, []);

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
