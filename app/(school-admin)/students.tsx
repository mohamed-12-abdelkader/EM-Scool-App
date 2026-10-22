import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { arFonts, colors, radii, shadows } from '@/theme/tokens';

type Student = { id: string; full_name: string; student_code: string; disciplinary_points: number };

export default function StudentsList() {
  const { accessToken, user } = useAuth();
  const [rows, setRows] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await apiRequest<Student[]>('/v1/sis/students', {
        token: accessToken || undefined,
        tenantId: user?.tenantId || undefined,
        branchId: user?.branchIds?.[0],
      });
      setRows(data);
      setError(null);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : 'تعذّر تحميل الطلاب');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>دليل الطلاب</Text>
      <Text style={styles.sub}>ملف 360° · أولياء · عيادة · سلوك</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={rows}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
        ListEmptyComponent={!error ? <Text style={styles.empty}>لا طلاب مسجّلين بعد</Text> : null}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, shadows.card]}
            onPress={() => router.push(`/(school-admin)/student/${item.id}` as never)}
          >
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.meta}>
              {item.student_code} · نقاط انضباط: {item.disciplinary_points ?? 0}
            </Text>
          </Pressable>
        )}
      />
      <Button label="تحديث" variant="outline" onPress={() => void load()} />
      <Button label="رجوع" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: colors.bgCanvas, gap: 8 },
  h1: { fontFamily: arFonts.extraBold, fontSize: 26, color: colors.textPrimary, textAlign: 'right' },
  sub: { fontFamily: arFonts.regular, color: colors.textSecondary, textAlign: 'right' },
  row: {
    padding: 14,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  name: { fontFamily: arFonts.semiBold, fontSize: 15, color: colors.textPrimary, textAlign: 'right' },
  meta: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  empty: { fontFamily: arFonts.regular, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },
});
