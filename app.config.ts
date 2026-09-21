import type { ExpoConfig } from 'expo/config';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'Local';

const appVersion = '1.0.0';

const defaultVersionCodes = {
    Local: 100,
    Dev: 200,
    Prod: 300,
} as const;

const defaultVersionCode =
    defaultVersionCodes[appEnv as keyof typeof defaultVersionCodes] ?? 100;

const versionCode = Number(process.env.APP_BUILD_NUMBER ?? defaultVersionCode);

const config: ExpoConfig = {
    name: `SL-${appEnv}-${versionCode}-v${appVersion}`,
    slug: 'shopping-list',
    version: appVersion,
    orientation: 'portrait',

    icon: './assets/images/icon.png',

    scheme: 'shoppinglist',

    userInterfaceStyle: 'automatic',

    extra: {
        appEnv,
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabasePublishableKey:
            process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    },

    ios: {
        icon: './assets/expo.icon',
    },

    android: {
        versionCode,

        adaptiveIcon: {
            backgroundColor: '#E6F4FE',
            foregroundImage: './assets/images/android-icon-foreground.png',
            backgroundImage: './assets/images/android-icon-background.png',
            monochromeImage: './assets/images/android-icon-monochrome.png',
        },

        predictiveBackGestureEnabled: false,

        package:
            appEnv === 'Local'
                ? 'com.anonymous.shoppinglist.local'
                : appEnv === 'Dev'
                  ? 'com.anonymous.shoppinglist.dev'
                  : 'com.anonymous.shoppinglist',
    },

    web: {
        output: 'static',
        favicon: './assets/images/favicon.png',
    },

    plugins: [
        'expo-router',
        'expo-sqlite',
        [
            'expo-splash-screen',
            {
                backgroundColor: '#208AEF',
                image: './assets/images/splash-icon.png',
                imageWidth: 76,
            },
        ],
    ],

    experiments: {
        typedRoutes: true,
        reactCompiler: true,
    },
};

export default config;
