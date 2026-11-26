import { Pressable, StyleSheet, Text, View } from 'react-native';

import { semanticColors } from '@/theme/semantic';
import { radii, spacing, typography } from '@/theme/tokens';

export type ListFilter = 'all' | 'mine' | 'shared';

type ListFiltersProps = {
    selectedFilter: ListFilter;
    onSelect: (filter: ListFilter) => void;
};

const filters: { id: ListFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'mine', label: 'Mine' },
    { id: 'shared', label: 'Shared' },
];

export function ListFilters({ selectedFilter, onSelect }: ListFiltersProps) {
    return (
        <View accessibilityRole="tablist" style={styles.container}>
            {filters.map((filter) => {
                const selected = filter.id === selectedFilter;

                return (
                    <Pressable
                        key={filter.id}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                        onPress={() => onSelect(filter.id)}
                        style={[
                            styles.filter,
                            selected && styles.selectedFilter,
                        ]}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                selected && styles.selectedFilterText,
                            ]}
                        >
                            {filter.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: radii.control,
        backgroundColor: semanticColors.control.secondary,
        padding: spacing.xxs,
    },
    filter: {
        flex: 1,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.swatch,
    },
    selectedFilter: {
        backgroundColor: semanticColors.screen.surface,
    },
    filterText: {
        ...typography.caption,
        color: semanticColors.content.secondary,
        fontWeight: '600',
    },
    selectedFilterText: {
        color: semanticColors.control.secondaryText,
    },
});
