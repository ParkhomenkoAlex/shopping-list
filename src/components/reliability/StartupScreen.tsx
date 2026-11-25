import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type StartupScreenProps = {
    error?: boolean;
    onRetry?: () => void;
};

export function StartupScreen({ error = false, onRetry }: StartupScreenProps) {
    return (
        <View style={styles.container} accessibilityRole="progressbar">
            {error ? (
                <>
                    <Text style={styles.title}>Unable to start the app</Text>
                    <Text style={styles.message}>
                        Check your internet connection and try again.
                    </Text>
                    <Pressable style={styles.button} onPress={onRetry}>
                        <Text style={styles.buttonText}>Retry</Text>
                    </Pressable>
                </>
            ) : (
                <>
                    <ActivityIndicator size="large" color="#208AEF" />
                    <Text style={styles.message}>Starting app…</Text>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 22,
    },
    button: {
        marginTop: 24,
        backgroundColor: '#208AEF',
        borderRadius: 8,
        paddingHorizontal: 22,
        paddingVertical: 12,
    },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
