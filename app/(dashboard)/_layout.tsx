import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, router } from 'expo-router';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/lib/auth';
import { colors } from '@/theme/tokens';

export default function DashboardLayout() {
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/(auth)/signin' as never);
    }
  }, [ready, user]);

  if (!ready || !user) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </View>
    );
  }

  return (
    <DashboardShell>
      <Slot />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCanvas,
  },
});
