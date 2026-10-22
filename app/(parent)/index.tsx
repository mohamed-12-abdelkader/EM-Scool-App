import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';

type Child = { id: string; full_name: string; student_code: string };
type AlertRow = {
  id: string;
  payload: {
    type?: string;
    studentId?: string;
    studentName?: string;
    status?: string;
    attendanceDate?: string;
  };
  status: string;
  related_type?: string | null;
  created_at: string;
};

const statusAr: Record<string, string> = {
  ABSENT: 'غائب',
  LATE: 'متأخر',
  PRESENT: 'حاضر',
  EXCUSED: 'بعذر',
};

function alertTitle(a: AlertRow) {
  const t = a.payload?.type || a.related_type || '';
  if (t === 'ATTENDANCE_ALERT') {
    const st = statusAr[a.payload.status || ''] || a.payload.status || '';
    return `تنبيه حضور · ${st}`;
  }
  if (t === 'CLINIC_VISIT') return 'زيارة عيادة';
  if (t === 'BEHAVIOR_SUMMONS') return 'استدعاء سلوكي';
  if (t === 'DOCUMENT_REJECTED') return 'مستند مرفوض — أعد الرفع';
  if (t === 'GATE_DISMISSAL') return 'مغادرة من البوابة';
  return 'تنبيه جديد';
}

function alertBody(a: AlertRow) {
  const name = a.payload?.studentName || '';
  const date = a.payload?.attendanceDate || '';
  if (a.payload?.type === 'ATTENDANCE_ALERT') {
    return `${name}${date ? ` · ${date}` : ''} — تم تسجيل الحالة من المعلم.`;
  }
  return name || 'راجع تفاصيل الطالب مع إدارة المدرسة.';
}

export default function ParentHome() {
  const { accessToken, user, activeChildId, setActiveChildId } = useAuth();
  const { isCompact } = useBreakpoint();
  const [children, setChildren] = useState<Child[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const headers = {
    token: accessToken || undefined,
    tenantId: user?.tenantId || undefined,
    branchId: user?.branchIds?.[0],
  };

  const load = useCallback(async () => {
    try {
      const kids = await apiRequest<Child[]>('/v1/sis/parent/children', headers);
      setChildren(kids);
      const childId = activeChildId && kids.some((k) => k.id === activeChildId) ? activeChildId : kids[0]?.id;
      if (childId && childId !== activeChildId) setActiveChildId(childId);
      const feed = await apiRequest<AlertRow[]>(
        childId ? `/v1/sis/parent/alerts?student_id=${childId}` : '/v1/sis/parent/alerts',
        headers,
      );
      setAlerts(feed);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر التحميل');
    }
  }, [accessToken, user?.tenantId, activeChildId]);

  useEffect(() => {
    void load();
  }, [activeChildId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const active = children.find((c) => c.id === activeChildId) || children[0];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(280)} style={styles.hero}>
        <PillBadge label="نطاق: العائلة" tone="indigo" />
        <Text style={styles.h1}>لوحة ولي الأمر</Text>
        <Text style={styles.sub}>بدّل بين الأبناء وتابع تنبيهات الحضور والعيادة فوراً.</Text>
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Animated.View entering={FadeInDown.delay(60).duration(280)} style={styles.section}>
        <Text style={styles.sectionTitle}>الأبناء</Text>
        <View style={styles.chips}>
          {children.length === 0 ? (
            <Text style={styles.empty}>لا أبناء مرتبطين بعد — أكمل مسار القبول أولاً.</Text>
          ) : (
            children.map((c) => {
              const on = (activeChildId || active?.id) === c.id;
              return (
                <AnimatedPressable
                  key={c.id}
                  onPress={() => setActiveChildId(c.id)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.full_name}</Text>
                </AnimatedPressable>
              );
            })
          )}
        </View>
      </Animated.View>

      {active ? (
        <Animated.View entering={FadeInDown.delay(100).duration(280)} style={[styles.card, shadows.card]}>
          <Text style={styles.cardLabel}>الطالب النشط</Text>
          <Text style={styles.name}>{active.full_name}</Text>
          <Text style={styles.mono}>{active.student_code}</Text>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(140).duration(280)} style={styles.section}>
        <View style={styles.feedHead}>
          <Text style={styles.sectionTitle}>التنبيهات</Text>
          <PillBadge label={`${alerts.length}`} tone="indigo" />
        </View>

        {alerts.length === 0 ? (
          <View style={[styles.emptyCard, shadows.sm]}>
            <Text style={styles.emptyTitle}>لا تنبيهات بعد</Text>
            <Text style={styles.empty}>
              عند تسجيل غياب أو تأخير من المعلم، تظهر التنبيهات هنا مباشرة (حتى بدون Redis).
            </Text>
          </View>
        ) : (
          <View style={styles.feed}>
            {alerts.map((a, i) => (
              <Animated.View
                key={a.id}
                entering={FadeInDown.delay(Math.min(i, 6) * 40).duration(220)}
                style={[styles.alertCard, shadows.sm]}
              >
                <View style={styles.alertTop}>
                  <PillBadge
                    label={a.payload?.status ? statusAr[a.payload.status] || a.payload.status : 'تنبيه'}
                    tone={
                      a.payload?.status === 'ABSENT'
                        ? 'rose'
                        : a.payload?.status === 'LATE'
                          ? 'amber'
                          : 'indigo'
                    }
                  />
                  <Text style={styles.alertTime}>
                    {new Date(a.created_at).toLocaleString('ar-EG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Text>
                </View>
                <Text style={styles.alertTitle}>{alertTitle(a)}</Text>
                <Text style={styles.alertBody}>{alertBody(a)}</Text>
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: arFonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  chips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipOn: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { fontFamily: arFonts.semiBold, color: colors.textPrimary },
  chipTextOn: { color: '#fff' },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 18,
    gap: 4,
    alignItems: 'flex-end',
  },
  cardLabel: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textMuted },
  name: { fontFamily: arFonts.bold, fontSize: 20, color: colors.textPrimary },
  mono: { fontFamily: arFonts.mono, fontSize: 12, color: colors.textMuted },
  feedHead: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feed: { gap: 10 },
  alertCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    gap: 6,
  },
  alertTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  alertTime: { fontFamily: arFonts.regular, fontSize: 11, color: colors.textMuted },
  alertTitle: {
    fontFamily: arFonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  alertBody: {
    fontFamily: arFonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: arFonts.bold,
    fontSize: 15,
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
});
