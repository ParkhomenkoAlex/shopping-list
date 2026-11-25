import type { ViewStyle } from 'react-native';

export const colors = {
    canvas: '#E9EAF3',
    background: '#F6F7FC',
    surface: '#FFFFFF',
    textPrimary: '#20243A',
    textSecondary: '#62677E',
    textMuted: '#74788D',
    border: '#E8E9F1',
    borderStrong: '#DCDFEA',
    borderSubtle: '#EFF0F5',
    primary: '#585BD6',
    primaryStrong: '#4548B8',
    primarySubtle: '#E6E9FF',
    warningSurface: '#FFF1D8',
    danger: '#C93649',
    scrim: '#20243A66',
    white: '#FFFFFF',
} as const;

export const spacing = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 32,
    huge: 40,
} as const;

export const radii = {
    swatch: 10,
    control: 12,
    button: 14,
    card: 17,
    authLogo: 24,
    sheet: 25,
} as const;

export const borders = {
    hairline: 1,
    regular: 1,
    selected: 2,
    focus: 2,
} as const;

export const typography = {
    screenTitle: {
        fontSize: 30,
        lineHeight: 36,
        fontWeight: '700',
    },
    dialogTitle: {
        fontSize: 25,
        lineHeight: 32,
        fontWeight: '700',
    },
    sheetTitle: {
        fontSize: 21,
        lineHeight: 28,
        fontWeight: '700',
    },
    body: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '400',
    },
    button: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '600',
    },
    sectionLabel: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    supporting: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '400',
    },
    caption: {
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '400',
    },
} as const;

export const iconSizes = {
    list: 24,
    action: 20,
    compactAction: 19,
} as const;

export const controlDimensions = {
    touchTarget: 44,
    inputMinHeight: 48,
    iconTile: 44,
    checkbox: 24,
    progressHeight: 5,
} as const;

export const elevation = {
    card: {
        elevation: 1,
        shadowColor: '#252638',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    floating: {
        elevation: 4,
        shadowColor: '#252638',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
    },
} as const satisfies Record<string, ViewStyle>;
