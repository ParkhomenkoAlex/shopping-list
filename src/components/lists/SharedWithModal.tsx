import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SharedListMember } from '@/services/ListMemberService';

type SharedWithModalProps = {
    visible: boolean;
    members: SharedListMember[];
    onClose: () => void;
};

export function SharedWithModal({
    visible,
    members,
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
                            <View key={member.user_id} style={styles.member}>
                                <Text style={styles.email}>{member.email}</Text>
                                <Text style={styles.role}>{member.role}</Text>
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

    member: {
        gap: 4,
    },

    email: {
        fontSize: 16,
    },

    role: {
        color: '#666666',
        fontSize: 14,
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
