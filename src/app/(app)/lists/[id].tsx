import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ListItems } from '@/components/items/ListItems';
import { EditListModal } from '@/components/lists/EditListModal';
import { ListHeader } from '@/components/lists/ListHeader';
import { ListSharing } from '@/components/lists/ListSharing';
import { useListDetails } from '@/hooks/useListDetails';

export default function ListDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const {
        list,
        isListLoading,
        listError,
        isEditListModalVisible,
        editListForm,
        isUpdating,
        updateError,
        isListDeleting,
        deleteListError,
        handleOpenEditListModal,
        handleChangeEditListForm,
        handleCancelEditList,
        handleSaveEditList,
        handleDeleteList,
    } = useListDetails(id);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>List Details</Text>

            {isListLoading && <ActivityIndicator />}

            {listError && <Text style={styles.error}>{listError.message}</Text>}

            {list && (
                <ListHeader
                    list={list}
                    isUpdating={isUpdating}
                    isDeleting={isListDeleting}
                    deleteError={deleteListError}
                    onEdit={handleOpenEditListModal}
                    onDelete={handleDeleteList}
                />
            )}

            {!isListLoading && !listError && list && (
                <View style={styles.content}>
                    <ListItems listId={id} />

                    <ListSharing listId={id} />
                </View>
            )}

            <EditListModal
                visible={isEditListModalVisible}
                form={editListForm}
                isUpdating={isUpdating}
                error={updateError}
                onChange={handleChangeEditListForm}
                onCancel={handleCancelEditList}
                onSubmit={handleSaveEditList}
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

    content: {
        marginTop: 24,
    },

    error: {
        color: '#D32F2F',
        marginBottom: 16,
    },
});
