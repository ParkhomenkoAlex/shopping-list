import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BuildVersionLabel } from '@/components/BuildVersionLabel';
import type { AccountMenuAnchor } from '@/components/lists/ListsHeader';
import { useIllustrationStyle } from '@/providers/IllustrationStyleProvider';
import { semanticColors } from '@/theme/semantic';
import { elevation, radii, spacing, typography } from '@/theme/tokens';

type AccountMenuProps = {
    visible: boolean;
    anchor: AccountMenuAnchor | null;
    email: string | undefined;
    isSigningOut: boolean;
    onClose: () => void;
    onSignOut: () => void;
};

export function AccountMenu({
    visible,
    anchor,
    email,
    isSigningOut,
    onClose,
    onSignOut,
}: AccountMenuProps) {
    const {
        illustrationSet,
        setIllustrationSet,
        illustrationStyle,
        setIllustrationStyle,
    } = useIllustrationStyle();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.root}>
                <Pressable
                    accessibilityLabel="Close account menu"
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                />
                <View
                    accessibilityViewIsModal
                    style={[
                        styles.menu,
                        {
                            top: anchor?.top ?? spacing.huge,
                            right: anchor?.right ?? spacing.lg,
                        },
                    ]}
                >
                    <Text numberOfLines={2} style={styles.email}>
                        {email ?? 'Member'}
                    </Text>
                    <BuildVersionLabel style={styles.version} />

                    <Text style={styles.label}>Illustration set</Text>
                    <View style={styles.segments}>
                        {(['basket', 'meerkat'] as const).map((set) => {
                            const selected = set === illustrationSet;
                            const label =
                                set === 'basket' ? 'Basket' : 'Meerkat';

                            return (
                                <Pressable
                                    key={set}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${label} illustration set`}
                                    accessibilityState={{ selected }}
                                    onPress={() => setIllustrationSet(set)}
                                    style={[
                                        styles.segment,
                                        selected && styles.selectedSegment,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            selected &&
                                                styles.selectedSegmentText,
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Text style={styles.label}>Illustration style</Text>
                    <View style={styles.segments}>
                        {(['clean', 'cozy'] as const).map((style) => {
                            const selected = style === illustrationStyle;
                            const label = style === 'clean' ? 'Clean' : 'Cozy';

                            return (
                                <Pressable
                                    key={style}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${label} illustration style`}
                                    accessibilityState={{ selected }}
                                    onPress={() => setIllustrationStyle(style)}
                                    style={[
                                        styles.segment,
                                        selected && styles.selectedSegment,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            selected &&
                                                styles.selectedSegmentText,
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Log out"
                        accessibilityState={{
                            disabled: isSigningOut,
                            busy: isSigningOut,
                        }}
                        disabled={isSigningOut}
                        onPress={onSignOut}
                        style={styles.logout}
                    >
                        <Ionicons
                            color={semanticColors.feedback.error}
                            name="log-out-outline"
                            size={20}
                        />
                        <Text style={styles.logoutText}>
                            {isSigningOut ? 'Logging out...' : 'Log out'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    menu: {
        position: 'absolute',
        width: 272,
        borderRadius: radii.card,
        backgroundColor: semanticColors.screen.surface,
        padding: spacing.md,
        ...elevation.floating,
    },
    email: {
        ...typography.body,
        color: semanticColors.content.primary,
        fontWeight: '600',
    },
    version: {
        ...typography.caption,
        color: semanticColors.content.muted,
        marginTop: spacing.xxs,
    },
    label: {
        ...typography.caption,
        color: semanticColors.content.secondary,
        fontWeight: '600',
        marginTop: spacing.lg,
    },
    segments: {
        flexDirection: 'row',
        borderRadius: radii.control,
        backgroundColor: semanticColors.control.secondary,
        marginTop: spacing.xs,
        padding: spacing.xxs,
    },
    segment: {
        flex: 1,
        alignItems: 'center',
        borderRadius: radii.swatch,
        minHeight: 36,
        justifyContent: 'center',
    },
    selectedSegment: {
        backgroundColor: semanticColors.screen.surface,
    },
    segmentText: {
        ...typography.caption,
        color: semanticColors.content.secondary,
        fontWeight: '600',
    },
    selectedSegmentText: {
        color: semanticColors.control.secondaryText,
    },
    logout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: 44,
        marginTop: spacing.md,
    },
    logoutText: {
        ...typography.body,
        color: semanticColors.feedback.error,
        fontWeight: '600',
    },
});
