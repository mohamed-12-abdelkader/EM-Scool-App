import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
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
import { useBreakpoint } from '@/hooks/useBreakpoint';

type Section = { id: string; name: string; grade_level_id?: string };
type Subject = { id: string; name: string; color: string };
type TimetableRow = {
  id: string;
  section_id: string;
  section_name?: string;
  grade_name?: string;
  status: string;
  title?: string;
};
type Slot = {
  day_of_week: number;
  period_number: number;
  subject_id?: string | null;
  subject_name?: string;
  subject_color?: string;
  teacher_name?: string | null;
  slot_type: string;
};
type Settings = { working_days: number[]; periods_per_day: number };

const DAY_LABELS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

function notify(msg: string) {
  if (Platform.OS === 'web') window.alert(msg);
  else Alert.alert('الجدول', msg);
}

export default function TimetablePage() {
  const headers = useSessionHeaders();
  const { isCompact } = useBreakpoint();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetables, setTimetables] = useState<TimetableRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [settings, setSettings] = useState<Settings>({ working_days: [0, 1, 2, 3, 4], periods_per_day: 7 });
  const [status, setStatus] = useState('draft');
  const [pickSubject, setPickSubject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMeta = useCallback(async () => {
    setLoading(true);
    try {
      const [secs, subs, tts, sett] = await Promise.all([
        apiRequest<Section[]>('/v1/tenants/me/sections', headers),
        apiRequest<Subject[]>('/v1/academics/subjects', headers),
        apiRequest<TimetableRow[]>('/v1/academics/timetables', headers),
        apiRequest<Settings>('/v1/academics/timetable/settings', headers),
      ]);

      setSections(secs);
      setSubjects(subs);
      setTimetables(tts);
      setSettings(sett);
      if (tts[0]) setActiveId(tts[0].id);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر تحميل الجدول');
    } finally {
      setLoading(false);
    }
  }, [headers.token, headers.tenantId, headers.branchId]);

  const loadDetail = useCallback(
    async (id: string) => {
      try {
        const data = await apiRequest<{
          timetable: TimetableRow;
          slots: Slot[];
          settings: Settings;
        }>(`/v1/academics/timetables/${id}`, headers);
        setSlots(data.slots);
        setStatus(data.timetable.status);
        setSettings(data.settings);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'تعذّر تحميل الحصص');
      }
    },
    [headers.token, headers.tenantId, headers.branchId],
  );

  useEffect(() => {
    void loadMeta();
  }, []);

  useEffect(() => {
    if (activeId) void loadDetail(activeId);
  }, [activeId]);

  const days = useMemo(
    () => (settings.working_days?.length ? settings.working_days : [0, 1, 2, 3, 4]),
    [settings],
  );
  const periods = useMemo(
    () => Array.from({ length: settings.periods_per_day || 7 }, (_, i) => i + 1),
    [settings],
  );

  const slotMap = useMemo(() => {
    const m = new Map<string, Slot>();
    for (const s of slots) m.set(`${s.day_of_week}-${s.period_number}`, s);
    return m;
  }, [slots]);

  const ensureTimetable = async (sectionId: string) => {
    const existing = timetables.find((t) => t.section_id === sectionId);
    if (existing) {
      setActiveId(existing.id);
      return;
    }
    const created = await apiRequest<TimetableRow>('/v1/academics/timetables', {
      ...headers,
      method: 'POST',
      body: { section_id: sectionId, title: 'الجدول الأسبوعي' },
    });
    setTimetables((prev) => [created, ...prev]);
    setActiveId(created.id);
  };

  const toggleCell = async (day: number, period: number) => {
    if (!activeId) return;
    const key = `${day}-${period}`;
    const current = slotMap.get(key);
    let nextSlots = slots.filter((s) => !(s.day_of_week === day && s.period_number === period));

    if (!current || current.slot_type === 'break') {
      if (!pickSubject && subjects[0]) setPickSubject(subjects[0].id);
      const subjectId = pickSubject || subjects[0]?.id;
      if (!subjectId) {
        notify('أضف مواد أولاً');
        return;
      }
      const sub = subjects.find((s) => s.id === subjectId);
      nextSlots = [
        ...nextSlots,
        {
          day_of_week: day,
          period_number: period,
          subject_id: subjectId,
          subject_name: sub?.name,
          subject_color: sub?.color,
          slot_type: 'lesson',
        },
      ];
    } else {
      // clear cell
    }

    setSlots(nextSlots);
    try {
      const data = await apiRequest<{ slots: Slot[] }>(`/v1/academics/timetables/${activeId}/slots`, {
        ...headers,
        method: 'PUT',
        body: {
          slots: nextSlots.map((s) => ({
            day_of_week: s.day_of_week,
            period_number: s.period_number,
            subject_id: s.subject_id ?? null,
            teacher_name: s.teacher_name ?? null,
            slot_type: s.slot_type || 'lesson',
          })),
        },
      });
      setSlots(data.slots);
      setStatus('draft');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'فشل الحفظ');
      void loadDetail(activeId);
    }
  };

  const publish = async () => {
    if (!activeId) return;
    try {
      await apiRequest(`/v1/academics/timetables/${activeId}/publish`, {
        ...headers,
        method: 'POST',
      });
      setStatus('published');
      notify('تم نشر الجدول');
      void loadMeta();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'فشل النشر');
    }
  };

  const seedSubjects = async () => {
    try {
      await apiRequest('/v1/academics/subjects/seed-defaults', { ...headers, method: 'POST' });
      void loadMeta();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'فشل التهيئة');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PageHeader
        title="الجدول المدرسي"
        subtitle="بناء أسبوعي للشعب مع نشر فوري — نظام الجداول الكامل"
        breadcrumbs={['الجداول الدراسية', 'الجدول المدرسي']}
        actions={
          <>
            <Button label="مواد افتراضية" variant="outline" onPress={() => void seedSubjects()} />
            <Button
              label={status === 'published' ? 'منشور' : 'نشر الجدول'}
              onPress={() => void publish()}
              disabled={!activeId || status === 'published'}
            />
          </>
        }
      />

      <Animated.View entering={FadeInDown.duration(280)} style={[styles.hero, shadows.sm]}>
        <View style={styles.heroTop}>
          <PillBadge label="أكاديميات · ERP" tone="violet" />
          <View style={styles.liveRow}>
            <LivePulseDot size={8} color={colors.statusSuccess} />
            <Text style={styles.liveText}>{status === 'published' ? 'منشور' : 'مسودة'}</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>اختر الشعبة وابنِ الحصص بالنقر على الخلايا</Text>
        <Text style={styles.heroSub}>اضغط خلية لإضافة المادة المحددة، واضغط مجدداً لمسحها.</Text>
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        <View style={styles.chips}>
          {sections.map((s, i) => {
            const tt = timetables.find((t) => t.section_id === s.id);
            const active = tt?.id === activeId;
            return (
              <Animated.View key={s.id} entering={FadeInDown.delay(i * 40).duration(220)}>
                <AnimatedPressable
                  onPress={() => void ensureTimetable(s.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {s.name}
                    {tt ? ` · ${tt.status === 'published' ? 'منشور' : 'مسودة'}` : ''}
                  </Text>
                </AnimatedPressable>
              </Animated.View>
            );
          })}
          {!sections.length ? (
            <Text style={styles.emptyHint}>لا شعب بعد — نفّذ bootstrap للمستأجر من مشرف المنصة</Text>
          ) : null}
        </View>
      </ScrollView>

      <Text style={styles.sectionLabel}>المادة المحددة للنقر</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {subjects.map((s) => {
            const active = (pickSubject || subjects[0]?.id) === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => setPickSubject(s.id)}
                style={[styles.subjectChip, active && { borderColor: s.color, backgroundColor: `${s.color}22` }]}
              >
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Text style={styles.subjectText}>{s.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {activeId ? (
        <Animated.View entering={FadeInDown.delay(80).duration(280)} style={[styles.gridWrap, shadows.sm]}>
          <ScrollView horizontal={!isCompact} showsHorizontalScrollIndicator>
            <View>
              <View style={styles.gridRow}>
                <View style={[styles.cell, styles.headCell, styles.corner]}>
                  <Text style={styles.headText}>الحصة</Text>
                </View>
                {days.map((d) => (
                  <View key={d} style={[styles.cell, styles.headCell]}>
                    <Text style={styles.headText}>{DAY_LABELS[d] || d}</Text>
                  </View>
                ))}
              </View>
              {periods.map((p) => (
                <View key={p} style={styles.gridRow}>
                  <View style={[styles.cell, styles.headCell, styles.corner]}>
                    <Text style={styles.headText}>{p}</Text>
                  </View>
                  {days.map((d) => {
                    const slot = slotMap.get(`${d}-${p}`);
                    const color = slot?.subject_color || colors.brandSoft;
                    return (
                      <Pressable
                        key={`${d}-${p}`}
                        onPress={() => void toggleCell(d, p)}
                        style={[
                          styles.cell,
                          styles.slotCell,
                          slot ? { backgroundColor: `${color}33`, borderColor: color } : null,
                        ]}
                      >
                        <Text style={styles.slotText} numberOfLines={2}>
                          {slot?.subject_name || '—'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      ) : (
        <Text style={styles.emptyHint}>اختر شعبة لبدء بناء الجدول</Text>
      )}
    </ScrollView>
  );
}

const CELL_W = 110;
const CELL_H = 64;

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
    gap: 8,
  },
  heroTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  liveRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  liveText: { fontFamily: arFonts.semiBold, fontSize: 12, color: colors.textSecondary },
  heroTitle: {
    fontFamily: arFonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  heroSub: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  chipsScroll: { maxHeight: 52 },
  chips: { flexDirection: 'row-reverse', gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: { backgroundColor: colors.brandSoft, borderColor: colors.brandPrimary },
  chipText: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.brandPrimary },
  sectionLabel: {
    fontFamily: arFonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  subjectChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
  },
  subjectText: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textPrimary },
  dot: { width: 10, height: 10, borderRadius: 5 },
  gridWrap: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  gridRow: { flexDirection: 'row-reverse' },
  cell: {
    width: CELL_W,
    height: CELL_H,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  headCell: { backgroundColor: colors.brandSoft, height: 44 },
  corner: { width: 56 },
  headText: { fontFamily: arFonts.semiBold, fontSize: 12, color: colors.brandPrimary },
  slotCell: { backgroundColor: colors.bgCanvas },
  slotText: { fontFamily: arFonts.medium, fontSize: 11, color: colors.textPrimary, textAlign: 'center' },
  emptyHint: { fontFamily: arFonts.regular, color: colors.textMuted, textAlign: 'center', padding: 24 },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },
});
