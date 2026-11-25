import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

import { BuildVersionLabel } from '@/components/BuildVersionLabel';
import { CreateList } from '@/components/lists/CreateList';
import { ListCard } from '@/components/lists/ListCard';
import { Screen } from '@/components/ui/Screen';
import { useList } from '@/hooks/useList';
import { useAuth } from '@/providers/AuthProvider';

export default function ListsScreen() {
    const { lists, hasListsData, isListsLoading, listsError, refetchLists } =
        useList();
    const { signOut, user } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [signOutError, setSignOutError] = useState<string | null>(null);
    const isSigningOutRef = useRef(false);
    const pendingListNavigationIdsRef = useRef<Set<string>>(new Set());
    const netInfo = useNetInfo();
    const isOffline =
        netInfo.isConnected === false && netInfo.isInternetReachable !== true;

    useFocusEffect(
        useCallback(() => {
            pendingListNavigationIdsRef.current.clear();
        }, [])
    );

    const handleOpenList = (listId: string) => {
        if (pendingListNavigationIdsRef.current.has(listId)) {
            return;
        }

        pendingListNavigationIdsRef.current.add(listId);
        router.push({
            pathname: '/lists/[id]',
            params: { id: listId },
        });
    };

    const handleSignOut = async () => {
        if (isSigningOutRef.current) {
            return;
        }

        isSigningOutRef.current = true;
        setSignOutError(null);
        setIsSigningOut(true);

        try {
            await signOut();
        } catch (error) {
            console.error('Failed to sign out:', error);
            setSignOutError('Unable to sign out. Please try again.');
        } finally {
            isSigningOutRef.current = false;
            setIsSigningOut(false);
        }
    };

    return (
        <Screen
            scrollable
            padded={false}
            edges={['top', 'bottom']}
            contentContainerStyle={styles.container}
        >
            <Text accessibilityRole="header" style={styles.title}>
                My Lists
            </Text>
            <View style={styles.metadata}>
                <BuildVersionLabel style={styles.buildVersion} />
                {user?.email && (
                    <Text style={styles.userEmail}>{user.email}</Text>
                )}
            </View>

            {isListsLoading && !hasListsData && <ActivityIndicator />}

            {isOffline && !hasListsData && (
                <Text style={styles.offline}>
                    No internet connection. Connect to the internet to load your
                    lists.
                </Text>
            )}

            {listsError && !isOffline && (
                <>
                    <Text style={styles.error}>Unable to load your lists.</Text>
                    <Pressable onPress={() => void refetchLists()}>
                        <Text style={styles.retry}>Retry</Text>
                    </Pressable>
                </>
            )}

            {!isListsLoading &&
                !listsError &&
                lists.map((list) => (
                    <ListCard
                        key={list.id}
                        list={list}
                        onPress={() => handleOpenList(list.id)}
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

            {signOutError && <Text style={styles.error}>{signOutError}</Text>}

            <Pressable
                style={[
                    styles.logoutButton,
                    isSigningOut && styles.disabledButton,
                ]}
                onPress={() => void handleSignOut()}
                disabled={isSigningOut}
                accessibilityState={{
                    disabled: isSigningOut,
                    busy: isSigningOut,
                }}
            >
                {isSigningOut && (
                    <ActivityIndicator size="small" color="#D32F2F" />
                )}
                <Text style={styles.logoutButtonText}>
                    {isSigningOut ? 'Logging out...' : 'Log out'}
                </Text>
            </Pressable>
        </Screen>
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
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },

    disabledButton: {
        opacity: 0.5,
    },

    logoutButtonText: {
        color: '#D32F2F',
        fontSize: 16,
        fontWeight: '600',
    },
});
