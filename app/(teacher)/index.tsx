import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loadOfflineAttendance } from '@/lib/attendanceOffline';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';

type Section = { id: string; name: string };

export default function TeacherHome() {
  const { user, accessToken } = useAuth();
  const { isCompact } = useBreakpoint();
  const [sections, setSections] = useState<Section[]>([]);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    void apiRequest<Section[]>('/v1/tenants/me/sections', {
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
      branchId: user?.branchIds?.[0],
    })
      .then(setSections)
      .catch(() => setSections([]));
    void loadOfflineAttendance().then((rows) => setQueued(rows.length));
  }, []);

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(300)} style={styles.hero}>
        <PillBadge label="نطاق: المعلم" tone="emerald" />
        <Text style={styles.h1}>لوحة المعلم</Text>
        <Text style={styles.sub}>
          مرحباً {user?.full_name || 'بالمعلم'} — سجّل حضور الفصل بسرعة، حتى بدون إنترنت.
        </Text>
        <Text style={styles.date}>{today}</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(70).duration(300)}
        style={[styles.statsRow, isCompact && styles.statsCol]}
      >
        <Stat label="الفصول المتاحة" value={String(sections.length)} tone="brand" />
        <Stat label="سجلات معلّقة" value={String(queued)} tone={queued ? 'amber' : 'emerald'} />
        <Stat label="وضع العمل" value={queued ? 'دون اتصال' : 'متصل'} tone="emerald" isText />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(300)}>
        <AnimatedPressable
          onPress={() => router.push('/(teacher)/attendance')}
          style={[styles.heroCard, shadows.brand]}
        >
          <View style={styles.heroCardTop}>
            <PillBadge label="الأهم اليوم" tone="emerald" />
            <Text style={styles.heroCardTitle}>حضور الفصل</Text>
            <Text style={styles.heroCardBody}>
              اختر الفصل، حمّل الطلاب، ومرّر على الحالة (حاضر / غائب / متأخر / بعذر) ثم احفظ.
              يعمل بدون إنترنت ويُزامَن لاحقاً.
            </Text>
          </View>
          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>بدء المناداة الآن</Text>
          </View>
        </AnimatedPressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(300)} style={[styles.panel, shadows.sm]}>
        <Text style={styles.panelTitle}>فصولك</Text>
        {sections.length === 0 ? (
          <Text style={styles.empty}>
            لا فصول بعد — اطلب من مشرف المنصة أو مدير المدرسة تشغيل إعداد Phase 1.
          </Text>
        ) : (
          <View style={styles.sectionList}>
            {sections.map((s) => (
              <AnimatedPressable
                key={s.id}
                onPress={() => router.push('/(teacher)/attendance')}
                style={styles.sectionRow}
              >
                <View style={styles.sectionAvatar}>
                  <Text style={styles.sectionAvatarText}>{s.name}</Text>
                </View>
                <View style={styles.sectionMeta}>
                  <Text style={styles.sectionName}>فصل {s.name}</Text>
                  <Text style={styles.sectionHint}>اضغط لفتح الحضور</Text>
                </View>
                <Text style={styles.chevron}>‹</Text>
              </AnimatedPressable>
            ))}
          </View>
        )}
      </Animated.View>

      {queued > 0 ? (
        <Animated.View entering={FadeInDown.delay(220).duration(300)} style={styles.warnBanner}>
          <Text style={styles.warnTitle}>لديك {queued} سجل حضور غير مُزامَن</Text>
          <Text style={styles.warnBody}>افتح الحضور واضغط «مزامنة السجلات» عند توفر الإنترنت.</Text>
        </Animated.View>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Stat({
  label,
  value,
  tone,
  isText,
}: {
  label: string;
  value: string;
  tone: 'brand' | 'amber' | 'emerald';
  isText?: boolean;
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
      <Text style={[styles.statValue, isText && styles.statValueSm]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  content: {
    maxWidth: 960,
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
    maxWidth: 520,
  },
  date: { fontFamily: arFonts.medium, fontSize: 13, color: colors.textMuted, textAlign: 'right' },

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
    fontSize: 26,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statValueSm: { fontSize: 18 },
  statLabel: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textSecondary },

  heroCard: {
    backgroundColor: colors.statusSuccess,
    borderRadius: radii['2xl'],
    padding: 22,
    gap: 16,
  },
  heroCardTop: { gap: 8, alignItems: 'flex-end' },
  heroCardTitle: {
    fontFamily: arFonts.extraBold,
    fontSize: 24,
    color: '#fff',
    textAlign: 'right',
  },
  heroCardBody: {
    fontFamily: arFonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'right',
    lineHeight: 22,
  },
  heroCta: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.xl,
  },
  heroCtaText: { fontFamily: arFonts.bold, fontSize: 14, color: colors.statusSuccess },

  panel: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 18,
    gap: 12,
  },
  panelTitle: {
    fontFamily: arFonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  empty: {
    fontFamily: arFonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    lineHeight: 20,
  },
  sectionList: { gap: 8 },
  sectionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.xl,
    backgroundColor: colors.bgCanvas,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sectionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionAvatarText: { fontFamily: arFonts.bold, fontSize: 16, color: colors.statusSuccess },
  sectionMeta: { flex: 1, gap: 2 },
  sectionName: {
    fontFamily: arFonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  sectionHint: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  chevron: { fontFamily: arFonts.bold, fontSize: 22, color: colors.textMuted },

  warnBanner: {
    backgroundColor: colors.statusWarningSoft,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    padding: 14,
    gap: 4,
  },
  warnTitle: {
    fontFamily: arFonts.bold,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  warnBody: {
    fontFamily: arFonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
