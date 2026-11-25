import { Stack } from 'expo-router';

import { semanticColors } from '@/theme/semantic';

export default function AppLayout() {
    return (
        <Stack
            screenOptions={{
                contentStyle: {
                    backgroundColor: semanticColors.screen.background,
                },
                headerShown: false,
            }}
        />
    );
}
