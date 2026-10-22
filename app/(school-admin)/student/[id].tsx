import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button } from '@/components/ui';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { arFonts, colors, radii } from '@/theme/tokens';

type Guardian = { id: string; full_name: string; phone?: string; can_pickup?: boolean };
type Sibling = { id: string; full_name: string };
type Clinic = { id: string; symptoms?: string };
type Behavior = { id: string; incident_type?: string; description?: string; points?: number };

type Profile = {
  student: {
    full_name: string;
    student_code: string;
    medical_profile?: Record<string, unknown> | null;
  };
  guardians?: Guardian[];
  siblings?: Sibling[];
  clinic_visits?: Clinic[];
  behavior_incidents?: Behavior[];
};

export default function StudentProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void apiRequest<Profile>(`/v1/sis/students/${id}`, {
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
    })
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => {
        setData(null);
        setError(e instanceof Error ? e.message : 'تعذّر التحميل');
      });
  }, [id]);

  if (error) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.error}>{error}</Text>
        <Button label="رجوع" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.meta}>جارٍ التحميل…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>{data.student.full_name}</Text>
      <Text style={styles.meta}>{data.student.student_code}</Text>

      <Text style={styles.section}>الملف الطبي</Text>
      <Text style={styles.body}>
        {data.student.medical_profile
          ? JSON.stringify(data.student.medical_profile, null, 2)
          : 'لا بيانات طبية'}
      </Text>

      <Text style={styles.section}>أولياء الأمور</Text>
      {(data.guardians || []).length === 0 ? (
        <Text style={styles.body}>لا أولياء مسجّلين</Text>
      ) : (
        data.guardians?.map((g) => (
          <Text key={g.id} style={styles.body}>
            {g.full_name}
            {g.phone ? ` · ${g.phone}` : ''}
            {g.can_pickup ? ' · استلام' : ''}
          </Text>
        ))
      )}

      <Text style={styles.section}>الإخوة</Text>
      {(data.siblings || []).length === 0 ? (
        <Text style={styles.body}>لا إخوة</Text>
      ) : (
        data.siblings?.map((s) => (
          <Text key={s.id} style={styles.body}>
            {s.full_name}
          </Text>
        ))
      )}

      <Text style={styles.section}>العيادة</Text>
      {(data.clinic_visits || []).length === 0 ? (
        <Text style={styles.body}>لا زيارات</Text>
      ) : (
        data.clinic_visits?.map((c) => (
          <Text key={c.id} style={styles.body}>
            {c.symptoms || '—'}
          </Text>
        ))
      )}

      <Text style={styles.section}>السلوك</Text>
      {(data.behavior_incidents || []).length === 0 ? (
        <Text style={styles.body}>لا حوادث</Text>
      ) : (
        data.behavior_incidents?.map((b) => (
          <Text key={b.id} style={styles.body}>
            {b.incident_type}: {b.description} ({b.points})
          </Text>
        ))
      )}

      <Button label="رجوع" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 8, backgroundColor: colors.bgCanvas },
  h1: { fontFamily: arFonts.extraBold, fontSize: 26, color: colors.textPrimary, textAlign: 'right' },
  meta: { fontFamily: arFonts.mono, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  section: {
    marginTop: 12,
    fontFamily: arFonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'right',
    backgroundColor: colors.bgSurface,
    padding: 8,
    borderRadius: radii.md,
  },
  body: { fontFamily: arFonts.regular, color: colors.textSecondary, textAlign: 'right', lineHeight: 22 },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },
});
