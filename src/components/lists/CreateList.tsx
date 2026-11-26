import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { CreateListModal } from '@/components/lists/CreateListModal';
import { useList } from '@/hooks/useList';
import type { CreateListForm } from '@/types/CreateListForm';
import { semanticColors } from '@/theme/semantic';
import { elevation, spacing } from '@/theme/tokens';

const initialForm: CreateListForm = {
    name: '',
    description: '',
};

export function CreateList() {
    const { isCreating, createError, createList } = useList();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<CreateListForm>(initialForm);

    const handleChange = <K extends keyof CreateListForm>(
        field: K,
        value: CreateListForm[K]
    ) => {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCreateList = async () => {
        const name = form.name.trim();
        const description = form.description.trim();

        if (!name) {
            return;
        }

        try {
            await createList({
                name,
                description: description || null,
            });

            setForm(initialForm);
            setIsModalVisible(false);
        } catch (error) {
            console.error('Failed to create list:', error);
        }
    };

    const handleCancelCreateList = () => {
        setForm(initialForm);
        setIsModalVisible(false);
    };

    return (
        <>
            <Pressable
                accessibilityLabel="Create list"
                accessibilityRole="button"
                accessibilityState={{ disabled: isCreating, busy: isCreating }}
                style={styles.addButton}
                onPress={handleOpenModal}
                disabled={isCreating}
            >
                <Ionicons
                    color={semanticColors.content.onPrimary}
                    name="add"
                    size={28}
                />
            </Pressable>

            <CreateListModal
                visible={isModalVisible}
                form={form}
                isCreating={isCreating}
                error={createError}
                onChange={handleChange}
                onCancel={handleCancelCreateList}
                onSubmit={handleCreateList}
            />
        </>
    );
}

const styles = StyleSheet.create({
    addButton: {
        alignSelf: 'flex-end',
        width: 56,
        height: 56,
        borderRadius: 28,
        marginTop: spacing.md,
        backgroundColor: semanticColors.control.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...elevation.floating,
    },
});
