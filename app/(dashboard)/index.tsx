import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { Icon } from '@/components/ui';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useSessionHeaders } from '@/lib/session';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

type FinanceSummary = {
  total_collected: number;
  balance_due: number;
  overdue_amount: number;
  collection_rate: number;
};

type Shortcut = {
  key: string;
  title: string;
  hint: string;
  href: string;
  icon: 'Wallet' | 'CalendarClock' | 'UserPlus';
  accent: string;
  soft: string;
};

const SHORTCUTS: Shortcut[] = [
  {
    key: 'fees',
    title: 'الرسوم والأقساط',
    hint: 'حصّل وادفع الأقساط',
    href: '/finance',
    icon: 'Wallet',
    accent: colors.brandPrimary,
    soft: colors.brandSoft,
  },
  {
    key: 'tt',
    title: 'الجدول المدرسي',
    hint: 'ابنِ جدول الأسبوع',
    href: '/timetable',
    icon: 'CalendarClock',
    accent: '#0EA5E9',
    soft: 'rgba(14, 165, 233, 0.12)',
  },
  {
    key: 'adm',
    title: 'القبول والطلاب',
    hint: 'راجع الطلبات والملفات',
    href: '/admissions',
    icon: 'UserPlus',
    accent: colors.brandAccent,
    soft: colors.brandAccentSoft,
  },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const headers = useSessionHeaders();
  const router = useRouter();
  const { isCompact } = useBreakpoint();
  const [apps, setApps] = useState(0);
  const [students, setStudents] = useState(0);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      apiRequest<unknown[]>('/v1/admissions/applications', headers).catch(() => []),
      apiRequest<unknown[]>('/v1/sis/students', headers).catch(() => []),
      apiRequest<FinanceSummary>('/v1/finance/summary', headers).catch(() => null),
    ]).then(([a, s, f]) => {
      setApps(a.length);
      setStudents(s.length);
      setFinance(f);
      setLoading(false);
    });
  }, [headers.token, headers.tenantId, headers.branchId]);

  const firstName = (user?.full_name || 'بالمدرسة').split(' ')[0];
  const overdue = Number(finance?.overdue_amount || 0);
  const collected = Number(finance?.total_collected || 0);
  const rate = finance?.collection_rate ?? 0;
  const needsSetup = !loading && students === 0 && apps === 0;

  return (
    <View style={styles.root}>
      <View style={styles.glowA} pointerEvents="none" />
      <View style={styles.glowB} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(280)} style={styles.topRow}>
          <View style={styles.liveChip}>
            <LivePulseDot size={7} color={colors.statusSuccess} />
            <Text style={styles.liveText}>مباشر</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>أهلاً {firstName}</Text>
            <Text style={styles.sub}>ماذا تريد إنجازه اليوم؟</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(300)} style={[styles.primary, shadows.card]}>
          <View style={styles.primaryText}>
            <Text style={styles.primaryEyebrow}>الأهم الآن</Text>
            <Text style={styles.primaryTitle}>الرسوم والأقساط</Text>
            <Text style={styles.primaryBody}>
              {needsSetup
                ? 'ابدأ بقبول الطلاب ثم وزّع هيكل الرسوم على الصف.'
                : overdue > 0
                  ? `لديك متأخرات ${overdue.toLocaleString('ar-EG')} ج.م — راجع الأقساط.`
                  : collected > 0
                    ? `تحصيل ${rate}% · المحصّل ${collected.toLocaleString('ar-EG')} ج.م`
                    : 'وزّع الأقساط على الطلاب وابدأ التحصيل.'}
            </Text>
          </View>
          <View style={styles.primaryActions}>
            <AnimatedPressable
              style={styles.primaryBtn}
              onPress={() => router.push('/finance')}
              accessibilityLabel="فتح الرسوم"
            >
              <Text style={styles.primaryBtnText}>فتح الرسوم</Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={styles.secondaryBtn}
              onPress={() => router.push('/installments')}
              accessibilityLabel="الأقساط"
            >
              <Text style={styles.secondaryBtnText}>الأقساط</Text>
            </AnimatedPressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(280)} style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>اختصارات سريعة</Text>
        </Animated.View>

        <View style={[styles.shortcuts, isCompact && styles.shortcutsCol]}>
          {SHORTCUTS.map((item, i) => (
            <Animated.View
              key={item.key}
              entering={FadeInDown.delay(200 + i * 70).duration(280)}
              style={styles.shortcutWrap}
            >
              <AnimatedPressable
                style={styles.shortcut}
                onPress={() => router.push(item.href as never)}
                accessibilityLabel={item.title}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: item.soft }]}>
                  <Icon name={item.icon} size={22} color={item.accent} />
                </View>
                <Text style={styles.shortcutTitle}>{item.title}</Text>
                <Text style={styles.shortcutHint}>{item.hint}</Text>
                <Text style={[styles.shortcutGo, { color: item.accent }]}>فتح ←</Text>
              </AnimatedPressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(400).duration(280)} style={styles.statsStrip}>
          {loading ? (
            <ActivityIndicator color={colors.brandPrimary} />
          ) : (
            <>
              <Stat label="قبول" value={String(apps)} onPress={() => router.push('/admissions')} />
              <View style={styles.statDiv} />
              <Stat label="طلاب" value={String(students)} onPress={() => router.push('/students')} />
              <View style={styles.statDiv} />
              <Stat
                label="متأخرات"
                value={overdue > 0 ? `${overdue.toLocaleString('ar-EG')}` : '0'}
                danger={overdue > 0}
                onPress={() => router.push('/installments')}
              />
            </>
          )}
        </Animated.View>

        {needsSetup ? (
          <Animated.View entering={FadeInDown.delay(480).duration(280)} style={styles.tip}>
            <Text style={styles.tipTitle}>خطوات البداية</Text>
            <Text style={styles.tipLine}>١) راجع مسار القبول وسجّل طالباً</Text>
            <Text style={styles.tipLine}>٢) من الرسوم: «تهيئة رسوم» ثم «توزيع على الصف»</Text>
            <Text style={styles.tipLine}>٣) ابنِ الجدول الأسبوعي للشعبة</Text>
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({
  label,
  value,
  danger,
  onPress,
}: {
  label: string;
  value: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable style={styles.stat} onPress={onPress}>
      <Text style={[styles.statValue, danger && { color: colors.statusDanger }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  glowA: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(79, 70, 229, 0.10)',
  },
  glowB: {
    position: 'absolute',
    top: 180,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
    paddingBottom: 120,
    gap: spacing.lg,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  contentCompact: { paddingHorizontal: spacing.md },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  liveChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.statusSuccessSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginTop: 6,
  },
  liveText: { fontFamily: arFonts.semiBold, fontSize: 11, color: '#059669' },
  hello: {
    fontFamily: arFonts.extraBold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  sub: {
    fontFamily: arFonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  primary: {
    backgroundColor: colors.bgSurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  primaryText: { gap: 6 },
  primaryEyebrow: {
    fontFamily: arFonts.semiBold,
    fontSize: 12,
    color: colors.brandPrimary,
    textAlign: 'right',
  },
  primaryTitle: {
    fontFamily: arFonts.bold,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  primaryBody: {
    fontFamily: arFonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
  },
  primaryActions: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.full,
  },
  primaryBtnText: { fontFamily: arFonts.semiBold, fontSize: 14, color: '#fff' },
  secondaryBtn: {
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.full,
  },
  secondaryBtnText: { fontFamily: arFonts.semiBold, fontSize: 14, color: colors.brandPrimary },
  sectionHead: { marginTop: 4 },
  sectionTitle: {
    fontFamily: arFonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  shortcuts: { flexDirection: 'row-reverse', gap: 12 },
  shortcutsCol: { flexDirection: 'column' },
  shortcutWrap: { flex: 1, minWidth: 160 },
  shortcut: {
    backgroundColor: colors.bgSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: 8,
    minHeight: 168,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  shortcutTitle: {
    fontFamily: arFonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  shortcutHint: {
    fontFamily: arFonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    flex: 1,
  },
  shortcutGo: {
    fontFamily: arFonts.semiBold,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 4,
  },
  statsStrip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 8,
    minHeight: 64,
    justifyContent: 'space-around',
  },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
  statValue: {
    fontFamily: arFonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: { fontFamily: arFonts.medium, fontSize: 11, color: colors.textMuted },
  statDiv: { width: 1, height: 28, backgroundColor: colors.borderSubtle },
  tip: {
    backgroundColor: 'rgba(79, 70, 229, 0.06)',
    borderRadius: 16,
    padding: spacing.lg,
    gap: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  tipTitle: {
    fontFamily: arFonts.bold,
    fontSize: 14,
    color: colors.brandPrimary,
    textAlign: 'right',
    marginBottom: 4,
  },
  tipLine: {
    fontFamily: arFonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
  },
});
