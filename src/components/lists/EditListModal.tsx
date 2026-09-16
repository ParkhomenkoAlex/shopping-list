import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type EditListForm = {
    name: string;
    description: string;
};

type EditListModalProps = {
    visible: boolean;
    form: EditListForm;
    isUpdating: boolean;
    error: Error | null;
    onChange: (field: keyof EditListForm, value: string) => void;
    onCancel: () => void;
    onSubmit: () => void | Promise<void>;
};

export function EditListModal({
    visible,
    form,
    isUpdating,
    error,
    onChange,
    onCancel,
    onSubmit,
}: EditListModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Edit list</Text>

                    <TextInput
                        style={styles.input}
                        value={form.name}
                        onChangeText={(value) => onChange('name', value)}
                        placeholder="List name"
                        editable={!isUpdating}
                        autoFocus
                    />

                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        value={form.description}
                        onChangeText={(value) => onChange('description', value)}
                        placeholder="Description"
                        multiline
                        editable={!isUpdating}
                    />

                    {error && <Text style={styles.error}>{error.message}</Text>}

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
                            onPress={onSubmit}
                            disabled={isUpdating}
                        >
                            <Text style={styles.saveButtonText}>
                                {isUpdating ? 'Saving...' : 'Save'}
                            </Text>
                        </Pressable>
                    </View>
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

    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 12,
    },

    descriptionInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },

    error: {
        color: '#D32F2F',
        marginTop: 4,
    },

    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 20,
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
