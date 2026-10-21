import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input, PageHeader, useToast } from '@/components/ui';
import { colors, fonts, spacing } from '@/theme/tokens';

export default function CreateStudentPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [guardian, setGuardian] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'اسم الطالب مطلوب';
    if (nationalId.trim().length < 14) next.nationalId = 'الرقم القومي غير مكتمل';
    if (!guardian.trim()) next.guardian = 'اسم ولي الأمر مطلوب';
    if (phone.trim().length < 11) next.phone = 'رقم الهاتف غير صحيح';
    setErrors(next);
    if (Object.keys(next).length) {
      showToast('يرجى استكمال الحقول المطلوبة', 'warning');
      return;
    }
    showToast('تم تجهيز بيانات الطالب محلياً (بدون حفظ خلفي)', 'success');
    router.push('/students');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <PageHeader
        title="إضافة طالب جديد"
        subtitle="نموذج متعدد الأقسام لتسجيل بيانات القيد والتواصل والوضع الأكاديمي"
        breadcrumbs={['الإدارة الأكاديمية', 'إدارة الطلاب', 'إضافة']}
        actions={<Button label="رجوع" variant="outline" onPress={() => router.back()} />}
      />

      <Card style={styles.section}>
        <Text style={styles.title}>البيانات الشخصية</Text>
        <View style={styles.grid}>
          <View style={styles.field}><Input label="اسم الطالب" value={name} onChangeText={setName} error={errors.name} /></View>
          <View style={styles.field}><Input label="الرقم القومي" value={nationalId} onChangeText={setNationalId} error={errors.nationalId} keyboardType="number-pad" /></View>
          <View style={styles.field}><Input label="تاريخ الميلاد" placeholder="YYYY-MM-DD" /></View>
          <View style={styles.field}><Input label="الجنس" placeholder="ذكر / أنثى" /></View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.title}>بيانات ولي الأمر والطوارئ</Text>
        <View style={styles.grid}>
          <View style={styles.field}><Input label="اسم ولي الأمر" value={guardian} onChangeText={setGuardian} error={errors.guardian} /></View>
          <View style={styles.field}><Input label="رقم الهاتف" value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" /></View>
          <View style={styles.field}><Input label="البريد الإلكتروني" placeholder="parent@email.com" /></View>
          <View style={styles.field}><Input label="هاتف الطوارئ" placeholder="01xxxxxxxxx" /></View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.title}>التسكين الأكاديمي</Text>
        <View style={styles.grid}>
          <View style={styles.field}><Input label="العام الدراسي" placeholder="2025 / 2026" /></View>
          <View style={styles.field}><Input label="الصف" placeholder="الصف الأول الإعدادي" /></View>
          <View style={styles.field}><Input label="الفصل / الشعبة" placeholder="١/أ" /></View>
          <View style={styles.field}><Input label="حالة القيد" placeholder="نشط" /></View>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button label="حفظ الطالب" icon="Check" onPress={submit} />
        <Button label="إلغاء" variant="outline" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing['2xl'], paddingBottom: spacing['4xl'], gap: spacing.lg },
  section: { gap: spacing.lg },
  title: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, textAlign: 'right' },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.lg },
  field: { flexGrow: 1, flexBasis: 260, minWidth: 220 },
  actions: { flexDirection: 'row-reverse', gap: spacing.md },
});
