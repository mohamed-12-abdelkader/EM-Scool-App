import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Navbar } from '@/components/marketing';
import { Button, Input } from '@/components/ui';
import { apiRequest } from '@/lib/api';
import { colors, fonts, radii, shadows } from '@/theme/tokens';

/** Public FR-SIS-01 online application portal */
export default function AdmissionsApply() {
  const [tenantSlug, setTenantSlug] = useState('demo-school');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('2018-01-15');
  const [branchId, setBranchId] = useState('');
  const [yearId, setYearId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const result = await apiRequest<{ id: string; status: string }>(
        `/v1/public/${tenantSlug}/admissions/apply`,
        {
          method: 'POST',
          body: {
            branch_id: branchId,
            academic_year_id: yearId,
            target_grade_id: gradeId,
            applicant_full_name: name,
            date_of_birth: dob,
            guardian_details: { full_name: guardianName, phone: guardianPhone },
            documents: [],
          },
        },
      );
      setMsg(`Application submitted — ${result.id} (${result.status})`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.h1}>Online Admissions Application</Text>
          <Text style={styles.sub}>
            Age-at-admission validation runs against your institution’s October 1st cutoff (FR-SIS-01).
          </Text>
          <Input label="Institution code (slug)" value={tenantSlug} onChangeText={setTenantSlug} />
          <Input label="Applicant full name" value={name} onChangeText={setName} />
          <Input label="Date of birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} />
          <Input label="Branch UUID" value={branchId} onChangeText={setBranchId} />
          <Input label="Academic year UUID" value={yearId} onChangeText={setYearId} />
          <Input label="Target grade UUID" value={gradeId} onChangeText={setGradeId} />
          <Input label="Guardian name" value={guardianName} onChangeText={setGuardianName} />
          <Input label="Guardian phone" value={guardianPhone} onChangeText={setGuardianPhone} />
          <Button
            label={loading ? 'Submitting…' : 'Submit application →'}
            fullWidth
            size="lg"
            onPress={() => void submit()}
            disabled={loading}
          />
          {msg ? <Text style={styles.msg}>{msg}</Text> : null}
          <Button label="← Back to website" variant="ghost" onPress={() => router.push('/(public)' as never)} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas, direction: 'ltr' },
  scroll: { padding: 24, alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 24,
    gap: 12,
  },
  h1: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.textPrimary, letterSpacing: -0.6 },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginBottom: 8, lineHeight: 20 },
  msg: { fontFamily: fonts.semiBold, color: colors.brandPrimary, textAlign: 'center' },
});
