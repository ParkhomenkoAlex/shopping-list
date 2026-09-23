import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SharedListMember } from '@/services/ListMemberService';

type SharedWithModalProps = {
    visible: boolean;
    members: SharedListMember[];
    canRemove?: boolean;
    isRemoving?: boolean;
    onRemoveMember?: (userId: string, email: string) => void | Promise<void>;
    onClose: () => void;
};

export function SharedWithModal({
    visible,
    members,
    canRemove,
    isRemoving,
    onRemoveMember,
    onClose,
}: SharedWithModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Shared with</Text>

                    <View style={styles.members}>
                        {members.map((member) => (
                            <View key={member.user_id} style={styles.memberRow}>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.email}>
                                        {member.email}
                                    </Text>
                                    <Text style={styles.role}>
                                        {member.role}
                                    </Text>
                                </View>

                                {canRemove && onRemoveMember && (
                                    <Pressable
                                        style={[
                                            styles.removeButton,
                                            isRemoving && styles.disabledButton,
                                        ]}
                                        onPress={() =>
                                            onRemoveMember(
                                                member.user_id,
                                                member.email
                                            )
                                        }
                                        disabled={isRemoving}
                                    >
                                        <Text style={styles.removeButtonText}>
                                            Remove
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                        ))}
                    </View>

                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        padding: 24,
    },

    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
    },

    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
    },

    members: {
        gap: 12,
    },

    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    memberInfo: {
        flex: 1,
        gap: 4,
    },

    email: {
        fontSize: 16,
    },

    role: {
        color: '#666666',
        fontSize: 14,
    },

    removeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#D32F2F',
    },

    removeButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },

    disabledButton: {
        opacity: 0.5,
    },

    closeButton: {
        alignSelf: 'flex-end',
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#208AEF',
    },

    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
