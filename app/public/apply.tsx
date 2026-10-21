import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Input } from '@/components/ui';
import { apiRequest } from '@/lib/api';
import { colors } from '@/theme/tokens';

/** Public online application form — FR-SIS-01 */
export default function PublicApply() {
  const [tenantSlug, setTenantSlug] = useState('demo-school');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('2018-01-15');
  const [branchId, setBranchId] = useState('');
  const [yearId, setYearId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
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
      setMsg(`تم الإرسال — ${result.id} (${result.status})`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>طلب التحاق إلكتروني</Text>
      <Input label="Tenant slug" value={tenantSlug} onChangeText={setTenantSlug} />
      <Input label="اسم الطالب" value={name} onChangeText={setName} />
      <Input label="تاريخ الميلاد YYYY-MM-DD" value={dob} onChangeText={setDob} />
      <Input label="Branch UUID" value={branchId} onChangeText={setBranchId} />
      <Input label="Academic year UUID" value={yearId} onChangeText={setYearId} />
      <Input label="Grade UUID" value={gradeId} onChangeText={setGradeId} />
      <Input label="ولي الأمر" value={guardianName} onChangeText={setGuardianName} />
      <Input label="هاتف ولي الأمر" value={guardianPhone} onChangeText={setGuardianPhone} />
      <Button label="إرسال الطلب" onPress={() => void submit()} />
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 8, backgroundColor: colors.background },
  h1: { fontFamily: 'Cairo_700Bold', fontSize: 22, marginBottom: 8 },
  msg: { fontFamily: 'Cairo_500Medium', color: colors.primary, textAlign: 'center' },
});
