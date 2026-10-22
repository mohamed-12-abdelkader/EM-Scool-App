import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button, PageHeader } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useSessionHeaders } from '@/lib/session';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';

type Student = {
  id: string;
  full_name: string;
  student_code: string;
  disciplinary_points?: number;
};

export default function StudentsPage() {
  const headers = useSessionHeaders();
  const router = useRouter();
  const [rows, setRows] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Student[]>('/v1/sis/students', headers);
      setRows(data);
      setError(null);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : 'تعذّر تحميل الطلاب');
    } finally {
      setLoading(false);
    }
  }, [headers.token, headers.tenantId, headers.branchId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.root}>
      <PageHeader
        title="دليل الطلاب"
        subtitle="ملفات 360° — أولياء · عيادة · سلوك (Phase 1 SIS)"
        breadcrumbs={['SIS', 'دليل الطلاب']}
        actions={<Button label="تحديث" variant="outline" onPress={() => void load()} />}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 40 }} /> : null}

      <FlatList
        data={rows}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>لا طلاب مسجّلين بعد — أكمل مسار القبول</Text> : null
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 40).duration(240)}>
            <AnimatedPressable
              style={[styles.row, shadows.sm]}
              onPress={() => router.push(`/(school-admin)/student/${item.id}` as never)}
            >
              <View style={styles.rowTop}>
                <PillBadge label="ملف 360°" tone="violet" />
                <Text style={styles.code}>{item.student_code}</Text>
              </View>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.meta}>نقاط انضباط: {item.disciplinary_points ?? 0}</Text>
            </AnimatedPressable>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas, padding: spacing.xl, paddingBottom: 40 },
  list: { gap: 10, paddingBottom: 80, paddingTop: 8 },
  row: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 4,
  },
  rowTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textMuted },
  name: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary, textAlign: 'right' },
  meta: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textSecondary, textAlign: 'right' },
  empty: { fontFamily: arFonts.regular, color: colors.textMuted, textAlign: 'center', padding: 40 },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right', marginBottom: 8 },
});
