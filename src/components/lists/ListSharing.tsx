import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useListMembership } from '@/hooks/useListMembership';
import { useAuth } from '@/providers/AuthProvider';

type ListSharingProps = {
    listId: string;
};

export function ListSharing({ listId }: ListSharingProps) {
    const { user } = useAuth();
    const { memberRole, addMemberByEmail, isAddingMember, addMemberError } =
        useListMembership(listId, user?.id);
    const [email, setEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    if (memberRole !== 'owner') {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sharing</Text>

            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Member email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isAddingMember}
            />

            <Pressable
                style={[
                    styles.addButton,
                    isAddingMember && styles.disabledButton,
                ]}
                onPress={handleAddMember}
                disabled={isAddingMember}
            >
                <Text style={styles.addButtonText}>
                    {isAddingMember ? 'Adding...' : 'Add member'}
                </Text>
            </Pressable>

            {addMemberError && (
                <Text style={styles.error}>{addMemberError.message}</Text>
            )}

            {successMessage && (
                <Text style={styles.success}>{successMessage}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },

    title: {
        fontSize: 20,
        fontWeight: '600',
    },

    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },

    addButton: {
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#208AEF',
        alignItems: 'center',
    },

    disabledButton: {
        opacity: 0.5,
    },

    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    error: {
        color: '#D32F2F',
    },

    success: {
        color: '#2E7D32',
    },
});
