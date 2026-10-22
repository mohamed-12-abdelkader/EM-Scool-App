import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { Button, PageHeader } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useSessionHeaders } from '@/lib/session';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';

type Summary = {
  total_fees: number;
  total_collected: number;
  balance_due: number;
  overdue_amount: number;
  accounts: number;
  collection_rate: number;
  installments: { paid: number; open: number; overdue: number };
  recent_payments: Array<{
    id: string;
    amount: number;
    method: string;
    student_name?: string;
    paid_at: string;
  }>;
};

type Structure = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  installment_count: number;
  grade_name?: string;
  category_name?: string;
};

function money(n: number, currency = 'EGP') {
  return `${Number(n || 0).toLocaleString('ar-EG')} ${currency}`;
}

function notify(msg: string) {
  if (Platform.OS === 'web') window.alert(msg);
  else Alert.alert('المالية', msg);
}

export default function FinancePage() {
  const headers = useSessionHeaders();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, structs] = await Promise.all([
        apiRequest<Summary>('/v1/finance/summary', headers),
        apiRequest<Structure[]>('/v1/finance/structures', headers),
      ]);
      setSummary(sum);
      setStructures(structs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر تحميل المالية');
    } finally {
      setLoading(false);
    }
  }, [headers.token, headers.tenantId, headers.branchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const seed = async () => {
    try {
      await apiRequest('/v1/finance/seed-defaults', { ...headers, method: 'POST' });
      notify('تم إنشاء منتج الرسوم الافتراضي');
      void load();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'فشل التهيئة');
    }
  };

  const assignAll = async (id: string) => {
    try {
      const res = await apiRequest<{ assigned_count: number }>(`/v1/finance/structures/${id}/assign`, {
        ...headers,
        method: 'POST',
        body: { assign_all_in_grade: true },
      });
      notify(`تم توزيع الأقساط على ${res.assigned_count} طالب`);
      void load();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'فشل التوزيع');
    }
  };

  if (loading && !summary) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </View>
    );
  }

  const rate = summary?.collection_rate ?? 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PageHeader
        title="لوحة المالية"
        subtitle="الرسوم والأقساط — المنتج الرئيسي لنظام المدرسة"
        breadcrumbs={['الرسوم والأقساط', 'لوحة المالية']}
        actions={
          <>
            <Button label="تهيئة رسوم" variant="outline" onPress={() => void seed()} />
            <Button label="الأقساط" onPress={() => router.push('/installments')} />
          </>
        }
      />

      <Animated.View entering={FadeInDown.duration(280)} style={[styles.hero, shadows.sm]}>
        <View style={styles.heroTop}>
          <PillBadge label="منتج رئيسي · FINANCE" tone="indigo" />
          <View style={styles.liveRow}>
            <LivePulseDot size={8} color={colors.statusSuccess} />
            <Text style={styles.liveText}>تحصيل مباشر</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>نسبة التحصيل {rate}%</Text>
        <AnimatedProgressBar progress={rate} label="التحصيل" />
        <Text style={styles.heroSub}>
          تابع الإيرادات والمتأخرات من مكان واحد، ووزّع الأقساط على الصفوف بضغطة.
        </Text>
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.metrics}>
        <Metric
          label="إجمالي الرسوم"
          value={money(summary?.total_fees || 0)}
          tone="brand"
          delay={40}
        />
        <Metric
          label="المحصّل"
          value={money(summary?.total_collected || 0)}
          tone="emerald"
          delay={80}
        />
        <Metric
          label="المتبقي"
          value={money(summary?.balance_due || 0)}
          tone="amber"
          delay={120}
        />
        <Metric
          label="متأخرات"
          value={money(summary?.overdue_amount || 0)}
          tone="rose"
          delay={160}
        />
      </View>

      <Animated.View entering={FadeInDown.delay(200).duration(280)} style={[styles.panel, shadows.sm]}>
        <Text style={styles.panelTitle}>هياكل الرسوم</Text>
        <Text style={styles.panelSub}>وزّع على كل طلاب الصف المرتبط بالهيكل</Text>
        {structures.map((s, i) => (
          <Animated.View
            key={s.id}
            entering={FadeInDown.delay(220 + i * 50).duration(240)}
            style={styles.structureRow}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.structureName}>{s.name}</Text>
              <Text style={styles.structureMeta}>
                {money(Number(s.amount), s.currency)} · {s.installment_count} أقساط
                {s.grade_name ? ` · ${s.grade_name}` : ''}
                {s.category_name ? ` · ${s.category_name}` : ''}
              </Text>
            </View>
            <AnimatedPressable style={styles.assignBtn} onPress={() => void assignAll(s.id)}>
              <Text style={styles.assignText}>توزيع على الصف</Text>
            </AnimatedPressable>
          </Animated.View>
        ))}
        {!structures.length ? (
          <Text style={styles.empty}>لا هياكل بعد — اضغط «تهيئة رسوم»</Text>
        ) : null}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(280).duration(280)} style={[styles.panel, shadows.sm]}>
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle}>آخر المدفوعات</Text>
          <AnimatedPressable onPress={() => router.push('/installments')}>
            <Text style={styles.link}>عرض الأقساط</Text>
          </AnimatedPressable>
        </View>
        {(summary?.recent_payments || []).map((p, i) => (
          <Animated.View
            key={p.id}
            entering={FadeInDown.delay(300 + i * 40).duration(220)}
            style={styles.payRow}
          >
            <Text style={styles.payAmount}>{money(Number(p.amount))}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.payName}>{p.student_name || 'طالب'}</Text>
              <Text style={styles.payMeta}>
                {p.method} · {new Date(p.paid_at).toLocaleDateString('ar-EG')}
              </Text>
            </View>
          </Animated.View>
        ))}
        {!summary?.recent_payments?.length ? (
          <Text style={styles.empty}>لا مدفوعات مسجّلة بعد</Text>
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}

function Metric({
  label,
  value,
  tone,
  delay,
}: {
  label: string;
  value: string;
  tone: 'brand' | 'emerald' | 'amber' | 'rose';
  delay: number;
}) {
  const toneMap = {
    brand: { bg: colors.brandSoft, fg: colors.brandPrimary },
    emerald: { bg: colors.statusSuccessSoft, fg: colors.statusSuccess },
    amber: { bg: colors.statusWarningSoft, fg: colors.statusWarning },
    rose: { bg: colors.statusDangerSoft, fg: colors.statusDanger },
  }[tone];

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(260)}
      style={[styles.metric, { backgroundColor: toneMap.bg }]}
    >
      <Text style={[styles.metricValue, { color: toneMap.fg }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  content: { padding: spacing.xl, paddingBottom: 120, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: 10,
  },
  heroTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  liveRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  liveText: { fontFamily: arFonts.semiBold, fontSize: 12, color: colors.textSecondary },
  heroTitle: {
    fontFamily: arFonts.extraBold,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  heroSub: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  metrics: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  metric: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 140,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: 4,
  },
  metricValue: {
    fontFamily: arFonts.bold,
    fontSize: 16,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textSecondary, textAlign: 'right' },
  panel: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: 10,
  },
  panelHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary, textAlign: 'right' },
  panelSub: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  structureRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  structureName: { fontFamily: arFonts.semiBold, fontSize: 14, color: colors.textPrimary, textAlign: 'right' },
  structureMeta: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  assignBtn: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  assignText: { fontFamily: arFonts.semiBold, fontSize: 12, color: '#fff' },
  payRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  payAmount: {
    fontFamily: arFonts.bold,
    fontSize: 14,
    color: colors.statusSuccess,
    fontVariant: ['tabular-nums'],
  },
  payName: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textPrimary, textAlign: 'right' },
  payMeta: { fontFamily: arFonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'right' },
  link: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.brandPrimary },
  empty: { fontFamily: arFonts.regular, color: colors.textMuted, textAlign: 'center', paddingVertical: 16 },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },
});
