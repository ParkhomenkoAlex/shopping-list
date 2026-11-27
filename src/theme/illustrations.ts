import type { ImageSourcePropType } from 'react-native';

import type { ListIconKey } from '@/theme/listAppearance';

export type IllustrationStyle = 'clean' | 'cozy';
export type IllustrationSet = 'basket' | 'meerkat';

export type IllustrationKey =
    | 'no-items'
    | 'no-lists'
    | 'no-shared-lists'
    | 'basket-empty'
    | 'basket-partial'
    | 'basket-filled'
    | 'basket-complete'
    | 'error'
    | 'offline'
    | 'unavailable'
    | 'greeting-morning'
    | 'greeting-day'
    | 'greeting-evening'
    | 'greeting-night';

export type ListIllustrationKey =
    | 'essentials'
    | 'events'
    | 'general'
    | 'home'
    | 'plans'
    | 'shopping'
    | 'travel'
    | 'wishlist';

type StyledIllustrations = Record<IllustrationStyle, ImageSourcePropType>;

export const noImageIllustration = require('../../assets/images/illustrations/no-image.png');

export const illustrationCatalog = {
    basket: {
        'no-items': {
            clean: require('../../assets/images/illustrations/basket-set/empty/no-items-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/empty/no-items-cozy.png'),
        },
        'no-lists': {
            clean: require('../../assets/images/illustrations/basket-set/empty/no-lists-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/empty/no-lists-cozy.png'),
        },
        'no-shared-lists': {
            clean: require('../../assets/images/illustrations/basket-set/empty/no-shared-lists-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/empty/no-shared-lists-cozy.png'),
        },
        'basket-empty': {
            clean: require('../../assets/images/illustrations/basket-set/progress/basket-empty-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/progress/basket-empty-cozy.png'),
        },
        'basket-partial': {
            clean: require('../../assets/images/illustrations/basket-set/progress/basket-partial-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/progress/basket-partial-cozy.png'),
        },
        'basket-filled': {
            clean: require('../../assets/images/illustrations/basket-set/progress/basket-filled-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/progress/basket-filled-cozy.png'),
        },
        'basket-complete': {
            clean: require('../../assets/images/illustrations/basket-set/progress/basket-complete-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/progress/basket-complete-cozy.png'),
        },
        error: {
            clean: require('../../assets/images/illustrations/basket-set/states/error-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/states/error-cozy.png'),
        },
        offline: {
            clean: require('../../assets/images/illustrations/basket-set/states/offline-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/states/offline-cozy.png'),
        },
        unavailable: {
            clean: require('../../assets/images/illustrations/basket-set/states/unavailable-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/states/unavailable-cozy.png'),
        },
        'greeting-morning': {
            clean: require('../../assets/images/illustrations/basket-set/greetings/morning-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/greetings/morning-cozy.png'),
        },
        'greeting-day': {
            clean: require('../../assets/images/illustrations/basket-set/greetings/day-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/greetings/day-cozy.png'),
        },
        'greeting-evening': {
            clean: require('../../assets/images/illustrations/basket-set/greetings/evening-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/greetings/evening-cozy.png'),
        },
        'greeting-night': {
            clean: require('../../assets/images/illustrations/basket-set/greetings/night-clean.png'),
            cozy: require('../../assets/images/illustrations/basket-set/greetings/night-cozy.png'),
        },
    },
    meerkat: {
        'no-items': {
            clean: require('../../assets/images/illustrations/meerkat-set/empty/no-items-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/empty/no-items-cozy.png'),
        },
        'no-lists': {
            clean: require('../../assets/images/illustrations/meerkat-set/empty/no-lists-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/empty/no-lists-cozy.png'),
        },
        'no-shared-lists': {
            clean: require('../../assets/images/illustrations/meerkat-set/empty/no-shared-lists-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/empty/no-shared-lists-cozy.png'),
        },
        'basket-empty': {
            clean: require('../../assets/images/illustrations/meerkat-set/progress/basket-empty-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/progress/basket-empty-cozy.png'),
        },
        'basket-partial': {
            clean: require('../../assets/images/illustrations/meerkat-set/progress/basket-partial-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/progress/basket-partial-cozy.png'),
        },
        'basket-filled': {
            clean: require('../../assets/images/illustrations/meerkat-set/progress/basket-filled-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/progress/basket-filled-cozy.png'),
        },
        'basket-complete': {
            clean: require('../../assets/images/illustrations/meerkat-set/progress/basket-complete-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/progress/basket-complete-cozy.png'),
        },
        error: {
            clean: require('../../assets/images/illustrations/meerkat-set/states/error-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/states/error-cozy.png'),
        },
        offline: {
            clean: require('../../assets/images/illustrations/meerkat-set/states/offline-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/states/offline-cozy.png'),
        },
        unavailable: {
            clean: require('../../assets/images/illustrations/meerkat-set/states/unavailable-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/states/unavailable-cozy.png'),
        },
        'greeting-morning': {
            clean: require('../../assets/images/illustrations/meerkat-set/greetings/morning-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/greetings/morning-cozy.png'),
        },
        'greeting-day': {
            clean: require('../../assets/images/illustrations/meerkat-set/greetings/day-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/greetings/day-cozy.png'),
        },
        'greeting-evening': {
            clean: require('../../assets/images/illustrations/meerkat-set/greetings/evening-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/greetings/evening-cozy.png'),
        },
        'greeting-night': {
            clean: require('../../assets/images/illustrations/meerkat-set/greetings/night-clean.png'),
            cozy: require('../../assets/images/illustrations/meerkat-set/greetings/night-cozy.png'),
        },
    },
} as const satisfies Record<
    IllustrationSet,
    Record<IllustrationKey, StyledIllustrations>
