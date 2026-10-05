import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useListMembership } from '@/hooks/useListMembership';
import { useAuth } from '@/providers/AuthProvider';
import { confirmAction } from '@/utils/confirmation';

type ListSharingModalProps = {
    visible: boolean;
    listId: string;
    onClose: () => void;
};

export function ListSharingModal({
    visible,
    listId,
    onClose,
}: ListSharingModalProps) {
    const { user } = useAuth();

    const {
        memberRole,
        sharedMembers,
        isSharedMembersLoading,
        sharedMembersError,
        addMemberByEmail,
        isAddingMember,
        addMemberError,
        removeMember,
        isRemovingMember,
        removeMemberError,
    } = useListMembership(listId, user?.id);

    const [email, setEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const isOwner = memberRole === 'owner';

    const handleAddMember = async () => {
        const normalizedEmail = email.trim();

        setSuccessMessage(null);

        if (!normalizedEmail) {
            return;
        }

        try {
            await addMemberByEmail(normalizedEmail);

            setEmail('');
            setSuccessMessage('Member added successfully.');
        } catch {
            return;
        }
    };

    const handleRemoveMember = (targetUserId: string, memberEmail: string) => {
        confirmAction({
            title: 'Remove member',
            message: `Are you sure you want to remove "${memberEmail}" from this list?`,
            confirmText: 'Remove',
            onConfirm: async () => {
                try {
                    await removeMember(targetUserId);
                } catch (error) {
                    console.error('Failed to remove member:', error);
                }
            },
        });
    };

    const handleClose = () => {
        setEmail('');
        setSuccessMessage(null);
        onClose();
    };

    const getMemberInitial = (memberEmail: string) =>
        memberEmail.charAt(0).toUpperCase();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Sharing</Text>

                        <Pressable
                            style={styles.closeIconButton}
                            onPress={handleClose}
                            hitSlop={12}
                        >
                            <Ionicons name="close" size={24} color="#666666" />
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.sectionTitle}>MEMBERS</Text>

                        {isSharedMembersLoading && (
                            <ActivityIndicator style={styles.loader} />
                        )}

                        {sharedMembersError && (
                            <Text style={styles.error}>
                                {sharedMembersError.message}
                            </Text>
                        )}

                        {!isSharedMembersLoading && (
                            <View style={styles.members}>
                                {sharedMembers.map((member) => (
                                    <View
                                        key={member.user_id}
                                        style={styles.memberRow}
                                    >
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>
                                                {getMemberInitial(member.email)}
                                            </Text>
                                        </View>

                                        <View style={styles.memberInfo}>
                                            <Text
                                                style={styles.memberEmail}
                                                numberOfLines={1}
                                            >
                                                {member.email}
                                            </Text>

                                            <Text style={styles.memberRole}>
                                                {member.role === 'owner'
                                                    ? 'Owner'
                                                    : 'Member'}
                                            </Text>
                                        </View>

                                        {isOwner && member.role !== 'owner' && (
                                            <Pressable
                                                style={styles.removeButton}
                                                onPress={() =>
                                                    handleRemoveMember(
                                                        member.user_id,
                                                        member.email
                                                    )
                                                }
                                                disabled={isRemovingMember}
                                                hitSlop={8}
                                            >
                                                {isRemovingMember ? (
                                                    <ActivityIndicator size="small" />
                                                ) : (
                                                    <Ionicons
                                                        name="trash-outline"
                                                        size={20}
                                                        color="#D32F2F"
                                                    />
                                                )}
                                            </Pressable>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {removeMemberError && (
                            <Text style={styles.error}>
                                {removeMemberError.message}
                            </Text>
                        )}

                        {isOwner && (
                            <View style={styles.addMemberSection}>
                                <Text style={styles.sectionTitle}>
                                    ADD MEMBER
                                </Text>

                                <View style={styles.addMemberRow}>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={(value) => {
                                            setEmail(value);
                                            setSuccessMessage(null);
                                        }}
                                        placeholder="Email address"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={handleAddMember}
                                        editable={!isAddingMember}
                                    />

                                    <Pressable
                                        style={[
                                            styles.addButton,
                                            (!email.trim() || isAddingMember) &&
                                                styles.disabledButton,
                                        ]}
                                        onPress={handleAddMember}
                                        disabled={
                                            !email.trim() || isAddingMember
                                        }
                                    >
                                        {isAddingMember ? (
                                            <ActivityIndicator
                                                size="small"
                                                color="#FFFFFF"
                                            />
                                        ) : (
                                            <Ionicons
                                                name="add"
                                                size={26}
                                                color="#FFFFFF"
                                            />
                                        )}
                                    </Pressable>
                                </View>

                                {addMemberError && (
                                    <Text style={styles.error}>
                                        {addMemberError.message}
                                    </Text>
                                )}

                                {successMessage && (
                                    <Text style={styles.success}>
                                        {successMessage}
                                    </Text>
                                )}
                            </View>
                        )}
                    </ScrollView>
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
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 24,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111111',
    },

    closeIconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

    content: {
        flexGrow: 0,
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: '#888888',
        marginBottom: 10,
    },

    loader: {
        marginVertical: 20,
    },

    members: {
        gap: 2,
    },

    memberRow: {
        minHeight: 64,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E8E8E8',
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555555',
    },

    memberInfo: {
        flex: 1,
        gap: 3,
    },

    memberEmail: {
        fontSize: 16,
        color: '#111111',
    },

    memberRole: {
        fontSize: 13,
        color: '#888888',
    },

    removeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    addMemberSection: {
        marginTop: 28,
    },

    addMemberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    input: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        color: '#111111',
    },

    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#208AEF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    disabledButton: {
        opacity: 0.4,
    },

    error: {
        color: '#D32F2F',
        fontSize: 13,
        marginTop: 8,
    },

    success: {
        color: '#2E7D32',
        fontSize: 13,
        marginTop: 8,
    },
});
