import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { Button, PageHeader } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useSessionHeaders } from '@/lib/session';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';

type Installment = {
  id: string;
  student_id: string;
  student_name?: string;
  student_code?: string;
  label: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: string;
};

const FILTERS = [
  { key: '', label: 'الكل' },
  { key: 'pending', label: 'معلّق' },
  { key: 'partial', label: 'جزئي' },
  { key: 'overdue', label: 'متأخر' },
  { key: 'paid', label: 'مدفوع' },
];

function money(n: number) {
  return `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;
}

function notify(msg: string) {
  if (Platform.OS === 'web') window.alert(msg);
  else Alert.alert('الأقساط', msg);
}

function statusTone(status: string): 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' {
  if (status === 'paid') return 'emerald';
  if (status === 'overdue') return 'rose';
  if (status === 'partial') return 'amber';
  if (status === 'pending') return 'indigo';
  return 'slate';
}

const statusAr: Record<string, string> = {
  pending: 'معلّق',
  partial: 'جزئي',
  paid: 'مدفوع',
  overdue: 'متأخر',
  cancelled: 'ملغى',
};

export default function InstallmentsPage() {
  const headers = useSessionHeaders();
  const [rows, setRows] = useState<Installment[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [payId, setPayId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter ? `?status=${encodeURIComponent(filter)}` : '';
      const data = await apiRequest<Installment[]>(`/v1/finance/installments${q}`, headers);
      setRows(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر تحميل الأقساط');
    } finally {
      setLoading(false);
    }
  }, [filter, headers.token, headers.tenantId, headers.branchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    const due = rows.reduce((s, r) => s + (Number(r.amount) - Number(r.paid_amount)), 0);
    const overdue = rows
      .filter((r) => r.status === 'overdue')
      .reduce((s, r) => s + (Number(r.amount) - Number(r.paid_amount)), 0);
    return { due, overdue, count: rows.length };
  }, [rows]);

  const pay = async (row: Installment) => {
    const remaining = Number(row.amount) - Number(row.paid_amount);
    const value = amount ? Number(amount) : remaining;
    if (!value || value <= 0) {
      notify('أدخل مبلغاً صالحاً');
      return;
    }
    try {
      await apiRequest('/v1/finance/payments', {
        ...headers,
        method: 'POST',
        body: {
          student_id: row.student_id,
          installment_id: row.id,
          amount: value,
          method: 'cash',
        },
      });
      setPayId(null);
      setAmount('');
      notify('تم تسجيل الدفعة');
      void load();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'فشل الدفع');
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PageHeader
        title="الأقساط والمدفوعات"
        subtitle="تسجيل الدفعات ومتابعة الاستحقاقات — قلب منتج الرسوم"
        breadcrumbs={['الرسوم والأقساط', 'الأقساط والمدفوعات']}
        actions={<Button label="تحديث" variant="outline" onPress={() => void load()} />}
      />

      <Animated.View entering={FadeInDown.duration(280)} style={[styles.hero, shadows.sm]}>
        <View style={styles.heroTop}>
          <PillBadge label="تحصيل · أقساط" tone="emerald" />
          <View style={styles.liveRow}>
            <LivePulseDot size={8} color={colors.statusWarning} />
            <Text style={styles.liveText}>{totals.count} قسط ظاهر</Text>
          </View>
        </View>
        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroValue}>{money(totals.due)}</Text>
            <Text style={styles.heroLabel}>مستحق</Text>
          </View>
          <View style={styles.heroMetric}>
            <Text style={[styles.heroValue, { color: colors.statusDanger }]}>{money(totals.overdue)}</Text>
            <Text style={styles.heroLabel}>متأخر</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <AnimatedPressable
                key={f.key || 'all'}
                onPress={() => setFilter(f.key)}
                style={[styles.filter, active && styles.filterActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 24 }} /> : null}

      <View style={styles.list}>
        {rows.map((row, i) => {
          const remaining = Number(row.amount) - Number(row.paid_amount);
          const open = payId === row.id;
          return (
            <Animated.View
              key={row.id}
              entering={FadeInDown.delay(i * 45).duration(240)}
              style={[styles.card, shadows.sm]}
            >
              <View style={styles.cardTop}>
                <PillBadge label={statusAr[row.status] || row.status} tone={statusTone(row.status)} />
                <Text style={styles.due}>{row.due_date}</Text>
              </View>
              <Text style={styles.name}>{row.student_name || 'طالب'}</Text>
              <Text style={styles.meta}>
                {row.student_code || ''} · {row.label}
              </Text>
              <View style={styles.amounts}>
                <Text style={styles.amount}>{money(Number(row.amount))}</Text>
                <Text style={styles.remaining}>متبقي {money(remaining)}</Text>
              </View>

              {row.status !== 'paid' && row.status !== 'cancelled' ? (
                open ? (
                  <View style={styles.payBox}>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                      placeholder={`المبلغ (افتراضي ${remaining})`}
                      style={styles.input}
                      placeholderTextColor={colors.textMuted}
                    />
                    <View style={styles.payActions}>
                      <Button label="تأكيد الدفع" onPress={() => void pay(row)} />
                      <Button
                        label="إلغاء"
                        variant="ghost"
                        onPress={() => {
                          setPayId(null);
                          setAmount('');
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <AnimatedPressable style={styles.payBtn} onPress={() => setPayId(row.id)}>
                    <Text style={styles.payBtnText}>تسجيل دفعة</Text>
                  </AnimatedPressable>
                )
              ) : null}
            </Animated.View>
          );
        })}
        {!loading && !rows.length ? (
          <Text style={styles.empty}>لا أقساط — وزّع هيكل رسوم من لوحة المالية أولاً</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  content: { padding: spacing.xl, paddingBottom: 120, gap: spacing.md },
  hero: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: 12,
  },
  heroTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  liveRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  liveText: { fontFamily: arFonts.semiBold, fontSize: 12, color: colors.textSecondary },
  heroMetrics: { flexDirection: 'row-reverse', gap: 24 },
  heroMetric: { gap: 2 },
  heroValue: {
    fontFamily: arFonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  heroLabel: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  filters: { flexDirection: 'row-reverse', gap: 8, paddingVertical: 4 },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  filterActive: { backgroundColor: colors.brandSoft, borderColor: colors.brandPrimary },
  filterText: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: colors.brandPrimary },
  list: { gap: 10 },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 6,
  },
  cardTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  due: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  name: { fontFamily: arFonts.bold, fontSize: 15, color: colors.textPrimary, textAlign: 'right' },
  meta: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  amounts: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 4 },
  amount: {
    fontFamily: arFonts.semiBold,
    fontSize: 14,
    color: colors.brandPrimary,
    fontVariant: ['tabular-nums'],
  },
  remaining: {
    fontFamily: arFonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  payBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  payBtnText: { fontFamily: arFonts.semiBold, fontSize: 13, color: '#fff' },
  payBox: { marginTop: 8, gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: arFonts.medium,
    textAlign: 'right',
    backgroundColor: colors.bgCanvas,
    color: colors.textPrimary,
  },
  payActions: { flexDirection: 'row-reverse', gap: 8 },
  empty: { fontFamily: arFonts.regular, color: colors.textMuted, textAlign: 'center', padding: 32 },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },
});
