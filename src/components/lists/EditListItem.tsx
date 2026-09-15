import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type EditListItemProps = {
    name: string;
    isUpdating: boolean;
    onChangeName: (name: string) => void;
    onCancel: () => void;
    onSave: () => void | Promise<void>;
};

export function EditListItem({
    name,
    isUpdating,
    onChangeName,
    onCancel,
    onSave,
}: EditListItemProps) {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={onChangeName}
                autoFocus
                editable={!isUpdating}
            />

            <View style={styles.buttons}>
                <Pressable
                    style={styles.cancelButton}
                    onPress={onCancel}
                    disabled={isUpdating}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.saveButton,
                        isUpdating && styles.disabledButton,
                    ]}
                    onPress={onSave}
                    disabled={isUpdating}
                >
                    <Text style={styles.saveButtonText}>
                        {isUpdating ? 'Saving...' : 'Save'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },

    input: {
        borderWidth: 1,
        borderColor: '#208AEF',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 18,
    },

    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },

    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    cancelButtonText: {
        fontSize: 16,
    },

    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#208AEF',
    },

    disabledButton: {
        opacity: 0.5,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
