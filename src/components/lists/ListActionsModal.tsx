import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MenuAnchor } from '@/components/lists/ListHeader';

type ListActionsModalProps = {
    visible: boolean;
    anchor: MenuAnchor | null;
    canManageList: boolean;
    onEdit: () => void;
    onSharing: () => void;
    onDelete: () => void;
    onClose: () => void;
};

export function ListActionsModal({
    visible,
    anchor,
    canManageList,
    onEdit,
    onSharing,
    onDelete,
    onClose,
}: ListActionsModalProps) {
    if (!anchor) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View
                    style={[
                        styles.menuWrapper,
                        {
                            top: anchor.y + anchor.height,
                            right: 24,
                        },
                    ]}
                >
                    <Pressable
                        style={styles.menu}
                        onPress={(event) => event.stopPropagation()}
                    >
                        {canManageList && (
                            <Pressable style={styles.action} onPress={onEdit}>
                                <Ionicons
                                    name="pencil-outline"
                                    size={21}
                                    color="#111111"
                                />

                                <Text style={styles.actionText}>Edit list</Text>
                            </Pressable>
                        )}

                        <Pressable style={styles.action} onPress={onSharing}>
                            <Ionicons
                                name="people-outline"
                                size={21}
                                color="#111111"
                            />

                            <Text style={styles.actionText}>Sharing</Text>
                        </Pressable>

                        {canManageList && (
                            <Pressable style={styles.action} onPress={onDelete}>
                                <Ionicons
                                    name="trash-outline"
                                    size={21}
                                    color="#D32F2F"
                                />

                                <Text
                                    style={[
                                        styles.actionText,
                                        styles.deleteText,
                                    ]}
                                >
                                    Delete list
                                </Text>
                            </Pressable>
                        )}
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    menuWrapper: {
        position: 'absolute',
    },

    menu: {
        width: 210,
        paddingVertical: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,

        elevation: 8,

        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },

    action: {
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
    },

    actionText: {
        fontSize: 16,
        color: '#111111',
    },

    deleteText: {
        color: '#D32F2F',
    },
});
