import { router } from 'expo-router';
import Constants from 'expo-constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';

const appEnv = Constants.expoConfig?.extra?.appEnv ?? 'Unknown';
const appVersion = Constants.expoConfig?.version ?? 'Unknown';
const appBuild = Constants.expoConfig?.android?.versionCode ?? 'Unknown';

export default function HomeScreen() {
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                SL-{appEnv}-{appBuild}-v{appVersion}
            </Text>

            {user?.email && <Text>{user.email}</Text>}

            <Pressable
                style={styles.button}
                onPress={() => router.push('/lists')}
            >
                <Text style={styles.buttonText}>Our app starts here</Text>
            </Pressable>
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
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 24,
    },

    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#208AEF',
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
