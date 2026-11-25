import type { ReactNode } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
    type PressableProps,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';

import { controlDimensions, radii, spacing, typography } from '@/theme/tokens';
import { semanticColors } from '@/theme/semantic';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'icon';

export type ButtonProps = Omit<
    PressableProps,
    'accessibilityRole' | 'children' | 'disabled' | 'style'
> & {
    label: string;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
};

/**
 * A presentational control. Feature-level mutation guards remain responsible for
 * preventing duplicate business operations; this component only blocks presses
 * while it is disabled or loading.
 */
export function Button({
    label,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
    accessibilityLabel,
    accessibilityState,
    ...pressableProps
}: ButtonProps) {
    const isDisabled = disabled || loading;
    const isIconOnly = variant === 'icon' && Boolean(icon);
    const indicatorColor = {
        primary: semanticColors.content.onPrimary,
        secondary: semanticColors.control.primary,
        destructive: semanticColors.feedback.error,
        icon: semanticColors.control.secondaryText,
    }[variant];
    const variantStyle = {
        primary: styles.primary,
        secondary: styles.secondary,
        destructive: styles.destructive,
        icon: styles.icon,
    }[variant];
    const variantTextStyle = {
        primary: styles.primaryText,
        secondary: styles.secondaryText,
        destructive: styles.destructiveText,
        icon: styles.iconText,
    }[variant];

    return (
        <Pressable
            {...pressableProps}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityRole="button"
            accessibilityState={{
                ...accessibilityState,
                disabled: isDisabled,
                busy: loading,
            }}
            disabled={isDisabled}
            style={({ pressed }) => [
                styles.base,
                variantStyle,
                isIconOnly && styles.iconOnly,
                isDisabled && styles.disabled,
                pressed && !isDisabled && styles.pressed,
                style,
            ]}
        >
            <View style={[styles.content, loading && styles.loadingContent]}>
                {icon}
                {!isIconOnly && (
                    <Text style={[styles.text, variantTextStyle, textStyle]}>
                        {label}
                    </Text>
                )}
            </View>
            {loading && (
                <View pointerEvents="none" style={styles.loader}>
                    <ActivityIndicator size="small" color={indicatorColor} />
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        position: 'relative',
        minHeight: controlDimensions.touchTarget,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
        borderRadius: radii.button,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    primary: {
        backgroundColor: semanticColors.control.primary,
    },
    secondary: {
        backgroundColor: semanticColors.control.secondary,
    },
    destructive: {
        backgroundColor: semanticColors.feedback.errorSurface,
    },
    icon: {
        backgroundColor: semanticColors.control.secondary,
        paddingHorizontal: 0,
    },
    iconOnly: {
        width: controlDimensions.touchTarget,
        paddingHorizontal: 0,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    loadingContent: {
        opacity: 0,
    },
    loader: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        opacity: 0.86,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...typography.button,
    },
    primaryText: {
        color: semanticColors.content.onPrimary,
    },
    secondaryText: {
        color: semanticColors.control.secondaryText,
    },
    destructiveText: {
        color: semanticColors.feedback.error,
    },
    iconText: {
        color: semanticColors.control.secondaryText,
    },
});
