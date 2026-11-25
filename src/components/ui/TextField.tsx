import { forwardRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    type StyleProp,
    type TextStyle,
    type TextInputProps,
} from 'react-native';

import {
    borders,
    controlDimensions,
    radii,
    spacing,
    typography,
} from '@/theme/tokens';
import { semanticColors } from '@/theme/semantic';

export type TextFieldProps = Omit<
    TextInputProps,
    'accessibilityLabel' | 'style'
> & {
    label?: string;
    error?: string;
    helperText?: string;
    disabled?: boolean;
    accessibilityLabel?: string;
    inputStyle?: StyleProp<TextStyle>;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
    function TextField(
        {
            label,
            error,
            helperText,
            disabled = false,
            editable = true,
            accessibilityLabel,
            inputStyle,
            onBlur,
            onFocus,
            accessibilityState,
            ...inputProps
        },
        ref
    ) {
        const [isFocused, setIsFocused] = useState(false);
        const isDisabled = disabled || editable === false;
        const supportingText = error ?? helperText;

        return (
            <View style={styles.container}>
                {label && <Text style={styles.label}>{label}</Text>}
                <TextInput
                    {...inputProps}
                    ref={ref}
                    accessibilityLabel={accessibilityLabel ?? label}
                    accessibilityState={{
                        ...accessibilityState,
                        disabled: isDisabled,
                    }}
                    editable={!isDisabled}
                    onBlur={(event) => {
                        setIsFocused(false);
                        onBlur?.(event);
                    }}
                    onFocus={(event) => {
                        setIsFocused(true);
                        onFocus?.(event);
                    }}
                    placeholderTextColor={semanticColors.content.muted}
                    style={[
                        styles.input,
                        isFocused && styles.focused,
                        Boolean(error) && styles.inputError,
                        isDisabled && styles.disabled,
                        inputStyle,
                    ]}
                />
                {supportingText && (
                    <Text
                        accessibilityLiveRegion={error ? 'polite' : 'none'}
                        style={error ? styles.error : styles.helperText}
                    >
                        {supportingText}
                    </Text>
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        gap: spacing.xs,
    },
    label: {
        ...typography.sectionLabel,
        color: semanticColors.content.primary,
    },
    input: {
        minHeight: controlDimensions.inputMinHeight,
        borderWidth: borders.regular,
        borderColor: semanticColors.border.strong,
        borderRadius: radii.control,
        backgroundColor: semanticColors.screen.surface,
        color: semanticColors.content.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        ...typography.body,
    },
    inputError: {
        borderColor: semanticColors.feedback.error,
    },
    focused: {
        borderColor: semanticColors.control.focusRing,
    },
    disabled: {
        backgroundColor: semanticColors.control.disabled,
        opacity: 0.65,
    },
    helperText: {
        ...typography.supporting,
        color: semanticColors.content.secondary,
    },
    error: {
        ...typography.supporting,
        color: semanticColors.feedback.error,
    },
});
