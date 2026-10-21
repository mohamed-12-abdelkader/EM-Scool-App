import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ModulePage, SectionTitle } from '@/components/modules/ModulePage';
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  FilterBar,
  statusTone,
  useToast,
} from '@/components/ui';
import { students } from '@/data/mock';
import { colors, fonts, spacing } from '@/theme/tokens';
import { formatCurrency } from '@/utils/format';
import type { Student } from '@/types';

export default function StudentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('الكل');
  const [grade, setGrade] = useState('الكل');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return students.filter((student) => {
      const q = search.trim();
      const matchesSearch =
        !q ||
        student.name.includes(q) ||
        student.code.includes(q) ||
        student.guardianPhone.includes(q) ||
        student.nationalId.includes(q);
      const matchesStatus = status === 'الكل' || student.enrollmentStatus === status;
      const matchesGrade = grade === 'الكل' || student.grade.includes(grade);
      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [search, status, grade]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <ModulePage
      title="إدارة الطلاب"
      subtitle="سجل شامل لبيانات الطلاب، الحالة الأكاديمية، والمتابعة المالية"
      breadcrumbs={['الإدارة الأكاديمية', 'إدارة الطلاب']}
      metrics={[
        {
          id: 'total',
          label: 'إجمالي المعروض',
          value: String(filtered.length),
          delta: 'بعد تطبيق الفلاتر',
          trend: 'neutral',
          icon: 'GraduationCap',
          accent: 'primary',
        },
        {
          id: 'active',
          label: 'طلاب نشطون',
          value: String(students.filter((s) => s.enrollmentStatus === 'نشط').length),
          delta: 'من أصل السجل الكامل',
          trend: 'up',
          icon: 'UserCheck',
          accent: 'success',
        },
        {
          id: 'balance',
          label: 'أرصدة مستحقة',
          value: formatCurrency(students.reduce((s, x) => s + x.outstandingBalance, 0)),
          delta: 'يتطلب متابعة',
          trend: 'down',
          icon: 'AlertCircle',
          accent: 'danger',
        },
      ]}
      primaryAction={{ label: 'إضافة طالب', icon: 'Plus', onPress: () => router.push('/students/create') }}
      secondaryAction={{
        label: 'تصدير',
        icon: 'Download',
        onPress: () => showToast('تم تجهيز ملف التصدير (واجهة تجريبية)', 'success'),
      }}
    >
      <FilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="بحث بالاسم أو الكود أو هاتف ولي الأمر أو الرقم القومي"
        filters={[
          {
            key: 'status',
            label: 'حالة القيد',
            value: status,
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
            options: [
              { label: 'الكل', value: 'الكل' },
              { label: 'نشط', value: 'نشط' },
              { label: 'موقوف', value: 'موقوف' },
            ],
          },
          {
            key: 'grade',
            label: 'المرحلة',
            value: grade,
            onChange: (v) => {
              setGrade(v);
              setPage(1);
            },
            options: [
              { label: 'الكل', value: 'الكل' },
              { label: 'ابتدائي', value: 'ابتدائي' },
              { label: 'إعدادي', value: 'إعدادي' },
              { label: 'ثانوي', value: 'ثانوي' },
            ],
          },
        ]}
        trailing={
          selected.length ? (
            <Button
              label={`إجراء جماعي (${selected.length})`}
              variant="secondary"
              size="sm"
              onPress={() => showToast(`تم تحديد ${selected.length} طلاب لإجراء جماعي`, 'info')}
            />
          ) : (
            <Button
              label="استيراد"
              icon="Upload"
              variant="outline"
              size="sm"
              onPress={() => showToast('رفع ملف الاستيراد متاح في الواجهة التجريبية', 'info')}
            />
          )
        }
      />

      <SectionTitle title="قائمة الطلاب" hint={`${filtered.length} نتيجة`} />

      <DataTable<Student>
        data={pageData}
        selectedIds={selected}
        onToggleSelect={toggle}
        onRowPress={(row) => router.push(`/students/${row.id}`)}
        columns={[
          {
            key: 'name',
            label: 'الطالب',
            width: 220,
            primary: true,
            render: (row) => (
              <View style={styles.person}>
                <Avatar name={row.name} color={row.avatarColor} size={36} />
                <View>
                  <Text style={styles.name}>{row.name}</Text>
                  <Text style={styles.meta}>{row.code}</Text>
                </View>
              </View>
            ),
          },
          { key: 'grade', label: 'الصف', width: 160, getValue: (r) => r.grade },
          { key: 'className', label: 'الفصل', width: 80, getValue: (r) => r.className },
          {
            key: 'guardian',
            label: 'ولي الأمر',
            width: 160,
            render: (row) => (
              <View>
                <Text style={styles.name}>{row.guardianName}</Text>
                <Text style={styles.meta}>{row.guardianPhone}</Text>
              </View>
            ),
          },
          {
            key: 'attendance',
            label: 'حضور اليوم',
            width: 110,
            render: (row) => <Badge label={row.attendanceToday} tone={statusTone(row.attendanceToday)} />,
          },
          {
            key: 'balance',
            label: 'المستحق',
            width: 120,
            render: (row) => (
              <Text style={[styles.name, row.outstandingBalance > 0 && { color: colors.danger }]}>
                {row.outstandingBalance ? formatCurrency(row.outstandingBalance) : 'مسدد'}
              </Text>
            ),
          },
          {
            key: 'status',
            label: 'الحالة',
            width: 100,
            render: (row) => (
              <Badge label={row.enrollmentStatus} tone={statusTone(row.enrollmentStatus)} />
            ),
          },
        ]}
      />

      <View style={styles.pagination}>
        <Button
          label="التالي"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
        <Text style={styles.pageText}>
          صفحة {page} من {totalPages}
        </Text>
        <Button
          label="السابق"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
        />
      </View>
    </ModulePage>
  );
}

const styles = StyleSheet.create({
  person: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  name: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, textAlign: 'right' },
  meta: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, textAlign: 'right' },
  pagination: {
    marginTop: spacing.xl,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  pageText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
});
