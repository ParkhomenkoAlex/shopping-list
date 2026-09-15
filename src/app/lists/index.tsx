import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CreateList } from '@/components/lists/CreateList';
import { ListCard } from '@/components/lists/ListCard';
import { useLists } from '@/hooks/useLists';

export default function ListsScreen() {
    const { lists, isLoading, error } = useLists();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Lists</Text>

            {isLoading && <ActivityIndicator />}

            {error && <Text style={styles.error}>{error.message}</Text>}

            {!isLoading &&
                !error &&
                lists.map((list) => (
                    <ListCard
                        key={list.id}
                        list={list}
                        onPress={() =>
                            router.push({
                                pathname: '/lists/[id]',
                                params: {
                                    id: list.id,
                                },
                            })
                        }
                    />
                ))}

            {!isLoading && !error && lists.length === 0 && (
                <Text style={styles.empty}>No lists yet.</Text>
            )}

            <CreateList />
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

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },

    empty: {
        color: '#666666',
        marginBottom: 16,
    },
});
