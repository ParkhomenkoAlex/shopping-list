import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/theme/tokens';

export type ListIconKey =
    | 'groceries'
    | 'home'
    | 'favorites'
    | 'produce'
    | 'gifts'
    | 'cafe'
    | 'travel'
    | 'work';

export type ListColorKey =
    'indigo' | 'blue' | 'green' | 'teal' | 'purple' | 'pink' | 'amber' | 'gray';

export type IoniconName = keyof typeof Ionicons.glyphMap;

export type ListColorAppearance = {
    foreground: string;
    background: string;
};

export const DEFAULT_LIST_ICON_KEY: ListIconKey = 'groceries';
export const DEFAULT_LIST_COLOR_KEY: ListColorKey = 'indigo';

export const listIconCatalog = {
    groceries: 'basket-outline',
    home: 'home-outline',
    favorites: 'heart-outline',
    produce: 'leaf-outline',
    gifts: 'gift-outline',
    cafe: 'cafe-outline',
    travel: 'airplane-outline',
    work: 'briefcase-outline',
} as const satisfies Record<ListIconKey, IoniconName>;

export const listColorCatalog = {
    indigo: { foreground: colors.primary, background: colors.primarySubtle },
    blue: { foreground: '#3979C6', background: '#DCEAFF' },
    green: { foreground: '#21866B', background: '#D9F2E8' },
    teal: { foreground: '#298BA8', background: '#DDF1F8' },
    purple: { foreground: '#9061C6', background: '#EDE1FC' },
    pink: { foreground: '#C65C91', background: '#F9E0ED' },
    amber: { foreground: '#D18A25', background: '#FFF0D5' },
    gray: { foreground: '#6B7280', background: '#E9EAF0' },
} as const satisfies Record<ListColorKey, ListColorAppearance>;

export function isListIconKey(value: unknown): value is ListIconKey {
    return (
        typeof value === 'string' &&
        Object.prototype.hasOwnProperty.call(listIconCatalog, value)
    );
}

export function isListColorKey(value: unknown): value is ListColorKey {
    return (
        typeof value === 'string' &&
        Object.prototype.hasOwnProperty.call(listColorCatalog, value)
    );
}

export function getListIconKey(value: unknown): ListIconKey {
    return isListIconKey(value) ? value : DEFAULT_LIST_ICON_KEY;
}

export function getListColorKey(value: unknown): ListColorKey {
    return isListColorKey(value) ? value : DEFAULT_LIST_COLOR_KEY;
}

export function getListAppearance(
    iconKey: unknown,
    colorKey: unknown
): {
    iconKey: ListIconKey;
    colorKey: ListColorKey;
    iconName: IoniconName;
    color: ListColorAppearance;
} {
    const resolvedIconKey = getListIconKey(iconKey);
    const resolvedColorKey = getListColorKey(colorKey);

    return {
        iconKey: resolvedIconKey,
        colorKey: resolvedColorKey,
        iconName: listIconCatalog[resolvedIconKey],
        color: listColorCatalog[resolvedColorKey],
    };
}
