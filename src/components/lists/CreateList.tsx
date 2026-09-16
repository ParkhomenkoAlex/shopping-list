import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { CreateListModal } from '@/components/lists/CreateListModal';
import { useList } from '@/hooks/useList';
import { initialListForm, type ListForm } from '@/types/ListForm';

export function CreateList() {
    const { isCreating, createError, createList } = useList();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<ListForm>(initialListForm);

    const handleChange = <K extends keyof ListForm>(
        field: K,
        value: ListForm[K]
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

            setForm(initialListForm);
            setIsModalVisible(false);
        } catch (error) {
            console.error('Failed to create list:', error);
        }
    };

    const handleCancelCreateList = () => {
        setForm(initialListForm);
        setIsModalVisible(false);
    };

    return (
        <>
            <Pressable
                style={styles.addButton}
                onPress={handleOpenModal}
                disabled={isCreating}
            >
                <Text style={styles.addButtonText}>
                    {isCreating ? 'Creating...' : 'Add list'}
                </Text>
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
        marginTop: 12,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#208AEF',
        alignItems: 'center',
    },

    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
