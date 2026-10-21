import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AttendanceBoard } from '@/components/modules/AttendanceBoard';
import { ModulePage, SectionTitle } from '@/components/modules/ModulePage';
import { Badge, Button, DataTable, FilterBar, statusTone, useToast } from '@/components/ui';
import { classes } from '@/data/mock';
import { colors, fonts, spacing } from '@/theme/tokens';

export default function AttendancePage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const rows = useMemo(
    () =>
      classes
        .filter((c) => !search || c.name.includes(search) || c.supervisor.includes(search))
        .map((c) => ({
          id: c.id,
          name: c.name,
          supervisor: c.supervisor,
          students: String(c.students),
          rate: '٩٤٪',
          status: 'نشط',
        })),
    [search],
  );

  return (
    <ModulePage
      title="الحضور والغياب"
      subtitle="تسجيل يومي سريع حسب الفصل مع إجراءات جماعية وتقارير فورية"
      breadcrumbs={['شؤون الطلاب', 'الحضور والغياب']}
      metrics={[
        {
          id: '1',
          label: 'نسبة اليوم',
          value: '٩٤.٦٪',
          delta: '+١.٣٪ عن أمس',
          trend: 'up',
          icon: 'ClipboardCheck',
          accent: 'success',
        },
        {
          id: '2',
          label: 'غياب اليوم',
          value: '٦٧',
          delta: '١٢ بعذر',
          trend: 'down',
          icon: 'AlertCircle',
          accent: 'danger',
        },
        {
          id: '3',
          label: 'تأخيرات',
          value: '٢٤',
          delta: 'تم إشعار أولياء الأمور',
          trend: 'neutral',
          icon: 'Clock',
          accent: 'warning',
        },
      ]}
      primaryAction={{
        label: 'إشعار الغياب',
        icon: 'Bell',
        onPress: () => showToast('تم تجهيز إشعارات الغياب للعرض فقط', 'info'),
      }}
      secondaryAction={{
        label: 'تصدير تقرير',
        icon: 'Download',
        onPress: () => showToast('تقرير الحضور جاهز للتحميل (تجريبي)', 'success'),
      }}
    >
      <AttendanceBoard />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث بالفصل أو المشرف..."
      />
      <SectionTitle title="حضور حسب الفصول" hint={`${rows.length} فصل`} />
      <DataTable
        data={rows}
        columns={[
          { key: 'name', label: 'الفصل', width: 160, getValue: (r) => r.name },
          { key: 'supervisor', label: 'المشرف', width: 180, getValue: (r) => r.supervisor },
          { key: 'students', label: 'عدد الطلاب', width: 100, getValue: (r) => r.students },
          { key: 'rate', label: 'نسبة الحضور', width: 110, getValue: (r) => r.rate },
          {
            key: 'status',
            label: 'الحالة',
            width: 100,
            render: (r) => <Badge label={r.status} tone={statusTone(r.status)} />,
          },
        ]}
      />
      <View style={styles.footer}>
        <Text style={styles.hint}>تسجيل الحضور تفاعلي محلياً ولا يُحفظ على خادم.</Text>
        <Button
          label="تصحيح حضور"
          variant="outline"
          size="sm"
          onPress={() => showToast('طلب التصحيح بانتظار الاعتماد (واجهة)', 'warning')}
        />
      </View>
    </ModulePage>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: spacing.xl,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    flex: 1,
  },
});
