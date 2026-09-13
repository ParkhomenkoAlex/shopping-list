import Constants from 'expo-constants';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

const appEnv = Constants.expoConfig?.extra?.appEnv ?? 'Unknown';
const appVersion = Constants.expoConfig?.version ?? 'Unknown';

export default function HomeScreen() {
    useEffect(() => {
        const testSupabaseConnection = async () => {
            const { data, error } = await supabase
                .from('lists')
                .select('*');
        };

        testSupabaseConnection();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Shopping List {appEnv} 123
            </Text>

            <Text style={styles.version}>
                Version {appVersion}
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
        marginBottom: 8,
    },

    version: {
        marginBottom: 8,
    },
});