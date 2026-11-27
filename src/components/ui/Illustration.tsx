import { Image, type ImageStyle, type StyleProp } from 'react-native';

import { useIllustrationStyle } from '@/providers/IllustrationStyleProvider';
import {
    getIllustrationSource,
    getListIllustrationSource,
    noImageIllustration,
    type IllustrationKey,
} from '@/theme/illustrations';

import type { ListIconKey } from '@/theme/listAppearance';

type IllustrationProps = {
    listIconKey?: ListIconKey;
    illustrationKey?: IllustrationKey;
    accessibilityLabel: string;
    style: StyleProp<ImageStyle>;
};

export function Illustration({
    illustrationKey,
    listIconKey,
    accessibilityLabel,
    style,
}: IllustrationProps) {
    const { illustrationStyle, illustrationSet } = useIllustrationStyle();
    const source = illustrationKey
        ? getIllustrationSource(
              illustrationKey,
              illustrationStyle,
              illustrationSet
          )
        : listIconKey
          ? getListIllustrationSource(listIconKey, illustrationSet)
          : noImageIllustration;

    return (
        <Image
            accessibilityLabel={accessibilityLabel}
            resizeMode="contain"
            source={source}
            style={style}
        />
    );
}
