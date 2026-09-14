import { Pressable, StyleSheet, Text } from 'react-native';

import type { List } from '@/types/List';

type ListItemProps = {
    list: List;
    onPress: () => void;
};

export function ListItem({ list, onPress }: ListItemProps) {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Text style={styles.name}>{list.name}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        marginBottom: 12,
    },

    name: {
        fontSize: 18,
    },
});
