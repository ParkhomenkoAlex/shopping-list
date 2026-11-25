import { colors } from '@/theme/tokens';

export const semanticColors = {
    screen: {
        background: colors.background,
        surface: colors.surface,
        overlay: colors.scrim,
    },
    content: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
        muted: colors.textMuted,
        onPrimary: colors.white,
    },
    control: {
        primary: colors.primary,
        primaryPressed: colors.primaryStrong,
        secondary: colors.primarySubtle,
        secondaryText: colors.primaryStrong,
        disabled: colors.border,
        focusRing: colors.primary,
    },
    feedback: {
        error: colors.danger,
        errorSurface: '#FBE7EA',
        warning: '#7A5200',
        warningSurface: colors.warningSurface,
        success: '#21866B',
        successSurface: '#D9F2E8',
    },
    border: {
        default: colors.border,
        strong: colors.borderStrong,
        subtle: colors.borderSubtle,
    },
} as const;
