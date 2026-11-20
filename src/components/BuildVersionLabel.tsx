import Constants from 'expo-constants';
import { type StyleProp, Text, type TextStyle } from 'react-native';

const appEnv = Constants.expoConfig?.extra?.appEnv ?? 'Unknown';
const appVersion = Constants.expoConfig?.version ?? 'Unknown';
const appBuild = Constants.expoConfig?.android?.versionCode ?? 'Unknown';

type BuildVersionLabelProps = {
    style?: StyleProp<TextStyle>;
};

export function BuildVersionLabel({ style }: BuildVersionLabelProps) {
    return (
        <Text style={style}>
            SL-{appEnv}-{appBuild}-v{appVersion}
        </Text>
    );
}
