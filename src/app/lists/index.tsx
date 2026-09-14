import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { CreateListModal } from '@/components/lists/CreateListModal';
import { ListItem } from '@/components/lists/ListItem';
import { useLists } from '@/hooks/useLists';

export default function ListsScreen() {
    const { lists, isLoading, isCreating, error, createError, createList } =
        useLists();

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
        } catch {
            // Error is displayed inside CreateListModal.
        }
    };

    const handleCancelCreateList = () => {
        setNewListName('');
        setIsModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Lists</Text>

            {isLoading && <ActivityIndicator />}

            {error && <Text style={styles.error}>{error.message}</Text>}

            {!isLoading &&
                !error &&
                lists.map((list) => (
                    <ListItem
                        key={list.id}
                        list={list}
                        onPress={() =>
                            router.push({
                                pathname: '/lists/[id]',
                                params: {
                                    id: list.id,
                                },
                            })
                        }
                    />
                ))}

            {!isLoading && !error && lists.length === 0 && (
                <Text style={styles.empty}>No lists yet.</Text>
            )}

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },

    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 24,
    },

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

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },

    empty: {
        color: '#666666',
        marginBottom: 16,
    },
});
