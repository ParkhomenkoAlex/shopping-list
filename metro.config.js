const { getSentryExpoConfig } = require('@sentry/react-native/metro');

// Adds Debug IDs to the JS bundle and source map used by Sentry symbolication.
module.exports = getSentryExpoConfig(__dirname, {
    annotateReactComponents: false,
    includeWebReplay: false,
});
