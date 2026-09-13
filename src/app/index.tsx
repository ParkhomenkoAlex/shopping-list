import Constants from 'expo-constants';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

const appEnv = Constants.expoConfig?.extra?.appEnv ?? 'Unknown';
const appVersion = Constants.expoConfig?.version ?? 'Unknown';
const appBuildNumber =
    Constants.expoConfig?.android?.versionCode ?? 'Unknown';

export default function HomeScreen() {
    useEffect(() => {
        const testSupabaseConnection = async () => {
            const { data, error } = await supabase
                .from('lists')
                .select('*');
        };

        testSupabaseConnection();
    }, []);

    const appBuildInfo =
        `SL-${appEnv}-build-${appBuildNumber}-v${appVersion}`;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Shopping List {appEnv} github + README
            </Text>

            <Text style={styles.version}>
                {appBuildInfo}
            </Text>

            <Text>Our app starts here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontSize: 32,
        fontWeight: '600',
        marginBottom: 16,
    },

    version: {
        marginBottom: 8,
    },
});