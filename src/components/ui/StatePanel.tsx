import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { radii, spacing, typography } from '@/theme/tokens';
import { semanticColors } from '@/theme/semantic';

export type StatePanelState = 'loading' | 'empty' | 'error' | 'offline';

type StatePanelBaseProps = {
    state: StatePanelState;
    title: string;
    description?: string;
    loadingAccessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
};

export type StatePanelProps =
    | (StatePanelBaseProps & {
          onRetry?: undefined;
          retrying?: undefined;
          retryLabel?: undefined;
      })
    | (StatePanelBaseProps & {
          onRetry: () => void;
          retrying?: boolean;
          retryLabel: string;
      });

export function StatePanel({
    state,
    title,
    description,
    onRetry,
    retrying = false,
    retryLabel,
    loadingAccessibilityLabel,
    style,
}: StatePanelProps) {
    const isFeedbackState = state === 'error' || state === 'offline';

    return (
        <View
            accessibilityLiveRegion={isFeedbackState ? 'polite' : 'none'}
            style={[
                styles.container,
                state === 'offline' && styles.offline,
                state === 'error' && styles.error,
                style,
            ]}
        >
            {state === 'loading' && (
                <ActivityIndicator
                    accessibilityLabel={loadingAccessibilityLabel}
                    color={semanticColors.control.primary}
                />
            )}
            <Text style={styles.title}>{title}</Text>
            {description && (
                <Text style={styles.description}>{description}</Text>
            )}
            {onRetry && retryLabel && state !== 'loading' && (
                <Button
                    label={retryLabel}
                    loading={retrying}
                    disabled={retrying}
                    onPress={onRetry}
                    style={styles.retryButton}
                    variant="secondary"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: semanticColors.border.default,
        borderRadius: radii.card,
        backgroundColor: semanticColors.screen.surface,
        padding: spacing.xl,
    },
    offline: {
        borderColor: semanticColors.feedback.warning,
        backgroundColor: semanticColors.feedback.warningSurface,
    },
    error: {
        borderColor: semanticColors.feedback.error,
        backgroundColor: semanticColors.feedback.errorSurface,
    },
    title: {
        ...typography.sheetTitle,
        color: semanticColors.content.primary,
        textAlign: 'center',
    },
    description: {
        ...typography.body,
        color: semanticColors.content.secondary,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: spacing.xs,
    },
});
