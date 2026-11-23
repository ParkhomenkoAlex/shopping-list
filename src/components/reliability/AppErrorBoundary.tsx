import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { reportError } from '@/lib/Monitoring';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        reportError(error, 'react_error_boundary');
        // Component stacks can contain screen names but are not displayed or sent as user data.
        void info;
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Что-то пошло не так</Text>
                <Text style={styles.message}>
                    Попробуйте открыть экран ещё раз.
                </Text>
                <Pressable
                    style={styles.button}
                    onPress={() => this.setState({ hasError: false })}
                >
                    <Text style={styles.buttonText}>Повторить</Text>
                </Pressable>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FFFFFF',
    },
    title: { fontSize: 22, fontWeight: '600' },
    message: { marginTop: 12, color: '#666666', textAlign: 'center' },
    button: {
        marginTop: 24,
        backgroundColor: '#208AEF',
        borderRadius: 8,
        paddingHorizontal: 22,
        paddingVertical: 12,
    },
    buttonText: { color: '#FFFFFF', fontWeight: '600' },
});
