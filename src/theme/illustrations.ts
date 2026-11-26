import type { ImageSourcePropType } from 'react-native';

export type IllustrationStyle = 'clean' | 'cozy';

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
    | 'unavailable';

type StyledIllustrations = Record<IllustrationStyle, ImageSourcePropType>;

export const noImageIllustration = require('../../assets/images/illustrations/no-image.png');

export const illustrationCatalog = {
    'no-items': {
        clean: require('../../assets/images/illustrations/empty/no-items-clean.png'),
        cozy: require('../../assets/images/illustrations/empty/no-items-cozy.png'),
    },
    'no-lists': {
        clean: require('../../assets/images/illustrations/empty/no-lists-clean.png'),
        cozy: require('../../assets/images/illustrations/empty/no-lists-cozy.png'),
    },
    'no-shared-lists': {
        clean: require('../../assets/images/illustrations/empty/no-shared-lists-clean.png'),
        cozy: require('../../assets/images/illustrations/empty/no-shared-lists-cozy.png'),
    },
    'basket-empty': {
        clean: require('../../assets/images/illustrations/progress/basket-empty-clean.png'),
        cozy: require('../../assets/images/illustrations/progress/basket-empty-cozy.png'),
    },
    'basket-partial': {
        clean: require('../../assets/images/illustrations/progress/basket-partial-clean.png'),
        cozy: require('../../assets/images/illustrations/progress/basket-partial-cozy.png'),
    },
    'basket-filled': {
        clean: require('../../assets/images/illustrations/progress/basket-filled-clean.png'),
        cozy: require('../../assets/images/illustrations/progress/basket-filled-cozy.png'),
    },
    'basket-complete': {
        clean: require('../../assets/images/illustrations/progress/basket-complete-clean.png'),
        cozy: require('../../assets/images/illustrations/progress/basket-complete-cozy.png'),
    },
    error: {
        clean: require('../../assets/images/illustrations/states/error-clean.png'),
        cozy: require('../../assets/images/illustrations/states/error-cozy.png'),
    },
    offline: {
        clean: require('../../assets/images/illustrations/states/offline-clean.png'),
        cozy: require('../../assets/images/illustrations/states/offline-cozy.png'),
    },
    unavailable: {
        clean: require('../../assets/images/illustrations/states/unavailable-clean.png'),
        cozy: require('../../assets/images/illustrations/states/unavailable-cozy.png'),
    },
} as const satisfies Record<IllustrationKey, StyledIllustrations>;

export function getIllustrationSource(
    key: IllustrationKey,
    style: IllustrationStyle
): ImageSourcePropType {
    return illustrationCatalog[key][style];
}
