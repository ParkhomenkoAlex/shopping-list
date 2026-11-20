import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

type AppExtra = {
    appEnv?: string;
    sentryDsn?: string;
};

const extra = Constants.expoConfig?.extra as AppExtra | undefined;
const appEnv = extra?.appEnv ?? 'Local';
const version = Constants.expoConfig?.version ?? 'unknown';
const build = String(Constants.expoConfig?.android?.versionCode ?? 'unknown');
const dsn = extra?.sentryDsn;

Sentry.init({
    dsn,
    enabled: Boolean(dsn),
    environment: appEnv.toLowerCase(),
    release: `shopping-list@${version}`,
    dist: build,
    sendDefaultPii: false,
    attachScreenshot: false,
    attachViewHierarchy: false,
    enableCaptureFailedRequests: false,
    tracesSampleRate: 0,
    beforeSend(event) {
        // This app never sends request bodies, auth headers, user details, or UI captures.
        delete event.user;
        delete event.request;
        return event;
    },
});

Sentry.setTags({ app_env: appEnv, app_version: version, android_build: build });

export function addMonitoringBreadcrumb(
    message: string,
    data?: Record<string, string | number | boolean>
) {
    Sentry.addBreadcrumb({
        category: 'app.lifecycle',
        level: 'info',
        message,
        data,
    });
}

export function reportError(error: unknown, context?: string) {
    Sentry.withScope((scope) => {
        if (context) scope.setTag('error_context', context);
        Sentry.captureException(error);
    });
}

export function isMonitoringEnabled() {
    return Boolean(dsn);
}
