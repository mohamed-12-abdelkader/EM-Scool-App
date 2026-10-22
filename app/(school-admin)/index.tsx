import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';

type AppRow = { id: string; status: string };
type Student = { id: string };

export default function SchoolAdminHome() {
  const { user, accessToken } = useAuth();
  const { isCompact } = useBreakpoint();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const headers = {
    token: accessToken || undefined,
    tenantId: user?.tenantId || undefined,
    branchId: user?.branchIds?.[0],
  };

  useEffect(() => {
    void Promise.all([
      apiRequest<AppRow[]>('/v1/admissions/applications', headers).catch(() => [] as AppRow[]),
      apiRequest<Student[]>('/v1/sis/students', headers).catch(() => [] as Student[]),
    ])
      .then(([a, s]) => {
        setApps(a);
        setStudents(s);
        setLoadError(null);
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'تعذّر التحميل'));
  }, []);

  const pending = apps.filter((a) =>
    ['SUBMITTED', 'EXAM_SCHEDULED', 'WAITLISTED', 'ACCEPTED'].includes(a.status),
  ).length;
  const enrolled = apps.filter((a) => a.status === 'ENROLLED').length;

  const shortTenant = user?.tenantId
    ? `${user.tenantId.slice(0, 8)}…${user.tenantId.slice(-4)}`
    : '—';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(300)} style={styles.hero}>
        <PillBadge label="نطاق: إدارة المدرسة / الفرع" tone="violet" />
        <Text style={styles.h1}>لوحة إدارة المدرسة</Text>
        <Text style={styles.sub}>
          مرحباً {user?.full_name || 'بالمدير'} — راجع القبول وسجّل الطلاب من مكان واحد.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(70).duration(300)}
        style={[styles.statsRow, isCompact && styles.statsCol]}
      >
        <Stat label="طلبات القبول" value={String(apps.length)} tone="brand" />
        <Stat label="بانتظار إجراء" value={String(pending)} tone="amber" />
        <Stat label="طلاب مسجّلون" value={String(students.length || enrolled)} tone="emerald" />
      </Animated.View>

      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}

      <Animated.View
        entering={FadeInDown.delay(120).duration(300)}
        style={[styles.actions, isCompact && styles.actionsCol]}
      >
        <ActionCard
          eyebrow="القبول"
          title="مسار القبول"
          body="راجع الطلبات، جدولة الامتحان، القبول أو التسجيل في الفصل."
          cta="فتح مسار القبول"
          tone="brand"
          onPress={() => router.push('/(school-admin)/admissions')}
        />
        <ActionCard
          eyebrow="SIS"
          title="دليل الطلاب"
          body="ملفات 360° — أولياء الأمور، العيادة، والسلوك لكل طالب."
          cta="عرض الطلاب"
          tone="violet"
          onPress={() => router.push('/(school-admin)/students')}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(300)} style={[styles.infoPanel, shadows.sm]}>
        <Text style={styles.infoTitle}>بيانات النطاق</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>الدور</Text>
          <Text style={styles.infoValue}>{user?.role || '—'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>معرّف المستأجر</Text>
          <Text style={styles.infoMono} selectable>
            {shortTenant}
          </Text>
        </View>
        {user?.branchIds?.[0] ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الفرع</Text>
            <Text style={styles.infoMono} selectable>
              {`${user.branchIds[0].slice(0, 8)}…`}
            </Text>
          </View>
        ) : null}
        <Text style={styles.infoHint}>
          للتقديم العام يستخدم أولياء الأمور كود المدرسة (slug) من مشرف المنصة.
        </Text>
      </Animated.View>

      <View style={{ height: 96 }} />
    </ScrollView>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'brand' | 'amber' | 'emerald';
}) {
  const color =
    tone === 'amber'
      ? colors.statusWarning
      : tone === 'emerald'
        ? colors.statusSuccess
        : colors.brandPrimary;
  return (
    <View style={[styles.stat, shadows.sm]}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({
  eyebrow,
  title,
  body,
  cta,
  tone,
  onPress,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  tone: 'brand' | 'violet';
  onPress: () => void;
}) {
  const accent = tone === 'violet' ? colors.brandAccent : colors.brandPrimary;
  const soft = tone === 'violet' ? colors.brandAccentSoft : colors.brandSoft;
  return (
    <AnimatedPressable onPress={onPress} style={[styles.actionCard, shadows.card]}>
      <View style={[styles.actionAccent, { backgroundColor: soft }]}>
        <View style={[styles.actionAccentBar, { backgroundColor: accent }]} />
      </View>
      <View style={styles.actionBody}>
        <Text style={[styles.actionEyebrow, { color: accent }]}>{eyebrow}</Text>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{body}</Text>
        <View style={[styles.actionCta, { backgroundColor: accent }]}>
          <Text style={styles.actionCtaText}>{cta}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  content: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    gap: spacing.xl,
  },
  contentCompact: { paddingHorizontal: spacing.lg },

  hero: { gap: 8, alignItems: 'flex-end' },
  h1: {
    fontFamily: arFonts.extraBold,
    fontSize: 30,
    color: colors.textPrimary,
    textAlign: 'right',
    lineHeight: 42,
  },
  sub: {
    fontFamily: arFonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 24,
    maxWidth: 560,
  },

  statsRow: { flexDirection: 'row-reverse', gap: 12 },
  statsCol: { flexDirection: 'column' },
  stat: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 4,
    alignItems: 'flex-end',
  },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  statValue: {
    fontFamily: arFonts.extraBold,
    fontSize: 28,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textSecondary },

  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },

  actions: { flexDirection: 'row-reverse', gap: 16 },
  actionsCol: { flexDirection: 'column' },
  actionCard: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
    minHeight: 200,
  },
  actionAccent: { height: 6, width: '100%' },
  actionAccentBar: { flex: 1 },
  actionBody: { padding: 20, gap: 8, alignItems: 'flex-end' },
  actionEyebrow: { fontFamily: arFonts.semiBold, fontSize: 12 },
  actionTitle: {
    fontFamily: arFonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  actionDesc: {
    fontFamily: arFonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 8,
  },
  actionCta: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.xl,
  },
  actionCtaText: { fontFamily: arFonts.semiBold, fontSize: 13, color: '#fff' },

  infoPanel: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 18,
    gap: 10,
  },
  infoTitle: {
    fontFamily: arFonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  infoLabel: { fontFamily: arFonts.medium, fontSize: 13, color: colors.textMuted },
  infoValue: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textPrimary },
  infoMono: { fontFamily: arFonts.mono, fontSize: 12, color: colors.textPrimary },
  infoHint: {
    fontFamily: arFonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    lineHeight: 20,
    marginTop: 4,
  },
});
