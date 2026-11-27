import { useRef } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';

import { Illustration } from '@/components/ui/Illustration';
import { semanticColors } from '@/theme/semantic';
import { controlDimensions, spacing, typography } from '@/theme/tokens';

export type AccountMenuAnchor = {
    top: number;
    right: number;
};

type ListsHeaderProps = {
    email: string | undefined;
    onPressAccount: (anchor: AccountMenuAnchor) => void;
};

function getGreeting(hour: number) {
    if (hour >= 5 && hour < 12)
        return { text: 'Good morning', key: 'greeting-morning' } as const;
    if (hour >= 12 && hour < 17)
        return { text: 'Good afternoon', key: 'greeting-day' } as const;
    if (hour >= 17 && hour < 22)
        return { text: 'Good evening', key: 'greeting-evening' } as const;
    return { text: 'Good night', key: 'greeting-night' } as const;
}

export function ListsHeader({ email, onPressAccount }: ListsHeaderProps) {
    const avatarRef = useRef<View>(null);
    const { width: windowWidth } = useWindowDimensions();
    const initial = email?.trim().charAt(0).toUpperCase() || 'M';
    const greeting = getGreeting(new Date().getHours());

    const handlePressAccount = () => {
        avatarRef.current?.measureInWindow((x, y, width, height) => {
            onPressAccount({
                top: y + height + spacing.xs,
                right: Math.max(spacing.lg, windowWidth - x - width),
            });
        });
    };

    return (
        <View style={styles.container}>
            <Illustration
                accessibilityLabel="Greeting illustration"
                illustrationKey={greeting.key}
                style={styles.illustration}
            />
            <Text
                accessibilityRole="header"
                numberOfLines={1}
                style={styles.greeting}
            >
                {greeting.text}
            </Text>
            <Pressable
                ref={avatarRef}
                accessibilityLabel="Open account menu"
                accessibilityRole="button"
                onPress={handlePressAccount}
                style={styles.avatar}
            >
                <Text style={styles.avatarText}>{initial}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    illustration: {
        width: 48,
        height: 48,
    },
    greeting: {
        ...typography.sheetTitle,
        color: semanticColors.content.primary,
        flex: 1,
        fontWeight: '600',
    },
    avatar: {
        width: controlDimensions.touchTarget,
        height: controlDimensions.touchTarget,
        borderRadius: controlDimensions.touchTarget / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: semanticColors.control.secondary,
    },
    avatarText: {
        ...typography.button,
        color: semanticColors.control.secondaryText,
        fontWeight: '700',
    },
});
