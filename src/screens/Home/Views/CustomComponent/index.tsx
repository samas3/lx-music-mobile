import { View, StyleSheet, Text } from "react-native";
import { useTheme } from '@/store/theme/hook'
export const Message = ({ msg }: { msg: string }) => {
    const theme = useTheme();
    return <Text style={[styles.message, {color: theme['c-primary-font']}]}>{msg}</Text>;
};
export const Separator = () => {
    const theme = useTheme();
    return <View style={[styles.separator, {backgroundColor: theme['c-primary-alpha-800'] }]} />;
};
const styles = StyleSheet.create({
  separator: {
    height: 1,
    width: '100%'
  },
  message: {
    fontSize: 12,
    textAlign: 'center'
  }
});