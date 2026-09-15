import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type CreateListItemProps = {
    name: string;
    isCreating: boolean;
    error: Error | null;
    onChangeName: (name: string) => void;
    onCreate: () => void | Promise<void>;
};

export function CreateListItem({
    name,
    isCreating,
    error,
    onChangeName,
    onCreate,
}: CreateListItemProps) {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={onChangeName}
                placeholder="New list item name"
                editable={!isCreating}
            />

            <Pressable
                style={[styles.addButton, isCreating && styles.disabledButton]}
                onPress={onCreate}
                disabled={isCreating}
            >
                <Text style={styles.addButtonText}>
                    {isCreating ? 'Adding...' : 'Add'}
                </Text>
            </Pressable>

            {error && <Text style={styles.error}>{error.message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
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
        marginBottom: 16,
    },
});
