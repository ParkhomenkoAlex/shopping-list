import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

import { ListItems } from '@/components/items/ListItems';
import { EditListModal } from '@/components/lists/EditListModal';
import { ListActionsModal } from '@/components/lists/ListActionsModal';
import { ListHeader, type MenuAnchor } from '@/components/lists/ListHeader';
import { ListSharingModal } from '@/components/lists/ListSharingModal';
import { Screen } from '@/components/ui/Screen';
import { useListDetails } from '@/hooks/useListDetails';
import { useListMembership } from '@/hooks/useListMembership';
import { useAuth } from '@/providers/AuthProvider';

export default function ListDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();

    const [isCreateItemVisible, setIsCreateItemVisible] = useState(false);
    const [isActionsModalVisible, setIsActionsModalVisible] = useState(false);
    const [isSharingModalVisible, setIsSharingModalVisible] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);

    const {
        list,
        hasListData,
        memberRole,
        isListLoading,
        isListPaused,
        isListRefetching,
        listError,
        refetchList,
        isEditListModalVisible,
        editListForm,
        isUpdating,
        updateError,
        isListDeleting,
        deleteListError,
        handleOpenEditListModal,
        handleChangeEditListForm,
        handleCancelEditList,
        handleSaveEditList,
        handleDeleteList,
    } = useListDetails(id);

    const { notifyMembers, isNotifying } = useListMembership(id, user?.id);
    const netInfo = useNetInfo();
    const isOffline =
        netInfo.isConnected === false && netInfo.isInternetReachable !== true;
    const isInitialListLoading = isListLoading && !hasListData && !isListPaused;
    const isInitialListPaused = isListPaused && !hasListData;
    const hasInitialListError = Boolean(listError) && !hasListData;

    const handleBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace('/lists');
    }, []);

    useFocusEffect(
        useCallback(() => {
            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                () => {
                    if (router.canGoBack()) {
                        return false;
                    }

                    handleBack();
                    return true;
                }
            );

            return () => subscription.remove();
        }, [handleBack])
    );

    const handleOpenActions = (anchor: MenuAnchor) => {
        setMenuAnchor(anchor);
        setIsActionsModalVisible(true);
    };

    const handleCloseActions = () => {
        setIsActionsModalVisible(false);
    };

    const handleOpenEdit = () => {
        setIsActionsModalVisible(false);
        handleOpenEditListModal();
    };

    const handleOpenSharing = () => {
        setIsActionsModalVisible(false);
        setIsSharingModalVisible(true);
    };

    const handleNotifyMembers = async () => {
        try {
            const result = await notifyMembers();

            setIsActionsModalVisible(false);

            if (result.notifiedCount > 0) {
                Alert.alert(
                    'Notification sent',
                    `Notification was sent to ${result.notifiedCount} ${
                        result.notifiedCount === 1 ? 'member' : 'members'
                    }.`
                );
                return;
            }

            Alert.alert(
                'No notifications sent',
                'There are no other members with registered push tokens.'
            );
        } catch (error) {
            console.error('Failed to notify members:', error);

            setIsActionsModalVisible(false);

            Alert.alert(
                'Notification failed',
                'Failed to send notifications. Please try again.'
            );
        }
    };

    const handleDelete = () => {
        setIsActionsModalVisible(false);
        handleDeleteList();
    };

    return (
        <Screen
            padded={false}
            edges={['top', 'bottom']}
            style={styles.container}
        >
            {isInitialListLoading && (
                <View style={styles.loading}>
                    <ActivityIndicator />
                </View>
            )}

            {isInitialListPaused && (
                <View style={styles.loadError}>
                    <Text style={styles.offline}>
                        No internet connection. Connect to the internet to load
                        this list.
                    </Text>
                </View>
            )}

            {hasInitialListError && (
                <View style={styles.loadError}>
                    <Text style={styles.error}>
                        {isOffline
                            ? 'No internet connection. Connect to the internet to load this list.'
                            : 'Unable to load this list.'}
                    </Text>
                    <Pressable
                        style={[
                            styles.retryButton,
                            isListRefetching && styles.disabledButton,
                        ]}
                        onPress={() => void refetchList()}
                        disabled={isListRefetching}
                    >
                        {isListRefetching ? (
                            <ActivityIndicator size="small" color="#208AEF" />
                        ) : (
                            <Text style={styles.retry}>Retry</Text>
                        )}
                    </Pressable>
                </View>
            )}

            {deleteListError && (
                <Text style={styles.error}>{deleteListError.message}</Text>
            )}

            {list && (
                <>
                    <ListHeader
                        list={list}
                        onBack={handleBack}
                        onMenuPress={handleOpenActions}
                    />

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <ListItems
                            listId={id}
                            isCreateVisible={isCreateItemVisible}
                            onCloseCreate={() => setIsCreateItemVisible(false)}
                        />
                    </ScrollView>

                    {!isCreateItemVisible && (
                        <Pressable
                            style={styles.addButton}
                            onPress={() => setIsCreateItemVisible(true)}
                        >
                            <Ionicons name="add" size={30} color="#FFFFFF" />
                        </Pressable>
                    )}

                    <ListActionsModal
                        visible={isActionsModalVisible}
                        anchor={menuAnchor}
                        canManageList={memberRole === 'owner'}
                        isNotifying={isNotifying}
                        onEdit={handleOpenEdit}
                        onSharing={handleOpenSharing}
                        onNotify={handleNotifyMembers}
                        onDelete={handleDelete}
                        onClose={handleCloseActions}
                    />

                    <ListSharingModal
                        visible={isSharingModalVisible}
                        listId={id}
                        onClose={() => setIsSharingModalVisible(false)}
                    />
                </>
            )}

            <EditListModal
                visible={isEditListModalVisible}
                form={editListForm}
                isUpdating={isUpdating}
                error={updateError}
                onChange={handleChangeEditListForm}
                onCancel={handleCancelEditList}
                onSubmit={handleSaveEditList}
            />

            {isListDeleting && (
                <View style={styles.deletingOverlay}>
                    <ActivityIndicator size="large" />
                </View>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
        marginTop: 32,
    },
    scrollContent: {
        paddingBottom: 104,
    },
    addButton: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#208AEF',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    deletingOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },
    offline: {
        color: '#7A5200',
        lineHeight: 22,
        textAlign: 'center',
    },
    loadError: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retryButton: {
        minWidth: 100,
        alignItems: 'center',
        paddingVertical: 8,
    },
    retry: {
        color: '#208AEF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
