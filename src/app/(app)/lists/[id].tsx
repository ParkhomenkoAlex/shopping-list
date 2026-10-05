import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { ListItems } from '@/components/items/ListItems';
import { EditListModal } from '@/components/lists/EditListModal';
import { ListActionsModal } from '@/components/lists/ListActionsModal';
import { ListHeader, type MenuAnchor } from '@/components/lists/ListHeader';
import { ListSharingModal } from '@/components/lists/ListSharingModal';
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
        memberRole,
        isListLoading,
        listError,
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
        <View style={styles.container}>
            {isListLoading && (
                <View style={styles.loading}>
                    <ActivityIndicator />
                </View>
            )}

            {listError && <Text style={styles.error}>{listError.message}</Text>}

            {deleteListError && (
                <Text style={styles.error}>{deleteListError.message}</Text>
            )}

            {!isListLoading && !listError && list && (
                <>
                    <ListHeader list={list} onMenuPress={handleOpenActions} />

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
        </View>
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
});
