import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/theme/tokens';

/** Public marketing — Arabic Egypt RTL via document dir (not RN `direction` style). */
export default function PublicLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.style.direction = 'rtl';
      document.body.style.fontFamily = 'Cairo_400Regular, "Segoe UI", Tahoma, sans-serif';
    }
  }, []);

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
  },
});
