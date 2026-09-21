import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';

export default function AuthScreen() {
    const { signIn, signUp, isLoading } = useAuth();

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const normalizedEmail = email.trim();

        if (!normalizedEmail || !password) {
            setError('Email and password are required.');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            if (isRegistering) {
                await signUp(normalizedEmail, password);
            } else {
                await signIn(normalizedEmail, password);
            }
        } catch (error) {
            setError(
                error instanceof Error ? error.message : 'Something went wrong.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleMode = () => {
        setIsRegistering((currentMode) => !currentMode);
        setError(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {isRegistering ? 'Create account' : 'Sign in'}
            </Text>

            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isSubmitting && !isLoading}
            />

            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                editable={!isSubmitting && !isLoading}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
                style={[
                    styles.submitButton,
                    (isSubmitting || isLoading) && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || isLoading}
            >
                <Text style={styles.submitButtonText}>
                    {isSubmitting
                        ? 'Please wait...'
                        : isRegistering
                          ? 'Register'
                          : 'Sign in'}
                </Text>
            </Pressable>

            <Pressable
                style={styles.switchButton}
                onPress={handleToggleMode}
                disabled={isSubmitting || isLoading}
            >
                <Text style={styles.switchButtonText}>
                    {isRegistering
                        ? 'Already have an account? Sign in'
                        : 'Need an account? Register'}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },

    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 24,
    },

    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 12,
    },

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },

    submitButton: {
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#208AEF',
        alignItems: 'center',
    },

    disabledButton: {
        opacity: 0.5,
    },

    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    switchButton: {
        alignItems: 'center',
        marginTop: 20,
    },

    switchButtonText: {
        color: '#208AEF',
        fontSize: 16,
    },
});
