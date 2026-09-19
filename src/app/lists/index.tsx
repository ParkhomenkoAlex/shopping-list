import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';

import { CreateList } from '@/components/lists/CreateList';
import { ListCard } from '@/components/lists/ListCard';
import { useList } from '@/hooks/useList';

export default function ListsScreen() {
    const { lists, isListsLoading, listsError } = useList();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>My Lists</Text>

            {isListsLoading && <ActivityIndicator />}

            {listsError && (
                <Text style={styles.error}>{listsError.message}</Text>
            )}

            {!isListsLoading &&
                !listsError &&
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

            {!isListsLoading && !listsError && lists.length === 0 && (
                <Text style={styles.empty}>No lists yet.</Text>
            )}

            <CreateList />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
