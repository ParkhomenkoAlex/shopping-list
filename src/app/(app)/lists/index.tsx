import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

import { AccountMenu } from '@/components/lists/AccountMenu';
import { CreateList } from '@/components/lists/CreateList';
import { ListCard } from '@/components/lists/ListCard';
import { ListFilters, type ListFilter } from '@/components/lists/ListFilters';
import {
    ListsHeader,
    type AccountMenuAnchor,
} from '@/components/lists/ListsHeader';
import { ListsStatePanel } from '@/components/lists/ListsStatePanel';
import { Screen } from '@/components/ui/Screen';
import { useList } from '@/hooks/useList';
import { useAuth } from '@/providers/AuthProvider';
import { semanticColors } from '@/theme/semantic';
import { radii, spacing, typography } from '@/theme/tokens';

export default function ListsScreen() {
    const {
        lists,
        hasListsData,
        isListsLoading,
        listsError,
        refetchLists,
        listMemberships,
        hasListMembershipsData,
        listMembershipsError,
        refetchListMemberships,
    } = useList();
    const { signOut, user } = useAuth();
    const [isAccountMenuVisible, setIsAccountMenuVisible] = useState(false);
    const [accountMenuAnchor, setAccountMenuAnchor] =
        useState<AccountMenuAnchor | null>(null);
    const [selectedListFilter, setSelectedListFilter] =
        useState<ListFilter>('all');
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [signOutError, setSignOutError] = useState<string | null>(null);
    const isSigningOutRef = useRef(false);
    const pendingListNavigationIdsRef = useRef<Set<string>>(new Set());
    const netInfo = useNetInfo();
    const isOffline =
        netInfo.isConnected === false && netInfo.isInternetReachable !== true;
    const isInitialLoading = isListsLoading && !hasListsData;
    const hasInitialError = Boolean(listsError) && !hasListsData;
    const hasRefreshError = Boolean(listsError) && hasListsData;
    const isFiltersAvailable = hasListMembershipsData;
    const isMembershipFilterUnavailable =
        selectedListFilter !== 'all' && !hasListMembershipsData;
    const visibleLists = useMemo(() => {
        if (selectedListFilter === 'all') {
            return lists;
        }

        if (!hasListMembershipsData) {
            return [];
        }

        const membershipRoles = new Map(
            listMemberships.map((membership) => [
                membership.list_id,
                membership.role,
            ])
        );
        const expectedRole = selectedListFilter === 'mine' ? 'owner' : 'member';

        return lists.filter(
            (list) => membershipRoles.get(list.id) === expectedRole
        );
    }, [hasListMembershipsData, listMemberships, lists, selectedListFilter]);

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
            <ListsHeader
                email={user?.email}
                onPressAccount={(anchor) => {
                    setAccountMenuAnchor(anchor);
                    setIsAccountMenuVisible((visible) => !visible);
                }}
            />

            {isInitialLoading && !isOffline && (
                <View accessibilityLiveRegion="polite" style={styles.loading}>
                    <ActivityIndicator
                        accessibilityLabel="Loading lists"
                        color={semanticColors.control.primary}
                    />
                </View>
            )}

            {isOffline && !hasListsData && (
                <ListsStatePanel
                    description="Connect to the internet to load your shopping lists."
                    illustrationKey="offline"
                    title="You're offline"
                    onRetry={() => void refetchLists()}
                />
            )}

            {hasInitialError && !isOffline && (
                <ListsStatePanel
                    description="Something went wrong. Please try again."
                    illustrationKey="error"
                    title="Couldn't load data"
                    onRetry={() => void refetchLists()}
                />
            )}

            {hasRefreshError && (
                <View
                    accessibilityLiveRegion="polite"
                    style={styles.refreshError}
                >
                    <Text style={styles.refreshErrorText}>
                        Couldn&apos;t refresh data. Showing last available data.
                    </Text>
                    <Text
                        accessibilityRole="button"
                        onPress={() => void refetchLists()}
                        style={styles.refreshRetry}
                    >
                        Try again
                    </Text>
                </View>
            )}

            {listMembershipsError && (
                <View
                    accessibilityLiveRegion="polite"
                    style={styles.membershipError}
                >
                    <Text style={styles.refreshErrorText}>
                        {hasListMembershipsData
                            ? "Couldn't refresh list access. Showing last available filters."
                            : "Couldn't load list access. Mine and Shared are unavailable."}
                    </Text>
                    <Text
                        accessibilityRole="button"
                        onPress={() => void refetchListMemberships()}
                        style={styles.refreshRetry}
                    >
                        Try again
                    </Text>
                </View>
            )}

            {isFiltersAvailable ? (
                <View style={styles.listActions}>
                    <ListFilters
                        selectedFilter={selectedListFilter}
                        onSelect={setSelectedListFilter}
                    />
                    <CreateList />
                </View>
            ) : (
                <CreateList />
            )}

            {hasListsData && visibleLists.length > 0 && (
                <View>
                    {visibleLists.map((list) => (
                        <ListCard
                            key={list.id}
                            list={list}
                            onPress={() => handleOpenList(list.id)}
                        />
                    ))}
                </View>
            )}

            {hasListsData &&
                visibleLists.length === 0 &&
                !listsError &&
                !isOffline &&
                !isMembershipFilterUnavailable && (
                    <ListsStatePanel
                        description={
                            selectedListFilter === 'shared'
                                ? 'Lists shared with you will appear here.'
                                : 'Create your first shopping list.'
                        }
                        illustrationKey={
                            selectedListFilter === 'shared'
                                ? 'no-shared-lists'
                                : 'no-lists'
                        }
                        title={
                            selectedListFilter === 'shared'
                                ? 'Better together.'
                                : 'Every shop starts with a list.'
                        }
                    />
                )}

            {signOutError && (
                <Text
                    accessibilityLiveRegion="polite"
                    style={styles.signOutError}
                >
                    {signOutError}
                </Text>
            )}

            <AccountMenu
                anchor={accountMenuAnchor}
                email={user?.email}
                isSigningOut={isSigningOut}
                onClose={() => setIsAccountMenuVisible(false)}
                onSignOut={() => void handleSignOut()}
                visible={isAccountMenuVisible}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: spacing.lg,
    },
    loading: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
    },
    refreshError: {
        borderRadius: radii.control,
        backgroundColor: semanticColors.feedback.warningSurface,
        marginBottom: spacing.md,
        padding: spacing.sm,
    },
    membershipError: {
        borderRadius: radii.control,
        backgroundColor: semanticColors.feedback.warningSurface,
        marginBottom: spacing.md,
        padding: spacing.sm,
    },
    listActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    refreshErrorText: {
        ...typography.supporting,
        color: semanticColors.feedback.warning,
    },
    refreshRetry: {
        ...typography.supporting,
        color: semanticColors.control.secondaryText,
        fontWeight: '700',
        marginTop: spacing.xxs,
    },
    signOutError: {
        ...typography.supporting,
        color: semanticColors.feedback.error,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
});
