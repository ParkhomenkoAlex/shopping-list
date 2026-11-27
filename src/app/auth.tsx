import { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { BuildVersionLabel } from '@/components/BuildVersionLabel';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/providers/AuthProvider';
import { elevation, radii, spacing, typography } from '@/theme/tokens';
import { semanticColors } from '@/theme/semantic';

const groceryBagIllustration = require('../../assets/images/auth-grocery-bag.png');

export default function AuthScreen() {
    const { signIn, signUp, isLoading } = useAuth();

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isFormDisabled = isSubmitting || isLoading;

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

    const handleSelectMode = (nextIsRegistering: boolean) => {
        if (nextIsRegistering === isRegistering) {
            return;
        }

        setIsRegistering(nextIsRegistering);
        setError(null);
    };

    return (
        <Screen edges={['top', 'bottom']} padded={false}>
            <KeyboardAvoidingView
                behavior={Platform.select({
                    ios: 'padding',
                    android: 'height',
                })}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}
                >
                    <View style={styles.content}>
                        <View style={styles.hero}>
                            <Image
                                accessible={false}
                                resizeMode="contain"
                                source={groceryBagIllustration}
                                style={styles.illustration}
                            />
                            <Text
                                accessibilityRole="header"
                                style={styles.brand}
                            >
                                Shopping List
                            </Text>
                            <Text style={styles.tagline}>
                                Plan, shop and share together.
                            </Text>
                        </View>

                        <View style={styles.tabs}>
                            <Button
                                accessibilityState={{
                                    selected: !isRegistering,
                                }}
                                disabled={isFormDisabled}
                                label="Sign in"
                                onPress={() => handleSelectMode(false)}
                                style={[
                                    styles.tab,
                                    !isRegistering && styles.selectedTab,
                                ]}
                                textStyle={[
                                    styles.tabText,
                                    !isRegistering && styles.selectedTabText,
                                ]}
                                variant="secondary"
                            />
                            <Button
                                accessibilityState={{ selected: isRegistering }}
                                disabled={isFormDisabled}
                                label="Register"
                                onPress={() => handleSelectMode(true)}
                                style={[
                                    styles.tab,
                                    isRegistering && styles.selectedTab,
                                ]}
                                textStyle={[
                                    styles.tabText,
                                    isRegistering && styles.selectedTabText,
                                ]}
                                variant="secondary"
                            />
                        </View>

                        <View style={styles.form}>
                            <Text
                                accessibilityRole="header"
                                style={styles.heading}
                            >
                                {isRegistering
                                    ? 'Create account'
                                    : 'Welcome back'}
                            </Text>

                            <TextField
                                autoCapitalize="none"
                                autoCorrect={false}
                                disabled={isFormDisabled}
                                keyboardType="email-address"
                                label="Email"
                                onChangeText={setEmail}
                                placeholder="you@example.com"
                                value={email}
                            />

                            <TextField
                                disabled={isFormDisabled}
                                label="Password"
                                onChangeText={setPassword}
                                placeholder="Your password"
                                secureTextEntry
                                value={password}
                            />

                            {error && (
                                <Text
                                    accessibilityLiveRegion="polite"
                                    style={styles.error}
                                >
                                    {error}
                                </Text>
                            )}

                            <Button
                                disabled={isLoading}
                                label={isRegistering ? 'Register' : 'Sign in'}
                                loading={isSubmitting}
                                onPress={handleSubmit}
                                style={styles.submitButton}
                            />
                        </View>

                        <BuildVersionLabel style={styles.buildVersion} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    content: {
        flexGrow: 1,
    },
    hero: {
        alignItems: 'center',
    },
    illustration: {
        width: '100%',
        height: 208,
        maxWidth: 272,
    },
    brand: {
        ...typography.screenTitle,
        color: semanticColors.content.primary,
        textAlign: 'center',
    },
    tagline: {
        ...typography.body,
        color: semanticColors.content.secondary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    tabs: {
        flexDirection: 'row',
        gap: spacing.xxs,
        marginTop: spacing.lg,
        padding: spacing.xxs,
        borderRadius: radii.button,
        backgroundColor: semanticColors.control.secondary,
    },
    tab: {
        flex: 1,
        minHeight: 44,
        backgroundColor: 'transparent',
    },
    selectedTab: {
        ...elevation.card,
        backgroundColor: semanticColors.screen.surface,
        shadowColor: semanticColors.content.primary,
    },
    tabText: {
        color: semanticColors.control.primary,
    },
    selectedTabText: {
        color: semanticColors.control.secondaryText,
    },
    form: {
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    heading: {
        ...typography.dialogTitle,
        color: semanticColors.content.primary,
        marginTop: spacing.xs,
    },
    error: {
        ...typography.supporting,
        color: semanticColors.feedback.error,
    },
    submitButton: {
        width: '100%',
        marginTop: spacing.xs,
    },
    buildVersion: {
        ...typography.caption,
        alignSelf: 'center',
        color: semanticColors.content.muted,
        marginTop: 'auto',
        paddingTop: spacing.xl,
    },
});
