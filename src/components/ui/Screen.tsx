import type { PropsWithChildren } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing } from '@/theme/tokens';
import { semanticColors } from '@/theme/semantic';

export type ScreenProps = PropsWithChildren<{
    scrollable?: boolean;
    padded?: boolean;
    edges?: readonly Edge[];
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({
    children,
    scrollable = false,
    padded = true,
    edges,
    style,
    contentContainerStyle,
}: ScreenProps) {
    const contentStyle = [padded && styles.padded, contentContainerStyle];

    return (
        <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
            {scrollable ? (
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, contentStyle]}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.content, contentStyle]}>{children}</View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: semanticColors.screen.background,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    padded: {
        padding: spacing.lg,
    },
});
