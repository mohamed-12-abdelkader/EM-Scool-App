import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors } from '@/theme/tokens';

export default function OperationsHome() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Operations</Text>
      <Text style={styles.meta}>{user?.role}</Text>
      <Text style={styles.meta}>Gate QR / Library scanner — Phase 1 shell</Text>
      <Button label="خروج" variant="ghost" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 8, backgroundColor: colors.background },
  h1: { fontFamily: 'Cairo_700Bold', fontSize: 24 },
  meta: { fontFamily: 'Cairo_400Regular', color: colors.textMuted },
});
