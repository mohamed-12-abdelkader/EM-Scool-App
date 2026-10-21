import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors } from '@/theme/tokens';

export default function StudentProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    void apiRequest(`/v1/sis/students/${id}`, {
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
    })
      .then(setData)
      .catch(() => setData(null));
  }, [id]);

  if (!data) {
    return (
      <View style={styles.wrap}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>{data.student.full_name}</Text>
      <Text style={styles.meta}>{data.student.student_code}</Text>
      <Text style={styles.section}>Medical</Text>
      <Text style={styles.body}>{JSON.stringify(data.student.medical_profile, null, 2)}</Text>
      <Text style={styles.section}>Guardians</Text>
      {data.guardians?.map((g: any) => (
        <Text key={g.id} style={styles.body}>
          {g.full_name} · {g.relationship} {g.can_pickup ? '· pickup' : ''}
        </Text>
      ))}
      <Text style={styles.section}>Siblings</Text>
      {data.siblings?.map((s: any) => (
        <Text key={s.id} style={styles.body}>
          {s.full_name}
        </Text>
      ))}
      <Text style={styles.section}>Clinic</Text>
      {data.clinic_visits?.map((c: any) => (
        <Text key={c.id} style={styles.body}>
          {c.symptoms}
        </Text>
      ))}
      <Text style={styles.section}>Behavior</Text>
      {data.behavior_incidents?.map((b: any) => (
        <Text key={b.id} style={styles.body}>
          {b.incident_type}: {b.description} ({b.points})
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: colors.background, gap: 6 },
  h1: { fontFamily: 'Cairo_700Bold', fontSize: 24 },
  meta: { fontFamily: 'Cairo_400Regular', color: colors.textMuted, marginBottom: 12 },
  section: { fontFamily: 'Cairo_700Bold', marginTop: 12, fontSize: 16 },
  body: { fontFamily: 'Cairo_400Regular' },
});
