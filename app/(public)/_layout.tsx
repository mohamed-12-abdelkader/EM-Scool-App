import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme/tokens';

/** Marketing surfaces — LTR English per ui.md */
export default function PublicLayout() {
  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgCanvas },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    direction: 'ltr',
  },
});
