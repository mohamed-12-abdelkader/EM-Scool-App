import { router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors } from '@/theme/tokens';

export default function TeacherHome() {
  const { logout } = useAuth();
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Teacher</Text>
      <Button label="حضور الفصل (Offline-ready)" onPress={() => router.push('/(teacher)/attendance')} />
      <Button label="خروج" variant="ghost" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 12, backgroundColor: colors.background },
  h1: { fontFamily: 'Cairo_700Bold', fontSize: 24 },
});
