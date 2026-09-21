import { router } from 'expo-router';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
} from 'react-native';

import { CreateList } from '@/components/lists/CreateList';
import { ListCard } from '@/components/lists/ListCard';
import { useList } from '@/hooks/useList';
import { useAuth } from '@/providers/AuthProvider';

export default function ListsScreen() {
    const { lists, isListsLoading, listsError } = useList();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

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

            <Pressable style={styles.logoutButton} onPress={handleSignOut}>
                <Text style={styles.logoutButtonText}>Log out</Text>
            </Pressable>
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

    logoutButton: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D32F2F',
        alignItems: 'center',
    },

    logoutButtonText: {
        color: '#D32F2F',
        fontSize: 16,
        fontWeight: '600',
    },
});
