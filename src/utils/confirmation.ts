import { Alert } from 'react-native';

type ConfirmActionOptions = {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
};

export function confirmAction({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmActionOptions) {
    Alert.alert(title, message, [
        {
            text: cancelText,
            style: 'cancel',
            onPress: onCancel,
        },
        {
            text: confirmText,
            style: 'destructive',
            onPress: onConfirm,
        },
    ]);
}
