import { Redirect } from 'expo-router';

// Expo Router resolves the group's index route on a cold start. Keep the
// authenticated landing route explicit so the placeholder screen is never shown.
export default function AuthenticatedIndexRoute() {
    return <Redirect href="/lists" />;
}
