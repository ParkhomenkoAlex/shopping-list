import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useList } from '@/hooks/useList';

export default function ListDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { list, isLoading, error } = useList(id);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>List Details</Text>

            {isLoading && <ActivityIndicator />}

            {error && <Text style={styles.error}>{error.message}</Text>}

            {list && <Text style={styles.listName}>{list.name}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },

    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 24,
    },

    listName: {
        fontSize: 22,
    },

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },
});
