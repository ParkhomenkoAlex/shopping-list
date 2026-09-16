import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { ListForm } from '@/types/ListForm';

type CreateListModalProps = {
    visible: boolean;
    form: ListForm;
    isCreating: boolean;
    error: Error | null;
    onChange: <K extends keyof ListForm>(field: K, value: ListForm[K]) => void;
    onCancel: () => void;
    onSubmit: () => void | Promise<void>;
};

export function CreateListModal({
    visible,
    form,
    isCreating,
    error,
    onChange,
    onCancel,
    onSubmit,
}: CreateListModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>New list</Text>

                    <TextInput
                        style={styles.input}
                        value={form.name}
                        onChangeText={(name) => onChange('name', name)}
                        placeholder="List name"
                        autoFocus
                        editable={!isCreating}
                    />

                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        value={form.description}
                        onChangeText={(description) =>
                            onChange('description', description)
                        }
                        placeholder="Description"
                        multiline
                        editable={!isCreating}
                    />

                    {error && <Text style={styles.error}>{error.message}</Text>}

                    <View style={styles.buttons}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={onCancel}
                            disabled={isCreating}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.createButton,
                                isCreating && styles.disabledButton,
                            ]}
                            onPress={onSubmit}
                            disabled={isCreating}
                        >
                            <Text style={styles.createButtonText}>
                                {isCreating ? 'Creating...' : 'Create'}
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
    },

    descriptionInput: {
        minHeight: 100,
        marginTop: 12,
        textAlignVertical: 'top',
    },

    error: {
        color: '#D32F2F',
        marginTop: 8,
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

    createButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#208AEF',
    },

    disabledButton: {
        opacity: 0.5,
    },

    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
