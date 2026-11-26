import 'expo-sqlite/localStorage/install';
import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from 'react';

import type { IllustrationStyle } from '@/theme/illustrations';

const ILLUSTRATION_STYLE_STORAGE_KEY = 'shopping-list:illustration-style';

type IllustrationStyleContextValue = {
    illustrationStyle: IllustrationStyle;
    setIllustrationStyle: (style: IllustrationStyle) => void;
};

const IllustrationStyleContext = createContext<
    IllustrationStyleContextValue | undefined
>(undefined);

export function IllustrationStyleProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [illustrationStyle, setStyle] = useState<IllustrationStyle>(() => {
        const storedStyle = localStorage.getItem(
            ILLUSTRATION_STYLE_STORAGE_KEY
        );

        if (storedStyle === 'clean' || storedStyle === 'cozy') {
            return storedStyle;
        }

        return 'cozy';
    });

    const setIllustrationStyle = useCallback((style: IllustrationStyle) => {
        setStyle(style);
        localStorage.setItem(ILLUSTRATION_STYLE_STORAGE_KEY, style);
    }, []);

    return (
        <IllustrationStyleContext.Provider
            value={{ illustrationStyle, setIllustrationStyle }}
        >
            {children}
        </IllustrationStyleContext.Provider>
    );
}

export function useIllustrationStyle() {
    const context = useContext(IllustrationStyleContext);

    if (!context) {
        throw new Error(
            'useIllustrationStyle must be used within IllustrationStyleProvider'
        );
    }

    return context;
}
