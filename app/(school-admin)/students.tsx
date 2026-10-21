import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors } from '@/theme/tokens';

type Student = { id: string; full_name: string; student_code: string; disciplinary_points: number };

export default function StudentsList() {
  const { accessToken, user } = useAuth();
  const [rows, setRows] = useState<Student[]>([]);

  useEffect(() => {
    void apiRequest<Student[]>('/v1/sis/students', {
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
      branchId: user?.branchIds?.[0],
    })
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Students (360°)</Text>
      <FlatList
        data={rows}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/(school-admin)/student/${item.id}` as never)}
          >
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.meta}>
              {item.student_code} · points {item.disciplinary_points}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: colors.background },
  h1: { fontFamily: 'Cairo_700Bold', fontSize: 22, marginBottom: 8 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  name: { fontFamily: 'Cairo_600SemiBold' },
  meta: { fontFamily: 'Cairo_400Regular', color: colors.textMuted },
});
