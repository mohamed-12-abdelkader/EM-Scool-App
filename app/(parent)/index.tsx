import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { arFonts, colors, radii, shadows } from '@/theme/tokens';

type Child = { id: string; full_name: string; student_code: string };

export default function ParentHome() {
  const { accessToken, user, activeChildId, setActiveChildId, logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiRequest<Child[]>('/v1/sis/parent/children', {
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
    })
      .then((rows) => {
        setChildren(rows);
        if (!activeChildId && rows[0]) setActiveChildId(rows[0].id);
        setError(null);
      })
      .catch((e) => {
        setChildren([]);
        setError(e instanceof Error ? e.message : 'تعذّر تحميل الأبناء');
      });
  }, []);

  const active = children.find((c) => c.id === activeChildId) || children[0];

  return (
    <View style={styles.wrap}>
      <PillBadge label="نطاق: العائلة المرتبطة" tone="indigo" />
      <Text style={styles.h1}>بوابة ولي الأمر</Text>
      <Text style={styles.section}>تبديل الأبناء</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        horizontal
        data={children}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ gap: 8 }}
        inverted
        ListEmptyComponent={<Text style={styles.meta}>لا أبناء مرتبطين بعد — سجّل طالباً من مسار القبول</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setActiveChildId(item.id)}
            style={[styles.chip, activeChildId === item.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeChildId === item.id && { color: '#fff' }]}>
              {item.full_name}
            </Text>
          </Pressable>
        )}
      />
      {active ? (
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.name}>{active.full_name}</Text>
          <Text style={styles.mono}>{active.student_code}</Text>
          <View style={styles.alerts}>
            <Text style={styles.alert}>✅ تنبيهات الحضور تظهر هنا بعد حفظ المعلم (مع Redis)</Text>
            <Text style={styles.alert}>🏥 سجل زيارات العيادة من ملف الطالب 360°</Text>
            <Text style={styles.alert}>🚌 تتبع الأتوبيس في مرحلة لاحقة</Text>
          </View>
        </View>
      ) : null}
      <Button label="تسجيل الخروج" variant="ghost" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 12, backgroundColor: colors.bgCanvas },
  h1: { fontFamily: arFonts.extraBold, fontSize: 28, color: colors.textPrimary, textAlign: 'right' },
  section: { fontFamily: arFonts.bold, fontSize: 14, color: colors.textPrimary, textAlign: 'right' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { fontFamily: arFonts.semiBold, color: colors.textPrimary },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 8,
  },
  name: { fontFamily: arFonts.bold, fontSize: 18, color: colors.textPrimary, textAlign: 'right' },
  mono: { fontFamily: arFonts.mono, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  alerts: { gap: 6 },
  alert: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textSecondary, textAlign: 'right', lineHeight: 20 },
  meta: { fontFamily: arFonts.regular, color: colors.textMuted, textAlign: 'right' },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },
});
