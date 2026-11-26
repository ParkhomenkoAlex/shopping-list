import { StyleSheet, Text, View } from 'react-native';

import { Illustration } from '@/components/ui/Illustration';
import { Button } from '@/components/ui/Button';
import type { IllustrationKey } from '@/theme/illustrations';
import { semanticColors } from '@/theme/semantic';
import { radii, spacing, typography } from '@/theme/tokens';

type ListsStatePanelProps = {
    illustrationKey: IllustrationKey;
    title: string;
    description: string;
    onRetry?: () => void;
};

export function ListsStatePanel({
    illustrationKey,
    title,
    description,
    onRetry,
}: ListsStatePanelProps) {
    return (
        <View style={styles.container}>
            <Illustration
                accessibilityLabel="State illustration"
                illustrationKey={illustrationKey}
                style={styles.illustration}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            {onRetry && (
                <Button
                    label="Try again"
                    onPress={onRetry}
                    style={styles.button}
                    variant="secondary"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderRadius: radii.card,
        backgroundColor: semanticColors.screen.surface,
        padding: spacing.xl,
    },
    illustration: {
        width: 152,
        height: 132,
        marginBottom: spacing.sm,
    },
    title: {
        ...typography.sheetTitle,
        color: semanticColors.content.primary,
        textAlign: 'center',
    },
    description: {
        ...typography.body,
        color: semanticColors.content.secondary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    button: {
        marginTop: spacing.lg,
    },
});
