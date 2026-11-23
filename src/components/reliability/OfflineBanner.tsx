import { StyleSheet, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

export function OfflineBanner() {
    const netInfo = useNetInfo();
    if (netInfo.isConnected !== false || netInfo.isInternetReachable === true)
        return null;
    return (
        <View style={styles.banner}>
            <Text style={styles.text}>Нет подключения к интернету</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#7A5200',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    text: { color: '#FFFFFF', textAlign: 'center', fontSize: 14 },
});
