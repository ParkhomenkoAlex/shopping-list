import 'expo-sqlite/localStorage/install';
import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from 'react';

import type { IllustrationSet, IllustrationStyle } from '@/theme/illustrations';

const ILLUSTRATION_SET_STORAGE_KEY = 'shopping-list:illustration-set';
const ILLUSTRATION_STYLE_STORAGE_KEY = 'shopping-list:illustration-style';

type IllustrationStyleContextValue = {
    illustrationSet: IllustrationSet;
    setIllustrationSet: (set: IllustrationSet) => void;
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
    const [illustrationSet, setSet] = useState<IllustrationSet>(() => {
        return localStorage.getItem(ILLUSTRATION_SET_STORAGE_KEY) === 'meerkat'
            ? 'meerkat'
            : 'basket';
    });

    const setIllustrationSet = useCallback((set: IllustrationSet) => {
        setSet(set);
        localStorage.setItem(ILLUSTRATION_SET_STORAGE_KEY, set);
    }, []);

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
            value={{
                illustrationSet,
                setIllustrationSet,
                illustrationStyle,
                setIllustrationStyle,
            }}
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
