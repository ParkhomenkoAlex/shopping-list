import { Image, type ImageStyle, type StyleProp } from 'react-native';

import { useIllustrationStyle } from '@/providers/IllustrationStyleProvider';
import {
    getIllustrationSource,
    noImageIllustration,
    type IllustrationKey,
} from '@/theme/illustrations';

type IllustrationProps = {
    illustrationKey?: IllustrationKey;
    accessibilityLabel: string;
    style: StyleProp<ImageStyle>;
};

export function Illustration({
    illustrationKey,
    accessibilityLabel,
    style,
}: IllustrationProps) {
    const { illustrationStyle } = useIllustrationStyle();
    const source = illustrationKey
        ? getIllustrationSource(illustrationKey, illustrationStyle)
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
