import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { CreateListModal } from '@/components/lists/CreateListModal';
import { useLists } from '@/hooks/useLists';

export function CreateList() {
    const { isCreating, createError, createList } = useLists();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newListName, setNewListName] = useState('');

    const handleCreateList = async () => {
        const name = newListName.trim();

        if (!name) {
            return;
        }

        try {
            await createList(name);

            setNewListName('');
            setIsModalVisible(false);
        } catch (error) {
            console.error('Failed to create list:', error);
        }
    };

    const handleCancelCreateList = () => {
        setNewListName('');
        setIsModalVisible(false);
    };

    return (
        <>
            <Pressable
                style={styles.addButton}
                onPress={() => setIsModalVisible(true)}
                disabled={isCreating}
            >
                <Text style={styles.addButtonText}>
                    {isCreating ? 'Creating...' : 'Add list'}
                </Text>
            </Pressable>

            <CreateListModal
                visible={isModalVisible}
                name={newListName}
                onChangeName={setNewListName}
                onCancel={handleCancelCreateList}
                onCreate={handleCreateList}
                isCreating={isCreating}
                error={createError}
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