>;

const listIllustrationCatalog = {
    basket: {
        essentials: require('../../assets/images/illustrations/basket-set/lists/essentials.png'),
        events: require('../../assets/images/illustrations/basket-set/lists/events.png'),
        general: require('../../assets/images/illustrations/basket-set/lists/general.png'),
        home: require('../../assets/images/illustrations/basket-set/lists/home.png'),
        plans: require('../../assets/images/illustrations/basket-set/lists/plans.png'),
        shopping: require('../../assets/images/illustrations/basket-set/lists/shopping.png'),
        travel: require('../../assets/images/illustrations/basket-set/lists/travel.png'),
        wishlist: require('../../assets/images/illustrations/basket-set/lists/wishlist.png'),
    },
    meerkat: {
        essentials: require('../../assets/images/illustrations/meerkat-set/lists/essentials.png'),
        events: require('../../assets/images/illustrations/meerkat-set/lists/events.png'),
        general: require('../../assets/images/illustrations/meerkat-set/lists/general.png'),
        home: require('../../assets/images/illustrations/meerkat-set/lists/home.png'),
        plans: require('../../assets/images/illustrations/meerkat-set/lists/plans.png'),
        shopping: require('../../assets/images/illustrations/meerkat-set/lists/shopping.png'),
        travel: require('../../assets/images/illustrations/meerkat-set/lists/travel.png'),
        wishlist: require('../../assets/images/illustrations/meerkat-set/lists/wishlist.png'),
    },
} as const satisfies Record<
    IllustrationSet,
    Record<ListIllustrationKey, ImageSourcePropType>
>;

const listIllustrationKeys = {
    groceries: 'shopping',
    home: 'home',
    favorites: 'wishlist',
    produce: 'essentials',
    gifts: 'events',
    cafe: 'general',
    travel: 'travel',
    work: 'plans',
} as const satisfies Record<ListIconKey, ListIllustrationKey>;

export function getIllustrationSource(
    key: IllustrationKey,
    style: IllustrationStyle,
    set: IllustrationSet = 'basket'
): ImageSourcePropType {
    return illustrationCatalog[set][key][style];
}

export function getListIllustrationSource(
    key: ListIconKey,
    set: IllustrationSet
): ImageSourcePropType {
    return listIllustrationCatalog[set][listIllustrationKeys[key]];
}
