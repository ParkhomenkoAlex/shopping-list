import { router } from 'expo-router';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

import { BuildVersionLabel } from '@/components/BuildVersionLabel';
import { CreateList } from '@/components/lists/CreateList';
import { ListCard } from '@/components/lists/ListCard';
import { useList } from '@/hooks/useList';
import { useAuth } from '@/providers/AuthProvider';

export default function ListsScreen() {
    const { lists, hasListsData, isListsLoading, listsError, refetchLists } =
        useList();
    const { signOut, user } = useAuth();
    const netInfo = useNetInfo();
    const isOffline =
        netInfo.isConnected === false && netInfo.isInternetReachable !== true;

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
            <View style={styles.metadata}>
                <BuildVersionLabel style={styles.buildVersion} />
                {user?.email && (
                    <Text style={styles.userEmail}>{user.email}</Text>
                )}
            </View>

            {isListsLoading && !hasListsData && <ActivityIndicator />}

            {isOffline && !hasListsData && (
                <Text style={styles.offline}>
                    Нет подключения к интернету. Подключитесь к сети, чтобы
                    загрузить списки.
                </Text>
            )}

            {listsError && !isOffline && (
                <>
                    <Text style={styles.error}>
                        Не удалось загрузить списки.
                    </Text>
                    <Pressable onPress={() => void refetchLists()}>
                        <Text style={styles.retry}>Повторить</Text>
                    </Pressable>
                </>
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

            {!isListsLoading &&
                !listsError &&
                !isOffline &&
                hasListsData &&
                lists.length === 0 && (
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
        marginBottom: 4,
    },

    metadata: {
        marginBottom: 24,
    },

    buildVersion: {
        color: '#777777',
        fontSize: 13,
        lineHeight: 18,
    },

    userEmail: {
        color: '#777777',
        fontSize: 13,
        lineHeight: 18,
    },

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },
    retry: {
        color: '#208AEF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },

    offline: {
        color: '#7A5200',
        lineHeight: 22,
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
