import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SharedWithModal } from '@/components/lists/SharedWithModal';
import { useListMembership } from '@/hooks/useListMembership';
import { useAuth } from '@/providers/AuthProvider';
import type { List } from '@/types/List';
import { confirmAction } from '@/utils/confirmation';

type ListHeaderProps = {
    list: List;
    isUpdating: boolean;
    isDeleting: boolean;
    deleteError: Error | null;
    onEdit: () => void;
    onDelete: () => void;
};

export function ListHeader({
    list,
    isUpdating,
    isDeleting,
    deleteError,
    onEdit,
    onDelete,
}: ListHeaderProps) {
    const { user } = useAuth();
    const {
        memberRole,
        sharedMembers,
        removeMember,
        isRemovingMember,
        notifyMembers,
        isNotifying,
        notifyError,
    } = useListMembership(list.id, user?.id);
    const [isSharedWithModalVisible, setIsSharedWithModalVisible] =
        useState(false);
    const [notifySuccessMessage, setNotifySuccessMessage] = useState<
        string | null
    >(null);

    const isOwner = memberRole === 'owner';

    const handleRemoveMember = (userId: string, email: string) => {
        confirmAction({
            title: 'Remove member',
            message: `Are you sure you want to remove "${email}"?`,
            confirmText: 'Remove',
            onConfirm: async () => {
                try {
                    await removeMember(userId);
                } catch (error) {
                    console.error('Failed to remove member:', error);
                }
            },
        });
    };

    const handleNotifyMembers = async () => {
        setNotifySuccessMessage(null);
        try {
            const result = await notifyMembers();
            if (result && result.notifiedCount > 0) {
                setNotifySuccessMessage(
                    `Уведомление отправлено (${result.notifiedCount})`
                );
            } else {
                setNotifySuccessMessage(
                    'Нет других участников с зарегистрированными push-токенами'
                );
            }
        } catch (error) {
            console.error('Failed to notify members:', error);
        }
    };

    return (
        <View style={styles.listInfo}>
            <View style={styles.listHeader}>
                <View style={styles.listText}>
                    <Text style={styles.listName}>{list.name}</Text>

                    {list.description && (
                        <Text style={styles.listDescription}>
                            {list.description}
                        </Text>
                    )}
                </View>

                <View style={styles.listActions}>
                    <Pressable
                        style={[
                            styles.notifyButton,
                            isNotifying && styles.disabledButton,
                        ]}
                        onPress={handleNotifyMembers}
                        disabled={isNotifying}
                    >
                        <Text style={styles.notifyButtonText}>
                            {isNotifying ? 'Notifying...' : 'Notify members'}
                        </Text>
                    </Pressable>

                    {sharedMembers.length > 0 && (
                        <Pressable
                            style={styles.sharingButton}
                            onPress={() => setIsSharedWithModalVisible(true)}
                        >
                            <Text style={styles.sharingButtonText}>
                                Sharing
                            </Text>
                        </Pressable>
                    )}

                    <Pressable
                        style={[
                            styles.editListButton,
                            (isUpdating || isDeleting) && styles.disabledButton,
                        ]}
                        onPress={onEdit}
                        disabled={isUpdating || isDeleting}
                    >
                        <Text style={styles.editListButtonText}>Edit</Text>
                    </Pressable>

                    {isOwner && (
                        <Pressable
                            style={[
                                styles.deleteListButton,
                                isDeleting && styles.disabledButton,
                            ]}
                            onPress={onDelete}
                            disabled={isDeleting}
                        >
                            <Text style={styles.deleteListButtonText}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>

            {notifySuccessMessage && (
                <Text style={styles.success}>{notifySuccessMessage}</Text>
            )}

            {notifyError && (
                <Text style={styles.error}>{notifyError.message}</Text>
            )}

            {deleteError && (
                <Text style={styles.error}>{deleteError.message}</Text>
            )}

            <SharedWithModal
                visible={isSharedWithModalVisible}
                members={sharedMembers}
                canRemove={isOwner}
                isRemoving={isRemovingMember}
                onRemoveMember={handleRemoveMember}
                onClose={() => setIsSharedWithModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    listInfo: {
        gap: 8,
    },

    listHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
    },

    listText: {
        flex: 1,
        gap: 8,
    },

    listName: {
        fontSize: 22,
    },

    listDescription: {
        fontSize: 16,
        color: '#666666',
    },

    listActions: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },

    notifyButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#388E3C',
    },

    notifyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    editListButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#666666',
    },

    sharingButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#208AEF',
    },

    sharingButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    editListButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    deleteListButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#D32F2F',
    },

    deleteListButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    disabledButton: {
        opacity: 0.5,
    },

    error: {
        color: '#D32F2F',
        marginTop: 4,
    },

    success: {
        color: '#2E7D32',
        marginTop: 4,
    },
});
